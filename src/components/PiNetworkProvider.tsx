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
    authenticate: () => Promise<void>;
    createPayment: (amount: number, memo: string, metadata: any) => Promise<void>;
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

    useEffect(() => {
        const initPi = async () => {
            try {
                if (window.Pi) {
                    const isPiBrowser = /PiBrowser/i.test(navigator.userAgent);
                    const isLocal = window.location.hostname === "localhost" ||
                        window.location.hostname === "127.0.0.1" ||
                        window.location.hostname.includes("ngrok-free.app") ||
                        window.location.hostname.includes("ngrok-free.dev") ||
                        window.location.hostname.includes("ngrok.io");

                    // Solo activar sandbox si estamos en desarrollo Y NO estamos dentro del Pi Browser
                    const useSandbox = isLocal && !isPiBrowser;

                    console.log(`Initializing Pi SDK (PiBrowser: ${isPiBrowser}, Local: ${isLocal}, useSandbox: ${useSandbox})...`);

                    window.Pi.init({ version: "2.0", sandbox: useSandbox });
                    console.log("Pi SDK initialized successfully");
                } else {
                    console.warn("Pi SDK (window.Pi) not found during initialization");
                }
            } catch (error) {
                console.error("Error initializing Pi SDK:", error);
            } finally {
                setLoading(false);
            }
        };

        // Dar un pequeño margen para que el script se cargue si no está inmediatamente disponible
        if (window.Pi) {
            initPi();
        } else {
            const timer = setTimeout(initPi, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const authenticate = async () => {
        if (!window.Pi) {
            console.error("Pi SDK not found on window");
            alert("El SDK de Pi no se ha cargado. Abre esta app desde el Pi Browser.");
            return;
        }

        try {
            console.log("Starting Pi authentication...");
            const scopes = ["username", "payments", "wallet_address"];

            const onIncompletePaymentFound = async (payment: any) => {
                console.log("Incomplete payment found during auth:", payment);
                try {
                    await fetch("/api/pi/complete", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ paymentId: payment.identifier, txid: payment.transaction.txid }),
                    });
                    console.log("Incomplete payment resolved");
                } catch (error) {
                    console.error("Error resolving incomplete payment:", error);
                }
            };

            const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
            console.log("Authentication successful:", auth);
            setUser(auth.user);
        } catch (error) {
            console.error("Authentication failed:", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            alert("Error al conectar con Pi Network: " + errorMessage + "\n\nTip: Asegúrate de estar dentro del Pi Browser y que la URL coincida con la configurada en el Developer Portal.");
        }
    };

    const createPayment = async (amount: number, memo: string, metadata: any) => {
        if (!window.Pi) {
            console.error("Pi SDK not found for payment");
            return;
        }

        try {
            console.log("Initiating payment of", amount, "Pi...");
            await window.Pi.createPayment({
                amount,
                memo,
                metadata,
            }, {
                onReadyForServerApproval: async (paymentId: string) => {
                    console.log("Payment ready for server approval:", paymentId);
                    try {
                        const response = await fetch("/api/pi/approve", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ paymentId }),
                        });
                        if (response.ok) {
                            console.log("Payment approved by server");
                        } else {
                            console.error("Failed to approve payment on server");
                        }
                    } catch (error) {
                        console.error("Error approving payment:", error);
                    }
                },
                onReadyForServerCompletion: async (paymentId: string, txid: string) => {
                    console.log("Payment ready for server completion:", paymentId, txid);
                    try {
                        const response = await fetch("/api/pi/complete", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ paymentId, txid }),
                        });
                        if (response.ok) {
                            console.log("Payment completed by server");
                            alert("¡Pago realizado con éxito!");
                        } else {
                            console.error("Failed to complete payment on server");
                        }
                    } catch (error) {
                        console.error("Error completing payment:", error);
                    }
                },
                onCancel: (paymentId: string) => {
                    console.log("Payment cancelled:", paymentId);
                },
                onError: (error: any, payment: any) => {
                    console.error("Payment error:", error, payment);
                },
            });
        } catch (error) {
            console.error("Error creating payment:", error);
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
    if (context === undefined) {
        throw new Error("usePi must be used within a PiProvider");
    }
    return context;
};
