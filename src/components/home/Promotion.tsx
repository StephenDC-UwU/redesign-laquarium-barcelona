"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Dictionary } from "@/dictionaries";

gsap.registerPlugin(ScrollTrigger);

interface PromotionProps {
    dict: Dictionary;
}

export default function Promotion({ dict }: PromotionProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const tweenRef = useRef<gsap.core.Tween | null>(null);

    // Drag scrolling states
    const isDragging = useRef(false);
    const startX = useRef(0);
    const startProgress = useRef(0);

    const p = dict.promotions;

    const promoItems = [
        {
            id: 1,
            title: p.promo1,
            image: "/promotions/shark.png",
            alt: "Experiencia con Tiburones",
        },
        {
            id: 2,
            title: p.promo2,
            image: "/promotions/reef.png",
            alt: "Experiencia en Arrecife",
        },
        {
            id: 3,
            title: p.promo3,
            image: "/promotions/betta.png",
            alt: "El universo de Guadi",
        },
        {
            id: 4,
            title: p.promo4,
            image: "/promotions/clownfish.png",
            alt: "Experiencia alimentando peces",
        },
        {
            id: 5,
            title: p.promo4,
            image: "/promotions/clownfish.png",
            alt: "Experiencia alimentando peces",
        },
        {
            id: 6,
            title: p.promo4,
            image: "/promotions/clownfish.png",
            alt: "Experiencia alimentando peces",
        },
    ];

    // Duplicate items for infinite marquee
    const duplicatedItems = [...promoItems, ...promoItems];

    useGSAP(() => {
        // Infinite marquee animation
        if (trackRef.current) {
            tweenRef.current = gsap.to(trackRef.current, {
                xPercent: -50,
                ease: "none",
                duration: 25,
                repeat: -1,
            });
        }

        // Title animation
        gsap.fromTo(".promo-title-group",
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 80%",
                }
            }
        );

        // Cards reveal
        gsap.fromTo(".promo-card",
            { opacity: 0, y: 50, scale: 0.95 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
                stagger: 0.1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 70%",
                }
            }
        );
    }, { scope: containerRef });

    // GSAP scroll on click
    const scroll = (direction: "left" | "right") => {
        if (!tweenRef.current || !trackRef.current) return;
        
        // Approximate one card step
        const step = 352 / (trackRef.current.scrollWidth / 2);
        const proxy = { p: tweenRef.current.progress() };
        const targetP = direction === "right" ? proxy.p + step : proxy.p - step;
        
        tweenRef.current.pause();
        
        gsap.to(proxy, {
            p: targetP,
            duration: 0.8,
            ease: "power3.out",
            onUpdate: () => {
                let v = proxy.p % 1;
                if (v < 0) v += 1;
                tweenRef.current?.progress(v);
            },
            onComplete: () => {
                if (!isDragging.current) {
                    tweenRef.current?.play();
                }
            }
        });
    };

    // Drag Handlers
    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        isDragging.current = true;
        tweenRef.current?.pause();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        startX.current = clientX;
        startProgress.current = tweenRef.current?.progress() || 0;
        
        if (trackRef.current) {
            trackRef.current.style.cursor = 'grabbing';
        }
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging.current || !tweenRef.current || !trackRef.current) return;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const dx = clientX - startX.current;
        
        const totalWidth = trackRef.current.scrollWidth / 2; 
        let newProgress = startProgress.current - (dx / totalWidth);
        
        newProgress = newProgress % 1;
        if (newProgress < 0) newProgress += 1;
        
        tweenRef.current.progress(newProgress);
    };

    const handleMouseUp = () => {
        if (isDragging.current) {
            isDragging.current = false;
            if (trackRef.current) {
                trackRef.current.style.cursor = 'grab';
            }
        }
        tweenRef.current?.play();
    };

    const handleMouseEnter = () => {
        if (!isDragging.current) {
            tweenRef.current?.pause();
        }
    };

    const handleMouseLeave = () => {
        if (isDragging.current) {
            isDragging.current = false;
            if (trackRef.current) {
                trackRef.current.style.cursor = 'grab';
            }
        }
        tweenRef.current?.play();
    };

    return (
        <section ref={containerRef} className="w-full py-20 bg-background overflow-hidden relative select-none">
            {/* Header */}
            <div className="promo-title-group flex justify-center mb-16 relative">
                <div className="relative">
                    <div className="absolute -left-8 -top-8 w-20 h-20 bg-primary/40 rounded-full -z-10 pointer-events-none" />
                    <h2 className="text-5xl md:text-6xl font-bold font-outfit text-secondary dark:text-white">
                        {p.title}
                    </h2>
                </div>
            </div>

            {/* Marquee Track */}
            <div className="w-full relative overflow-hidden px-4 md:px-0">
                <div
                    ref={trackRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onTouchStart={handleMouseDown}
                    onTouchMove={handleMouseMove}
                    onTouchEnd={handleMouseUp}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="flex flex-row flex-nowrap gap-8 w-max cursor-grab active:cursor-grabbing pb-8"
                >
                    {duplicatedItems.map((item, index) => (
                        <div
                            key={`${item.id}-${index}`}
                            className="promo-card flex-none w-[280px] md:w-[320px] text-center group select-none"
                        >
                            <div className="w-56 h-56 md:w-64 md:h-64 mx-auto rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-xl relative aspect-square transition-all duration-500 group-hover:scale-105 group-hover:border-primary group-hover:shadow-primary/20 pointer-events-none">
                                <Image
                                    src={item.image}
                                    alt={item.alt}
                                    fill
                                    sizes="(max-width: 768px) 224px, 256px"
                                    priority={index < 4}
                                    className="object-cover pointer-events-none"
                                    draggable={false}
                                />
                            </div>
                            <p className="mt-6 text-lg md:text-xl font-medium font-switzer text-slate-700 dark:text-slate-300 leading-snug max-w-[240px] mx-auto group-hover:text-primary transition-colors duration-300 pointer-events-none">
                                {item.title}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Controls Arrow Buttons */}
            <div className="flex justify-center gap-6 mt-8">
                <button
                    onClick={() => scroll("left")}
                    className="w-14 h-14 rounded-full bg-primary hover:bg-primary-light text-white flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer shadow-primary/20 z-10 relative"
                    aria-label="Anterior"
                >
                    <ArrowLeft size={28} strokeWidth={2.5} />
                </button>
                <button
                    onClick={() => scroll("right")}
                    className="w-14 h-14 rounded-full bg-primary hover:bg-primary-light text-white flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer shadow-primary/20 z-10 relative"
                    aria-label="Siguiente"
                >
                    <ArrowRight size={28} strokeWidth={2.5} />
                </button>
            </div>
        </section>
    );
}
