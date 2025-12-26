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

    const initPi = useCallback(async (useSandbox: boolean = false) => {
        if (typeof window === "undefined") return;

        // Si ya está inicializado con el modo que queremos, no hacemos nada
        if (initialized.current) return;

        console.log(`[PI] Inicializando SDK (Sandbox: ${useSandbox})`);

        if (window.Pi) {
            try {
                // Si estamos en Vercel, el modo sandbox depende de si queremos pagar con Test-Pi
                await window.Pi.init({ version: "2.0", sandbox: useSandbox });
                initialized.current = true;
            } catch (error) {
                console.log("[PI] El SDK ya estaba cargado");
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        // Al inicio cargamos SIN sandbox para que el LOGIN funcione perfecto
        const timer = setTimeout(() => initPi(false), 1000);
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
            console.error("[PI] Auth Error:", error);
            // Si el login falla sospechamos del modo sandbox
            alert("Error al conectar. Asegúrate de estar en el Pi Browser oficial.");
        }
    };

    const createPayment = async (amount: number, memo: string, metadata: any, onSuccess?: () => void) => {
        if (!window.Pi) return;

        try {
            // Nota: Para Test-Pi los pagos suelen requerir el modo sandbox del SDK
            // Pero intentamos lanzarlo nativamente primero
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
                    console.error("[PI] Payment Error:", error);
                    alert("Error en el pago: " + error.message);
                },
            });
        } catch (error: any) {
            console.error("[PI] Critical Payment Error:", error);
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
