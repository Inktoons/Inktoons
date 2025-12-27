"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { usePi } from "@/components/PiNetworkProvider";
import { useUserData } from "@/context/UserDataContext";
import {
    ArrowLeft,
    Bell,
    Menu,
    Heart,
    Users,
    History,
    ChevronRight,
    Edit2,
    Home,
    Search,
    BookOpen,
    User,
    Moon,
    Sun,
    Trash2,
    BarChart2,
    MessageCircle,
    Star,
    Shield,
    Wallet,
    Save,
    Crown
} from "lucide-react";
import { useContent } from "@/context/ContentContext";
import { useTheme } from "@/components/ThemeHandler";
import TopNavbar from "@/components/TopNavbar";

type ViewMode = 'main' | 'favorites' | 'following' | 'history';

export default function ProfilePage() {
    const router = useRouter();
    const { user } = usePi();
    const { userData, setProfileImage, toggleCensorship, updateWalletAddress } = useUserData();
    const { theme, toggleTheme } = useTheme();
    const { webtoons, deleteWebtoon, uploadImage } = useContent();
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('main');

    const username = user?.username || "Pionero";
    const initial = username.charAt(0).toUpperCase();

    const menuItems = [
        {
            id: 'favorites',
            icon: <Heart className="text-red-500" size={22} />,
            label: "Favoritos",
            count: userData.favorites.length,
            color: "bg-red-50 dark:bg-red-900/20"
        },
        {
            id: 'following',
            icon: <Users className="text-blue-500" size={22} />,
            label: "Siguiendo",
            count: userData.following.length,
            color: "bg-blue-50 dark:bg-blue-900/20"
        },
        {
            id: 'history',
            icon: <History className="text-green-500" size={22} />,
            label: "Historial",
            count: userData.history.length,
            color: "bg-green-50 dark:bg-green-900/20"
        },
    ];

    const getFilteredWebtoons = () => {
        switch (viewMode) {
            case 'favorites':
                return webtoons.filter(w => userData.favorites.includes(w.id));
            case 'following':
                // Filter webtoons where author is in following list
                return webtoons.filter(w => userData.following.includes(w.author));
            case 'history':
                // Maintain history order if possible, or just filter
                return userData.history
                    .map(hId => webtoons.find(w => w.id === hId))
                    .filter(Boolean) as typeof webtoons;
            default:
                return [];
        }
    };

    const getViewTitle = () => {
        switch (viewMode) {
            case 'favorites': return "Tus Favoritos";
            case 'following': return "Autores que Sigues";
            case 'history': return "Historial de Lectura";
            default: return "Perfil";
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const blobUrl = URL.createObjectURL(file);
                setProfileImage(blobUrl);
                const finalUrl = await uploadImage(file);
                if (finalUrl) setProfileImage(finalUrl);
            } catch (err) {
                console.error("Profile upload failed:", err);
            }
        }
    };

    const handleEditClick = () => {
        fileInputRef.current?.click();
    };

    const renderWebtoonList = (items: typeof webtoons) => (
        <div className="space-y-4">
            {items.length > 0 ? (
                items.map((inktoon, idx) => (
                    <motion.div
                        key={inktoon.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => router.push(`/news/${inktoon.id}`)}
                        className="bg-white dark:bg-[#111] rounded-2xl border border-slate-200 dark:border-white/5 p-4 flex gap-4 relative group hover:border-pi-purple/30 transition-all cursor-pointer shadow-sm hover:shadow-md"
                    >
                        <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-slate-100 dark:border-white/5">
                            <img src={inktoon.imageUrl} alt={inktoon.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-center py-1">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 mb-1">{inktoon.title}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">{inktoon.author}</p>
                            <div className="flex items-center gap-1 text-gray-400">
                                <Star size={12} className="text-pi-gold" fill="currentColor" />
                                <span className="text-[10px] font-black">{inktoon.rating?.toFixed(1) || "0.0"}</span>
                            </div>
                        </div>
                    </motion.div>
                ))
            ) : (
                <div className="py-20 text-center text-gray-400">
                    <p className="text-sm font-bold">Sin contenido aún.</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-gray-100 flex flex-col transition-colors duration-300">
            <TopNavbar />

            {/* Sub-view Header (if active) */}
            {viewMode !== 'main' && (
                <div className="sticky top-16 z-50 bg-slate-50/95 dark:bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-gray-100 dark:border-white/5 px-6 py-4 flex items-center gap-4">
                    <button onClick={() => setViewMode('main')} className="p-2 -ml-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-xl font-black">{getViewTitle()}</h2>
                </div>
            )}

            <main className="flex-1 max-w-md mx-auto w-full px-6 py-8 pb-32">
                <AnimatePresence mode="wait">
                    {viewMode === 'main' ? (
                        <motion.div
                            key="main"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            {/* Profile Card */}
                            <div className="bg-white dark:bg-[#111] rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm p-8 flex flex-col items-center text-center">
                                <div className="relative mb-4 group">
                                    {userData.subscription && Date.now() < userData.subscription.expiresAt && (
                                        <div className="absolute -inset-2 bg-gradient-to-tr from-amber-300 via-yellow-500 to-amber-600 rounded-full animate-spin-slow opacity-70 blur-[2px]" />
                                    )}
                                    <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 text-4xl font-bold border-4 border-white dark:border-[#222] shadow-sm overflow-hidden relative z-10">
                                        {userData.profileImage ? (
                                            <img src={userData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                        ) : initial}
                                    </div>
                                    {userData.subscription && Date.now() < userData.subscription.expiresAt && (
                                        <div className="absolute -bottom-1 -right-1 z-20 bg-gradient-to-r from-amber-400 to-amber-600 text-white rounded-full p-1.5 shadow-lg border-2 border-white dark:border-[#222]">
                                            <Crown size={14} fill="currentColor" />
                                        </div>
                                    )}
                                </div>
                                <h2 className="text-2xl font-black mb-1 text-slate-900 dark:text-white flex items-center gap-2">
                                    {username}
                                    {userData.subscription && Date.now() < userData.subscription.expiresAt && (
                                        <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-200 uppercase tracking-tighter">VIP</span>
                                    )}
                                </h2>
                                <p className="text-gray-400 font-medium mb-6 italic text-sm">
                                    {userData.subscription && Date.now() < userData.subscription.expiresAt ? "Miembro Premium" : "Lector apasionado"}
                                </p>

                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                                <button
                                    onClick={handleEditClick}
                                    className="bg-[#1a1a1a] dark:bg-white text-white dark:text-black px-8 py-2.5 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all flex items-center gap-2"
                                >
                                    <Edit2 size={16} />
                                    Editar Perfil
                                </button>
                            </div>

                            {/* My Content */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <BookOpen className="text-pi-purple" size={20} />
                                        MI CONTENIDO
                                    </h3>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{webtoons.length} PROYECTOS</span>
                                </div>

                                <div className="space-y-4">
                                    {webtoons.map((inktoon, idx) => (
                                        <motion.div
                                            key={inktoon.id}
                                            onClick={() => router.push(`/news/${inktoon.id}`)}
                                            className="bg-white dark:bg-[#111] rounded-2xl border border-slate-200 dark:border-white/5 p-4 flex gap-4 relative group hover:border-pi-purple/30 transition-all cursor-pointer shadow-sm hover:shadow-md"
                                        >
                                            <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-slate-100 dark:border-white/5">
                                                <img src={inktoon.imageUrl} alt={inktoon.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between py-1">
                                                <div>
                                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{inktoon.title}</h4>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Capítulos: {inktoon.chapters?.length || 0}</p>
                                                </div>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <div className="flex items-center gap-1 text-gray-400">
                                                        <Star size={12} className="text-pi-gold" fill="currentColor" />
                                                        <span className="text-[10px] font-black">4.8</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm("¿Seguro que quieres eliminar este Inktoon?")) deleteWebtoon(inktoon.id);
                                                }}
                                                className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </motion.div>
                                    ))}
                                    {webtoons.length === 0 && (
                                        <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-10 text-center border-2 border-dashed border-slate-200 dark:border-white/10">
                                            <p className="text-gray-400 text-sm font-bold">Aún no has subido contenido.</p>
                                            <button onClick={() => router.push('/upload')} className="text-pi-purple text-xs font-black mt-2 hover:underline">
                                                ¡SUBE TU PRIMER WEBTOON!
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Settings */}
                            <div className="space-y-4">
                                {/* Censorship */}
                                <div
                                    onClick={toggleCensorship}
                                    className="bg-white dark:bg-[#111] rounded-2xl border border-slate-200 dark:border-white/5 p-4 flex items-center justify-between group cursor-pointer hover:border-pi-purple/30 transition-all active:scale-[0.98]"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center">
                                            <Shield className="text-pink-500" size={22} />
                                        </div>
                                        <div>
                                            <span className="font-bold text-slate-700 dark:text-gray-200 block">Filtro de Contenido</span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Censurar +18 / Gore</span>
                                        </div>
                                    </div>
                                    <div className={`relative w-11 h-6 rounded-full transition-colors ${userData.censorshipEnabled ? 'bg-pi-purple' : 'bg-slate-200 dark:bg-white/10'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${userData.censorshipEnabled ? 'left-6' : 'left-1'}`} />
                                    </div>
                                </div>

                                {/* Wallet */}
                                <div className="bg-white dark:bg-[#111] rounded-2xl border border-slate-200 dark:border-white/5 p-4 hover:border-pi-purple/30 transition-all">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                                            <Wallet className="text-amber-500" size={22} />
                                        </div>
                                        <div>
                                            <span className="font-bold text-slate-700 dark:text-gray-200 block">Tu Billetera Pi</span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Para recibir propinas</span>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Pega tu dirección pública..."
                                            className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 dark:text-white focus:outline-none focus:border-pi-purple/50 focus:ring-1 focus:ring-pi-purple/50 font-mono"
                                            defaultValue={userData.walletAddress || ""}
                                            onBlur={(e) => updateWalletAddress(e.target.value)}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Save size={14} /></div>
                                    </div>
                                </div>
                            </div>

                            {/* Menu Items (Lists) */}
                            <div className="space-y-4">
                                {menuItems.map((item, index) => (
                                    <div
                                        key={item.label}
                                        onClick={() => setViewMode(item.id as ViewMode)}
                                        className="bg-white dark:bg-[#111] rounded-2xl border border-slate-200 dark:border-white/5 p-4 flex items-center justify-between group cursor-pointer hover:border-pi-purple/30 transition-all active:scale-[0.98]"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center`}>
                                                {item.icon}
                                            </div>
                                            <span className="font-bold text-slate-700 dark:text-gray-200">{item.label}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="bg-slate-900 dark:bg-white dark:text-black text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                                                {item.count}
                                            </span>
                                            <ChevronRight size={18} className="text-gray-300 group-hover:text-pi-purple" />
                                        </div>
                                    </div>
                                ))}

                                {/* Dark Mode Switch */}
                                <div
                                    onClick={toggleTheme}
                                    className="bg-white dark:bg-[#111] rounded-2xl border border-slate-200 dark:border-white/5 p-4 flex items-center justify-between group cursor-pointer hover:border-pi-purple/30 transition-all active:scale-[0.98]"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                                            {theme === 'dark' ? <Moon className="text-purple-500" size={22} /> : <Sun className="text-orange-500" size={22} />}
                                        </div>
                                        <span className="font-bold text-slate-700 dark:text-gray-200">Modo Oscuro</span>
                                    </div>
                                    <div className={`relative w-11 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-green-500' : 'bg-slate-200'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${theme === 'dark' ? 'left-6' : 'left-1'}`} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="subview"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            {renderWebtoonList(getFilteredWebtoons())}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Bottom Nav - Dark compatible */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-slate-100 dark:border-white/10 px-8 py-4 flex items-center justify-between z-50 transition-colors duration-300">
                <button onClick={() => router.push("/")} className="text-slate-400 dark:text-slate-500 hover:text-pi-purple dark:hover:text-pi-purple transition-all flex flex-col items-center gap-1">
                    <Home size={24} />
                    <span className="text-[10px] font-bold">Inicio</span>
                </button>
                <button onClick={() => router.push("/explore")} className="text-slate-400 dark:text-slate-500 hover:text-pi-purple dark:hover:text-pi-purple transition-all flex flex-col items-center gap-1">
                    <Search size={24} />
                    <span className="text-[10px] font-bold">Explorar</span>
                </button>
                <button onClick={() => router.push("/library")} className="text-slate-400 dark:text-slate-500 hover:text-pi-purple dark:hover:text-pi-purple transition-all flex flex-col items-center gap-1">
                    <BookOpen size={24} />
                    <span className="text-[10px] font-bold">Biblioteca</span>
                </button>
                <button className="text-pi-purple transition-all flex flex-col items-center gap-1">
                    <User size={24} />
                    <span className="text-[10px] font-bold">Perfil</span>
                </button>
            </nav>
        </div>
    );
}
