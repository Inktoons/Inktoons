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

    useEffect(() => {
        const initPi = async () => {
            if (typeof window === "undefined") return;

            try {
                if (window.Pi) {
                    const hostname = window.location.hostname;
                    const isLocal = hostname === "localhost" ||
                        hostname.includes("ngrok") ||
                        hostname === "127.0.0.1";

                    const isVercel = hostname.includes("vercel.app");

                    // Forzamos sandbox si estamos en local, ngrok o Vercel 
                    // (Esto activa las líneas amarillas y el uso de Test-Pi)
                    const useSandbox = isLocal || isVercel;
                    setIsSandbox(useSandbox);

                    console.log(`[Pi SDK] Init with sandbox: ${useSandbox} on ${hostname}`);

                    window.Pi.init({ version: "2.0", sandbox: useSandbox });
                }
            } catch (error) {
                console.error("Error initializing Pi SDK:", error);
            } finally {
                setLoading(false);
            }
        };

        if (window.Pi) {
            initPi();
        } else {
            const interval = setInterval(() => {
                if (window.Pi) {
                    initPi();
                    clearInterval(interval);
                }
            }, 500);
            return () => clearInterval(interval);
        }
    }, []);

    const authenticate = async () => {
        if (!window.Pi) return;
        try {
            const scopes = ["username", "payments", "wallet_address"];
            const onIncompletePaymentFound = async (payment: any) => {
                await fetch("/api/pi/complete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ paymentId: payment.identifier, txid: payment.transaction.txid }),
                });
            };
            const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
            setUser(auth.user);
        } catch (error) {
            console.error("Auth failed:", error);
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
                onError: (error: any) => alert("Error Pi: " + error.message),
            });
        } catch (error) {
            console.error("Payment error:", error);
        }
    };

    return (
        <PiContext.Provider value={{ user, loading, isSandbox, authenticate, createPayment }}>
            {/* Indicador visual de Sandbox para nosotros */}
            {isSandbox && (
                <div className="fixed top-0 left-0 right-0 h-1 bg-yellow-400 z-[9999] pointer-events-none" />
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
