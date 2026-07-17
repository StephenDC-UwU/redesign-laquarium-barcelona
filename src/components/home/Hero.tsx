"use client"

import Image from "next/image";

import bg_hero from "@/assets/home/bg-cover.jpg";
import sharkDefault from "@/assets/home/shark.svg";
import sharkActive from "@/assets/home/shark-open-mouth.svg";
import jellyfishOne from "@/assets/home/jellyfish-one.svg";
import jellyfishOneDark from "@/assets/home/jellyfish-one-dark.svg";
import jellyfishTwo from "@/assets/home/jellyfish-two.svg";
import jellyfishTwoDark from "@/assets/home/jellyfish-two-dark.svg";

import { Dictionary } from "@/dictionaries";
import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Theme } from "@/types/Theme";
import Link from "next/link";

interface HeroProps {
    dict: Dictionary;
}

export default function Hero({ dict }: HeroProps) {
    const { theme } = useTheme();
    const [sharkImg, setSharkImg] = useState(sharkDefault);
    const [currentIndex, setCurrentIndex] = useState(0);

    const slides = [
        {
            title: dict.hero.hero_title,
            buttonText: dict.hero.hero_button,
            buttonLink: "/tickets",
            bgImage: bg_hero,
            isSlide0: true,
        },
        {
            title: dict.discover.item2_title,
            buttonText: dict.discover.discover_button_check,
            buttonLink: "#diving",
            bgImage: "/promotions/shark.png",
            isSlide1: true,
        }
    ];

    useEffect(() => {
        if (slides.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
        }, 7000);
        return () => clearInterval(interval);
    }, [slides.length]);

    return (
        <section id="hero" className="h-dvh w-full relative flex flex-col 2xl:block items-center justify-center gap-8 px-6 pt-20 2xl:pt-0 overflow-hidden">
            {/* bg-gradient overlay */}
            <div className={`absolute inset-0 z-10 transition-colors duration-1000 ${theme === Theme.DARK ? 'bg-black/70' : 'bg-[linear-gradient(180deg,rgba(0,0,0,0.4)0%,rgba(0,0,0,0.6)33%,rgba(0,0,0,0.6)66%,rgba(0,0,0,0.7)100%)]'}`}></div>

            {/* Background Images Cross-Fade */}
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out -z-10 ${index === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"
                        }`}
                >
                    <Image
                        src={slide.bgImage}
                        fill
                        priority={index === 0}
                        className="object-cover object-center pointer-events-none"
                        alt={`bg_hero_${index}`}
                    />
                </div>
            ))}

            {/* Slide 0 Foreground: Hero Shark */}
            <div className={`transition-all duration-700 ease-in-out absolute inset-0 pointer-events-none z-30 ${currentIndex === 0 ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}>
                <Image
                    src={sharkImg}
                    priority
                    className="absolute left-1/2 top-3/8 2xl:left-[35%] 2xl:top-[50%] -translate-x-1/2 -translate-y-1/2 cursor-pointer select-none w-[70%] max-w-[320px] 2xl:w-auto 2xl:max-w-none h-auto transition-all duration-300 pointer-events-auto"
                    alt="shark"
                    onMouseEnter={() => setSharkImg(sharkActive)}
                    onMouseLeave={() => setSharkImg(sharkDefault)}
                />
            </div>

            {/* Slide 2 Foreground: Clownfish */}
            <div className={`transition-all duration-700 ease-in-out absolute inset-0 pointer-events-none z-30 ${currentIndex === 2 ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}>
                <div className="absolute left-1/2 top-1/2 2xl:left-[28%] 2xl:top-[50%] -translate-x-1/2 -translate-y-1/2 hover-jellyfish cursor-pointer pointer-events-auto">
                    <Image
                        src="/promotions/clownfish.png"
                        width={300}
                        height={220}
                        className="select-none w-[70%] max-w-[280px] 2xl:w-auto 2xl:max-w-none h-auto"
                        alt="clownfish"
                    />
                </div>
            </div>

            {/* Hero Title and Button Slides Container */}
            <div
                className="relative z-40 left-auto top-auto 2xl:absolute 2xl:left-[50%] 2xl:top-[60%] translate-x-0 translate-y-0 2xl:-translate-x-1/2 2xl:-translate-y-1/2 w-full max-w-4xl flex flex-col items-center justify-center gap-8"
                onMouseEnter={() => setSharkImg(sharkActive)}
                onMouseLeave={() => setSharkImg(sharkDefault)}
            >
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`transition-all duration-700 ease-in-out flex flex-col items-center gap-8 w-full ${index === currentIndex
                            ? "opacity-100 translate-y-0 scale-100 relative pointer-events-auto"
                            : "opacity-0 absolute translate-y-4 scale-95 pointer-events-none"
                            }`}
                    >
                        <h1 className="text-5xl md:text-8xl 2xl:text-[9.5rem] text-white font-shadows cursor-pointer select-none leading-[0.9] hover:text-primary transition-colors duration-300 ease-in-out text-center font-bold drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                            {slide.title}
                        </h1>
                        <Link
                            href={slide.buttonLink}
                            className="border-[3px] border-white bg-primary hover:bg-white hover:text-primary text-white font-bold px-10 py-3.5 transition-all duration-300 text-center text-xl md:text-2xl cursor-pointer tracking-wider shadow-2xl uppercase font-outfit"
                        >
                            {slide.buttonText}
                        </Link>
                    </div>
                ))}
            </div>

            {/* Slide 0 Decorations: Hero Jellyfish one */}
            <div className={`hidden 2xl:block absolute top-[40%] left-[70%] -translate-x-1/2 -translate-y-1/2 z-20 hover-jellyfish cursor-pointer transition-all duration-700 ease-in-out ${currentIndex === 0 ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
                }`}>
                <Image
                    src={jellyfishOne}
                    className={`transition-opacity duration-500 ease-in-out ${theme === Theme.DARK ? "opacity-0" : "opacity-100"
                        }`}
                    alt="jellyfish one light"
                />
                <Image
                    src={jellyfishOneDark}
                    className={`absolute top-0 left-0 transition-opacity duration-500 ease-in-out ${theme === Theme.DARK ? "opacity-100" : "opacity-0"
                        }`}
                    alt="jellyfish one dark"
                />
            </div>

            {/* Slide 0 Decorations: Hero Jellyfish two */}
            <div className={`hidden 2xl:block absolute top-[80%] left-[20%] -translate-x-1/2 -translate-y-1/2 z-20 hover-jellyfish cursor-pointer transition-all duration-700 ease-in-out ${currentIndex === 0 ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
                }`}>
                <Image
                    src={jellyfishTwo}
                    className={`transition-opacity duration-500 ease-in-out ${theme === Theme.DARK ? "opacity-0" : "opacity-100"
                        }`}
                    alt="jellyfish two light"
                />
                <Image
                    src={jellyfishTwoDark}
                    className={`absolute top-0 left-0 transition-opacity duration-500 ease-in-out ${theme === Theme.DARK ? "opacity-100" : "opacity-0"
                        }`}
                    alt="jellyfish two dark"
                />
            </div>

            {/* Prev/Next Buttons */}
            {slides.length > 1 && (
                <>
                    <button
                        onClick={() => setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
                        className="absolute left-6 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white transition-all duration-300 backdrop-blur-sm cursor-pointer select-none group hidden md:flex items-center justify-center"
                        aria-label="Previous slide"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1))}
                        className="absolute right-6 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white transition-all duration-300 backdrop-blur-sm cursor-pointer select-none group hidden md:flex items-center justify-center"
                        aria-label="Next slide"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 group-hover:translate-x-0.5 transition-transform">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>
                </>
            )}

            {/* Carousel Indicators */}
            {slides.length > 1 && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-50">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex ? "bg-primary w-8" : "bg-white/50 hover:bg-white"
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}