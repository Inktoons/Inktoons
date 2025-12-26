"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

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

    const initPi = useCallback(async () => {
        if (typeof window === "undefined") return;

        // Esperar a que el SDK esté disponible
        let attempts = 0;
        while (!window.Pi && attempts < 20) {
            await new Promise(r => setTimeout(r, 250));
            attempts++;
        }

        if (window.Pi) {
            try {
                const hostname = window.location.hostname;
                // Forzamos sandbox en desarrollo y vercel para pruebas con Test-Pi
                const useSandbox = hostname === "localhost" || hostname.includes("ngrok") || hostname.includes("vercel.app");

                window.Pi.init({ version: "2.0", sandbox: useSandbox });
                console.log(`[Inktoons] SDK Inicializado (Sandbox: ${useSandbox})`);
            } catch (error) {
                console.error("[Inktoons] SDK Init Error:", error);
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        initPi();
    }, [initPi]);

    const authenticate = async () => {
        if (!window.Pi) {
            alert("SDK de Pi no detectado. Si estás en el Pi Browser, por favor recarga la página.");
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
            alert("Error al conectar con Pi: " + (error.message || "Error desconocido"));
        }
    };

    const createPayment = async (amount: number, memo: string, metadata: any, onSuccess?: () => void) => {
        if (!window.Pi) return;
        try {
            await window.Pi.createPayment({ amount, memo, metadata }, {
                onReadyForServerApproval: async (paymentId: string) => {
                    const response = await fetch("/api/pi/approve", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ paymentId }),
                    });
                    if (!response.ok) {
                        const err = await response.json();
                        alert("Error de validación: " + (err.error || "Server error"));
                    }
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
                onError: (error: any) => alert("Error en transacción: " + error.message),
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
