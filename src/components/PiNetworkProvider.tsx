"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

interface PiUser {
    uid: string;
    username: string;
    wallet_address?: string;
}

interface PiContextType {
    user: PiUser | null;
    loading: boolean;
    authenticate: () => Promise<void>;
    createPayment: (amount: number, memo: string, metadata: any, onSuccess?: () => void) => Promise<void>;
    setMockUser: (user: PiUser | null) => void;
}

const PiContext = createContext<PiContextType | undefined>(undefined);

declare global {
    interface Window {
        Pi: any;
    }
}

export const PiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<PiUser | null>(null);
    const [loading, setLoading] = useState(true);
    const initialized = useRef(false);

    // PERSISTENCIA DE LOGIN (Nativa para la demo)
    const authenticate = useCallback(async (isAuto = false) => {
        if (!window.Pi) {
            if (!isAuto) alert("SDK de Pi no detectado. Si estás en Pi Browser, refresca.");
            return;
        }
        try {
            const auth = await window.Pi.authenticate(["username", "payments", "wallet_address"], (p: any) => { });
            setUser(auth.user);
            localStorage.setItem("pi_logged_in", "true");
        } catch (error: any) {
            if (!isAuto && !error.message?.includes("cancelled")) {
                alert("Error de conexión: " + error.message);
            }
            localStorage.removeItem("pi_logged_in");
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            // Soporte para Mock User en desarrollo
            if (process.env.NODE_ENV === 'development') {
                const mockUser = localStorage.getItem("dev_mock_user");
                if (mockUser) {
                    try {
                        setUser(JSON.parse(mockUser));
                    } catch (e) { }
                }
            }

            if (window.Pi && !initialized.current) {
                try {
                    // Inicializamos en modo TESTNET (sandbox) para pruebas
                    await window.Pi.init({ version: "2.0", sandbox: true });
                    initialized.current = true;
                    if (localStorage.getItem("pi_logged_in") === "true") {
                        await authenticate(true);
                    }
                } catch (e) { }
            }
            setLoading(false);
        };
        const timer = setTimeout(init, 1000);
        return () => clearTimeout(timer);
    }, [authenticate]);

    // PAGOS REALES de Pi Network
    const createPayment = async (amount: number, memo: string, metadata: any, onSuccess?: () => void) => {
        if (!window.Pi) {
            alert("SDK de Pi no disponible. Debes abrir esta app en Pi Browser.");
            return;
        }

        if (!user) {
            alert("Debes iniciar sesión primero");
            return;
        }

        try {
            console.log(`[Pi Payment] Iniciando pago de ${amount} Pi para: ${memo}`);

            // Crear el pago usando el SDK de Pi
            const payment = await window.Pi.createPayment({
                amount,
                memo,
                metadata
            }, {
                // Callbacks del SDK
                onReadyForServerApproval: async (paymentId: string) => {
                    console.log(`[Pi Payment] Aprobando en servidor: ${paymentId}`);

                    try {
                        // Llamar a nuestra API para aprobar el pago
                        const response = await fetch('/api/pi/approve', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ paymentId }),
                        });

                        if (!response.ok) {
                            throw new Error('Error al aprobar el pago en el servidor');
                        }

                        const data = await response.json();
                        console.log('[Pi Payment] Aprobado por el servidor:', data);
                    } catch (error) {
                        console.error('[Pi Payment] Error en aprobación del servidor:', error);
                        throw error;
                    }
                },
                onReadyForServerCompletion: async (paymentId: string, txid: string) => {
                    console.log(`[Pi Payment] Completando en servidor: ${paymentId}, txid: ${txid}`);

                    try {
                        // Llamar a nuestra API para completar el pago
                        const response = await fetch('/api/pi/complete', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ paymentId, txid }),
                        });

                        if (!response.ok) {
                            throw new Error('Error al completar el pago en el servidor');
                        }

                        const data = await response.json();
                        console.log('[Pi Payment] Completado por el servidor:', data);

                        // Ejecutar callback de éxito
                        if (onSuccess) {
                            onSuccess();
                        }
                    } catch (error) {
                        console.error('[Pi Payment] Error en completación del servidor:', error);
                        throw error;
                    }
                },
                onCancel: (paymentId: string) => {
                    console.log(`[Pi Payment] Pago cancelado: ${paymentId}`);
                    alert('Pago cancelado');
                },
                onError: (error: any, payment: any) => {
                    console.error('[Pi Payment] Error:', error);
                    alert('Error en el pago: ' + (error.message || 'Desconocido'));
                }
            });

            console.log('[Pi Payment] Pago creado exitosamente:', payment);
        } catch (error: any) {
            console.error('[Pi Payment] Error al crear el pago:', error);
            alert('Error al procesar el pago: ' + (error.message || 'Desconocido'));
        }
    };

    const setMockUser = useCallback((mockUser: PiUser | null) => {
        if (process.env.NODE_ENV !== 'development') return;

        if (mockUser) {
            setUser(mockUser);
            localStorage.setItem("dev_mock_user", JSON.stringify(mockUser));
        } else {
            setUser(null);
            localStorage.removeItem("dev_mock_user");
        }
    }, []);

    return (
        <PiContext.Provider value={{ user, loading, authenticate, createPayment, setMockUser }}>
            {children}
        </PiContext.Provider>
    );
};

export const usePi = () => {
    const context = useContext(PiContext);
    if (!context) throw new Error("usePi error");
    return context;
};
