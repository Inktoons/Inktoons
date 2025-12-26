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

        // Si el usuario intenta loguearse de forma manual, limpiamos cualquier modo pago
        if (!isAuto) {
            if (localStorage.getItem("pi_payment_mode") === "true") {
                localStorage.removeItem("pi_payment_mode");
                window.location.reload();
                return;
            }
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
            localStorage.setItem("pi_logged_in", "true");
        } catch (error: any) {
            if (!isAuto && !error.message?.includes("cancelled")) {
                alert("Error de conexión. Prueba a refrescar la página.");
            }
            if (!isAuto) localStorage.removeItem("pi_logged_in");
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
        if (!user) {
            alert("Debes conectar tu cuenta de Pi antes de realizar un pago.");
            return;
        }

        const isPaymentMode = localStorage.getItem("pi_payment_mode") === "true";
        const hostname = window.location.hostname;

        if (hostname.includes("vercel.app") && !isPaymentMode) {
            localStorage.setItem("pi_payment_mode", "true");
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
                    alert("Pago fallido: " + error.message);
                    window.location.reload();
                },
            });
        } catch (error: any) {
            localStorage.removeItem("pi_payment_mode");
        }
    };

    const cancelPaymentMode = () => {
        localStorage.removeItem("pi_payment_mode");
        window.location.reload();
    };

    return (
        <PiContext.Provider value={{ user, loading, authenticate, createPayment }}>
            {children}
            {typeof window !== "undefined" && localStorage.getItem("pi_payment_mode") === "true" && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-white border-2 border-pi-purple shadow-2xl rounded-2xl p-4 z-[9999] flex flex-col items-center gap-3 animate-in slide-in-from-top duration-300 max-w-[280px] text-center">
                    <div className="text-pi-purple font-black text-sm uppercase tracking-wider">Modo Pago Test-Pi</div>
                    <p className="text-xs text-gray-500 font-medium">Pulsa de nuevo el botón de compra para abrir la Wallet.</p>
                    <button
                        onClick={cancelPaymentMode}
                        className="text-[10px] font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-full transition-colors"
                    >
                        CANCELAR Y PULSAR LOGIN
                    </button>
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
