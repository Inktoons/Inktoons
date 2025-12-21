"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { mockNews } from "@/data/mockNews";
import { ArrowLeft, Share2, Bookmark, MessageSquare, Zap, Star } from "lucide-react";
import { usePi } from "@/components/PiNetworkProvider";

export default function NewsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { createPayment } = usePi();
    const news = mockNews.find((item) => item.id === id);

    const handleTip = () => {
        createPayment(0.1, `Tip for article: ${news?.title}`, { articleId: id });
    };

    if (!news) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-foreground">
                <div className="text-center">
                    <h2 className="text-2xl font-black mb-4">404</h2>
                    <p className="text-gray-500 mb-8">Historia no encontrada</p>
                    <button onClick={() => router.push("/")} className="btn-tapas">
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-foreground">
            {/* Top Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-bold text-sm">
                    <ArrowLeft size={20} />
                    <span>VOLVER</span>
                </button>
                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"><Bookmark size={20} /></button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"><Share2 size={20} /></button>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-6 py-12">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {/* Story Header */}
                    <div className="flex flex-col items-center text-center mb-12">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-pi-purple/10 text-pi-purple px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                {news.category}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                            {news.title}
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-gray-400 font-bold">
                            <div className="flex items-center gap-1"><Star size={14} fill="#fbc02d" className="text-pi-gold" /> 4.9k</div>
                            <span className="w-1 h-1 rounded-full bg-gray-200" />
                            <span>{news.author}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-200" />
                            <span>{news.date}</span>
                        </div>
                    </div>

                    {/* Featured Image (Cover) */}
                    <div className="relative aspect-[3/4.5] max-w-sm mx-auto rounded-2xl overflow-hidden shadow-2xl mb-16 group">
                        <Image
                            src={news.imageUrl}
                            alt={news.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    </div>

                    {/* Content Section */}
                    <div className="prose prose-gray prose-lg max-w-none">
                        <p className="text-gray-600 leading-relaxed mb-8 first-letter:text-5xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-pi-purple">
                            {news.excerpt} Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        </p>

                        <div className="my-12 p-8 bg-gray-50 rounded-2xl border-l-8 border-pi-purple italic text-xl text-gray-700 font-medium">
                            "La visión de Pi Network es construir el ecosistema peer-to-peer más inclusivo del mundo."
                        </div>

                        <p className="text-gray-600 leading-relaxed mb-8">
                            En el contexto del ecosistema Pi Network, esta noticia representa un hito importante para todos los Pioneros. La integración de nuevas tecnologías y la expansión de la red principal abierta son temas de debate constante en la comunidad.
                        </p>

                        <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden my-12 shadow-md">
                            <Image
                                src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80"
                                alt="Content"
                                fill
                                className="object-cover"
                            />
                        </div>

                        <p className="text-gray-600 leading-relaxed">
                            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                        </p>
                    </div>

                    {/* Support the Author Section - Tapas Style */}
                    <div className="mt-20 p-10 rounded-3xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-xl text-center">
                        <div className="w-20 h-20 rounded-full bg-pi-purple mx-auto mb-6 flex items-center justify-center text-white text-3xl font-black shadow-lg">
                            {news.author[0]}
                        </div>
                        <h3 className="text-2xl font-black mb-2">Apoya a {news.author}</h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            Si te ha gustado esta historia, considera enviar una propina en Pi para que el autor pueda seguir creando contenido increíble.
                        </p>
                        <button
                            onClick={handleTip}
                            className="btn-tapas px-12 py-4 text-lg flex items-center gap-3 mx-auto shadow-lg active:scale-95 transition-transform"
                        >
                            <Zap size={20} fill="#fbc02d" className="text-pi-gold" />
                            Enviar 0.1 Pi
                        </button>
                    </div>

                    {/* Footer Stats */}
                    <div className="mt-20 flex items-center justify-center gap-12 text-gray-400 font-bold">
                        <button className="flex items-center gap-2 hover:text-pi-purple transition-colors">
                            <MessageSquare size={24} />
                            <span>128</span>
                        </button>
                        <button className="flex items-center gap-2 hover:text-pi-gold transition-colors">
                            <Star size={24} />
                            <span>4.9k</span>
                        </button>
                        <button className="flex items-center gap-2 hover:text-black transition-colors">
                            <Share2 size={24} />
                            <span>COMPARTIR</span>
                        </button>
                    </div>
                </motion.div>
            </main>

            <footer className="mt-32 py-20 bg-gray-50 border-t border-gray-100 text-center">
                <div className="max-w-[1200px] mx-auto px-4">
                    <div className="text-xl font-black text-pi-purple mb-4">Inktoons</div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">
                        © {new Date().getFullYear()} Inktoons Foundation. Parte del ecosistema Pi Network.
                    </p>
                </div>
            </footer>
        </div>
    );
}
