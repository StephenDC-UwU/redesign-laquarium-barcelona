"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Dictionary } from "@/dictionaries";

gsap.registerPlugin(ScrollTrigger);

interface DiscoverProps {
    dict: Dictionary;
}

export default function Discover({ dict }: DiscoverProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const textWrapperRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const discoverDict = dict.discover;

    const discoverData = [
        {
            id: 1,
            image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop",
            title: discoverDict.item1_title,
            subtitle: discoverDict.item1_subtitle,
            description: discoverDict.item1_description,
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop",
            title: discoverDict.item2_title,
            subtitle: discoverDict.item2_subtitle,
            description: discoverDict.item2_description,
        },
        {
            id: 3,
            image: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?q=80&w=800&auto=format&fit=crop",
            title: discoverDict.item3_title,
            subtitle: discoverDict.item3_subtitle,
            description: discoverDict.item3_description,
        }
    ];

    // Initial scroll reveal
    useGSAP(() => {
        gsap.fromTo(".discover-header",
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, scrollTrigger: { trigger: containerRef.current, start: "top 80%" } }
        );

        gsap.fromTo(".discover-content",
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 0.8, delay: 0.2, scrollTrigger: { trigger: containerRef.current, start: "top 70%" } }
        );
    }, { scope: containerRef });

    // Animate text change
    useEffect(() => {
        if (textWrapperRef.current) {
            gsap.fromTo(textWrapperRef.current,
                { opacity: 0, x: 20 },
                { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
            );
        }
    }, [activeIndex]);

    const handleImageClick = (index: number) => {
        setActiveIndex(index);
    };

    const activeItem = discoverData[activeIndex];

    return (
        <section ref={containerRef} className="w-full py-24 bg-background overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 md:px-8">

                {/* Header */}
                <div className="discover-header flex justify-center mb-20 relative">
                    <div className="relative">
                        <div className="absolute -right-6 -top-4 w-16 h-16 bg-primary/40 rounded-full -z-10" />
                        <h2 className="text-5xl md:text-6xl font-bold font-outfit text-black dark:text-white">
                            {discoverDict.discover_title}
                        </h2>
                    </div>
                </div>

                <div className="discover-content grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                    {/* Carousel (Left) */}
                    <div className="relative w-full h-[400px] md:h-[550px] flex justify-center items-center">
                        {discoverData.map((item, index) => {
                            // Calculate distance relative to active index
                            let distance = index - activeIndex;
                            const total = discoverData.length;

                            // Normalize distance for an infinite loop effect
                            // e.g. for 3 items: distances 2 becomes -1, -2 becomes 1.
                            if (distance > Math.floor(total / 2)) distance -= total;
                            if (distance < -Math.floor(total / 2)) distance += total;

                            const isCenter = distance === 0;

                            // Calculate styles
                            const translateX = distance * 60; // slightly wider % offset
                            const scale = 1 - Math.abs(distance) * 0.2; // more pronounced scaling
                            const zIndex = 30 - Math.abs(distance);
                            const opacity = Math.abs(distance) > 1 ? 0 : 1;
                            const brightness = isCenter ? 1 : 0.4; // Darker inactive images

                            return (
                                <div
                                    key={item.id}
                                    className="absolute w-3/5 md:w-1/2 h-[90%] transition-all duration-500 ease-out cursor-pointer shadow-2xl"
                                    style={{
                                        transform: `translateX(${translateX}%) scale(${scale})`,
                                        zIndex,
                                        opacity,
                                        filter: `brightness(${brightness})`,
                                        pointerEvents: opacity === 0 ? 'none' : 'auto',
                                    }}
                                    onClick={() => handleImageClick(index)}
                                >
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        className="object-cover rounded-2xl pointer-events-none select-none"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                </div>
                            );
                        })}
                    </div>

                    {/* Text Content (Right) */}
                    <div className="flex flex-col justify-center px-4 md:px-12 h-[350px]">
                        <div ref={textWrapperRef} className="flex flex-col">
                            <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold font-outfit text-primary leading-tight mb-6 uppercase tracking-tight">
                                {activeItem.title}
                            </h3>
                            <h4 className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 font-switzer mb-6">
                                {activeItem.subtitle}
                            </h4>
                            <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 font-switzer mb-10 max-w-lg leading-relaxed">
                                {activeItem.description}
                            </p>
                            <div>
                                <button className="px-10 py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-md transition-colors shadow-lg shadow-primary/30 text-lg cursor-pointer">
                                    {discoverDict.discover_button_check}
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
