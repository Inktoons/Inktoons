"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { usePi } from "@/components/PiNetworkProvider";
import { mockNews } from "@/data/mockNews";
import { useContent } from "@/context/ContentContext";
import { Search, Bell, Menu, User, Zap, Star, TrendingUp, Clock, Home as HomeIcon, BookOpen, Upload } from "lucide-react";
import TopNavbar from "@/components/TopNavbar";

export default function Home() {
  const router = useRouter();
  const { user, authenticate, loading } = usePi();
  const { webtoons } = useContent();
  const [activeTab, setActiveTab] = useState("Nuevo"); // Changed default to "Nuevo"
  const [showLoginModal, setShowLoginModal] = useState(false);

  const displayWebtoons = [...webtoons, ...mockNews.filter(m => !webtoons.some(w => w.id === m.id))];

  // Dynamic filtering based on activeTab
  const filteredWebtoons = (() => {
    if (activeTab === "Nuevo") {
      // Prioritize recently created ones
      return [...displayWebtoons].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      });
    }
    if (activeTab === "Popular") {
      // Sort by votes (simulated for mock)
      return [...displayWebtoons].sort((a, b) => (b.votes || 0) - (a.votes || 0));
    }
    if (activeTab === "Gratis") {
      return displayWebtoons.slice().reverse(); // Just a variation
    }
    // Spotlight/Default
    return displayWebtoons;
  })();

  const handleProtectedNavigation = (path: string) => {
    if (user) {
      router.push(path);
    } else {
      setShowLoginModal(true);
    }
  };

  const categories = ["Spotlight", "Diario", "Nuevo", "Popular", "Gratis", "WUF", "Completado"];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-pi-gold selection:text-black">
      {/* Top Navbar */}
      <TopNavbar />

      <main className="max-w-[1200px] mx-auto px-4 py-6">
        {/* Promo Banner */}
        <section className="mb-12 mt-4">
          <div className="bg-gradient-to-r from-purple-900 via-purple-700 to-indigo-900 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between overflow-hidden relative group cursor-pointer shadow-lg">
            <div className="z-10 text-center md:text-left">
              <button onClick={() => router.push('/wallet')} className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold mb-4 inline-block hover:bg-white/30 transition-colors text-white">ECONOMÍA INKTOONS</button>
              <h2 className="text-3xl font-black text-white mb-2 leading-tight">¡Acumula Inks y desbloquea historias épicas!</h2>
              <p className="text-white/80 font-bold">Completa misiones, lee capítulos y canjea tus Inks por contenido exclusivo.</p>
            </div>
            <div className="mt-6 md:mt-0 z-10">
              <button onClick={() => router.push('/wallet')} className="bg-white text-black px-8 py-3 rounded-full font-black hover:scale-105 transition-transform shadow-xl">
                GANAR INKS
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
              {activeTab === "Nuevo" ? "🌱 Recién Llegados 🌱" : activeTab === "Popular" ? "🔥 Lo más Leído 🔥" : "✨ Destacados de Inktoons 2025 ✨"}
            </h3>
            <button className="text-gray-400 hover:text-black font-bold text-sm transition-colors">Ver más</button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-4">
            {filteredWebtoons.map((item, i) => (
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
            {displayWebtoons.slice(0, 4).map((item) => (
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

      {/* Mobile Bottom Nav style matching the reference */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white/80 backdrop-blur-xl border-t border-gray-100 px-8 py-4 flex items-center justify-between z-50">
        <button onClick={() => router.push("/")} className="text-pi-purple transition-all flex flex-col items-center gap-1">
          <HomeIcon size={24} />
          <span className="text-[10px] font-bold">Inicio</span>
        </button>
        <button onClick={() => router.push("/explore")} className="text-gray-400 hover:text-pi-purple transition-all flex flex-col items-center gap-1">
          <Search size={24} />
          <span className="text-[10px] font-bold">Explorar</span>
        </button>
        <button onClick={() => handleProtectedNavigation("/upload")} className="text-gray-400 hover:text-pi-purple transition-all flex flex-col items-center gap-1">
          <Upload size={24} />
          <span className="text-[10px] font-bold">Subir</span>
        </button>
        <button onClick={() => handleProtectedNavigation("/library")} className="text-gray-400 hover:text-pi-purple transition-all flex flex-col items-center gap-1">
          <BookOpen size={24} />
          <span className="text-[10px] font-bold">Biblioteca</span>
        </button>
        <button onClick={() => handleProtectedNavigation("/profile")} className="text-gray-400 hover:text-pi-purple transition-all flex flex-col items-center gap-1">
          <User size={24} />
          <span className="text-[10px] font-bold">Perfil</span>
        </button>
      </nav>
      {/* Safe area spacer for bottom nav */}
      <div className="lg:hidden h-24" />

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-pi-purple/10 text-pi-purple rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={32} />
            </div>
            <h3 className="text-xl font-black mb-2">Inicia sesión</h3>
            <p className="text-gray-500 mb-6 text-sm">
              Necesitas conectar tu cuenta de Pi Network para acceder a esta sección.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  authenticate();
                  setShowLoginModal(false);
                }}
                disabled={loading}
                className="w-full py-3 bg-pi-purple text-white font-bold rounded-xl hover:bg-pi-purple-dark transition-colors flex items-center justify-center gap-2"
              >
                {loading ? "Cargando..." : "Conectar Pi"}
              </button>
              <button
                onClick={() => setShowLoginModal(false)}
                className="w-full py-3 text-gray-400 font-bold hover:text-black transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
