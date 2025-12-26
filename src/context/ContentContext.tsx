"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { mockNews } from "@/data/mockNews";
import { SupabaseService, Webtoon, Chapter } from "@/lib/supabaseService";

interface ContentContextType {
    webtoons: Webtoon[];
    loading: boolean;
    addWebtoon: (webtoon: Webtoon) => Promise<void>;
    addChapter: (webtoonId: string, chapter: Chapter) => Promise<void>;
    updateChapter: (webtoonId: string, chapterId: string, updatedData: Partial<Chapter>) => Promise<void>;
    deleteWebtoon: (id: string) => Promise<void>;
    getWebtoon: (id: string) => Webtoon | undefined;
    uploadImage: (file: File) => Promise<string | null>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
    const [webtoons, setWebtoons] = useState<Webtoon[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadWebtoons() {
            try {
                // Load webtoons from Supabase
                let data = await SupabaseService.getAllWebtoons();

                // If no data in Supabase, initialize with mock data
                if (data.length === 0) {
                    const initialWebtoons: Webtoon[] = mockNews.map(news => ({
                        ...news,
                        status: "ongoing",
                        genres: ["Acción", "Aventura"],
                        chapters: [],
                        artist: "Unknown",
                        year: "2025",
                        language: "Español"
                    }));

                    // Save initial data to Supabase
                    await SupabaseService.saveAllWebtoons(initialWebtoons);
                    data = initialWebtoons;
                    console.log("✅ Initialized Supabase with mock data");
                }

                setWebtoons(data);
            } catch (err) {
                console.error("❌ Failed to load webtoons from Supabase:", err);

                // Fallback to mock data if Supabase fails
                const fallbackData: Webtoon[] = mockNews.map(news => ({
                    ...news,
                    status: "ongoing",
                    genres: ["Acción", "Aventura"],
                    chapters: [],
                    artist: "Unknown",
                    year: "2025",
                    language: "Español"
                }));
                setWebtoons(fallbackData);
            } finally {
                setLoading(false);
            }
        }
        loadWebtoons();
    }, []);

    const addWebtoon = async (webtoon: Webtoon) => {
        try {
            await SupabaseService.saveWebtoon(webtoon);
            setWebtoons(prev => [webtoon, ...prev]);
        } catch (error) {
            console.error("Error adding webtoon:", error);
            throw error;
        }
    };

    const addChapter = async (webtoonId: string, chapter: Chapter) => {
        try {
            await SupabaseService.addChapter(webtoonId, chapter);

            const target = webtoons.find(w => w.id === webtoonId);
            if (target) {
                const updated = {
                    ...target,
                    chapters: [chapter, ...(target.chapters || [])]
                };
                setWebtoons(prev => prev.map(w => w.id === webtoonId ? updated : w));
            }
        } catch (error) {
            console.error("Error adding chapter:", error);
            throw error;
        }
    };

    const updateChapter = async (webtoonId: string, chapterId: string, updatedData: Partial<Chapter>) => {
        try {
            await SupabaseService.updateChapter(chapterId, updatedData);

            const target = webtoons.find(w => w.id === webtoonId);
            if (target) {
                const updatedChapters = (target.chapters || []).map(ch =>
                    ch.id === chapterId ? { ...ch, ...updatedData } : ch
                );
                const updatedWebtoon = { ...target, chapters: updatedChapters };
                setWebtoons(prev => prev.map(w => w.id === webtoonId ? updatedWebtoon : w));
            }
        } catch (error) {
            console.error("Error updating chapter:", error);
            throw error;
        }
    };

    const deleteWebtoon = async (id: string) => {
        try {
            await SupabaseService.deleteWebtoon(id);
            setWebtoons(prev => prev.filter(w => w.id !== id));
        } catch (error) {
            console.error("Error deleting webtoon:", error);
            throw error;
        }
    };

    const getWebtoon = (id: string) => webtoons.find(w => w.id === id);

    const uploadImage = async (file: File): Promise<string | null> => {
        try {
            return await SupabaseService.uploadImage(file);
        } catch (error) {
            console.error("Error uploading image:", error);
            return null;
        }
    };

    return (
        <ContentContext.Provider value={{
            webtoons,
            loading,
            addWebtoon,
            addChapter,
            updateChapter,
            deleteWebtoon,
            getWebtoon,
            uploadImage
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

// Re-export types for convenience
export type { Webtoon, Chapter };
