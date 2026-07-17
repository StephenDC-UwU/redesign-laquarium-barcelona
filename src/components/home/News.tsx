"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useState, useEffect } from "react";
import SafeImage from "@/components/ui/SafeImage";
import { Dictionary } from "@/dictionaries";

import { getArticlesAction } from "@/actions/articleActions";

gsap.registerPlugin(ScrollTrigger);

interface NewsProps {
    dict: Dictionary;
    locale: string;
}

export default function News({ dict, locale }: NewsProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const featuredRef = useRef<HTMLDivElement>(null);
    const [newsList, setNewsList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    // Drag scrolling states for vertical list
    const listRef = useRef<HTMLDivElement>(null);
    const isDraggingList = useRef(false);
    const startY = useRef(0);
    const scrollTopStart = useRef(0);
    const isDragMove = useRef(false); // To prevent click on drag


    const newsDict = dict.news;

    // Fetch news from the database
    useEffect(() => {
        const fetchNews = async () => {
            try {
                const data = await getArticlesAction(locale);
                setNewsList(data);
            } catch (err) {
                console.error("Error loading articles:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, [locale]);

    // Auto-play interval for featured news
    useEffect(() => {
        if (newsList.length <= 1) return;
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % newsList.length);
        }, 5000); // Change every 5 seconds
        return () => clearInterval(timer);
    }, [newsList.length]);

    // Drag handlers for vertical list
    const handleListMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        const list = listRef.current;
        if (!list) return;
        isDraggingList.current = true;
        isDragMove.current = false;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        startY.current = clientY;
        scrollTopStart.current = list.scrollTop;
        list.style.scrollBehavior = "auto";
        list.style.cursor = "grabbing";
    };

    const handleListMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDraggingList.current) return;
        const list = listRef.current;
        if (!list) return;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const walk = (clientY - startY.current) * 1.5;

        if (Math.abs(walk) > 5) {
            isDragMove.current = true; // User actually moved, not just clicked
        }

        list.scrollTop = scrollTopStart.current - walk;
    };

    const handleListMouseUp = () => {
        isDraggingList.current = false;
        const list = listRef.current;
        if (list) {
            list.style.scrollBehavior = "smooth";
            list.style.cursor = "grab";
        }
        // Reset isDragMove after a short delay so click event has time to check it
        setTimeout(() => {
            isDragMove.current = false;
        }, 50);
    };

    // GSAP Animation for featured news change
    useGSAP(() => {
        if (featuredRef.current && newsList.length > 0) {
            gsap.fromTo(featuredRef.current,
                { opacity: 0.5, scale: 0.98 },
                { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" }
            );
        }
    }, { dependencies: [activeIndex, newsList.length], scope: containerRef });

    // Initial scroll reveal
    useGSAP(() => {
        if (newsList.length > 0) {
            gsap.fromTo(".news-header",
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.8, scrollTrigger: { trigger: containerRef.current, start: "top 80%" } }
            );

            gsap.fromTo(".news-list-item",
                { opacity: 0, x: 50 },
                { opacity: 1, x: 0, duration: 0.6, stagger: 0.15, ease: "power2.out", scrollTrigger: { trigger: containerRef.current, start: "top 70%" } }
            );
        }
    }, { dependencies: [newsList.length], scope: containerRef });

    if (loading || newsList.length === 0) {
        return (
            <section ref={containerRef} className="w-full py-24 bg-background">
                <div className="max-w-7xl mx-auto px-4 md:px-8 animate-pulse">
                    <div className="flex justify-center mb-16">
                        <div className="h-14 w-48 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                        <div className="w-full aspect-square md:aspect-[4/3] bg-slate-200 dark:bg-slate-800 rounded-[40px]" />
                        <div className="flex flex-col gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-6 py-6 border-b border-slate-200 dark:border-slate-800">
                                    <div className="w-28 h-24 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
                                    <div className="flex-1 flex flex-col gap-2">
                                        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                                        <div className="h-6 w-full bg-slate-200 dark:bg-slate-800 rounded" />
                                        <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    const featured = newsList[activeIndex] || newsList[0];

    return (
        <section ref={containerRef} className="w-full py-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 md:px-8">

                {/* Header */}
                <div className="news-header flex justify-center mb-16 relative">
                    <div className="relative">
                        <div className="absolute -right-4 -top-6 w-16 h-16 bg-primary/40 rounded-full -z-10" />
                        <h2 className="text-5xl md:text-6xl font-bold font-outfit text-black dark:text-white">
                            {newsDict.news_title}
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

                    {/* Featured News (Left) */}
                    <div
                        ref={featuredRef}
                        className="relative w-full aspect-square md:aspect-[4/3] rounded-[40px] overflow-hidden shadow-2xl group cursor-pointer"
                        onClick={() => window.location.href = featured.link}
                    >
                        <SafeImage
                            src={featured.image}
                            alt={featured.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/40 to-transparent" />

                        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 flex flex-col items-start text-white">
                            <span className="text-sm md:text-base font-light mb-2 opacity-90 font-switzer">
                                {featured.date}
                            </span>
                            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold font-outfit leading-tight mb-8">
                                {featured.title}
                            </h3>
                            <button className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-bold  transition-colors shadow-lg shadow-primary/30">
                                Consultar
                            </button>
                        </div>
                    </div>

                    {/* News List (Right) */}
                    <div className="flex flex-col h-full lg:max-h-[550px]">
                        <div className="w-full h-[2px] bg-slate-200 dark:bg-slate-800 mb-6 flex-shrink-0" />

                        <div
                            ref={listRef}
                            className="flex flex-col overflow-y-auto scrollbar-none pb-4 cursor-grab active:cursor-grabbing select-none"
                            onMouseDown={handleListMouseDown}
                            onMouseMove={handleListMouseMove}
                            onMouseUp={handleListMouseUp}
                            onMouseLeave={handleListMouseUp}
                            onTouchStart={handleListMouseDown}
                            onTouchMove={handleListMouseMove}
                            onTouchEnd={handleListMouseUp}
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {newsList.map((news, index) => (
                                <div 
                                    key={news.id} 
                                    className={`news-list-item flex flex-col ${
                                        index >= 5 ? "hidden md:flex" : ""
                                    }`}
                                >
                                    <a
                                        href={news.link}
                                        onClick={(e) => {
                                            if (isDragMove.current) {
                                                e.preventDefault();
                                            }
                                        }}
                                        className="flex items-center gap-6 py-6 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors rounded-xl px-2 -mx-2"
                                        onMouseEnter={() => setActiveIndex(index)}
                                    >
                                        {/* Thumbnail */}
                                        <div className="relative w-24 h-24 md:w-28 md:h-24 flex-shrink-0 rounded-3xl overflow-hidden border-2 border-transparent group-hover:border-primary transition-colors pointer-events-none">
                                            <SafeImage
                                                src={news.thumbnail}
                                                alt={news.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="flex flex-col justify-center pointer-events-none">
                                            <span className="text-xs md:text-sm text-slate-400 font-switzer mb-1">
                                                {news.listDate}
                                            </span>
                                            <h4 className="text-lg md:text-xl font-bold text-secondary dark:text-white font-outfit mb-2 group-hover:text-primary transition-colors leading-tight">
                                                {news.title}
                                            </h4>
                                            <span className="text-sm text-slate-500 font-switzer group-hover:underline">
                                                Saber Mas
                                            </span>
                                        </div>
                                    </a>
                                    <div className="w-full h-[1px] bg-slate-200 dark:bg-slate-800" />
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
