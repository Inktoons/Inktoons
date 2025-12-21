"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { usePi } from "@/components/PiNetworkProvider";
import { mockNews } from "@/data/mockNews";
import { Search, Bell, Menu, User, Zap, Star, TrendingUp, Clock } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { user, authenticate, loading } = usePi();
  const [activeTab, setActiveTab] = useState("Spotlight");

  const categories = ["Spotlight", "Diario", "Nuevo", "Popular", "Gratis", "WUF", "Completado"];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-pi-gold selection:text-black">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="text-2xl font-extrabold tracking-tighter text-pi-purple cursor-pointer" onClick={() => router.push("/")}>
            Inktoons
          </div>
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-gray-500">
            <a href="#" className="text-black border-b-2 border-black pb-1">Inicio</a>
            <a href="#" className="hover:text-black transition-colors">Cómics</a>
            <a href="#" className="hover:text-black transition-colors">Novelas</a>
            <a href="#" className="hover:text-black transition-colors">Comunidad</a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-64">
            <Search size={16} className="text-gray-400 mr-2" />
            <input type="text" placeholder="Buscar historias..." className="bg-transparent text-sm outline-none w-full" />
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"><Bell size={20} /></button>
              <div className="w-8 h-8 rounded-full bg-pi-purple flex items-center justify-center text-white cursor-pointer">
                <User size={16} />
              </div>
            </div>
          ) : (
            <button
              onClick={authenticate}
              disabled={loading}
              className={`btn-tapas text-sm shadow-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? "Cargando..." : "Conectar Pi"}
            </button>
          )}
          <button className="lg:hidden p-2 text-gray-500"><Menu size={24} /></button>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 py-6">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-6 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeTab === cat ? "pill-active shadow-md" : "pill-inactive hover:bg-gray-50"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Hero Spotlight Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-12">
          {[
            { label: "EVENTO HOY", color: "from-purple-900/80 to-purple-600/80", img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80" },
            { label: "NOVELAS PI", color: "from-indigo-900/80 to-indigo-600/80", img: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=300&q=80" },
            { label: "TOP SEMANA", color: "from-gray-900/80 to-gray-700/80", img: "https://images.unsplash.com/photo-1438183972690-6d4658e3290e?auto=format&fit=crop&w=300&q=80" },
            { label: "NUEVAS", color: "from-blue-900/80 to-blue-600/80", img: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=300&q=80" },
            { label: "OFERTAS", color: "from-black/80 to-zinc-800/80", img: "https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?auto=format&fit=crop&w=300&q=80" },
            { label: "DESTACADOS", color: "from-cyan-900/80 to-cyan-600/80", img: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=300&q=80" },
            { label: "BENEFICIOS", color: "from-blue-700/80 to-blue-400/80", img: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=300&q=80" },
          ].map((item, i) => (
            <div
              key={i}
              className="relative h-24 rounded-xl flex items-center justify-center p-3 text-center cursor-pointer hover:scale-[1.02] transition-all overflow-hidden shadow-sm group"
            >
              <Image
                src={item.img}
                alt={item.label}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} mix-blend-multiply`} />
              <span className="relative z-10 text-[11px] font-black text-white tracking-widest leading-tight drop-shadow-md">
                {item.label}
              </span>
            </div>
          ))}
        </section>

        {/* Promo Banner */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-pi-gold via-yellow-400 to-pi-gold-dark rounded-xl p-8 flex flex-col md:flex-row items-center justify-between overflow-hidden relative group cursor-pointer shadow-lg">
            <div className="z-10 text-center md:text-left">
              <span className="bg-black/10 px-3 py-1 rounded-full text-[10px] font-bold mb-4 inline-block">¿NUEVO EN INKTOONS?</span>
              <h2 className="text-3xl font-black text-white mb-2 leading-tight">Gana tu primer Pi leyendo cómics</h2>
              <p className="text-white/80 font-bold">Completa misiones diarias y desbloquea contenido premium.</p>
            </div>
            <div className="mt-6 md:mt-0 z-10">
              <button className="bg-white text-black px-8 py-3 rounded-full font-black hover:scale-105 transition-transform shadow-xl">
                EMPEZAR AHORA
              </button>
            </div>
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -ml-16 -mb-16" />
          </div>
        </section>

        {/* Section: Favorites / Highlights */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black flex items-center gap-2">
              ✨ Destacados de Inktoons 2025 ✨
            </h3>
            <button className="text-gray-400 hover:text-black font-bold text-sm transition-colors">Ver más</button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-4">
            {mockNews.map((item, i) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -5 }}
                className="tapas-card group cursor-pointer"
                onClick={() => router.push(`/news/${item.id}`)}
              >
                <div className="relative aspect-[3/4.5] w-full overflow-hidden">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    {i % 2 === 0 && <span className="badge-new w-min">NEW</span>}
                    {i % 3 === 0 && <span className="bg-pi-gold text-black text-[10px] font-black px-1.5 py-0.5 rounded italic shadow-sm">UP</span>}
                  </div>
                  {/* Overlay Title for Tapas style */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 pt-10">
                    <h4 className="text-[11px] font-bold text-white line-clamp-2 leading-tight">
                      {item.title}
                    </h4>
                  </div>
                </div>
              </motion.div>
            ))}
            {/* Add more placeholders for demo */}
            {[4, 5, 6, 7, 8, 9, 10, 11].map((n) => (
              <div key={n} className="tapas-card group cursor-pointer opacity-40">
                <div className="relative aspect-[3/4.5] w-full bg-gray-200 animate-pulse" />
              </div>
            ))}
          </div>
        </section>

        {/* Section: Trending News */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black flex items-center gap-2">
              🔥 Tendencias en el Ecosistema
            </h3>
            <button className="text-gray-400 hover:text-black font-bold text-sm transition-colors">Ver más</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockNews.slice(0, 2).map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-4 flex gap-4 border border-gray-100 hover:border-pi-purple/30 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                onClick={() => router.push(`/news/${item.id}`)}
              >
                <div className="relative w-24 h-32 flex-shrink-0 rounded-lg overflow-hidden shadow-sm">
                  <Image src={item.imageUrl} alt={item.title} fill className="object-cover group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-pi-purple uppercase mb-1 tracking-wider">{item.category}</span>
                  <h4 className="font-bold text-lg leading-tight mb-2 group-hover:text-pi-purple transition-colors">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <div className="flex items-center gap-1"><Star size={12} fill="currentColor" /> 4.9k</div>
                    <div className="flex items-center gap-1 font-medium"><TrendingUp size={12} /> #1 News</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-16 bg-white border-t border-gray-100">
        <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 text-center md:text-left">
          <div className="col-span-2">
            <div className="text-2xl font-black text-pi-purple mb-4 tracking-tighter">Inktoons</div>
            <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto md:mx-0">
              Tu portal de entretenimiento y noticias descentralizado en la red Pi. Lee, comparte y crece con los mejores creadores.
            </p>
            <div className="flex justify-center md:justify-start gap-4">
              <div className="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm cursor-pointer" />
              <div className="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm cursor-pointer" />
              <div className="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm cursor-pointer" />
            </div>
          </div>
          <div>
            <h5 className="font-bold text-sm mb-4">Explorar</h5>
            <ul className="text-sm text-gray-400 space-y-3">
              <li className="hover:text-black cursor-pointer transition-colors">Cómics</li>
              <li className="hover:text-black cursor-pointer transition-colors">Novelas</li>
              <li className="hover:text-black cursor-pointer transition-colors">Originales</li>
              <li className="hover:text-black cursor-pointer transition-colors">Noticias</li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-sm mb-4">Ayuda</h5>
            <ul className="text-sm text-gray-400 space-y-3">
              <li className="hover:text-black cursor-pointer transition-colors">Centro de ayuda</li>
              <li className="hover:text-black cursor-pointer transition-colors">Pautas</li>
              <li className="hover:text-black cursor-pointer transition-colors">Privacidad</li>
              <li className="hover:text-black cursor-pointer transition-colors">Términos</li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto px-4 mt-16 pt-8 border-t border-gray-100 text-[10px] text-gray-400 text-center tracking-widest uppercase font-bold">
          © {new Date().getFullYear()} Inktoons Foundation Inc. Parte del ecosistema Pi Network.
        </div>
      </footer>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl rounded-full shadow-2xl border border-gray-100 px-8 py-3 flex items-center gap-10 z-50">
        <button className="text-pi-purple transition-transform active:scale-90"><Menu size={24} /></button>
        <button className="text-gray-400 transition-transform active:scale-90"><Search size={24} /></button>
        <button className="text-gray-400 transition-transform active:scale-90"><Star size={24} /></button>
        <button className="text-gray-400 transition-transform active:scale-90"><Clock size={24} /></button>
      </div>
    </div>
  );
}
