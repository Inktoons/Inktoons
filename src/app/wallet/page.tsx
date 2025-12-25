"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Wallet, TrendingUp, Zap, ShieldCheck, RefreshCw, AlertCircle } from "lucide-react";
import { useUserData } from "@/context/UserDataContext";
import { usePi } from "@/components/PiNetworkProvider";

export default function WalletPage() {
    const router = useRouter();
    const { userData, addBalance } = useUserData();
    const { user, createPayment } = usePi();
    const [loadingPack, setLoadingPack] = useState<number | null>(null);

    // ECONOMY CONFIGURATION
    // 1 Ink = $0.02 USD (fixed)

    // REAL PI VALUE (Fetched from Internal API)
    const [currentPiValue, setCurrentPiValue] = useState<number | null>(null);
    const [priceError, setPriceError] = useState(false);

    useEffect(() => {
        const fetchPiPrice = async () => {
            try {
                // Fetching from internal API proxy to avoid CORS
                const response = await fetch('/api/price');
                const data = await response.json();

                if (data && data.price) {
                    setCurrentPiValue(data.price);
                    setPriceError(false);
                } else {
                    throw new Error("Invalid data format");
                }
            } catch (error) {
                console.error("Error fetching Pi price:", error);
                setPriceError(true);
            }
        };

        fetchPiPrice();
        // Update price every 60 seconds
        const interval = setInterval(fetchPiPrice, 60000);
        return () => clearInterval(interval);
    }, []);

    // Function to calculate Pi Price based on USD target
    const calculatePiPrice = (usdTarget: number) => {
        if (!currentPiValue) return "---";
        return Number((usdTarget / currentPiValue).toFixed(2));
    };

    const packs = [
        {
            id: 1,
            amount: 50,
            priceUsd: 1.00,
            label: "Puñado de Tinta",
            bonus: 0,
            color: "bg-blue-50 border-blue-100",
            iconColor: "text-blue-500"
        },
        {
            id: 2,
            amount: 150,
            priceUsd: 3.00,
            label: "Frasco de Tinta",
            bonus: 10,
            tag: "POPULAR",
            color: "bg-pi-purple/10 border-pi-purple/20",
            iconColor: "text-pi-purple"
        },
        {
            id: 3,
            amount: 500,
            priceUsd: 10.00,
            label: "Barril de Tinta",
            bonus: 100,
            tag: "MEJOR VALOR",
            color: "bg-amber-50 border-amber-100",
            iconColor: "text-amber-500"
        }
    ];

    const handlePurchase = (pack: typeof packs[0]) => {
        if (!user) {
            alert("Debes conectar tu cuenta de Pi primero.");
            return;
        }

        if (!currentPiValue) {
            alert("Esperando precio actualizado de Pi Network...");
            return;
        }

        const piCost = Number(calculatePiPrice(pack.priceUsd));

        setLoadingPack(pack.id);

        createPayment(
            piCost,
            `Compra de ${pack.label} (${pack.amount + pack.bonus} Inks)`,
            { packId: pack.id, credits: pack.amount + pack.bonus }, // Metadata
            () => { // onSuccess callback
                const total = pack.amount + pack.bonus;
                addBalance(total);
                setLoadingPack(null);
                alert(`¡Compra exitosa! Has recibido ${total} Inks.`);
            }
        ).catch(() => {
            setLoadingPack(null);
        });
    };

    return (
        <div className="min-h-screen bg-white text-foreground">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="font-black text-xl">Monedero</h1>
            </div>

            <main className="max-w-md mx-auto px-6 py-8">

                {/* Balance Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black text-white rounded-3xl p-8 mb-8 relative overflow-hidden shadow-xl"
                >
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <span className="text-white/60 text-sm font-bold uppercase tracking-wider mb-2">Tu Balance Actual</span>
                        <div className="flex items-center gap-2 mb-6">
                            <span className="text-5xl font-black">{userData.balance}</span>
                            <span className="text-xl font-bold text-gray-400">Inks</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            {user ? `Conectado como @${user.username}` : "Modo Invitado"}
                        </div>
                    </div>

                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-pi-purple opacity-30 blur-3xl rounded-full" />
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-500 opacity-20 blur-3xl rounded-full" />
                </motion.div>

                {/* Conversion Info - Live Data */}
                <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-pi-purple">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase">Valor de Mercado (Pi)</p>
                            {currentPiValue ? (
                                <motion.div
                                    key={currentPiValue}
                                    initial={{ opacity: 0.5 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-2"
                                >
                                    <p className="font-bold text-sm">
                                        1 Pi ≈ ${currentPiValue.toFixed(2)} USD
                                    </p>
                                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-200">En vivo</span>
                                </motion.div>
                            ) : priceError ? (
                                <p className="text-sm font-bold text-red-500 flex items-center gap-1">
                                    <AlertCircle size={14} /> Error al obtener precio
                                </p>
                            ) : (
                                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                            )}
                        </div>
                    </div>

                    <div className="h-[1px] bg-gray-200 w-full mb-4" />

                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>1 Ink = $0.02 USD (Fijo)</span>
                        {currentPiValue && (
                            <span>1 Pi ≈ {(currentPiValue / 0.02).toFixed(1)} Inks</span>
                        )}
                    </div>
                </div>

                {/* Packages */}
                <h2 className="font-black text-lg mb-4 flex items-center gap-2">
                    <Zap className="text-pi-purple ml-1" size={20} fill="currentColor" />
                    Recargar Inks
                </h2>

                <div className="space-y-4">
                    {packs.map((pack) => {
                        const piCost = calculatePiPrice(pack.priceUsd);
                        return (
                            <motion.button
                                key={pack.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handlePurchase(pack)}
                                disabled={loadingPack !== null || !currentPiValue}
                                className={`w-full relative ${pack.color} border-2 p-5 rounded-2xl flex items-center justify-between text-left transition-all group disabled:opacity-70 disabled:grayscale`}
                            >
                                {pack.tag && (
                                    <span className="absolute -top-3 left-6 bg-black text-white text-[10px] font-black px-2 py-1 rounded-md shadow-sm">
                                        {pack.tag}
                                    </span>
                                )}

                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center ${pack.iconColor}`}>
                                        <Wallet size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">{pack.label}</h3>
                                        <p className="text-sm font-semibold text-gray-500">
                                            {pack.amount} Inks
                                            {pack.bonus > 0 && <span className="text-green-500 ml-1">+{pack.bonus} Extra</span>}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end">
                                    <span className="text-lg font-black text-gray-900">
                                        {typeof piCost === 'number' ? `${piCost} Pi` : <span className="text-gray-400 text-sm">Cargando...</span>}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400">(${pack.priceUsd.toFixed(2)} USD)</span>
                                </div>

                                {/* Loading Overlay */}
                                {loadingPack === pack.id && (
                                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                                    </div>
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                <div className="mt-8 flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <ShieldCheck className="text-gray-400 flex-shrink-0" size={20} />
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">
                        El precio en Pi se actualiza automáticamente cada minuto desde el mercado global (CoinGecko) para garantizar la mayor precisión.
                    </p>
                </div>

            </main>
        </div>
    );
}
