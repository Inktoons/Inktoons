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
    isSandbox: boolean;
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
    const [isSandbox, setIsSandbox] = useState(false);

    const initPi = useCallback(async () => {
        if (typeof window === "undefined" || !window.Pi) return;

        try {
            const hostname = window.location.hostname;
            const isLocal = hostname === "localhost" || hostname.includes("ngrok") || hostname === "127.0.0.1";
            const isVercel = hostname.includes("vercel.app");
            const useSandbox = isLocal || isVercel;

            setIsSandbox(useSandbox);
            console.log(`[Pi SDK] Initializing on ${hostname} (Sandbox: ${useSandbox})`);

            await window.Pi.init({ version: "2.0", sandbox: useSandbox });
            console.log("[Pi SDK] Ready");
        } catch (error) {
            console.error("[Pi SDK] Init Error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Intentar inicializar inmediatamente
        if (window.Pi) {
            initPi();
        } else {
            // Reintentar si el script tarda en cargar
            const timer = setTimeout(initPi, 1000);
            return () => clearTimeout(timer);
        }
    }, [initPi]);

    const authenticate = async () => {
        if (!window.Pi) {
            alert("No se detectó el SDK de Pi. Por favor, abre la app desde el Pi Browser.");
            return;
        }

        try {
            console.log("[Pi SDK] Requesting authentication...");
            const scopes = ["username", "payments", "wallet_address"];

            const onIncompletePaymentFound = async (payment: any) => {
                console.log("[Pi SDK] Incomplete payment found:", payment.identifier);
                await fetch("/api/pi/complete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ paymentId: payment.identifier, txid: payment.transaction?.txid || "" }),
                });
            };

            const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
            console.log("[Pi SDK] Auth Success:", auth.user.username);
            setUser(auth.user);
        } catch (error: any) {
            console.error("[Pi SDK] Auth Error:", error);
            const msg = error.message || JSON.stringify(error);
            alert("Error al conectar: " + msg);
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
                        alert("Error servidor: " + (err.error || "Desconocido"));
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
                onCancel: () => console.log("Pago cancelado"),
                onError: (error: any) => alert("Error de pago: " + error.message),
            });
        } catch (error: any) {
            alert("Error crítico de pago: " + error.message);
        }
    };

    return (
        <PiContext.Provider value={{ user, loading, isSandbox, authenticate, createPayment }}>
            {isSandbox && (
                <div className="fixed top-0 left-0 right-0 h-1 bg-yellow-400 z-[99999] pointer-events-none" />
            )}
            {children}
        </PiContext.Provider>
    );
};

export const usePi = () => {
    const context = useContext(PiContext);
    if (!context) throw new Error("usePi must be used within a PiProvider");
    return context;
};
