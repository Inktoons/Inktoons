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
                    // Determinar si estamos en entorno de desarrollo (localhost o ngrok)
                    const isSandbox = window.location.hostname === "localhost" ||
                        window.location.hostname === "127.0.0.1" ||
                        window.location.hostname.includes("ngrok-free.app") ||
                        window.location.hostname.includes("ngrok.io");

                    console.log(`Initializing Pi SDK (Sandbox: ${isSandbox})...`);

                    window.Pi.init({ version: "2.0", sandbox: isSandbox });
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

            const onIncompletePaymentFound = (payment: any) => {
                console.log("Incomplete payment found during auth:", payment);
                // Aquí se podría implementar la lógica para completar pagos pendientes
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
                onReadyForServerApproval: (paymentId: string) => {
                    console.log("Payment ready for server approval:", paymentId);
                    // Aquí deberías llamar a tu backend para aprobar el pago
                },
                onReadyForServerCompletion: (paymentId: string, txid: string) => {
                    console.log("Payment ready for server completion:", paymentId, txid);
                    // Aquí deberías llamar a tu backend para completar el pago
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
