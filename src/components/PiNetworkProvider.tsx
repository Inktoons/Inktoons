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
        if (typeof window === "undefined") return;
        if (initialized.current) return;

        console.log("[PI] Intentando inicializar...");

        // Pequeña espera por si el script aún no está en window
        if (!window.Pi) {
            await new Promise(r => setTimeout(r, 1000));
        }

        if (window.Pi && !initialized.current) {
            try {
                const hostname = window.location.hostname;
                const useSandbox = hostname === "localhost" || hostname.includes("ngrok") || hostname.includes("vercel.app");

                window.Pi.init({ version: "2.0", sandbox: useSandbox });
                initialized.current = true;
                console.log(`[PI] SDK de Pi cargado con éxito (Sandbox: ${useSandbox})`);
            } catch (error) {
                console.error("[PI] Error al inicializar Pi SDK:", error);
            }
        } else {
            console.warn("[PI] SDK de Pi no disponible en este momento.");
        }

        setLoading(false);
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
            const scopes = ["username", "payments", "wallet_address"];
            const onIncompletePaymentFound = async (payment: any) => {
                try {
                    await fetch("/api/pi/complete", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ paymentId: payment.identifier, txid: payment.transaction?.txid || "" }),
                    });
                } catch (e) {
                    console.error("Error al completar pago pendiente:", e);
                }
            };

            const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
            setUser(auth.user);
        } catch (error: any) {
            if (error.message?.includes("cancelled")) return;
            alert("No se pudo conectar con Pi: " + (error.message || "Error desconocido"));
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
                        alert("Algo salió mal en el servidor: " + (err.error || "Error"));
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
                onError: (error: any) => alert("Error en el pago de Pi: " + error.message),
            });
        } catch (error: any) {
            console.error("Error crítico de pago:", error);
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
    if (!context) throw new Error("usePi debe estar dentro de un PiProvider");
    return context;
};
