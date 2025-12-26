"use client";

import { PiProvider } from "./PiNetworkProvider";
import { ContentProvider } from "@/context/ContentContext";
import { UserDataProvider } from "@/context/UserDataContext";
import { ThemeProvider } from "./ThemeHandler";
import { MissionProvider } from "@/context/MissionContext";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <PiProvider>
            <ContentProvider>
                <UserDataProvider>
                    <MissionProvider>
                        <ThemeProvider>
                            {children}
                        </ThemeProvider>
                    </MissionProvider>
                </UserDataProvider>
            </ContentProvider>
        </PiProvider>
    );
}
