"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { usePi } from "@/components/PiNetworkProvider";
import {
    Search,
    Home,
    BookOpen,
    User,
    Eye,
    ArrowLeft,
    TrendingUp,
    Clock,
    Grid,
    ChevronDown,
    X,
    Filter
} from "lucide-react";
import { mockNews } from "@/data/mockNews";
import { useContent } from "@/context/ContentContext";
import { useMissions } from "@/context/MissionContext";
import { motion, AnimatePresence } from "framer-motion";

export default function ExplorePage() {
    const router = useRouter();
    const { user } = usePi();
    const { webtoons } = useContent();
    const { trackAction } = useMissions();

    // Active Tab: POPULAR, LO ÚLTIMO, DIRECTORIO
    const [activeTab, setActiveTab] = useState("DIRECTORIO");
    const [searchQuery, setSearchQuery] = useState("");

    // Filters
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

    // Combine Data
    const allItems = useMemo(() => {
        const combined = [
            ...webtoons.map(w => ({
                id: w.id,
                title: w.title,
                author: w.author,
                genre: w.category,
                views: 0,
                status: w.status === "ongoing" ? "Continuo" : "Completado",
                isNew: new Date(w.date).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000), // Within 7 days
                image: w.imageUrl,
                date: w.date
            })),
            ...mockNews.map(item => ({
                id: item.id,
                title: item.title,
                author: item.author,
                genre: item.category,
                views: Math.floor(Math.random() * 50000),
                status: Math.random() > 0.3 ? "Continuo" : "Completado",
                isNew: false,
                image: item.imageUrl,
                date: item.date
            }))
        ];
        return combined;
    }, [webtoons]);

    // Derived Filtered List for Results
    const searchResults = useMemo(() => {
        if (!searchQuery && !selectedStatus && !selectedLetter) return [];

        return allItems.filter(item => {
            const matchesSearch = !searchQuery ||
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.author.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = !selectedStatus ||
                (selectedStatus === "Nueva" ? item.isNew : item.status === selectedStatus);

            const matchesLetter = !selectedLetter ||
                (selectedLetter === "0-9"
                    ? /^\d/.test(item.title)
                    : item.title.toUpperCase().startsWith(selectedLetter));

            return matchesSearch && matchesStatus && matchesLetter;
        });
    }, [searchQuery, selectedStatus, selectedLetter, allItems]);

    // Lists for Popular and Latest
    const popularList = useMemo(() => [...allItems].sort((a, b) => b.views - a.views), [allItems]);
    const latestList = useMemo(() => [...allItems].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [allItems]);

    const alphabet = ["0-9", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

    return (
        <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col font-sans">
            {/* 1. TOP SEARCH BAR */}
            <div className="p-4 pt-6">
                <div className="relative group">
                    <div className={`absolute inset-0 bg-gradient-to-r from-[#FF4D4D]/20 to-transparent rounded-lg blur-md opacity-0 group-focus-within:opacity-100 transition-opacity`} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Ingrese el título o el nombre del autor"
                        className="w-full bg-[#2A2A2A] border border-[#3A3A3A] group-focus-within:border-[#FF4D4D]/50 rounded-lg py-3.5 pl-12 pr-4 text-sm outline-none transition-all placeholder:text-gray-500 relative z-10"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-20" size={20} />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white z-20"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* 2. MAIN TABS */}
            <div className="flex border-b border-[#2A2A2A] px-4">
                {["POPULAR", "LO ÚLTIMO", "DIRECTORIO"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => {
                            setActiveTab(tab);
                            // Clear filters when switching to non-directory tabs if desired
                            if (tab !== "DIRECTORIO") {
                                setSelectedStatus(null);
                                setSelectedLetter(null);
                            }
                        }}
                        className={`flex-1 py-4 text-xs font-black tracking-widest relative transition-colors ${activeTab === tab ? "text-[#FF4D4D]" : "text-gray-500"
                            }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <motion.div
                                layoutId="tab-indicator"
                                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF4D4D]"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* 3. CONTENT AREA */}
            <main className="flex-1 overflow-y-auto pb-32">
                <AnimatePresence mode="wait">
                    {activeTab === "DIRECTORIO" && !searchQuery && !selectedStatus && !selectedLetter ? (
                        <motion.div
                            key="directory-main"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-6 space-y-8"
                        >
                            {/* --- ESTADO --- */}
                            <div>
                                <h3 className="text-gray-400 text-sm font-bold mb-6">Estado</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {["Continuo", "Completado", "Nueva"].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setSelectedStatus(status)}
                                            className="py-3 text-sm font-bold text-gray-300 hover:text-[#FF4D4D] transition-colors"
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* --- ALFABETICO --- */}
                            <div>
                                <h3 className="text-gray-400 text-sm font-bold mb-6">Alfabetico</h3>
                                <div className="grid grid-cols-3 gap-y-8 gap-x-4">
                                    {alphabet.map((char) => (
                                        <button
                                            key={char}
                                            onClick={() => setSelectedLetter(char)}
                                            className="py-2 text-sm font-bold text-gray-300 hover:text-[#FF4D4D] transition-colors text-center"
                                        >
                                            {char}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="results-list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-4"
                        >
                            {/* Filter Summary / Clear Button if in results mode */}
                            {(searchQuery || selectedStatus || selectedLetter) && (
                                <div className="flex items-center justify-between mb-6 px-2">
                                    <div className="flex flex-wrap gap-2">
                                        {selectedStatus && (
                                            <span className="bg-[#FF4D4D]/10 text-[#FF4D4D] px-3 py-1 rounded-full text-[10px] font-bold border border-[#FF4D4D]/20">
                                                {selectedStatus}
                                            </span>
                                        )}
                                        {selectedLetter && (
                                            <span className="bg-pi-purple/10 text-pi-purple px-3 py-1 rounded-full text-[10px] font-bold border border-pi-purple/20">
                                                Letra: {selectedLetter}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSearchQuery("");
                                            setSelectedStatus(null);
                                            setSelectedLetter(null);
                                        }}
                                        className="text-[10px] font-black text-gray-500 uppercase tracking-tighter hover:text-white"
                                    >
                                        Limpiar Todo
                                    </button>
                                </div>
                            )}

                            {/* Grid of Results */}
                            <div className="grid grid-cols-1 gap-4">
                                {(searchQuery || selectedStatus || selectedLetter ? searchResults :
                                    activeTab === "POPULAR" ? popularList : latestList).length > 0 ? (
                                    (searchQuery || selectedStatus || selectedLetter ? searchResults :
                                        activeTab === "POPULAR" ? popularList : latestList).map((item, idx) => (
                                            <div
                                                key={item.id + idx}
                                                onClick={() => router.push(`/news/${item.id}`)}
                                                className="flex gap-4 p-3 bg-[#252525] rounded-xl border border-[#303030] hover:border-[#FF4D4D]/30 transition-all cursor-pointer group active:scale-[0.98]"
                                            >
                                                <div className="relative w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden shadow-2xl">
                                                    <Image
                                                        src={item.image}
                                                        alt={item.title}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                    {item.isNew && (
                                                        <div className="absolute top-0 left-0 bg-[#FF4D4D] text-[8px] font-black px-1.5 py-0.5 rounded-br-lg uppercase">
                                                            NEW
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 flex flex-col justify-center py-1">
                                                    <h4 className="font-bold text-sm text-gray-100 line-clamp-2 leading-snug group-hover:text-[#FF4D4D] transition-colors mb-1.5">
                                                        {item.title}
                                                    </h4>
                                                    <p className="text-[11px] text-gray-500 font-medium mb-3">
                                                        {item.author} • {item.genre}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-auto">
                                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-black/30 rounded text-gray-400">
                                                            <TrendingUp size={10} className="text-[#FF4D4D]" />
                                                            <span className="text-[10px] font-black">{item.views.toLocaleString()}</span>
                                                        </div>
                                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${item.status === 'Continuo' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                                                            }`}>
                                                            {item.status.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                ) : (
                                    <div className="text-center py-20 flex flex-col items-center">
                                        <div className="w-16 h-16 bg-[#2A2A2A] rounded-full flex items-center justify-center mb-4 text-gray-600">
                                            <Search size={32} />
                                        </div>
                                        <p className="text-gray-400 text-sm font-bold">Sin resultados</p>
                                        <p className="text-gray-600 text-[11px] mt-1">Prueba con otros términos o filtros</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* 4. BOTTOM NAVIGATION - MATCHING GLOBAL STYLE */}
            <nav className="fixed bottom-0 left-0 right-0 bg-[#1A1A1A]/95 backdrop-blur-xl border-t border-[#2A2A2A] px-8 py-4 flex items-center justify-between z-50">
                <button onClick={() => router.push("/")} className="text-gray-500 hover:text-[#FF4D4D] transition-all flex flex-col items-center gap-1">
                    <Home size={22} />
                    <span className="text-[10px] font-bold">Inicio</span>
                </button>
                <button className="text-[#FF4D4D] flex flex-col items-center gap-1">
                    <Search size={22} />
                    <span className="text-[10px] font-bold underline decoration-2 underline-offset-4">Descubre</span>
                </button>
                <button onClick={() => router.push("/library")} className="text-gray-500 hover:text-[#FF4D4D] transition-all flex flex-col items-center gap-1">
                    <BookOpen size={22} />
                    <span className="text-[10px] font-bold">Biblioteca</span>
                </button>
                <button onClick={() => router.push("/profile")} className="text-gray-500 hover:text-[#FF4D4D] transition-all flex flex-col items-center gap-1">
                    <User size={22} />
                    <span className="text-[10px] font-bold">Perfil</span>
                </button>
            </nav>
        </div>
    );
}
