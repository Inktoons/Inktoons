"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { usePi } from "@/components/PiNetworkProvider";
import { SupabaseService } from "@/lib/supabaseService";

interface UserData {
    favorites: string[]; // IDs of favorite webtoons
    history: string[];   // IDs of read webtoons
    following: string[]; // Names of followed authors
    ratings: Record<string, number>; // ID -> Rating (1-5)
    lastRead: Record<string, string>; // webtoonId -> last chapterId read (for resuming)
    readChapters: Record<string, string[]>; // webtoonId -> list of ALL read chapterIds
    profileImage?: string; // Base64 or URL of profile image
    balance: number; // Virtual Currency Balance (Inks)
    subscription?: {
        type: '1m' | '6m' | '1y';
        expiresAt: number; // Timestamp
    };
}

interface UserDataContextType {
    userData: UserData;
    loading: boolean;
    toggleFavorite: (id: string) => void;
    addToHistory: (id: string) => void;
    toggleFollowAuthor: (authorName: string) => void;
    rateWebtoon: (id: string, rating: number) => void;
    setProfileImage: (image: string) => void;
    addBalance: (amount: number) => void;
    setSubscription: (type: '1m' | '6m' | '1y', durationInMonths: number) => void;
    isFavorite: (id: string) => boolean;
    isInHistory: (id: string) => boolean;
    isFollowingAuthor: (authorName: string) => boolean;
    getUserRating: (id: string) => number | undefined;
    getLastReadChapter: (id: string) => string | undefined;
    isChapterRead: (webtoonId: string, chapterId: string) => boolean;
    updateReadingProgress: (webtoonId: string, chapterId: string) => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export function UserDataProvider({ children }: { children: ReactNode }) {
    const { user } = usePi();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<UserData>({
        favorites: [],
        history: [],
        following: [],
        ratings: {},
        lastRead: {},
        readChapters: {},
        profileImage: undefined,
        balance: 50, // Welcome bonus
    });

    // 📥 LOAD DATA (Supabase > LocalStorage)
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);

            // 1. Try Supabase if user is logged in
            if (user?.uid) {
                const cloudData = await SupabaseService.getUserData(user.uid);
                if (cloudData) {
                    setUserData(prev => ({ ...prev, ...cloudData }));
                    setLoading(false);
                    return;
                }
            }

            // 2. Fallback to localStorage
            const stored = localStorage.getItem("inktoons_user_data");
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    setUserData(prev => ({ ...prev, ...parsed }));
                } catch (e) {
                    console.error("Failed to parse user data", e);
                }
            }
            setLoading(false);
        };

        loadInitialData();
    }, [user?.uid]);

    // 📤 SAVE DATA (Local + Cloud)
    useEffect(() => {
        if (loading) return; // Don't save initial state

        // Local save
        localStorage.setItem("inktoons_user_data", JSON.stringify(userData));

        // Cloud save if logged in
        if (user?.uid) {
            const timeoutId = setTimeout(() => {
                SupabaseService.saveUserData(user.uid, userData);
            }, 1000); // Debounce to avoid too many writes
            return () => clearTimeout(timeoutId);
        }
    }, [userData, user?.uid, loading]);

    const toggleFavorite = useCallback((id: string) => {
        setUserData(prev => {
            const isFav = prev.favorites.includes(id);
            return {
                ...prev,
                favorites: isFav
                    ? prev.favorites.filter(fid => fid !== id)
                    : [...prev.favorites, id]
            };
        });
    }, []);

    const addToHistory = useCallback((id: string) => {
        setUserData(prev => {
            if (prev.history.includes(id)) return prev;
            return {
                ...prev,
                history: [id, ...prev.history] // Add to top
            };
        });
    }, []);

    const toggleFollowAuthor = useCallback((authorName: string) => {
        setUserData(prev => {
            const isFollowing = prev.following.includes(authorName);
            return {
                ...prev,
                following: isFollowing
                    ? prev.following.filter(name => name !== authorName)
                    : [...prev.following, authorName]
            };
        });
    }, []);

    const rateWebtoon = useCallback((id: string, rating: number) => {
        setUserData(prev => ({
            ...prev,
            ratings: {
                ...prev.ratings,
                [id]: rating
            }
        }));
    }, []);

    const updateReadingProgress = useCallback((webtoonId: string, chapterId: string) => {
        setUserData(prev => {
            const currentRead = prev.readChapters[webtoonId] || [];
            if (prev.lastRead[webtoonId] === chapterId && currentRead.includes(chapterId)) {
                return prev;
            }

            const newRead = currentRead.includes(chapterId)
                ? currentRead
                : [...currentRead, chapterId];

            return {
                ...prev,
                lastRead: {
                    ...prev.lastRead,
                    [webtoonId]: chapterId
                },
                readChapters: {
                    ...prev.readChapters,
                    [webtoonId]: newRead
                },
                history: prev.history.includes(webtoonId)
                    ? prev.history
                    : [webtoonId, ...prev.history]
            };
        });
    }, []);

    const setProfileImage = useCallback((image: string) => {
        setUserData(prev => ({
            ...prev,
            profileImage: image
        }));
    }, []);

    const addBalance = useCallback((amount: number) => {
        setUserData(prev => ({
            ...prev,
            balance: (prev.balance || 0) + amount
        }));
    }, []);

    const setSubscription = useCallback((type: '1m' | '6m' | '1y', durationInMonths: number) => {
        setUserData(prev => {
            const now = Date.now();
            const ms = durationInMonths * 30 * 24 * 60 * 60 * 1000;
            const currentExpiry = prev.subscription?.expiresAt || now;
            const newExpiry = Math.max(now, currentExpiry) + ms;

            return {
                ...prev,
                subscription: {
                    type,
                    expiresAt: newExpiry
                }
            };
        });
    }, []);

    const isFavorite = useCallback((id: string) => userData.favorites.includes(id), [userData.favorites]);
    const isInHistory = useCallback((id: string) => userData.history.includes(id), [userData.history]);
    const isFollowingAuthor = useCallback((authorName: string) => userData.following.includes(authorName), [userData.following]);
    const getUserRating = useCallback((id: string) => userData.ratings[id], [userData.ratings]);
    const getLastReadChapter = useCallback((id: string) => userData.lastRead[id], [userData.lastRead]);
    const isChapterRead = useCallback((webtoonId: string, chapterId: string) => {
        return (userData.readChapters[webtoonId] || []).includes(chapterId);
    }, [userData.readChapters]);

    return (
        <UserDataContext.Provider value={{
            userData,
            loading,
            toggleFavorite,
            addToHistory,
            toggleFollowAuthor,
            rateWebtoon,
            setProfileImage,
            addBalance,
            setSubscription,
            isFavorite,
            isInHistory,
            isFollowingAuthor,
            getUserRating,
            getLastReadChapter,
            isChapterRead,
            updateReadingProgress
        }}>
            {children}
        </UserDataContext.Provider>
    );
}

export function useUserData() {
    const context = useContext(UserDataContext);
    if (context === undefined) {
        throw new Error("useUserData must be used within a UserDataProvider");
    }
    return context;
}
