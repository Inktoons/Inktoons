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

        // Intentar inicializar si existe el SDK
        if (window.Pi) {
            try {
                const hostname = window.location.hostname;
                // Si estamos en Vercel, Ngrok o Local, activamos Sandbox para usar Test-Pi
                const isDevEnv = hostname === "localhost" || hostname.includes("ngrok") || hostname.includes("vercel.app");

                await window.Pi.init({ version: "2.0", sandbox: isDevEnv });
                initialized.current = true;
                console.log(`[PI] SDK Inicializado con éxito. Sandbox: ${isDevEnv}`);
            } catch (error) {
                console.log("[PI] El SDK ya estaba inicializado o hubo un error leve.");
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        // Ejecutar con un ligero retraso para asegurar que el script de layout.tsx se cargue
        const timer = setTimeout(initPi, 1500);
        return () => clearTimeout(timer);
    }, [initPi]);

    const authenticate = async () => {
        if (!window.Pi) {
            alert("El sistema de Pi aún se está cargando. Espera 2 segundos y vuelve a intentarlo.");
            return;
        }

        try {
            const scopes = ["username", "payments", "wallet_address"];
            const onIncompletePaymentFound = async (payment: any) => {
                await fetch("/api/pi/complete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ paymentId: payment.identifier, txid: payment.transaction?.txid || "" }),
                });
            };

            const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
            setUser(auth.user);
        } catch (error: any) {
            if (error.message?.includes("cancelled")) return;
            alert("Error: Para conectar, asegúrate de estar usando el Sandbox o la URL de Desarrollo oficial.");
            console.error(error);
        }
    };

    const createPayment = async (amount: number, memo: string, metadata: any, onSuccess?: () => void) => {
        if (!window.Pi) return;
        try {
            await window.Pi.createPayment({ amount, memo, metadata }, {
                onReadyForServerApproval: async (paymentId: string) => {
                    await fetch("/api/pi/approve", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ paymentId }),
                    });
                },
                onReadyForServerCompletion: async (paymentId: string, txid: string) => {
                    await fetch("/api/pi/complete", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ paymentId, txid }),
                    });
                    if (onSuccess) onSuccess();
                },
                onCancel: () => { },
                onError: (error: any) => alert("Error de pago: " + error.message),
            });
        } catch (error: any) {
            console.error("Payment error:", error);
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
    if (!context) throw new Error("usePi must be used within a PiProvider");
    return context;
};
