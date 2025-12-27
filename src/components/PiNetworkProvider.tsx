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

    // PERSISTENCIA DE LOGIN (Nativa para la demo)
    const authenticate = useCallback(async (isAuto = false) => {
        if (!window.Pi) {
            if (!isAuto) alert("SDK de Pi no detectado. Si estás en Pi Browser, refresca.");
            return;
        }
        try {
            const auth = await window.Pi.authenticate(["username", "payments", "wallet_address"], (p: any) => { });
            setUser(auth.user);
            localStorage.setItem("pi_logged_in", "true");
        } catch (error: any) {
            if (!isAuto && !error.message?.includes("cancelled")) {
                alert("Error de conexión: " + error.message);
            }
            localStorage.removeItem("pi_logged_in");
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            if (window.Pi && !initialized.current) {
                try {
                    // Inicializamos normal para permitir el LOGIN
                    await window.Pi.init({ version: "2.0", sandbox: false });
                    initialized.current = true;
                    if (localStorage.getItem("pi_logged_in") === "true") {
                        await authenticate(true);
                    }
                } catch (e) { }
            }
            setLoading(false);
        };
        const timer = setTimeout(init, 1000);
        return () => clearTimeout(timer);
    }, [authenticate]);

    // MODO DEMO: Simula el pago instantáneamente sin abrir la wallet
    const createPayment = async (amount: number, memo: string, metadata: any, onSuccess?: () => void) => {
        console.log(`[DEMO MODE] Pago simulado por: ${amount} Pi (${memo})`);

        // Simulamos una pequeña espera de "procesamiento" para que se sienta real
        if (onSuccess) {
            setTimeout(() => {
                onSuccess();
            }, 800);
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
    if (!context) throw new Error("usePi error");
    return context;
};
