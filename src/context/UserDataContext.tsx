"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

interface UserData {
    favorites: string[]; // IDs of favorite webtoons
    history: string[];   // IDs of read webtoons
    following: string[]; // Names of followed authors
    ratings: Record<string, number>; // ID -> Rating (1-5)
    lastRead: Record<string, string>; // webtoonId -> last chapterId read (for resuming)
    readChapters: Record<string, string[]>; // webtoonId -> list of ALL read chapterIds
    profileImage?: string; // Base64 or URL of profile image
    balance: number; // Virtual Currency Balance (Inks)
}

interface UserDataContextType {
    userData: UserData;
    toggleFavorite: (id: string) => void;
    addToHistory: (id: string) => void;
    toggleFollowAuthor: (authorName: string) => void;
    rateWebtoon: (id: string, rating: number) => void;
    setProfileImage: (image: string) => void;
    addBalance: (amount: number) => void;
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

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem("inktoons_user_data");
        if (stored) {
            try {
                // Handle legacy data structure if needed
                const parsed = JSON.parse(stored);
                setUserData(prev => ({ ...prev, ...parsed }));
            } catch (e) {
                console.error("Failed to parse user data", e);
            }
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem("inktoons_user_data", JSON.stringify(userData));
    }, [userData]);

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
            toggleFavorite,
            addToHistory,
            toggleFollowAuthor,
            rateWebtoon,
            setProfileImage,
            addBalance,
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
