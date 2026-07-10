"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function PageTransitionLoader() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [textIndex, setTextIndex] = useState(0);

    const texts = ["Alimentando...", "Nadando...", "Aprendiendo..."];

    // Cycle text index every 1.5 seconds while active
    useEffect(() => {
        if (!isVisible) return;
        const interval = setInterval(() => {
            setTextIndex((prev) => (prev + 1) % texts.length);
        }, 400);
        return () => clearInterval(interval);
    }, [isVisible]);

    // Handle smooth page exit transitions on pathname changes
    useEffect(() => {
        if (!isLoading) return;

        // Keep loader visible for at least 600ms for a smooth breathing animation
        const delayTimer = setTimeout(() => {
            setIsFadingOut(true);

            // Wait 400ms for opacity fade-out transition, then unmount
            const fadeTimer = setTimeout(() => {
                setIsLoading(false);
                setIsVisible(false);
                setIsFadingOut(false);
            }, 400);

            return () => clearTimeout(fadeTimer);
        }, 600);

        return () => clearTimeout(delayTimer);
    }, [pathname, searchParams, isLoading]);

    // Setup listeners to start loading state
    useEffect(() => {
        const startLoader = () => {
            setIsFadingOut(false);
            setIsVisible(true);
            setIsLoading(true);
        };

        const handleAnchorClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest("a");

            if (anchor) {
                const href = anchor.getAttribute("href");
                const targetAttr = anchor.getAttribute("target");

                if (
                    href &&
                    href.startsWith("/") &&
                    !href.startsWith("/#") &&
                    targetAttr !== "_blank" &&
                    !e.metaKey &&
                    !e.ctrlKey
                ) {
                    startLoader();
                }
            }
        };

        document.addEventListener("click", handleAnchorClick);
        window.addEventListener("page-navigation-started", startLoader);

        return () => {
            document.removeEventListener("click", handleAnchorClick);
            window.removeEventListener("page-navigation-started", startLoader);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#00b5e2] text-white transition-opacity duration-300 ${isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
        >
            {/* Custom keyframes style tag for scale zoom-in/zoom-out pulse */}
            <style jsx global>{`
                @keyframes zoom-pulse {
                    0%, 100% {
                        transform: scale(0.9);
                    }
                    50% {
                        transform: scale(1.1);
                    }
                }
                .animate-zoom-pulse {
                    animation: zoom-pulse 2s infinite ease-in-out;
                }
            `}</style>

            <div className="relative w-48 h-48 mb-8 animate-zoom-pulse">
                <Image
                    src="/logo-transition.svg"
                    alt="L'Aquàrium Logo"
                    fill
                    priority
                    className="object-contain"
                />
            </div>

            <p className="text-4xl md:text-5xl font-tertiary tracking-wide select-none" style={{ fontFamily: "var(--font-shadows), cursive" }}>
                {texts[textIndex]}
            </p>
        </div>
    );
}
