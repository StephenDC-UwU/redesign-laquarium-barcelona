"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFoundPage() {
    const params = useParams();
    const locale = params?.locale || "es";

    return (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#00b5e2] text-white">
            <title>Página no encontrada | L&apos;Aquàrium Barcelona</title>
            
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

            {/* Back Button (Top Left) */}
            <button 
                onClick={() => window.history.back()}
                className="absolute top-8 left-8 w-14 h-14 rounded-full border border-white/50 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Regresar"
            >
                <ArrowLeft className="w-6 h-6 stroke-[1.5]" />
            </button>

            {/* Center Logo */}
            <div className="relative w-48 h-48 mb-8 animate-zoom-pulse">
                <Image
                    src="/logo-transition.svg"
                    alt="L'Aquàrium Logo"
                    fill
                    priority
                    className="object-contain"
                />
            </div>

            {/* Message */}
            <h1 
                className="text-4xl md:text-5xl font-tertiary tracking-wide select-none text-center max-w-lg mb-10 leading-snug px-4" 
                style={{ fontFamily: "var(--font-shadows), cursive" }}
            >
                Lo siento esta pagina no se encuentra :C
            </h1>

            {/* Regresar Button */}
            <Link 
                href={`/${locale}`}
                className="flex items-center gap-2 bg-white text-slate-800 font-bold px-8 py-3 rounded-sm transition-all hover:bg-slate-100 shadow-md cursor-pointer select-none"
            >
                <Home className="w-4 h-4" />
                <span className="font-outfit text-sm tracking-wide">Regresar</span>
            </Link>
        </div>
    );
}
