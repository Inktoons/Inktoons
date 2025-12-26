"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

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

    useEffect(() => {
        const initPi = async () => {
            try {
                if (window.Pi) {
                    const isPiBrowser = /PiBrowser/i.test(navigator.userAgent);
                    const isLocal = window.location.hostname === "localhost" ||
                        window.location.hostname === "127.0.0.1" ||
                        window.location.hostname.includes("ngrok-free.app") ||
                        window.location.hostname.includes("ngrok-free.dev") ||
                        window.location.hostname.includes("ngrok.io");

                    // Usar sandbox siempre que estemos en un dominio local, ngrok o Vercel (mientras estemos en Testnet)
                    const useSandbox = isLocal || window.location.hostname.includes("vercel.app");

                    console.log(`Initializing Pi SDK (PiBrowser: ${isPiBrowser}, Local: ${isLocal}, Host: ${window.location.hostname}, useSandbox: ${useSandbox})...`);

                    window.Pi.init({ version: "2.0", sandbox: useSandbox });
                    console.log("Pi SDK initialized successfully");
                } else {
                    console.warn("Pi SDK (window.Pi) not found during initialization");
                }
            } catch (error) {
                console.error("Error initializing Pi SDK:", error);
            } finally {
                setLoading(false);
            }
        };

        // Dar un pequeño margen para que el script se cargue si no está inmediatamente disponible
        if (window.Pi) {
            initPi();
        } else {
            const timer = setTimeout(initPi, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const authenticate = async () => {
        if (!window.Pi) {
            console.error("Pi SDK not found on window");
            alert("El SDK de Pi no se ha cargado. Abre esta app desde el Pi Browser.");
            return;
        }

        try {
            console.log("Starting Pi authentication...");
            const scopes = ["username", "payments", "wallet_address"];

            const onIncompletePaymentFound = async (payment: any) => {
                console.log("Incomplete payment found during auth:", payment);
                try {
                    await fetch("/api/pi/complete", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ paymentId: payment.identifier, txid: payment.transaction.txid }),
                    });
                    console.log("Incomplete payment resolved");
                } catch (error) {
                    console.error("Error resolving incomplete payment:", error);
                }
            };

            const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
            console.log("Authentication successful:", auth);
            setUser(auth.user);
        } catch (error) {
            console.error("Authentication failed:", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            alert("Error al conectar con Pi Network: " + errorMessage + "\n\nTip: Asegúrate de estar dentro del Pi Browser y que la URL coincida con la configurada en el Developer Portal.");
        }
    };

    const createPayment = async (amount: number, memo: string, metadata: any, onSuccess?: () => void) => {
        if (!window.Pi) {
            alert("SDK de Pi no encontrado. Prueba a recargar la página.");
            return;
        }

        try {
            console.log("Iniciando pago:", { amount, memo, metadata });
            // alert("Iniciando pago... Espera a que cargue la ventana de Pi.");

            await window.Pi.createPayment({
                amount,
                memo,
                metadata,
            }, {
                onReadyForServerApproval: async (paymentId: string) => {
                    console.log("Pago listo para aprobación del servidor:", paymentId);
                    try {
                        const response = await fetch("/api/pi/approve", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ paymentId }),
                        });
                        if (response.ok) {
                            console.log("Pago aprobado en el servidor");
                        } else {
                            const errorData = await response.json().catch(() => null);
                            const errorMessage = errorData?.error || await response.text();
                            alert("Error al aprobar pago: " + errorMessage);
                        }
                    } catch (error) {
                        console.error("Error en aprobación:", error);
                        alert("Error de conexión al aprobar págó.");
                    }
                },
                onReadyForServerCompletion: async (paymentId: string, txid: string) => {
                    console.log("Pago listo para completarse:", paymentId, txid);
                    try {
                        const response = await fetch("/api/pi/complete", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ paymentId, txid }),
                        });
                        if (response.ok) {
                            console.log("Pago completado!");
                            if (onSuccess) {
                                onSuccess();
                            } else {
                                alert("¡Pago completado con éxito!");
                            }
                        } else {
                            const errorText = await response.text();
                            alert("Error al completar pago: " + errorText);
                        }
                    } catch (error) {
                        console.error("Error en finalización:", error);
                    }
                },
                onCancel: (paymentId: string) => {
                    console.log("Pago cancelado:", paymentId);
                },
                onError: (error: any, payment: any) => {
                    console.error("Error en el pago:", error, payment);
                    alert("Error en el sistema de pagos: " + (error.message || error));
                },
            });
        } catch (error) {
            console.error("Error crítico al crear pago:", error);
            alert("Error crítico al iniciar el pago.");
        }
    };

    return (
        <PiContext.Provider value={{ user, loading, authenticate, createPayment }}>
            {children}
        </PiContext.Provider>
    );
};

export const usePi = () => {
    const context = useContext(PiContext);
    if (context === undefined) {
        throw new Error("usePi must be used within a PiProvider");
    }
    return context;
};
