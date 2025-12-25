"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { usePi } from "@/components/PiNetworkProvider";
import { mockNews } from "@/data/mockNews";
import {
    Bell,
    Menu,
    BookOpen,
    Home,
    Search,
    User,
    Clock,
    Play
} from "lucide-react";

export default function LibraryPage() {
    const router = useRouter();
    const { user } = usePi();

    // Simulamos historias que el usuario está leyendo actualmente
    const readingNow = mockNews.slice(0, 3).map((item, index) => ({
        ...item,
        progress: [75, 30, 95][index],
        lastChapter: ["Cap. 12", "Cap. 4", "Cap. 48"][index]
    }));

    return (
        <div className="min-h-screen bg-white text-foreground flex flex-col">
            {/* Header style matching reference */}
            <header className="px-6 py-4 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center gap-2">
                    <BookOpen className="text-pi-purple" size={28} />
                    <span className="text-2xl font-black text-pi-purple tracking-tighter">Inktoons</span>
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 text-gray-400 hover:text-black transition-colors"><Bell size={24} /></button>
                    <button className="p-2 text-gray-400 hover:text-black transition-colors"><Menu size={24} /></button>
                </div>
            </header>

            <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-black flex items-center gap-3">
                        <BookOpen className="text-pi-purple" size={24} />
                        Tu Biblioteca
                    </h1>
                    <span className="text-xs font-black text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                        {readingNow.length} HISTORIAS
                    </span>
                </div>

                {readingNow.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {readingNow.map((item) => (
                            <motion.div
                                key={item.id}
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group"
                                onClick={() => router.push(`/news/${item.id}`)}
                            >
                                <div className="flex h-40">
                                    <div className="relative w-28 h-full flex-shrink-0">
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.title}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
                                            <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-pi-purple scale-0 group-hover:scale-100 transition-transform">
                                                <Play size={16} fill="currentColor" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 p-4 flex flex-col justify-between">
                                        <div>
                                            <span className="text-[10px] font-black text-pi-purple uppercase tracking-widest block mb-1">
                                                {item.category}
                                            </span>
                                            <h3 className="font-bold text-sm leading-tight line-clamp-2 mb-2 group-hover:text-pi-purple transition-colors">
                                                {item.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-[11px] text-gray-400 font-bold">
                                                <Clock size={12} />
                                                <span>Sigue leyendo: {item.lastChapter}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-[10px] font-black text-gray-400">
                                                <span>PROGRESO</span>
                                                <span>{item.progress}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${item.progress}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                    className="h-full bg-pi-purple"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mb-6">
                            <BookOpen size={48} />
                        </div>
                        <h2 className="text-xl font-black mb-2">Tu Biblioteca está vacía</h2>
                        <p className="text-gray-400 text-sm max-w-xs mb-8">
                            Empieza a leer tus historias favoritas y aparecerán aquí automáticamente.
                        </p>
                        <button
                            onClick={() => router.push("/")}
                            className="btn-tapas px-10"
                        >
                            Explorar Contenido
                        </button>
                    </div>
                )}

                {/* Section for Recommendations or Favorites could go here */}
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 px-8 py-4 flex items-center justify-between z-50">
                <button onClick={() => router.push("/")} className="text-gray-400 hover:text-pi-purple transition-all flex flex-col items-center gap-1">
                    <Home size={24} />
                    <span className="text-[10px] font-bold">Inicio</span>
                </button>
                <button onClick={() => router.push("/explore")} className="text-gray-400 hover:text-pi-purple transition-all flex flex-col items-center gap-1">
                    <Search size={24} />
                    <span className="text-[10px] font-bold">Explorar</span>
                </button>
                <button className="text-pi-purple transition-all flex flex-col items-center gap-1">
                    <BookOpen size={24} />
                    <span className="text-[10px] font-bold">Biblioteca</span>
                </button>
                <button onClick={() => router.push("/profile")} className="text-gray-400 hover:text-pi-purple transition-all flex flex-col items-center gap-1">
                    <User size={24} />
                    <span className="text-[10px] font-bold">Perfil</span>
                </button>
            </nav>
            <div className="h-24" />
        </div>
    );
}
