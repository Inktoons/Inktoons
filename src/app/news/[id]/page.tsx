"use client";

import React, { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { mockNews } from "@/data/mockNews";
import {
    ArrowLeft,
    Share2,
    Download,
    AlertCircle,
    Star,
    Heart,
    BookOpen,
    Info,
    MessageSquare,
    ThumbsUp,
    PenTool,
    Image as ImageIcon,
    Send,
    X,
    MessageCircle,
    Trash2,
    Lock,
    Coins,
    Calendar,
    CheckCircle2,
    PlusCircle,
    Edit3
} from "lucide-react";
import { usePi } from "@/components/PiNetworkProvider";
import { useUserData } from "@/context/UserDataContext";
import { useContent, Chapter, Webtoon } from "@/context/ContentContext";

interface Comment {
    id: string;
    username: string;
    avatar: string; // URL or initial
    content: string;
    image?: string; // Optional image URL
    timestamp: string;
    likes: number;
    replies: number;
}

export default function MangaDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user, authenticate, loading } = usePi();
    const {
        isFavorite,
        toggleFavorite,
        isInHistory,
        addToHistory,
        isFollowingAuthor,
        toggleFollowAuthor,
        rateWebtoon,
        getUserRating,
        getLastReadChapter,
        isChapterRead,
        userData,
        addBalance,
        updateReadingProgress
    } = useUserData();
    const { getWebtoon } = useContent();

    // Attempt to get from context first, then mock
    const contentWebtoon = getWebtoon(id as string);
    const news = (contentWebtoon || mockNews.find((item) => item.id === id)) as Webtoon | undefined;

    const [activeTab, setActiveTab] = useState("DETALLES");
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
    const [showUnlockModal, setShowUnlockModal] = useState(false);

    // Comments State
    const [comments, setComments] = useState<Comment[]>([
        {
            id: "c1",
            username: "W893",
            avatar: "W",
            content: "🔥🥵",
            timestamp: "3 Horas atras",
            likes: 0,
            replies: 0
        },
        {
            id: "c2",
            username: "Pionero",
            avatar: "P",
            content: "¡Increíble historia! Me encanta el desarrollo de los personajes. 👍🥵👍",
            image: "https://images.unsplash.com/photo-1620336655055-1f69376980c2?auto=format&fit=crop&w=200&q=80",
            timestamp: "Nov 22, 2025",
            likes: 42,
            replies: 2
        }
    ]);
    const [showCommentInput, setShowCommentInput] = useState(false);
    const [newCommentText, setNewCommentText] = useState("");
    const [newCommentImage, setNewCommentImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Rating State initialized from data
    const [mockRating, setMockRating] = useState(news?.rating?.toFixed(1) || "0.0");
    const [voteCount, setVoteCount] = useState(news?.votes || 0);


    if (!news) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
                <div className="w-12 h-12 border-4 border-pi-purple border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-bold">Cargando inicio...</p>
                {/* Fallback button if it takes too long */}
                <button
                    onClick={() => router.push('/')}
                    className="mt-8 text-xs text-pi-purple font-bold border border-pi-purple/20 px-4 py-2 rounded-full"
                >
                    Volver al Inicio
                </button>
            </div>
        );
    }

    const { createPayment } = usePi();

    // Mock data to match the screenshot richness
    const status = "En progreso";
    const alternativeTitle = "The Pioneer's Legacy, Cronache della Rete";
    const genres = ["Acción", "Aventura", "Fantasía"];

    const isFav = isFavorite(news.id);
    const inHist = isInHistory(news.id);
    const isFollowingAuth = isFollowingAuthor(news.author);
    const userRating = getUserRating(news.id); // Get current user vote

    const handleRead = () => {
        addToHistory(news.id);
    };

    const handleVote = (ratingValue: number) => {
        if (user) {
            if (!userRating) {
                // Only increment if it's a new vote
                setVoteCount(prev => prev + 1);
            }
            rateWebtoon(news.id, ratingValue);

            // Updates visual average slightly to show interaction
            const currentTotal = parseFloat(mockRating) * voteCount;
            const newAverage = ((currentTotal + ratingValue) / (voteCount + 1)).toFixed(1);
            setMockRating(newAverage);

        } else {
            authenticate();
        }
    };

    // Format votes for display (e.g. 12500 -> 12.5k, 12501 -> 12501)
    const displayVotes = voteCount > 1000 && voteCount % 1000 === 0
        ? `${(voteCount / 1000).toFixed(1)}k`
        : voteCount.toLocaleString();

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewCommentImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteComment = (commentId: string) => {
        if (confirm("¿Estás seguro de que quieres eliminar este comentario?")) {
            setComments(comments.filter(c => c.id !== commentId));
        }
    };

    const handleSubmitComment = () => {
        if (!user) {
            alert("Debes iniciar sesión para comentar.");
            // authenticate(); // Could trigger auth flow
            return;
        }
        if (!newCommentText.trim() && !newCommentImage) return;

        const newComment: Comment = {
            id: Date.now().toString(),
            username: user.username,
            avatar: user.username.charAt(0).toUpperCase(),
            content: newCommentText,
            image: newCommentImage || undefined,
            timestamp: "Justo ahora",
            likes: 0,
            replies: 0
        };

        setComments([newComment, ...comments]);
        setNewCommentText("");
        setNewCommentImage(null);
        setShowCommentInput(false);
    };

    return (
        <div className="min-h-screen bg-white text-foreground pb-20">
            {/* Top Navigation - Manga Style */}
            <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-gray-600 hover:text-black transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <span className="font-black text-lg">Manga</span>
                </div>
                <div className="flex items-center gap-4 text-gray-600">
                    <button className="hover:text-black transition-colors"><Download size={22} /></button>
                    <button className="hover:text-black transition-colors"><Share2 size={22} /></button>
                    <button className="hover:text-black transition-colors"><AlertCircle size={22} /></button>
                </div>
            </nav>

            <main>
                {/* Hero Section */}
                <div className="px-5 py-6 flex gap-5">
                    {/* Cover Image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative w-32 h-44 flex-shrink-0 rounded-lg overflow-hidden shadow-lg"
                    >
                        <Image
                            src={news.imageUrl}
                            alt={news.title}
                            fill
                            className="object-cover"
                        />
                        <div className="absolute top-0 right-0 bg-pi-gold text-black text-[10px] font-black px-1.5 py-0.5 rounded-bl-lg">
                            HOT
                        </div>
                    </motion.div>

                    {/* Info */}
                    <div className="flex-1 py-1">
                        <h1 className="text-xl font-black leading-tight mb-2 line-clamp-3">
                            {news.title}
                        </h1>

                        {/* Interactive Rating */}
                        <div className="flex items-center gap-1 mb-2">
                            <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map(i => {
                                    // If user hasn't voted, stars are empty (userRating is undefined/0)
                                    // If user HAS voted, stars filled up to userRating
                                    const isFilled = i <= (userRating || 0);

                                    return (
                                        <button
                                            key={i}
                                            onClick={() => handleVote(i)}
                                            className="focus:outline-none transition-transform active:scale-95 p-0.5"
                                        >
                                            <Star
                                                size={16}
                                                className={`${isFilled
                                                    ? "text-yellow-400 fill-yellow-400"
                                                    : "text-gray-300 fill-transparent stroke-gray-300"
                                                    }`}
                                                strokeWidth={2}
                                            />
                                        </button>
                                    );
                                })}
                            </div>

                            <span className="text-red-500 font-bold text-sm ml-1">
                                {mockRating}
                            </span>
                            <span className="text-gray-400 text-xs font-medium">
                                ({displayVotes} votos)
                            </span>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-sm font-medium text-gray-500">{status}</span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                            {genres.map(g => (
                                <span key={g} className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-md">
                                    {g}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="px-5 mb-8 flex gap-4">
                    <button
                        onClick={() => toggleFavorite(news.id)}
                        className={`flex-1 py-3 rounded-full font-black text-sm border-2 transition-all active:scale-95 flex items-center justify-center gap-2 ${isFav
                            ? "border-pi-purple bg-pi-purple/10 text-pi-purple"
                            : "border-gray-200 text-gray-700 hover:border-pi-purple"
                            }`}
                    >
                        {isFav ? <Heart size={18} fill="currentColor" /> : <Heart size={18} />}
                        {isFav ? "SIGUIENDO" : "SEGUIR"}
                    </button>
                    <button
                        onClick={() => {
                            handleRead();
                            const lastChapterId = getLastReadChapter(news.id);
                            if (lastChapterId) {
                                router.push(`/chapter/${id}/${lastChapterId}`);
                            } else if (news.chapters && news.chapters.length > 0) {
                                // Navigate to the oldest chapter first if new reader? 
                                // Actually, webtoons usually display newest first in list, 
                                // so the first chapter to read is usually the last one in the array if sorted newest-first.
                                // Let's assume index 0 for now as previously, but better to go to newest if it's a "latest" click.
                                router.push(`/chapter/${id}/${news.chapters[news.chapters.length - 1].id}`);
                            } else {
                                setActiveTab("EPISODIO");
                            }
                        }}
                        className={`flex-1 py-3 rounded-full font-black text-sm shadow-lg shadow-pi-purple/20 transition-all active:scale-95 flex items-center justify-center gap-2 ${inHist
                            ? "bg-gray-800 text-white" // Reading state
                            : "bg-pi-purple text-white"
                            }`}
                    >
                        <BookOpen size={18} />
                        {inHist ? "CONTINUAR" : "LEER"}
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center border-b border-gray-100 mb-6 sticky top-[60px] bg-white z-40">
                    {["DETALLES", "EPISODIO", "COMENTARIOS"].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-4 text-xs font-black tracking-widest relative ${activeTab === tab ? "text-pi-purple" : "text-gray-400"
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="underline"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-pi-purple"
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="px-5 pb-20 min-h-[300px]">
                    {activeTab === "DETALLES" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            {/* Alternativo */}
                            <div className="mb-6">
                                <h3 className="text-gray-400 text-xs font-bold uppercase mb-2">Alternativo(s)</h3>
                                <p className="text-sm text-gray-600 font-medium leading-relaxed">
                                    {alternativeTitle}
                                </p>
                            </div>

                            {/* Introduccion */}
                            <div className="mb-8">
                                <h3 className="text-gray-400 text-xs font-bold uppercase mb-2">Introducción</h3>
                                <p className="text-gray-700 leading-relaxed text-sm">
                                    {news.excerpt}
                                    <br /><br />
                                    Dime, ¿qué te ha estado molestando? Puedo solucionar todos tus problemas... si te parecen bien mis métodos de tratamiento poco convencionales. Únete a esta aventura en el ecosistema Pi donde la realidad supera a la ficción.
                                </p>
                            </div>

                            {/* Publicador */}
                            <div className="mb-10">
                                <h3 className="text-gray-400 text-xs font-bold uppercase mb-3">Publicador</h3>
                                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                                    <div className="w-10 h-10 rounded-full bg-pi-purple flex items-center justify-center text-white font-black text-sm shadow-sm">
                                        {news.author[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{news.author}</p>
                                        <p className="text-xs text-gray-400">Verificado Oficial</p>
                                    </div>
                                    <button
                                        onClick={() => toggleFollowAuthor(news.author)}
                                        className={`ml-auto text-xs font-black border px-3 py-1 rounded-full transition-colors ${isFollowingAuth
                                            ? "bg-pi-purple text-white border-pi-purple"
                                            : "text-pi-purple border-pi-purple hover:bg-pi-purple hover:text-white"
                                            }`}
                                    >
                                        {isFollowingAuth ? "SIGUIENDO" : "+ SEGUIR"}
                                    </button>
                                </div>
                            </div>

                            {/* Recommendations */}
                            <div>
                                <h3 className="text-lg font-black mb-4">Te puede interesar</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {mockNews.filter(n => n.id !== id).map(item => (
                                        <div
                                            key={item.id}
                                            className="cursor-pointer group"
                                            onClick={() => router.push(`/news/${item.id}`)}
                                        >
                                            <div className="relative aspect-[3/4.5] rounded-lg overflow-hidden mb-2 bg-gray-100">
                                                <Image
                                                    src={item.imageUrl}
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform"
                                                />
                                            </div>
                                            <p className="text-xs font-bold line-clamp-2 leading-tight group-hover:text-pi-purple">{item.title}</p>
                                        </div>
                                    ))}
                                    {/* Placeholders to fill grid */}
                                    <div className="aspect-[3/4.5] rounded-lg bg-gray-100 animate-pulse" />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "EPISODIO" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                            {/* Creator Add Chapter Button */}
                            {(() => {
                                if (loading) return null; // Don't render until auth state is known
                                if (!user) return null; // Only show if a user is logged in

                                // 1. Check by username (case-insensitive)
                                const isAuthorName = user.username?.toLowerCase() === news.author?.toLowerCase();

                                // 2. Check if the webtoon ID belongs to the current user's locally created content
                                // This would require a way to track webtoons created by the current user,
                                // e.g., a 'myWebtoons' list in usePi or checking local storage for created IDs.
                                // For now, we rely on the author string.
                                // A more robust check might involve:
                                // const isLocalCreator = localStorage.getItem(`myWebtoon_${news.id}`) === user.username;
                                // const isCreator = isAuthorName || isLocalCreator;
                                const isCreator = isAuthorName;

                                return isCreator && (
                                    <button
                                        onClick={() => router.push(`/upload?webtoonId=${news.id}`)}
                                        className="w-full py-4 mb-4 border-2 border-dashed border-pi-purple/30 rounded-xl flex items-center justify-center gap-2 text-pi-purple font-black text-sm hover:bg-pi-purple/5 transition-all active:scale-[0.98]"
                                    >
                                        <PlusCircle size={20} />
                                        AÑADIR CAPÍTULO
                                    </button>
                                );
                            })()}

                            {news?.chapters && news.chapters.length > 0 ? (
                                news.chapters.map((chapter: Chapter, index: number) => {
                                    const isRead = isChapterRead(news.id, chapter.id);

                                    return (
                                        <div
                                            key={chapter.id}
                                            onClick={() => {
                                                const isUnlockedByTime = chapter.unlockDate && new Date() > new Date(chapter.unlockDate);
                                                const effectiveIsLocked = chapter.isLocked && !isUnlockedByTime;

                                                if (effectiveIsLocked) {
                                                    setSelectedChapter(chapter);
                                                    setShowUnlockModal(true);
                                                } else {
                                                    router.push(`/chapter/${id}/${chapter.id}`);
                                                }
                                            }}
                                            className={`p-4 rounded-xl flex items-center justify-between border transition-all cursor-pointer group ${isRead
                                                ? "bg-white border-pi-purple/20 shadow-sm"
                                                : "bg-gray-50 border-gray-100 hover:border-pi-purple/30 shadow-none"
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs ${isRead ? "bg-pi-purple/10 text-pi-purple" : "bg-white border border-gray-200 text-gray-400"
                                                    }`}>
                                                    {news.chapters.length - index}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className={`font-bold text-sm transition-colors ${isRead ? "text-pi-purple" : "text-gray-900 group-hover:text-pi-purple"
                                                            }`}>
                                                            {chapter.title}
                                                        </p>
                                                        {isRead && <CheckCircle2 size={14} className="text-pi-purple" />}
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
                                                        {chapter.date} {isRead && "• LEÍDO"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {/* Edit Button for Author */}
                                                {(user?.username?.toLowerCase() === news.author?.toLowerCase()) && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.push(`/upload?webtoonId=${news.id}&chapterId=${chapter.id}`);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-pi-purple hover:bg-pi-purple/10 rounded-lg transition-all"
                                                        title="Editar capítulo"
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>
                                                )}

                                                {(() => {
                                                    const isUnlockedByTime = chapter.unlockDate && new Date() > new Date(chapter.unlockDate);
                                                    const effectiveIsLocked = chapter.isLocked && !isUnlockedByTime;

                                                    if (effectiveIsLocked) {
                                                        const daysRemaining = Math.max(0, Math.ceil((new Date(chapter.unlockDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

                                                        return (
                                                            <div className="flex flex-col items-end">
                                                                <div className="flex items-center gap-1.5 bg-pi-gold/10 text-pi-gold-dark px-2 py-1 rounded-md">
                                                                    <Coins size={12} fill="currentColor" />
                                                                    <span className="text-[10px] font-black">{chapter.unlockCost || 60} INKS</span>
                                                                </div>
                                                                <div className="flex items-center gap-1 text-[9px] text-gray-400 mt-1">
                                                                    <Lock size={10} />
                                                                    <span>Gratis en {daysRemaining} {daysRemaining === 1 ? 'día' : 'días'}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    } else if (chapter.isLocked && isUnlockedByTime) {
                                                        return (
                                                            <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-black">
                                                                FREE
                                                            </div>
                                                        );
                                                    } else {
                                                        return (
                                                            <div className={`p-2 transition-colors ${isRead ? "text-pi-purple" : "text-gray-300"}`}>
                                                                <ArrowLeft className="rotate-180" size={18} />
                                                            </div>
                                                        );
                                                    }
                                                })()}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-20 text-gray-400">
                                    <ImageIcon className="mx-auto mb-4 opacity-20" size={48} />
                                    <p className="text-sm font-bold">No hay capítulos disponibles todavía.</p>
                                    <p className="text-xs">¡Sé el primero en subir contenido!</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === "COMENTARIOS" && (
                        <div className="relative min-h-[300px]">
                            {/* Comments List */}
                            <div className="flex flex-col gap-6">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-4">
                                        {/* Avatar */}
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden">
                                                {/* If avatar is length 1, treat as initial, else image */}
                                                {comment.avatar.length === 1 ? (
                                                    <span className="font-bold text-gray-600">{comment.avatar}</span>
                                                ) : (
                                                    <Image src={comment.avatar} alt={comment.username} width={40} height={40} className="object-cover" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm text-gray-900">{comment.username}</span>
                                                </div>
                                                <span className="text-xs text-gray-400 font-medium">{comment.timestamp}</span>
                                            </div>

                                            <p className="text-sm text-gray-800 leading-relaxed mb-2 whitespace-pre-wrap">{comment.content}</p>

                                            {comment.image && (
                                                <div className="relative w-48 h-48 rounded-lg overflow-hidden mb-2 bg-gray-100 border border-gray-100">
                                                    <Image
                                                        src={comment.image}
                                                        alt="Comment attachment"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            )}

                                            <div className="flex items-center gap-6 text-gray-400 mt-2">
                                                <button className="flex items-center gap-1.5 hover:text-pi-purple transition-colors text-xs font-bold">
                                                    <ThumbsUp size={14} />
                                                    <span>{comment.likes}</span>
                                                </button>
                                                <button className="flex items-center gap-1.5 hover:text-pi-purple transition-colors text-xs font-bold">
                                                    <MessageCircle size={14} />
                                                    <span>{comment.replies}</span>
                                                </button>

                                                {/* Delete Button for Owner */}
                                                {user && user.username === comment.username && (
                                                    <button
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        className="ml-auto flex items-center gap-1 hover:text-red-500 transition-colors text-xs"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}

                                                {/* Report Button for Others */}
                                                {(!user || user.username !== comment.username) && (
                                                    <button className="ml-auto hover:text-red-500 transition-colors">
                                                        <AlertCircle size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* FAB - Write Comment Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => user ? setShowCommentInput(true) : authenticate()}
                                className="fixed bottom-6 right-6 w-14 h-14 bg-[#FF6B6B] text-white rounded-full shadow-lg shadow-red-200 flex items-center justify-center z-40"
                            >
                                <PenTool size={24} />
                            </motion.button>
                        </div>
                    )}
                </div>

                {/* Comment Input Drawer/Modal */}
                <AnimatePresence>
                    {showCommentInput && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/50 z-[60]"
                                onClick={() => setShowCommentInput(false)}
                            />
                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 z-[70] shadow-2xl"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-lg">Escribir comentario</h3>
                                    <button onClick={() => setShowCommentInput(false)} className="p-2 text-gray-400 hover:text-black">
                                        <X size={24} />
                                    </button>
                                </div>

                                <textarea
                                    value={newCommentText}
                                    onChange={(e) => setNewCommentText(e.target.value)}
                                    placeholder="Comparte tu opinión..."
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm outline-none focus:border-pi-purple focus:ring-1 focus:ring-pi-purple min-h-[120px] resize-none mb-4"
                                />

                                {newCommentImage && (
                                    <div className="relative w-20 h-20 rounded-lg overflow-hidden mb-4 border border-gray-200">
                                        <Image src={newCommentImage} alt="Preview" fill className="object-cover" />
                                        <button
                                            onClick={() => setNewCommentImage(null)}
                                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-xs"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-3 bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100 hover:text-pi-purple transition-colors"
                                        >
                                            <ImageIcon size={20} />
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                        />
                                    </div>
                                    <button
                                        onClick={handleSubmitComment}
                                        disabled={!newCommentText.trim() && !newCommentImage}
                                        className="bg-[#FF6B6B] text-white px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-500 transition-colors"
                                    >
                                        <Send size={18} />
                                        PUBLICAR
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Unlock Chapter Modal */}
                <AnimatePresence>
                    {showUnlockModal && selectedChapter && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                                onClick={() => setShowUnlockModal(false)}
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="fixed inset-0 m-auto w-[90%] max-w-sm h-fit bg-white rounded-3xl p-8 z-[110] shadow-2xl text-center"
                            >
                                <div className="w-20 h-20 bg-pi-purple/10 rounded-full flex items-center justify-center mx-auto mb-6 text-pi-purple">
                                    <Lock size={40} />
                                </div>
                                <h3 className="text-2xl font-black mb-2">Capítulo Bloqueado</h3>
                                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                                    Este capítulo es exclusivo de **Early Access**. Desbloquéalo ahora con Inks o espera al estreno gratuito.
                                </p>

                                <div className="space-y-4">
                                    <button
                                        onClick={() => {
                                            if (!user) {
                                                authenticate();
                                                return;
                                            }

                                            const cost = selectedChapter.unlockCost || 60; // 60 Inks is roughly 0.06 Pi/chapter

                                            if (userData.balance >= cost) {
                                                // Deduct inks and unlock
                                                addBalance(-cost);
                                                updateReadingProgress(id as string, selectedChapter.id);
                                                alert(`¡Capítulo desbloqueado! Se han descontado ${cost} Inks de tu saldo.`);
                                                setShowUnlockModal(false);
                                            } else {
                                                if (confirm(`No tienes suficientes Inks (necesitas ${cost}). ¿Quieres ir a la Wallet a comprar más?`)) {
                                                    router.push('/wallet');
                                                }
                                            }
                                        }}
                                        className="w-full py-4 bg-pi-purple text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg shadow-pi-purple/20 hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        <Coins size={20} fill="currentColor" />
                                        DESBLOQUEAR CON {selectedChapter.unlockCost || 60} INKS
                                    </button>
                                    <button
                                        onClick={() => setShowUnlockModal(false)}
                                        className="w-full py-4 text-gray-400 font-bold hover:text-gray-600 transition-colors"
                                    >
                                        ESPERAR AL ESTRENO
                                    </button>
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <div className="flex items-center justify-center gap-2 text-pi-gold-dark font-black text-xs">
                                        <Calendar size={14} />
                                        <span>ESTRENO GRATIS: {new Date(selectedChapter.unlockDate || Date.now()).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
