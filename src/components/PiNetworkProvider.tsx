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

        if (window.Pi) {
            try {
                const hostname = window.location.hostname;
                // IMPORTANTE: Para Testnet App DEBE ser sandbox: true siempre
                const isTestEnvironment = hostname === "localhost" || hostname.includes("ngrok") || hostname.includes("vercel.app");

                await window.Pi.init({ version: "2.0", sandbox: isTestEnvironment });
                initialized.current = true;
                console.log(`[PI] SDK Inicializado (Sandbox: ${isTestEnvironment})`);
            } catch (error) {
                console.error("[PI] Init error:", error);
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const timer = setTimeout(initPi, 1000);
        return () => clearTimeout(timer);
    }, [initPi]);

    const authenticate = async () => {
        if (!window.Pi) return;
        try {
            const scopes = ["username", "payments", "wallet_address"];
            const onIncompletePaymentFound = (payment: any) => {
                fetch("/api/pi/complete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ paymentId: payment.identifier, txid: payment.transaction?.txid || "" }),
                }).catch(console.error);
            };
            const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
            setUser(auth.user);
        } catch (error: any) {
            if (error.message?.includes("cancelled")) return;
            alert("Error al conectar: " + error.message);
        }
    };

    const createPayment = async (amount: number, memo: string, metadata: any, onSuccess?: () => void) => {
        if (!window.Pi) return;
        try {
            console.log("[PI] Creando pago:", amount, memo);
            await window.Pi.createPayment({ amount, memo, metadata }, {
                onReadyForServerApproval: async (paymentId: string) => {
                    console.log("[PI] Pago listo para aprobación:", paymentId);
                    const res = await fetch("/api/pi/approve", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ paymentId }),
                    });
                    if (!res.ok) console.error("Error en aprobación servidor");
                },
                onReadyForServerCompletion: async (paymentId: string, txid: string) => {
                    console.log("[PI] Pago listo para completarse:", txid);
                    const res = await fetch("/api/pi/complete", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ paymentId, txid }),
                    });
                    if (res.ok && onSuccess) onSuccess();
                },
                onCancel: () => console.log("[PI] Pago cancelado por usuario"),
                onError: (error: any) => alert("Error en el pago: " + error.message),
            });
        } catch (error: any) {
            console.error("[PI] Error crítico:", error);
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
