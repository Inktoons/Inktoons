"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface PiUser {
    uid: string;
    username: string;
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
                    window.Pi.init({ version: "2.0", sandbox: true });
                    console.log("Pi SDK initialized with API Key detection:", !!process.env.NEXT_PUBLIC_PI_API_KEY);
                }
            } catch (error) {
                console.error("Error initializing Pi SDK:", error);
            } finally {
                setLoading(false);
            }
        };

        initPi();
    }, []);

    const authenticate = async () => {
        if (!window.Pi) {
            console.error("Pi SDK not found on window");
            return;
        }

        try {
            console.log("Starting Pi authentication...");
            const scopes = ["username", "payments", "wallet_address"];

            const onIncompletePaymentFound = (payment: any) => {
                console.log("Incomplete payment found during auth:", payment);
                // Aquí podrías implementar la lógica para completar o cancelar el pago pendiente
            };

            const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
            console.log("Authentication successful:", auth);
            setUser(auth.user);
        } catch (error) {
            console.error("Authentication failed:", error);
            alert("Error al conectar con Pi Network. Asegúrate de estar dentro del Pi Browser.");
        }
    };

    const createPayment = async (amount: number, memo: string, metadata: any) => {
        if (!window.Pi) return;

        try {
            await window.Pi.createPayment({
                amount,
                memo,
                metadata,
            }, {
                onReadyForServerApproval: (paymentId: string) => {
                    console.log("Payment ready for server approval:", paymentId);
                },
                onReadyForServerCompletion: (paymentId: string, txid: string) => {
                    console.log("Payment ready for server completion:", paymentId, txid);
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
