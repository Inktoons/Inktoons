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
    ArrowLeft
} from "lucide-react";
import { mockNews } from "@/data/mockNews";
import { useContent } from "@/context/ContentContext";

export default function ExplorePage() {
    const router = useRouter();
    const { user } = usePi();
    const { webtoons } = useContent();
    const [activeTab, setActiveTab] = useState("POPULAR"); // Tabs: POPULAR, LO ÚLTIMO, DIRECTORIO
    const [searchQuery, setSearchQuery] = useState("");

    // Directory State
    const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [selectedSort, setSelectedSort] = useState<string>("Popular");

    // Combine Mock Data and User Content
    const directoryItems = useMemo(() => {
        const allItems = [
            ...mockNews.map(item => ({
                id: item.id,
                title: item.title,
                author: item.author,
                genre: item.category,
                views: (Math.random() * 1000000).toFixed(0),
                chapter: "Capítulo 1",
                year: "2025",
                status: "Continuo",
                image: item.imageUrl
            })),
            ...webtoons.map(w => ({
                id: w.id,
                title: w.title,
                author: w.author,
                genre: w.category,
                views: "0",
                chapter: w.chapters.length > 0 ? `Capítulo ${w.chapters.length}` : "Sin capítulos",
                year: "2025",
                status: w.status === "ongoing" ? "Continuo" : "Completado",
                image: w.imageUrl
            }))
        ];
        return allItems;
    }, [webtoons]);

    // Filter Logic
    const filteredItems = useMemo(() => {
        let items = directoryItems.filter(item => {
            // Search Query Filter
            if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase()) && !item.author.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            // Letter Filter
            if (selectedLetter && !item.title.toUpperCase().startsWith(selectedLetter)) {
                return false;
            }
            // Year Filter
            if (selectedYear && item.year !== selectedYear) return false;
            // Status Filter
            if (selectedStatus && item.status !== selectedStatus) return false;

            return true;
        });

        // Tab or Sort Logic
        if (activeTab === "LO ÚLTIMO" || selectedSort === "Recientes") {
            return items.sort((a, b) => new Date(b.year || "2025").getTime() - new Date(a.year || "2025").getTime());
        }

        return items.sort((a, b) => {
            if (selectedSort === "A-Z") return a.title.localeCompare(b.title);
            if (selectedSort === "Popular") return parseInt(b.views.replace(/,/g, '')) - parseInt(a.views.replace(/,/g, ''));
            return 0;
        });
    }, [selectedLetter, selectedYear, selectedStatus, selectedSort, directoryItems, activeTab]);

    // Data for Popular/Latest tabs (simplified)
    const popularMangas = directoryItems;

    // Helper specific to Directory Horizontal Scroll Lists
    const FilterRow = ({
        label,
        items,
        selected,
        onSelect,
        isPill = false
    }: {
        label?: string, // e.g. "year", "status", "sort"
        items: string[],
        selected: string | null,
        onSelect: (val: string) => void,
        isPill?: boolean
    }) => (
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2 px-4 border-b border-gray-50 bg-white min-w-full">
            {label && (
                <div className="flex-shrink-0">
                    <span className="px-3 py-1 rounded-full border border-pi-purple/50 text-pi-purple text-xs font-bold uppercase tracking-wider">
                        {label}
                    </span>
                </div>
            )}

            {items.map(item => {
                const isActive = item === selected;
                return (
                    <button
                        key={item}
                        onClick={() => onSelect(item)}
                        className={`flex-shrink-0 text-sm font-medium transition-colors whitespace-nowrap ${isActive
                            ? "text-pi-purple font-black"
                            : "text-gray-400 hover:text-gray-600"
                            } ${isPill && isActive ? "" : ""}`} // Add pill styling logic specifically if needed, mimicking simple text list from image
                    >
                        {/* Circle indicator for alphabet active state in image */}
                        <div className="relative">
                            {item}
                            {!label && isActive && ( // Alphabet row style
                                <div className="absolute -inset-2 rounded-full border border-pi-purple opacity-30 pointer-events-none" />
                            )}
                        </div>
                    </button>
                );
            })}
        </div>
    );

    const years = ["2037", "2034", "2025", "2024", "2023", "2022", "2021", "2020", "2019"];
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    return (
        <div className="min-h-screen bg-white text-foreground flex flex-col">
            {/* Header / Search Bar OR Directory Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
                {activeTab === "DIRECTORIO" ? (
                    <div className="px-4 py-3 flex items-center gap-4 bg-white">
                        <button onClick={() => router.push("/")} className="text-gray-500 hover:text-black">
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-xl font-black">Directorio</h1>
                        {/* Optional Search icon on right if needed */}
                        <Search className="ml-auto text-gray-400" size={24} />
                    </div>
                ) : (
                    <div className="px-4 py-3">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Ingrese el título o el nombre del autor"
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-11 pr-4 text-sm outline-none focus:border-pi-purple focus:ring-1 focus:ring-pi-purple transition-all text-black"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex items-center justify-around px-2">
                    {["POPULAR", "LO ÚLTIMO", "DIRECTORIO"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === tab
                                ? "border-pi-purple text-pi-purple"
                                : "border-transparent text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </header>

            <main className="flex-1 pb-24">
                {activeTab === "DIRECTORIO" ? (
                    <div className="flex flex-col">
                        {/* 1. Alphabet Filter Row */}
                        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-3 px-6 border-b border-gray-50 bg-white">
                            {letters.map((l) => (
                                <button
                                    key={l}
                                    onClick={() => setSelectedLetter(l)}
                                    className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-all ${selectedLetter === l
                                        ? "bg-transparent border border-pi-purple text-pi-purple"
                                        : "text-gray-400 hover:text-gray-600"
                                        }`}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>

                        {/* 2. Year Filter Row */}
                        <FilterRow
                            label="year"
                            items={years}
                            selected={selectedYear}
                            onSelect={setSelectedYear}
                        />

                        {/* 3. Status Filter Row */}
                        <FilterRow
                            label="status"
                            items={["Continuo", "Completado"]}
                            selected={selectedStatus}
                            onSelect={setSelectedStatus}
                        />

                        {/* 4. Sort Filter Row */}
                        <FilterRow
                            label="sort"
                            items={["A-Z", "Popular", "Calificación", "Recientes"]}
                            selected={selectedSort}
                            onSelect={setSelectedSort}
                        />

                        {/* Results List */}
                        <div className="p-4 flex flex-col gap-4">
                            {filteredItems.length > 0 ? filteredItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-start gap-4 hover:bg-gray-50 p-2 rounded-xl transition-colors cursor-pointer"
                                    onClick={() => router.push(`/news/${item.id}`)}
                                >
                                    {/* Thumbnail */}
                                    <div className="relative w-20 h-28 flex-shrink-0 rounded-md overflow-hidden shadow-sm">
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 flex flex-col justify-center gap-1.5 py-1">
                                        <h3 className="text-base font-bold leading-tight text-gray-800">
                                            {item.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 font-medium border-l-2 border-pi-purple pl-2">
                                            {item.genre} | {item.author || "Unknown"}
                                        </p>
                                        <p className="text-[11px] text-gray-400">
                                            Esto tiene {item.views} vistas
                                        </p>
                                        <p className="text-[11px] text-gray-500 font-bold mt-1">
                                            {item.chapter}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-20">
                                    <p className="text-gray-400 font-medium">No se encontraron resultados para "{selectedLetter}"</p>
                                    <button onClick={() => { setSelectedLetter(null); setSelectedYear(null); setSelectedStatus(null); }} className="text-pi-purple text-sm font-bold mt-2">
                                        Limpiar Filtros
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Content List for Popular and Lo Último */
                    <div className="flex flex-col">
                        {filteredItems.map((manga) => (
                            <div
                                key={manga.id}
                                className="flex items-start gap-4 p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group"
                                onClick={() => router.push(`/news/${manga.id}`)}
                            >
                                {/* Manga Cover */}
                                <div className="relative w-24 h-32 flex-shrink-0 rounded shadow-sm overflow-hidden">
                                    <Image
                                        src={manga.image}
                                        alt={manga.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform"
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1 flex flex-col gap-1">
                                    <h3 className="text-base font-bold text-gray-900 group-hover:text-pi-purple transition-colors leading-tight">
                                        {manga.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 font-medium">
                                        {manga.author} | {manga.genre}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {manga.chapter}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-auto pt-2">
                                        <Eye size={12} className="text-gray-400" />
                                        <p className="text-[11px] text-gray-400">
                                            Esto tiene {manga.views} vistas
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 px-8 py-4 flex items-center justify-between z-50">
                <button onClick={() => router.push("/")} className="text-gray-400 hover:text-pi-purple transition-all flex flex-col items-center gap-1">
                    <Home size={24} />
                    <span className="text-[10px] font-bold">Inicio</span>
                </button>
                <button className="text-pi-purple transition-all flex flex-col items-center gap-1">
                    <Search size={24} />
                    <span className="text-[10px] font-bold">Explorar</span>
                </button>
                <button onClick={() => router.push("/library")} className="text-gray-400 hover:text-pi-purple transition-all flex flex-col items-center gap-1">
                    <BookOpen size={24} />
                    <span className="text-[10px] font-bold">Biblioteca</span>
                </button>
                <button onClick={() => router.push("/profile")} className="text-gray-400 hover:text-pi-purple transition-all flex flex-col items-center gap-1">
                    <User size={24} />
                    <span className="text-[10px] font-bold">Perfil</span>
                </button>
            </nav>
            <div className="h-6 lg:hidden" /> {/* Spacer */}
        </div>
    );
}
