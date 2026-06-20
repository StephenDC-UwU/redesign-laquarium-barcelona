"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { Dictionary } from "@/dictionaries";

gsap.registerPlugin(ScrollTrigger);

interface ExperienceProps {
    dict: Dictionary;
}

export default function Experience({ dict }: ExperienceProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoWrapperRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        // We use a timeline with ScrollTrigger to scrub through the animation
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top", // When the section hits the top of the viewport
                end: "+=80%", // Pin for 80% of viewport height while animating (less scroll required)
                scrub: 1, // Smooth scrubbing
                pin: true, // Pin the section in place
            }
        });

        // 1. Animate the video container to 100vw and 100vh
        tl.to(videoWrapperRef.current, {
            width: "100vw",
            height: "100vh",
            borderRadius: "0px",
            ease: "none",
            duration: 1, // Base duration for the timeline scale
        });

        // 2. Fade in the text starting halfway through the video animation
        tl.fromTo(textRef.current,
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
            0.5 // Start at the 50% mark of the timeline
        );

    }, { scope: containerRef });

    return (
        <section ref={containerRef} className="relative w-full h-screen bg-background flex items-center justify-center overflow-hidden">

            {/* Video Container - starts at 40% width, fixed height/aspect ratio */}
            <div
                ref={videoWrapperRef}
                className="relative w-[80vw] md:w-[40vw] h-[50vh] md:h-[60vh] rounded-[40px] overflow-hidden shadow-2xl flex items-center justify-center bg-black"
            >
                {/* Background Video */}
                {/* Nota: Usamos un video placeholder externo. Puedes cambiar el 'src' por tu video local ej: '/videos/experiencia.mp4' */}
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                    src="/video/experience.mp4"
                />

                {/* Gradient Overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/20 pointer-events-none" />

                {/* Text Overlay - Hidden initially, animated by GSAP */}
                <div
                    ref={textRef}
                    className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 opacity-0 z-10"
                >
                    <h2 className="text-5xl md:text-7xl lg:text-8xl font-shadows text-center mb-8 drop-shadow-lg max-w-4xl leading-tight">
                        Ven vive una<br />experiencia unica
                    </h2>
                    <button className="px-10 py-4 bg-tertiary hover:bg-tertiary/90 text-white font-bold font-switzer rounded-md text-lg md:text-xl transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer">
                        Comprar
                    </button>
                </div>

            </div>

        </section>
    );
}
