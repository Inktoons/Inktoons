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

    const initPi = useCallback(async () => {
        if (typeof window === "undefined" || initialized.current) return;

        try {
            if (!window.Pi) {
                // Esperar un poco más si el script no está
                await new Promise(r => setTimeout(r, 1000));
            }

            if (window.Pi) {
                const hostname = window.location.hostname;
                const isLocal = hostname === "localhost" || hostname.includes("ngrok");

                // Modo Sandbox automático: 
                // Lo activamos en local o si el usuario ha iniciado un proceso de pago en Testnet
                const isPaymentMode = localStorage.getItem("pi_payment_mode") === "true";
                const useSandbox = isLocal || isPaymentMode;

                console.log(`[PI] Inicializando SDK (Host: ${hostname}, Sandbox: ${useSandbox})`);

                await window.Pi.init({ version: "2.0", sandbox: useSandbox });
                initialized.current = true;
            }
        } catch (error) {
            console.error("[PI] Init Error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        initPi();
    }, [initPi]);

    const authenticate = async () => {
        if (!window.Pi) {
            alert("El SDK de Pi no está listo. Prueba a refrescar la página.");
            return;
        }

        try {
            console.log("[PI] Iniciando autenticación...");
            const scopes = ["username", "payments", "wallet_address"];

            const auth = await window.Pi.authenticate(scopes, (p: any) => {
                console.log("[PI] Pago incompleto encontrado", p);
            });

            console.log("[PI] Autenticación exitosa:", auth.user.username);
            setUser(auth.user);
        } catch (error: any) {
            console.error("[PI] Detalle de error de Login:", error);

            // Mostramos el error real para saber qué está pasando
            const errorMsg = error.message || JSON.stringify(error);

            if (errorMsg.includes("cancelled")) return;

            alert(`Error de Login: ${errorMsg}\n\nTip: Asegúrate de entrar por la URL correcta configurada en el Developer Portal.`);
        }
    };

    const createPayment = async (amount: number, memo: string, metadata: any, onSuccess?: () => void) => {
        const hostname = window.location.hostname;
        const isPaymentMode = localStorage.getItem("pi_payment_mode") === "true";

        // Si estamos en Vercel y no estamos en modo Sandbox, lo activamos para el pago
        if (hostname.includes("vercel.app") && !isPaymentMode) {
            localStorage.setItem("pi_payment_mode", "true");
            window.location.reload();
            return;
        }

        if (!window.Pi) return;

        try {
            await window.Pi.createPayment({ amount, memo, metadata }, {
                onReadyForServerApproval: async (paymentId: string) => {
                    await fetch("/api/pi/approve", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ paymentId })
                    });
                },
                onReadyForServerCompletion: async (paymentId: string, txid: string) => {
                    await fetch("/api/pi/complete", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ paymentId, txid })
                    });
                    localStorage.removeItem("pi_payment_mode");
                    if (onSuccess) onSuccess();
                },
                onCancel: () => {
                    localStorage.removeItem("pi_payment_mode");
                    window.location.reload();
                },
                onError: (err: any) => {
                    localStorage.removeItem("pi_payment_mode");
                    alert("Error en el pago: " + err.message);
                    window.location.reload();
                }
            });
        } catch (error: any) {
            localStorage.removeItem("pi_payment_mode");
        }
    };

    return (
        <PiContext.Provider value={{ user, loading, authenticate, createPayment }}>
            {children}
            {/* Botón de reset de emergencia si se queda pillado en modo pago */}
            {typeof window !== "undefined" && localStorage.getItem("pi_payment_mode") === "true" && (
                <button
                    onClick={() => { localStorage.removeItem("pi_payment_mode"); window.location.reload(); }}
                    className="fixed bottom-4 right-4 bg-red-500 text-white text-[10px] px-3 py-2 rounded-full z-[9999]"
                >
                    Salir de Modo Pago
                </button>
            )}
        </PiContext.Provider>
    );
};

export const usePi = () => {
    const context = useContext(PiContext);
    if (!context) throw new Error("usePi must be used within a PiProvider");
    return context;
};
