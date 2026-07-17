import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { Dictionary } from "@/dictionaries";

interface ArticleListProps {
    dict: Dictionary;
    paginatedArticles: any[];
    currentPage: number;
    totalPages: number;
    setCurrentPage: (page: number) => void;
    handleEditArticle: (art: any) => void;
    handleDeleteArticle: (id: string) => void;
}

export default function ArticleList({
    dict,
    paginatedArticles,
    currentPage,
    totalPages,
    setCurrentPage,
    handleEditArticle,
    handleDeleteArticle,
}: ArticleListProps) {
    if (paginatedArticles.length === 0) {
        return (
            <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
                <p className="font-switzer text-slate-500">{dict.admin.articles.no_articles}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {paginatedArticles.map((art) => (
                <div
                    key={art.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                >
                    <div className="flex items-start gap-4 flex-1">
                        {art.thumbnail && (
                            <img
                                src={art.thumbnail}
                                alt={art.title}
                                className="w-16 h-16 rounded-xl object-cover border border-slate-100 dark:border-slate-800 flex-shrink-0"
                            />
                        )}
                        <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full font-outfit">
                                    {art.date}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-outfit">
                                    {art.category === "blog" ? dict.admin.articles.blog : dict.admin.articles.news}
                                </span>
                                <span className="text-slate-400 text-xs font-mono">
                                    {art.listDate}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold font-outfit text-secondary dark:text-white truncate">
                                {art.title || dict.admin.articles.no_title_external}
                            </h3>
                            {art.link && (
                                <p className="text-slate-500 dark:text-slate-400 font-mono text-xs truncate">
                                    {dict.admin.articles.link_prefix} {art.link}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-4 sm:pt-0">
                        <button
                            onClick={() => handleEditArticle(art)}
                            className="p-2 text-slate-400 hover:text-primary rounded-full hover:bg-primary/10 transition-all cursor-pointer"
                            aria-label={dict.admin.articles.aria_edit}
                        >
                            <Edit className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => handleDeleteArticle(art.id)}
                            className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                            aria-label={dict.admin.articles.aria_delete}
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
                    <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold font-outfit text-xs rounded-xl transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        « {dict.admin.articles.page_start}
                    </button>
                    <button
                        onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold font-outfit text-xs rounded-xl transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        ‹ {dict.admin.articles.page_prev}
                    </button>
                    <span className="text-xs font-semibold text-slate-500 font-switzer px-2">
                        {dict.admin.articles.page_label} {currentPage} {dict.admin.articles.page_of} {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold font-outfit text-xs rounded-xl transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {dict.admin.articles.page_next} ›
                    </button>
                    <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold font-outfit text-xs rounded-xl transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {dict.admin.articles.page_last} »
                    </button>
                </div>
            )}
        </div>
    );
}
