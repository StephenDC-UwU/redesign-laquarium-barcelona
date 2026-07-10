"use client";

import { useState, useEffect, useRef } from "react";
import SafeImage from "@/components/ui/SafeImage";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X, Calendar, BookOpen, Clock } from "lucide-react";
import { Dictionary } from "@/dictionaries";
import { getFilteredArticlesAction } from "@/actions/articleActions";

interface ArticlesClientPageProps {
    dict: Dictionary;
    locale: string;
    category: "news" | "blog";
    initialArticles: any[];
    initialTotalCount: number;
    availableTopics?: string[];
    availableYears?: string[];
}

export default function ArticlesClientPage({
    dict,
    locale,
    category,
    initialArticles,
    initialTotalCount,
    availableTopics = [],
    availableYears = [],
}: ArticlesClientPageProps) {
    const isBlog = category === "blog";
    const router = useRouter();
    const handleNavigate = (path: string) => {
        window.dispatchEvent(new CustomEvent("page-navigation-started"));
        router.push(path);
    };
    
    // Page Title based on category and dictionary
    const title = isBlog ? (dict.nav.nav_blog || "Blog") : (dict.news.news_title || "Noticias");

    // Topic translations based on locale
    const topicTranslations: Record<string, Record<string, string>> = {
        es: {
            "Actualidad": "Actualidad",
            "Acuario": "Acuario",
            "Promociones": "Promociones"
        },
        en: {
            "Actualidad": "News & Events",
            "Acuario": "Aquarium",
            "Promociones": "Promotions"
        },
        ca: {
            "Actualidad": "Actualitat",
            "Acuario": "Aquari",
            "Promociones": "Promocions"
        }
    };

    // Filter lists built dynamically from DB
    const topicList = availableTopics.map(topic => ({
        label: topicTranslations[locale]?.[topic] || topic,
        value: topic
    }));

    const yearList = availableYears.map(year => ({
        label: year,
        value: year
    }));

    // Map month display text based on locale
    const monthList = locale === "es" ? [
        { label: "Enero", value: "01" },
        { label: "Febrero", value: "02" },
        { label: "Marzo", value: "03" },
        { label: "Junio", value: "06" }
    ] : locale === "ca" ? [
        { label: "Gener", value: "01" },
        { label: "Febrer", value: "02" },
        { label: "Març", value: "03" },
        { label: "Juny", value: "06" }
    ] : [
        { label: "January", value: "01" },
        { label: "February", value: "02" },
        { label: "March", value: "03" },
        { label: "June", value: "06" }
    ];

    // Filter states
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [selectedYears, setSelectedYears] = useState<string[]>([]);
    const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
    const [searchVal, setSearchVal] = useState("");
    const [activeSearch, setActiveSearch] = useState("");

    // Mobile filter visibility
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Articles state
    const [articles, setArticles] = useState<any[]>(initialArticles);
    const [totalCount, setTotalCount] = useState(initialTotalCount);
    const [loadingMore, setLoadingMore] = useState(false);
    const loadingMoreRef = useRef(false);
    const [loadingFilters, setLoadingFilters] = useState(false);

    // Trigger filter update on states changes
    useEffect(() => {
        const fetchFiltered = async () => {
            setLoadingFilters(true);
            try {
                // Fetch first batch (1 featured + 9 grid items = 10)
                const res = await getFilteredArticlesAction({
                    locale,
                    category,
                    topics: selectedTopics,
                    years: selectedYears,
                    months: selectedMonths,
                    searchQuery: activeSearch,
                    skip: 0,
                    take: 10,
                });
                setArticles(res.articles);
                setTotalCount(res.totalCount);
            } catch (e) {
                console.error("Error filtering articles:", e);
            } finally {
                setLoadingFilters(false);
            }
        };

        // Skip initial call because initialArticles is already loaded
        const isInitial = 
            selectedTopics.length === 0 && 
            selectedYears.length === 0 && 
            selectedMonths.length === 0 && 
            activeSearch === "";
            
        if (!isInitial) {
            fetchFiltered();
        } else {
            setArticles(initialArticles);
            setTotalCount(initialTotalCount);
        }
    }, [selectedTopics, selectedYears, selectedMonths, activeSearch, category, locale, initialArticles, initialTotalCount]);

    // Debounce live search value to query DB after 300ms of typing inactivity
    useEffect(() => {
        const timer = setTimeout(() => {
            setActiveSearch(searchVal);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchVal]);

    // Prevent form submission page reloads
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    };

    // Clear all filters
    const handleClearFilters = () => {
        setSelectedTopics([]);
        setSelectedYears([]);
        setSelectedMonths([]);
        setSearchVal("");
        setActiveSearch("");
    };

    // Toggle items in arrays
    const toggleTopic = (val: string) => {
        setSelectedTopics(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
    };
    const toggleYear = (val: string) => {
        setSelectedYears(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
    };
    const toggleMonth = (val: string) => {
        setSelectedMonths(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
    };

    // Load More items
    const handleLoadMore = async () => {
        if (loadingMoreRef.current || articles.length >= totalCount) return;
        loadingMoreRef.current = true;
        setLoadingMore(true);
        try {
            const nextBatch = await getFilteredArticlesAction({
                locale,
                category,
                topics: selectedTopics,
                years: selectedYears,
                months: selectedMonths,
                searchQuery: activeSearch,
                skip: articles.length,
                take: 9, // Load in 3x3 (9 items) blocks
            });
            
            setArticles(prev => {
                const existingIds = new Set(prev.map(art => art.id));
                const uniqueNewArticles = nextBatch.articles.filter(art => !existingIds.has(art.id));
                return [...prev, ...uniqueNewArticles];
            });
            setTotalCount(nextBatch.totalCount);
        } catch (e) {
            console.error("Error loading more articles:", e);
        } finally {
            setLoadingMore(false);
            loadingMoreRef.current = false;
        }
    };

    // Separate featured article from the grid list
    // The featured article is either marked `featured: true` or is the first one in the list.
    const featuredIndex = articles.findIndex(art => art.featured === true);
    const featuredArticle = featuredIndex !== -1 ? articles[featuredIndex] : articles[0];
    
    // Grid articles: everything except the featured article
    const gridArticles = featuredArticle 
        ? articles.filter(art => art.id !== featuredArticle.id)
        : [];

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 font-switzer">
            {/* Top Toolbar: Title, Filter Toggle, Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-slate-100 dark:border-slate-800 pb-6">
                <div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-outfit text-black dark:text-white flex items-center gap-3">
                        {title}
                        {loadingFilters && (
                            <span className="inline-block w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin"></span>
                        )}
                    </h1>
                </div>

                <div className="flex items-center gap-4 flex-wrap relative">
                    {/* Search Input Form */}
                    <form onSubmit={handleSearchSubmit} className="flex items-center w-full sm:w-auto relative">
                        <input
                            type="text"
                            placeholder="Buscar artículo..."
                            value={searchVal}
                            onChange={(e) => setSearchVal(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary text-black dark:text-white text-sm transition-all"
                        />
                        <Search className="absolute left-3 w-4 h-4 text-slate-400" />
                        <button
                            type="submit"
                            className="ml-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all cursor-pointer"
                        >
                            Buscar
                        </button>
                    </form>

                    {/* Filter Toggle Button */}
                    <button
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                            showMobileFilters || selectedTopics.length > 0 || selectedYears.length > 0 || selectedMonths.length > 0
                                ? "bg-secondary border-secondary text-white"
                                : "border-slate-200 dark:border-slate-800 text-black dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900"
                        }`}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        <span>Filtros</span>
                        {(selectedTopics.length + selectedYears.length + selectedMonths.length) > 0 && (
                            <span className="bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                {selectedTopics.length + selectedYears.length + selectedMonths.length}
                            </span>
                        )}
                    </button>

                    {/* Filter Dropdown Overlay */}
                    {showMobileFilters && (
                        <div className="absolute right-0 top-full mt-3 w-80 md:w-96 bg-white dark:bg-slate-900 shadow-2xl rounded-3xl p-6 border border-slate-100 dark:border-slate-850 space-y-6 z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                            {/* Topics Block */}
                            {topicList.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider mb-3 border-b border-slate-200 dark:border-slate-800 pb-1">
                                        Topics
                                    </h3>
                                    <div className="flex flex-col gap-2">
                                        {topicList.map(topic => {
                                            const isChecked = selectedTopics.includes(topic.value);
                                            return (
                                                <label key={topic.value} className="flex items-center gap-3 cursor-pointer group text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleTopic(topic.value)}
                                                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer accent-primary"
                                                    />
                                                    <span className={isChecked ? "text-primary font-semibold" : ""}>{topic.label}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Years Block */}
                            {yearList.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider mb-3 border-b border-slate-200 dark:border-slate-800 pb-1">
                                        Year
                                    </h3>
                                    <div className="flex flex-col gap-2">
                                        {yearList.map(year => {
                                            const isChecked = selectedYears.includes(year.value);
                                            return (
                                                <label key={year.value} className="flex items-center gap-3 cursor-pointer group text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleYear(year.value)}
                                                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer accent-primary"
                                                    />
                                                    <span className={isChecked ? "text-primary font-semibold" : ""}>{year.label}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Months Block */}
                            <div>
                                <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider mb-3 border-b border-slate-200 dark:border-slate-800 pb-1">
                                    Months
                                </h3>
                                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto scrollbar-none">
                                    {monthList.map(month => {
                                        const isChecked = selectedMonths.includes(month.value);
                                        return (
                                            <label key={month.value} className="flex items-center gap-3 cursor-pointer group text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleMonth(month.value)}
                                                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer accent-primary"
                                                />
                                                <span className={isChecked ? "text-primary font-semibold" : ""}>{month.label}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Active Filters Display & Clear */}
            {(selectedTopics.length > 0 || selectedYears.length > 0 || selectedMonths.length > 0 || activeSearch) && (
                <div className="flex flex-wrap items-center gap-2 mb-8 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Filtros Activos:</span>
                    {activeSearch && (
                        <span className="flex items-center gap-1 bg-primary/10 text-primary dark:text-primary-light text-xs font-bold px-3 py-1 rounded-full border border-primary/20">
                            Search: &quot;{activeSearch}&quot;
                            <button onClick={() => { setSearchVal(""); setActiveSearch(""); }} className="hover:text-red-500 cursor-pointer">
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}
                    {selectedTopics.map(val => (
                        <span key={val} className="flex items-center gap-1 bg-secondary/10 text-secondary dark:text-teal-400 text-xs font-bold px-3 py-1 rounded-full border border-secondary/20">
                            {val}
                            <button onClick={() => toggleTopic(val)} className="hover:text-red-500 cursor-pointer">
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                    {selectedYears.map(val => (
                        <span key={val} className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/20">
                            {val}
                            <button onClick={() => toggleYear(val)} className="hover:text-red-500 cursor-pointer">
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                    {selectedMonths.map(val => {
                        const monthLabel = monthList.find(m => m.value === val)?.label || val;
                        return (
                            <span key={val} className="flex items-center gap-1 bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 text-xs font-bold px-3 py-1 rounded-full border border-indigo-500/20">
                                {monthLabel}
                                <button onClick={() => toggleMonth(val)} className="hover:text-red-500 cursor-pointer">
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        );
                    })}
                    <button
                        onClick={handleClearFilters}
                        className="text-xs font-bold text-red-500 hover:text-red-650 underline ml-auto cursor-pointer"
                    >
                        Limpiar todos
                    </button>
                </div>
            )}

            {/* Layout content and Articles */}
            <div className="w-full space-y-16">
                    
                    {/* Zero State */}
                    {articles.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50 dark:bg-slate-900/30 rounded-3xl border border-slate-105 border-dashed">
                            <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4 animate-bounce" />
                            <h3 className="text-xl font-bold text-slate-750 dark:text-slate-200 mb-1">No se encontraron artículos</h3>
                            <p className="text-slate-500 text-sm max-w-sm">Intenta ajustar tu búsqueda o los filtros acumulados para ver más publicaciones.</p>
                        </div>
                    )}

                    {/* 1. Featured Article (El artículo más grande / destacado) */}
                    {featuredArticle && (
                        <div 
                            className="relative w-full h-[400px] md:h-[550px] rounded-[32px] overflow-hidden group shadow-2xl transition-all duration-500 cursor-pointer border border-white/10"
                            onClick={() => handleNavigate(`/${locale}/articles/${category}/${featuredArticle.slug}`)}
                        >
                            <SafeImage
                                src={featuredArticle.image}
                                alt={featuredArticle.title}
                                fill
                                priority
                                className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.02]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                            
                            <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 text-white z-10">
                                <span className="text-sm md:text-base font-light mb-2 opacity-90 font-switzer">
                                    {featuredArticle.date}
                                </span>
                                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold font-outfit leading-tight mb-8 max-w-4xl group-hover:text-primary transition-colors duration-300">
                                    {featuredArticle.title}
                                </h2>
                                <button className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-primary/30 w-fit cursor-pointer">
                                    Ver mas
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 2. Sub-Grid (2 pequeños a la izquierda, 1 grande a la derecha) */}
                    {articles.length >= 4 && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                            {/* Left Side: 2 stacked smaller cards */}
                            <div className="lg:col-span-5 flex flex-col gap-8">
                                {[articles[1], articles[2]].map((art) => (
                                    <div 
                                        key={art.id}
                                        className="relative aspect-[16/10] rounded-[24px] overflow-hidden group shadow-xl cursor-pointer border border-white/10 flex flex-col justify-end p-6 text-white"
                                        onClick={() => handleNavigate(`/${locale}/articles/${category}/${art.slug}`)}
                                    >
                                        <SafeImage
                                            src={art.image}
                                            alt={art.title}
                                            fill
                                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-103"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                        <div className="relative z-10">
                                            <span className="text-xs opacity-90 font-switzer block mb-1">
                                                {art.date}
                                            </span>
                                            <h3 className="text-lg md:text-xl font-bold font-outfit leading-tight mb-4 group-hover:text-primary transition-colors duration-300 line-clamp-2">
                                                {art.title}
                                            </h3>
                                            <button className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-lg transition-all duration-300 shadow-md">
                                                Ver mas
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Right Side: 1 tall larger card */}
                            <div 
                                className="lg:col-span-7 relative min-h-[400px] rounded-[24px] overflow-hidden group shadow-xl cursor-pointer border border-white/10 flex flex-col justify-end p-8 text-white"
                                onClick={() => handleNavigate(`/${locale}/articles/${category}/${articles[3].slug}`)}
                            >
                                <SafeImage
                                    src={articles[3].image}
                                    alt={articles[3].title}
                                    fill
                                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-103"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                                <div className="relative z-10">
                                    <span className="text-sm opacity-90 font-switzer block mb-1">
                                        {articles[3].date}
                                    </span>
                                    <h3 className="text-2xl md:text-3xl font-bold font-outfit leading-tight mb-6 group-hover:text-primary transition-colors duration-300">
                                        {articles[3].title}
                                    </h3>
                                    <button className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-lg transition-all duration-300 shadow-md">
                                        Ver mas
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. Banner Article (Uno tipo banner full-width) */}
                    {articles.length >= 5 && (
                        <div 
                            className="relative w-full aspect-[21/9] min-h-[220px] rounded-[24px] overflow-hidden group shadow-2xl transition-all duration-500 cursor-pointer border border-white/10 flex flex-col justify-center items-center text-center p-6 text-white"
                            onClick={() => handleNavigate(`/${locale}/articles/${category}/${articles[4].slug}`)}
                        >
                            <SafeImage
                                src={articles[4].image}
                                alt={articles[4].title}
                                fill
                                className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.02]"
                            />
                            <div className="absolute inset-0 bg-black/55 group-hover:bg-black/65 transition-colors duration-350" />
                            
                            <div className="relative z-10 flex flex-col items-center gap-4 max-w-3xl">
                                <span className="text-xs md:text-sm tracking-wider uppercase opacity-85 font-switzer">
                                    {articles[4].date}
                                </span>
                                <h2 className="text-xl md:text-3xl lg:text-4xl font-bold font-outfit leading-tight group-hover:text-primary transition-colors duration-300">
                                    {articles[4].title}
                                </h2>
                                <button className="px-6 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-lg transition-all duration-300 shadow-lg shadow-primary/20">
                                    Ver mas
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 4. Subsequent 3x3 Grid (Paginación de 9 en 9) */}
                    {articles.length >= 6 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {articles.slice(5).map((art) => (
                                <div
                                    key={art.id}
                                    className="relative aspect-square rounded-[24px] overflow-hidden border border-slate-105 dark:border-slate-850/50 hover:shadow-2xl transition-all duration-500 flex flex-col justify-end p-6 text-white group cursor-pointer"
                                    onClick={() => handleNavigate(`/${locale}/articles/${category}/${art.slug}`)}
                                >
                                    <SafeImage
                                        src={art.thumbnail || art.image}
                                        alt={art.title}
                                        fill
                                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                    
                                    <div className="relative z-10">
                                        <span className="text-xs opacity-90 font-switzer block mb-1">
                                            {art.date}
                                        </span>
                                        <h3 className="text-lg font-bold font-outfit leading-tight mb-4 group-hover:text-primary transition-colors duration-300 line-clamp-2">
                                            {art.title}
                                        </h3>
                                        <button className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-lg transition-all duration-300 shadow-md">
                                            Ver mas
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Skeleton loader for loading state (Instead of spinner) */}
                    {loadingMore && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                                <div key={i} className="relative aspect-square rounded-[24px] bg-slate-200 dark:bg-slate-800 animate-pulse overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" style={{ animationDuration: '1.5s' }} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Infinite Scroll detector element */}
                    {articles.length < totalCount && (
                        <div 
                            ref={(el) => {
                                if (el) {
                                    // Trigger loader when this detector gets in viewport
                                    const observer = new IntersectionObserver((entries) => {
                                        if (entries[0].isIntersecting && !loadingMore) {
                                            handleLoadMore();
                                        }
                                    }, { rootMargin: "200px" });
                                    observer.observe(el);
                                }
                            }}
                            className="h-10 flex items-center justify-center text-sm font-medium text-slate-400"
                        >
                            Cargando más artículos...
                        </div>
                    )}
                </div>
            </div>
    );
}
