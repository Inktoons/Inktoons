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

    const authenticate = useCallback(async (isAuto = false) => {
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
            localStorage.setItem("pi_logged_in", "true");
            console.log("[PI] Auth Exitoso:", auth.user.username);
        } catch (error: any) {
            if (!isAuto && !error.message?.includes("cancelled")) {
                alert("Error al conectar: " + error.message);
            }
            localStorage.removeItem("pi_logged_in");
        }
    }, []);

    const initPi = useCallback(async () => {
        if (typeof window === "undefined" || initialized.current) return;

        if (window.Pi) {
            try {
                const hostname = window.location.hostname;
                const isPaymentMode = localStorage.getItem("pi_payment_mode") === "true";
                const useSandbox = hostname === "localhost" || hostname.includes("ngrok") || (hostname.includes("vercel.app") && isPaymentMode);

                await window.Pi.init({ version: "2.0", sandbox: useSandbox });
                initialized.current = true;
                console.log(`[PI] Init (Sandbox: ${useSandbox})`);

                // Si estábamos logueados, intentamos recuperar la sesión automáticamente
                if (localStorage.getItem("pi_logged_in") === "true") {
                    await authenticate(true);
                }
            } catch (error) {
                console.error("[PI] Init error", error);
            }
        }
        setLoading(false);
    }, [authenticate]);

    useEffect(() => {
        const timer = setTimeout(initPi, 1000);
        return () => clearTimeout(timer);
    }, [initPi]);

    const createPayment = async (amount: number, memo: string, metadata: any, onSuccess?: () => void) => {
        const isPaymentMode = localStorage.getItem("pi_payment_mode") === "true";
        const hostname = window.location.hostname;

        if (hostname.includes("vercel.app") && !isPaymentMode) {
            localStorage.setItem("pi_payment_mode", "true");
            // Guardamos intención de pago para que sea más fluido tras el reload
            localStorage.setItem("pi_pending_pay_amount", amount.toString());
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
                        body: JSON.stringify({ paymentId })
                    });
                },
                onReadyForServerCompletion: async (paymentId: string, txid: string) => {
                    await fetch("/api/pi/complete", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ paymentId, txid })
                    });
                    localStorage.removeItem("pi_payment_mode");
                    if (onSuccess) onSuccess();
                },
                onCancel: () => {
                    localStorage.removeItem("pi_payment_mode");
                    window.location.reload();
                },
                onError: (error: any) => {
                    localStorage.removeItem("pi_payment_mode");
                    alert("Error en el pago: " + error.message);
                    window.location.reload();
                },
            });
        } catch (error: any) {
            localStorage.removeItem("pi_payment_mode");
        }
    };

    return (
        <PiContext.Provider value={{ user, loading, authenticate, createPayment }}>
            {children}
            {typeof window !== "undefined" && localStorage.getItem("pi_payment_mode") === "true" && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-pi-purple text-white px-4 py-2 rounded-full z-[9999] shadow-lg flex items-center gap-2 animate-bounce">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></span>
                    Pulsa de nuevo para confirmar pago con Test-Pi
                </div>
            )}
        </PiContext.Provider>
    );
};

export const usePi = () => {
    const context = useContext(PiContext);
    if (!context) throw new Error("usePi must be used within a PiProvider");
    return context;
};
