"use client";

import { useRef } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Dictionary } from "@/dictionaries";
// @ts-expect-error - @splidejs/react-splide has missing types in its package.json exports mapping
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";

interface PromotionProps {
    dict: Dictionary;
}

export default function Promotion({ dict }: PromotionProps) {
    const splideRef = useRef<any>(null);
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
    ];

    const handlePrev = () => {
        splideRef.current?.go("<");
    };

    const handleNext = () => {
        splideRef.current?.go(">");
    };

    return (
        <section className="w-full py-20 bg-background overflow-hidden relative select-none">
            {/* Header */}
            <div className="flex justify-center mb-16 relative">
                <div className="relative">
                    <div className="absolute -left-8 -top-8 w-20 h-20 bg-primary/40 rounded-full -z-10 pointer-events-none" />
                    <h2 className="text-5xl md:text-6xl font-semibold font-outfit text-black dark:text-white">
                        {p.title}
                    </h2>
                </div>
            </div>

            {/* Splide Slider Container */}
            <div className="w-full max-w-[1200px] mx-auto px-4 h-auto relative">
                <Splide
                    ref={splideRef}
                    options={{
                        type: "loop",
                        focus: "center",
                        perPage: 3,
                        gap: "2rem",
                        arrows: false,
                        pagination: false,
                        autoplay: true,
                        interval: 3000,
                        drag: true,
                        pauseOnHover: true,
                        breakpoints: {
                            768: {
                                perPage: 1,
                            },
                        },
                    }}
                >
                    {promoItems.map((item, index) => (
                        <SplideSlide key={item.id} >
                            <div className={`promo-card flex-none w-[260px] md:w-[320px] text-center group select-none transition-all duration-500 py-14 ${index % 2 !== 0 ? "translate-y-0 md:translate-y-12" : "translate-y-0 md:-translate-y-4"
                                }`} >
                                <div className="circle-img-wrapper w-60 h-60 md:w-80 md:h-80 mx-auto rounded-full overflow-hidden   relative aspect-square transition-all duration-500">
                                    <Image
                                        src={item.image}
                                        alt={item.alt}
                                        fill
                                        sizes="(max-width: 768px) 240px, 320px"
                                        priority
                                        className="object-cover pointer-events-none"
                                        draggable={false}
                                    />
                                </div>
                                <p className="promo-title mt-6 text-lg md:text-xl font-light font-switzer text-black dark:text-slate-300 leading-snug max-w-[240px] mx-auto transition-colors duration-500">
                                    {item.title}
                                </p>
                            </div>
                        </SplideSlide>
                    ))}
                </Splide>
            </div>

            {/* Controls Arrow Buttons */}
            <div className="flex justify-center gap-40 mt-12">
                <button
                    onClick={handlePrev}
                    className="w-14 h-14 rounded-full bg-primary hover:bg-primary-light text-white flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer shadow-primary/20 z-10 relative"
                    aria-label="Anterior"
                >
                    <ArrowLeft size={28} strokeWidth={2.5} />
                </button>
                <button
                    onClick={handleNext}
                    className="w-14 h-14 rounded-full bg-primary hover:bg-primary-light text-white flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer shadow-primary/20 z-10 relative"
                    aria-label="Siguiente"
                >
                    <ArrowRight size={28} strokeWidth={2.5} />
                </button>
            </div>
        </section>
    );
}
