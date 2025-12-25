"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { mockNews, NewsItem } from "@/data/mockNews";
import { StorageService } from "@/lib/storage";

export interface Chapter {
    id: string;
    title: string;
    date: string;
    isLocked: boolean;
    unlockCost?: number;
    unlockDate?: string;
    images?: string[];
}

export interface Webtoon extends NewsItem {
    status: string; // "ongoing" | "completed"
    genres: string[];
    chapters: Chapter[];
    artist?: string;
    alternatives?: string;
    year?: string;
    language?: string;
    bannerUrl?: string;
}

interface ContentContextType {
    webtoons: Webtoon[];
    loading: boolean;
    addWebtoon: (webtoon: Webtoon) => Promise<void>;
    addChapter: (webtoonId: string, chapter: Chapter) => Promise<void>;
    updateChapter: (webtoonId: string, chapterId: string, updatedData: Partial<Chapter>) => Promise<void>;
    deleteWebtoon: (id: string) => Promise<void>;
    getWebtoon: (id: string) => Webtoon | undefined;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
    const [webtoons, setWebtoons] = useState<Webtoon[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function initDB() {
            try {
                // 1. Try to get data from IndexedDB
                let data = await StorageService.getAll<Webtoon>();

                // 2. Migration from old localStorage if IndexedDB is empty
                if (data.length === 0) {
                    const oldStored = localStorage.getItem("inktoons_content_data");
                    if (oldStored) {
                        const migratedData = JSON.parse(oldStored);
                        await StorageService.saveAll(migratedData);
                        data = migratedData;
                        console.log("Migrated data from localStorage to IndexedDB");
                        // Clear old storage to save space
                        localStorage.removeItem("inktoons_content_data");
                    } else {
                        // 3. Initial state with mock data
                        const initialWebtoons: Webtoon[] = mockNews.map(news => ({
                            ...news,
                            status: "ongoing",
                            genres: ["Acción", "Aventura"],
                            chapters: [],
                            artist: "Unknown",
                            year: "2025",
                            language: "Español"
                        }));
                        await StorageService.saveAll(initialWebtoons);
                        data = initialWebtoons;
                    }
                }
                setWebtoons(data);
            } catch (err) {
                console.error("Failed to init storage:", err);
            } finally {
                setLoading(false);
            }
        }
        initDB();
    }, []);

    const addWebtoon = async (webtoon: Webtoon) => {
        await StorageService.save(webtoon);
        setWebtoons(prev => [webtoon, ...prev]);
    };

    const addChapter = async (webtoonId: string, chapter: Chapter) => {
        const target = webtoons.find(w => w.id === webtoonId);
        if (target) {
            const updated = {
                ...target,
                chapters: [chapter, ...target.chapters]
            };
            await StorageService.save(updated);
            setWebtoons(prev => prev.map(w => w.id === webtoonId ? updated : w));
        }
    };

    const updateChapter = async (webtoonId: string, chapterId: string, updatedData: Partial<Chapter>) => {
        const target = webtoons.find(w => w.id === webtoonId);
        if (target) {
            const updatedChapters = target.chapters.map(ch =>
                ch.id === chapterId ? { ...ch, ...updatedData } : ch
            );
            const updatedWebtoon = { ...target, chapters: updatedChapters };
            await StorageService.save(updatedWebtoon);
            setWebtoons(prev => prev.map(w => w.id === webtoonId ? updatedWebtoon : w));
        }
    };

    const deleteWebtoon = async (id: string) => {
        await StorageService.delete(id);
        setWebtoons(prev => prev.filter(w => w.id !== id));
    };

    const getWebtoon = (id: string) => webtoons.find(w => w.id === id);

    return (
        <ContentContext.Provider value={{
            webtoons,
            loading,
            addWebtoon,
            addChapter,
            updateChapter,
            deleteWebtoon,
            getWebtoon
        }}>
            {children}
        </ContentContext.Provider>
    );
}

export function useContent() {
    const context = useContext(ContentContext);
    if (context === undefined) {
        throw new Error("useContent must be used within a ContentProvider");
    }
    return context;
}
