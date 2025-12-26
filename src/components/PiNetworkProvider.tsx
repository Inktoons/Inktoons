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
        if (typeof window === "undefined") return;

        // Esperar un máximo de 5 segundos a que window.Pi aparezca
        let attempts = 0;
        while (!window.Pi && attempts < 10) {
            await new Promise(r => setTimeout(r, 500));
            attempts++;
        }

        if (!window.Pi) {
            console.error("[PI] SDK not found after 5s");
            setLoading(false);
            return;
        }

        try {
            const hostname = window.location.hostname;
            const useSandbox = hostname === "localhost" || hostname.includes("ngrok") || hostname.includes("vercel.app");

            setIsSandbox(useSandbox);
            window.Pi.init({ version: "2.0", sandbox: useSandbox });
            console.log("[PI] Initialized success");
            // alert("SDK de Pi Listo (Sandbox: " + useSandbox + ")"); // Debug opcional
        } catch (error) {
            console.error("[PI] Init error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        initPi();
    }, [initPi]);

    const authenticate = async () => {
        if (!window.Pi) {
            alert("Error: El SDK de Pi no está cargado.");
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

            // Intentar autenticar
            const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
            setUser(auth.user);
        } catch (error: any) {
            const errorMsg = error.message || JSON.stringify(error);
            if (errorMsg.includes("cancelled")) return; // No molestar si el usuario cancela
            alert("Error de Autenticación: " + errorMsg);
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
                        alert("Error aprobación: " + (err.error || "Server Error"));
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
                onError: (error: any) => alert("Error pago: " + error.message),
            });
        } catch (error: any) {
            alert("Error crítico: " + error.message);
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
