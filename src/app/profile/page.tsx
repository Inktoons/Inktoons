"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
    Star
} from "lucide-react";
import { useContent } from "@/context/ContentContext";
import { useTheme } from "@/components/ThemeHandler";

export default function ProfilePage() {
    const router = useRouter();
    const { user } = usePi();
    const { userData, setProfileImage } = useUserData();
    const { theme, toggleTheme } = useTheme();
    const { webtoons, deleteWebtoon } = useContent();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const menuItems = [
        {
            icon: <Heart className="text-red-500" size={22} />,
            label: "Favoritos",
            count: userData.favorites.length,
            color: "bg-red-50 dark:bg-red-900/20"
        },
        {
            icon: <Users className="text-blue-500" size={22} />,
            label: "Siguiendo",
            count: userData.following.length,
            color: "bg-blue-50 dark:bg-blue-900/20"
        },
        {
            icon: <History className="text-green-500" size={22} />,
            label: "Historial",
            count: userData.history.length,
            color: "bg-green-50 dark:bg-green-900/20"
        },
    ];

    const username = user?.username || "Pionero";
    const initial = username.charAt(0).toUpperCase();

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950 text-foreground flex flex-col transition-colors duration-300">
            {/* Header style matching the reference image */}
            <header className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-50 z-10">
                <div className="flex items-center gap-2">
                    <BookOpen className="text-pi-purple" size={28} />
                    <span className="text-2xl font-black text-pi-purple tracking-tighter">Inktoons</span>
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 text-gray-400 hover:text-black transition-colors"><Bell size={24} /></button>
                    <button className="p-2 text-gray-400 hover:text-black transition-colors"><Menu size={24} /></button>
                </div>
            </header>

            <main className="flex-1 max-w-md mx-auto w-full px-6 py-8">
                {/* Profile Card Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-[#171717] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-8 flex flex-col items-center text-center mb-8 transition-colors duration-300"
                >
                    <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-4xl font-bold mb-4 border-4 border-white dark:border-gray-700 shadow-sm overflow-hidden relative">
                        {userData.profileImage ? (
                            <img src={userData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            initial
                        )}
                    </div>
                    <h2 className="text-2xl font-black mb-1 dark:text-white">{username}</h2>
                    <p className="text-gray-400 font-medium mb-6 italic text-sm">Lector apasionado</p>

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                    <button
                        onClick={handleEditClick}
                        className="bg-[#1a1a1a] dark:bg-white dark:text-black text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Edit2 size={16} />
                        Editar Perfil
                    </button>
                </motion.div>

                {/* MY CONTENT SECTION */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-black dark:text-white flex items-center gap-2">
                            <BookOpen className="text-pi-purple" size={20} />
                            MI CONTENIDO
                        </h3>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{webtoons.length} PROYECTOS</span>
                    </div>

                    <div className="space-y-4">
                        {webtoons.length > 0 ? (
                            webtoons.map((inktoon, idx) => (
                                <motion.div
                                    key={inktoon.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => router.push(`/news/${inktoon.id}`)}
                                    className="bg-white dark:bg-[#171717] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex gap-4 relative group hover:border-pi-purple/30 transition-all cursor-pointer shadow-sm hover:shadow-md"
                                >
                                    <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-gray-100 dark:border-gray-800">
                                        <img src={inktoon.imageUrl} alt={inktoon.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            <h4 className="font-bold text-sm dark:text-white line-clamp-1">{inktoon.title}</h4>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Capítulos: {inktoon.chapters?.length || 0}</p>
                                        </div>

                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="flex items-center gap-1 text-gray-400">
                                                <Star size={12} className="text-pi-gold" fill="currentColor" />
                                                <span className="text-[10px] font-black">4.8</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-gray-400">
                                                <MessageCircle size={12} />
                                                <span className="text-[10px] font-black">0</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-gray-400">
                                                <BarChart2 size={12} />
                                                <span className="text-[10px] font-black">Popular</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm("¿Seguro que quieres eliminar este Inktoon? No se puede deshacer.")) {
                                                deleteWebtoon(inktoon.id);
                                            }
                                        }}
                                        className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </motion.div>
                            ))
                        ) : (
                            <div className="bg-gray-50 dark:bg-neutral-900 rounded-3xl p-10 text-center border-2 border-dashed border-gray-100 dark:border-gray-800">
                                <p className="text-gray-400 text-sm font-bold">Aún no has subido contenido.</p>
                                <button
                                    onClick={() => router.push('/upload')}
                                    className="text-pi-purple text-xs font-black mt-2 hover:underline"
                                >
                                    ¡SUBE TU PRIMER WEBTOON!
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* List Items Sections */}
                <div className="space-y-4">
                    {menuItems.map((item, index) => (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-[#171717] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between group cursor-pointer hover:border-pi-purple/30 transition-all active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center`}>
                                    {item.icon}
                                </div>
                                <span className="font-bold text-gray-700 dark:text-gray-200">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="bg-gray-900 dark:bg-gray-700 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                                    {item.count}
                                </span>
                                <ChevronRight size={18} className="text-gray-300 group-hover:text-pi-purple" />
                            </div>
                        </motion.div>
                    ))}

                    {/* Dark Mode Toggle */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        onClick={toggleTheme}
                        className="bg-white dark:bg-[#171717] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between group cursor-pointer hover:border-pi-purple/30 transition-all active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center`}>
                                {theme === 'dark' ? <Moon className="text-purple-500" size={22} /> : <Sun className="text-orange-500" size={22} />}
                            </div>
                            <span className="font-bold text-gray-700 dark:text-gray-200">Modo Oscuro</span>
                        </div>
                        <div className="relative w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors">
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${theme === 'dark' ? 'left-6' : 'left-1'}`} />
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* Mobile Bottom Navigation style matching the reference */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 px-8 py-4 flex items-center justify-between z-50 transition-colors duration-300">
                <button onClick={() => router.push("/")} className="text-gray-400 hover:text-pi-purple transition-all flex flex-col items-center gap-1">
                    <Home size={24} />
                    <span className="text-[10px] font-bold">Inicio</span>
                </button>
                <button onClick={() => router.push("/explore")} className="text-gray-400 hover:text-pi-purple transition-all flex flex-col items-center gap-1">
                    <Search size={24} />
                    <span className="text-[10px] font-bold">Explorar</span>
                </button>
                <button onClick={() => router.push("/library")} className="text-gray-400 hover:text-pi-purple transition-all flex flex-col items-center gap-1">
                    <BookOpen size={24} />
                    <span className="text-[10px] font-bold">Biblioteca</span>
                </button>
                <button className="text-pi-purple transition-all flex flex-col items-center gap-1">
                    <User size={24} />
                    <span className="text-[10px] font-bold">Perfil</span>
                </button>
            </nav>
            {/* Safe area spacer for bottom nav */}
            <div className="h-24" />
        </div>
    );
}
