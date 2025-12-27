"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Bell, Menu, User, Crown } from "lucide-react";
import { usePi } from "@/components/PiNetworkProvider";
import { useUserData } from "@/context/UserDataContext";
import NotificationDropdown from "./NotificationDropdown";

export default function TopNavbar() {
    const router = useRouter();
    const { user, authenticate, loading } = usePi();
    const { userData } = useUserData();
    const [showNotifications, setShowNotifications] = useState(false);

    const unreadCount = (userData.notifications || []).filter(n => !n.read).length;
    const isVIP = userData.subscription && Date.now() < userData.subscription.expiresAt;

    const username = user?.username || "Pionero";
    const initial = username.charAt(0).toUpperCase();

    return (
        <header className="sticky top-0 z-[60] bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-6">
                <div
                    className="text-2xl font-black tracking-tighter text-pi-purple cursor-pointer flex items-center gap-2"
                    onClick={() => router.push("/")}
                >
                    <div className="relative w-8 h-8">
                        {/* Using component as fallback if icon.png fails or is not yet available, but the user requested icon.png */}
                        <img src="/icon.png" alt="Logo" className="w-full h-full object-contain" onError={(e) => {
                            // Fallback to a styled div if image not found
                            (e.target as any).style.display = 'none';
                            (e.target as any).parentElement.innerHTML = '<div class="w-8 h-8 bg-pi-purple rounded-lg"></div>';
                        }} />
                    </div>
                    <span>Inktoons</span>
                </div>
                <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-gray-500">
                    <button onClick={() => router.push("/")} className="hover:text-black transition-colors">Inicio</button>
                    <button onClick={() => router.push("/explore")} className="hover:text-black transition-colors">Explorar</button>
                    <button className="hover:text-black transition-colors">Comunidad</button>
                </nav>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <div className="hidden md:flex items-center bg-gray-50 border border-gray-100 rounded-full px-4 py-2 w-64 focus-within:border-pi-purple/30 transition-all">
                    <Search size={16} className="text-gray-400 mr-2" />
                    <input type="text" placeholder="Buscar historias..." className="bg-transparent text-sm outline-none w-full text-black" />
                </div>

                {user ? (
                    <div className="flex items-center gap-1 md:gap-3">
                        {/* Inks / Balance icon replaced by icon.png as per request */}
                        <button
                            onClick={() => router.push('/wallet')}
                            className="p-2 transition-transform active:scale-90"
                            title="Billetera"
                        >
                            <img src="/icon.png" alt="Inks" className="w-6 h-6 object-contain" />
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-pi-purple/10 text-pi-purple' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                <Bell size={22} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF4D4D] text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                            <NotificationDropdown isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
                        </div>

                        <div
                            onClick={() => router.push("/profile")}
                            className="relative cursor-pointer group ml-1"
                        >
                            {/* Profile Frame for VIP */}
                            {isVIP && (
                                <div className="absolute -inset-1 bg-gradient-to-tr from-amber-300 via-yellow-500 to-amber-600 rounded-full animate-spin-slow opacity-80 blur-[1px]" />
                            )}
                            <div className="w-9 h-9 rounded-full bg-pi-purple flex items-center justify-center text-white shadow-sm transition-transform active:scale-90 overflow-hidden relative z-10 border-2 border-white">
                                {userData.profileImage ? (
                                    <img src={userData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs font-bold">{initial}</span>
                                )}
                            </div>
                            {isVIP && (
                                <div className="absolute -bottom-0.5 -right-0.5 z-20 bg-amber-500 text-white rounded-full p-0.5 shadow-md border border-white scale-75">
                                    <Crown size={10} fill="currentColor" />
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={authenticate}
                        disabled={loading}
                        className={`btn-tapas text-xs md:text-sm shadow-sm py-2 px-4 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? "..." : "Conectar Pi"}
                    </button>
                )}
                <button className="lg:hidden p-2 text-gray-500 hover:text-black transition-colors">
                    <Menu size={24} />
                </button>
            </div>
        </header>
    );
}
