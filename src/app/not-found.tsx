"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootNotFound() {
    const router = useRouter();

    useEffect(() => {
        // Client-side fallback: parse path to find locale or default to Spanish
        const pathname = window.location.pathname;
        const segment = pathname.split("/")[1];
        const locale = (segment === "ca" || segment === "en") ? segment : "es";

        // Redirect to a non-existent route inside the locale to trigger the localized [...not-found] page
        router.replace(`/${locale}/404-not-found`);
    }, [router]);

    return null;
}
