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
            const hostname = window.location.hostname;
            const isLocal = hostname === "localhost" || hostname.includes("ngrok");

            // COMPROBACIÓN MAESTRA: ¿Estamos en modo pago?
            const isPaymentMode = localStorage.getItem("pi_payment_mode") === "true";

            // Si estamos en Vercel, solo usamos Sandbox si el usuario ha pulsado "Comprar"
            const useSandbox = isLocal || (hostname.includes("vercel.app") && isPaymentMode);

            if (window.Pi) {
                await window.Pi.init({ version: "2.0", sandbox: useSandbox });
                initialized.current = true;
                console.log(`[PI] SDK Iniciado. Sandbox: ${useSandbox}`);

                // Si acabamos de entrar en modo pago, lanzamos lo que hubiera pendiente
                if (isPaymentMode) {
                    console.log("[PI] Modo Pago Activo");
                }
            }
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
        if (!window.Pi) return;
        try {
            // Limpiamos modo pago para el auth por si acaso
            localStorage.removeItem("pi_payment_mode");
            const scopes = ["username", "payments", "wallet_address"];
            const auth = await window.Pi.authenticate(scopes, (p: any) => { });
            setUser(auth.user);
        } catch (error: any) {
            console.error("[PI] Auth failed", error);
            alert("Error al conectar cuenta.");
        }
    };

    const createPayment = async (amount: number, memo: string, metadata: any, onSuccess?: () => void) => {
        const isPaymentMode = localStorage.getItem("pi_payment_mode") === "true";
        const hostname = window.location.hostname;

        // Si estamos en Vercel y NO estamos en modo pago todavía, activamos y recargamos
        if (hostname.includes("vercel.app") && !isPaymentMode) {
            localStorage.setItem("pi_payment_mode", "true");
            // Guardamos los datos del pago para intentarlo al recargar (opcional, por ahora solo recargamos)
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
                        body: JSON.stringify({ paymentId }),
                    });
                },
                onReadyForServerCompletion: async (paymentId: string, txid: string) => {
                    await fetch("/api/pi/complete", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ paymentId, txid }),
                    });
                    localStorage.removeItem("pi_payment_mode");
                    if (onSuccess) onSuccess();
                },
                onCancel: () => {
                    localStorage.removeItem("pi_payment_mode");
                    window.location.reload(); // Volvemos a modo normal
                },
                onError: (error: any) => {
                    localStorage.removeItem("pi_payment_mode");
                    alert("Error en el pago: " + error.message);
                    window.location.reload();
                },
            });
        } catch (error: any) {
            localStorage.removeItem("pi_payment_mode");
            console.error(error);
        }
    };

    return (
        <PiContext.Provider value={{ user, loading, authenticate, createPayment }}>
            {/* Pequeño aviso visual de que estamos en modo pago */}
            {typeof window !== "undefined" && localStorage.getItem("pi_payment_mode") === "true" && (
                <div className="fixed bottom-4 left-4 bg-pi-purple text-white text-[10px] px-2 py-1 rounded-full z-[9999] animate-pulse">
                    Modo Pago Activo
                </div>
            )}
            {children}
        </PiContext.Provider>
    );
};

export const usePi = () => {
    const context = useContext(PiContext);
    if (!context) throw new Error("usePi error");
    return context;
};
