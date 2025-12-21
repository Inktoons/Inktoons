"use client";

import { PiProvider } from "./PiNetworkProvider";

export function Providers({ children }: { children: React.ReactNode }) {
    return <PiProvider>{children}</PiProvider>;
}
