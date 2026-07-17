import React from "react";
import { Calendar } from "lucide-react";
import { Dictionary } from "@/dictionaries";

interface ArticleFiltersProps {
    dict: Dictionary;
    articleFilterLocale: "es" | "ca" | "en";
    setArticleFilterLocale: (locale: "es" | "ca" | "en") => void;
    articleFilterCategory: "all" | "news" | "blog";
    setArticleFilterCategory: (cat: "all" | "news" | "blog") => void;
    articleFilterDate: string;
    setArticleFilterDate: (date: string) => void;
    showFilterCalendar: boolean;
    setShowFilterCalendar: (show: boolean) => void;
    filterCalYear: number;
    setFilterCalYear: React.Dispatch<React.SetStateAction<number>>;
    filterCalMonth: number;
    setFilterCalMonth: React.Dispatch<React.SetStateAction<number>>;
    setCurrentPage: (page: number) => void;
    getFirstDayOfMonth: (year: number, month: number) => number;
    getDaysInMonth: (year: number, month: number) => number;
}

export default function ArticleFilters({
    dict,
    articleFilterLocale,
    setArticleFilterLocale,
    articleFilterCategory,
    setArticleFilterCategory,
    articleFilterDate,
    setArticleFilterDate,
    showFilterCalendar,
    setShowFilterCalendar,
    filterCalYear,
    setFilterCalYear,
    filterCalMonth,
    setFilterCalMonth,
    setCurrentPage,
    getFirstDayOfMonth,
    getDaysInMonth,
}: ArticleFiltersProps) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h4 className="text-sm font-bold font-outfit text-slate-500 uppercase tracking-wider">
                    {dict.admin.articles.search_filters}
                </h4>
                {(articleFilterCategory !== "all" || articleFilterDate) && (
                    <button
                        onClick={() => {
                            setArticleFilterCategory("all");
                            setArticleFilterDate("");
                            setCurrentPage(1);
                        }}
                        className="text-xs text-primary font-bold hover:underline cursor-pointer flex items-center gap-1 self-start sm:self-auto"
                    >
                        {dict.admin.articles.clear_filters}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Language Filter */}
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 block">
                        {dict.admin.articles.display_language}
                    </label>
                    <div className="flex bg-slate-100 dark:bg-slate-950 p-0.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                        {(["es", "ca", "en"] as const).map((lang) => {
                            const label = lang === "es" ? "ES" : lang === "ca" ? "CA" : "EN";
                            return (
                                <button
                                    key={lang}
                                    type="button"
                                    onClick={() => {
                                        setArticleFilterLocale(lang);
                                        setCurrentPage(1);
                                    }}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold font-outfit transition-all cursor-pointer text-center ${
                                        articleFilterLocale === lang
                                            ? "bg-white dark:bg-slate-800 text-primary shadow-sm"
                                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                    }`}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Category Filter */}
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 block">
                        {dict.admin.articles.category}
                    </label>
                    <select
                        value={articleFilterCategory}
                        onChange={(e) => {
                            setArticleFilterCategory(e.target.value as any);
                            setCurrentPage(1);
                        }}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-xs text-foreground focus:outline-none focus:border-primary h-[38px] cursor-pointer"
                    >
                        <option value="all">{dict.admin.articles.all_categories}</option>
                        <option value="news">{dict.admin.articles.news}</option>
                        <option value="blog">{dict.admin.articles.blog}</option>
                    </select>
                </div>

                {/* Date Filter */}
                <div className="space-y-1 relative">
                    <label className="text-xs font-semibold text-slate-500 block">
                        {dict.admin.articles.publish_date}
                    </label>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowFilterCalendar(!showFilterCalendar)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-xs text-left flex items-center justify-between text-foreground hover:border-primary transition-all cursor-pointer h-[38px]"
                        >
                            <span className="truncate">{articleFilterDate || dict.admin.articles.any_date}</span>
                            <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        </button>

                        {showFilterCalendar && (
                            <div className="absolute right-0 left-0 sm:left-auto sm:w-60 z-20 mt-1 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900 shadow-xl font-switzer animate-fadeIn">
                                <div className="flex justify-between items-center mb-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (filterCalMonth === 0) {
                                                setFilterCalMonth(11);
                                                setFilterCalYear(prev => prev - 1);
                                            } else {
                                                setFilterCalMonth(prev => prev - 1);
                                            }
                                        }}
                                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
                                    >
                                        ←
                                    </button>
                                    <span className="font-bold text-xs text-secondary dark:text-white capitalize">
                                        {dict.admin.orders.months[filterCalMonth]} {filterCalYear}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (filterCalMonth === 11) {
                                                setFilterCalMonth(0);
                                                setFilterCalYear(prev => prev + 1);
                                            } else {
                                                setFilterCalMonth(prev => prev + 1);
                                            }
                                        }}
                                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
                                    >
                                        →
                                    </button>
                                </div>

                                <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-bold text-slate-400 mb-2">
                                    {dict.admin.orders.days.map((d) => (
                                        <div key={d}>{d}</div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-0.5">
                                    {Array.from({ length: getFirstDayOfMonth(filterCalYear, filterCalMonth) }).map((_, i) => (
                                        <div key={`empty-${i}`} />
                                    ))}

                                    {Array.from({ length: getDaysInMonth(filterCalYear, filterCalMonth) }).map((_, i) => {
                                        const day = i + 1;
                                        const dayStr = String(day).padStart(2, "0");
                                        const monthStr = String(filterCalMonth + 1).padStart(2, "0");
                                        const dateStr = `${filterCalYear}-${monthStr}-${dayStr}`;
                                        const isSelected = articleFilterDate === dateStr;

                                        return (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => {
                                                    setArticleFilterDate(dateStr);
                                                    setShowFilterCalendar(false);
                                                    setCurrentPage(1);
                                                }}
                                                className={`h-7 w-7 mx-auto flex items-center justify-center rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                                                    isSelected
                                                        ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                                                        : "text-secondary dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                }`}
                                            >
                                                {day}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const today = new Date();
                                            const year = today.getFullYear();
                                            const month = String(today.getMonth() + 1).padStart(2, '0');
                                            const day = String(today.getDate()).padStart(2, '0');
                                            setArticleFilterDate(`${year}-${month}-${day}`);
                                            setFilterCalYear(year);
                                            setFilterCalMonth(today.getMonth());
                                            setShowFilterCalendar(false);
                                            setCurrentPage(1);
                                        }}
                                        className="px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary font-bold font-switzer text-[10px] rounded-lg transition-all cursor-pointer"
                                    >
                                        {dict.admin.articles.today}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
