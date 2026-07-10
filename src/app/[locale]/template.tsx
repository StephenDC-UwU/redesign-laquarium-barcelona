"use client";

import { useEffect } from "react";

export default function PageTemplate({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Dispatch event when the new page component has finished mounting/rendering on the client
        window.dispatchEvent(new CustomEvent("page-rendering-complete"));
    }, []);

    return <>{children}</>;
}
