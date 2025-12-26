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
                // Forzamos sandbox en Vercel/Local para que Test-Pi funcione
                const isSandboxRequested = hostname === "localhost" || hostname.includes("ngrok") || hostname.includes("vercel.app");

                await window.Pi.init({ version: "2.0", sandbox: isSandboxRequested });
                initialized.current = true;
                console.log("[PI] Modo Sandbox activado para Testnet");
            } catch (error) {
                console.log("[PI] Nota: El SDK ya estaba listo.");
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const timer = setTimeout(initPi, 1000);
        return () => clearTimeout(timer);
    }, [initPi]);

    const authenticate = async () => {
        if (!window.Pi) {
            alert("El SDK de Pi no está listo. Prueba a refrescar la página en el Pi Browser.");
            return;
        }

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

            // Mensaje de ayuda estratégica
            alert("¡Casi listo! Para conectar tu cuenta en esta versión de prueba, asegúrate de estar en el modo Sandbox de Pi Browser.");
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
                    const res = await fetch("/api/pi/complete", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ paymentId, txid }),
                    });
                    if (res.ok && onSuccess) onSuccess();
                },
                onCancel: () => { },
                onError: (error: any) => {
                    if (error.message?.includes("Sandbox")) {
                        alert("Este pago requiere modo Sandbox activo (Test-Pi).");
                    } else {
                        alert("Error en el pago: " + error.message);
                    }
                },
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
