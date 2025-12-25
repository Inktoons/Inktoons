"use client";

import { PiProvider } from "./PiNetworkProvider";
import { ContentProvider } from "@/context/ContentContext";
import { UserDataProvider } from "@/context/UserDataContext";
import { ThemeProvider } from "./ThemeHandler";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <PiProvider>
            <ContentProvider>
                <UserDataProvider>
                    <ThemeProvider>
                        {children}
                    </ThemeProvider>
                </UserDataProvider>
            </ContentProvider>
        </PiProvider>
    );
}
