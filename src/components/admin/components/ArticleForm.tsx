import React from "react";
import { Plus, Newspaper, RefreshCw, X, Calendar } from "lucide-react";
import MarkdownEditor from "./MarkdownEditor";
import { Dictionary } from "@/dictionaries";

interface ArticleFormProps {
    dict: Dictionary;
    editingArticleId: string | null;
    articleLink: string;
    setArticleLink: (val: string) => void;
    articleImage: string;
    setArticleImage: (val: string) => void;
    articleThumbnail: string;
    setArticleThumbnail: (val: string) => void;
    articleCategory: "news" | "blog";
    setArticleCategory: (val: "news" | "blog") => void;
    articleListDate: string;
    setArticleListDate: (val: string) => void;
    articleTitleEs: string;
    setArticleTitleEs: (val: string) => void;
    articleTitleCa: string;
    setArticleTitleCa: (val: string) => void;
    articleTitleEn: string;
    setArticleTitleEn: (val: string) => void;
    articleContentEs: string;
    setArticleContentEs: (val: string) => void;
    articleContentCa: string;
    setArticleContentCa: (val: string) => void;
    articleContentEn: string;
    setArticleContentEn: (val: string) => void;
    activeArticleFormLocale: "es" | "ca" | "en";
    setActiveArticleFormLocale: (locale: "es" | "ca" | "en") => void;
    articleFormError: string;
    isUploadingImage: boolean;
    isUploadingThumbnail: boolean;
    handleUpload: (e: React.ChangeEvent<HTMLInputElement>, target: "image" | "thumbnail") => Promise<void>;
    showCalendar: boolean;
    setShowCalendar: (val: boolean) => void;
    calYear: number;
    setCalYear: React.Dispatch<React.SetStateAction<number>>;
    calMonth: number;
    setCalMonth: React.Dispatch<React.SetStateAction<number>>;
    handleCancelEditArticle: () => void;
    handleCreateOrUpdateArticle: (e: React.FormEvent) => void;
    getFirstDayOfMonth: (year: number, month: number) => number;
    getDaysInMonth: (year: number, month: number) => number;
}

export default function ArticleForm({
    dict,
    editingArticleId,
    articleLink,
    setArticleLink,
    articleImage,
    setArticleImage,
    articleThumbnail,
    setArticleThumbnail,
    articleCategory,
    setArticleCategory,
    articleListDate,
    setArticleListDate,
    articleTitleEs,
    setArticleTitleEs,
    articleTitleCa,
    setArticleTitleCa,
    articleTitleEn,
    setArticleTitleEn,
    articleContentEs,
    setArticleContentEs,
    articleContentCa,
    setArticleContentCa,
    articleContentEn,
    setArticleContentEn,
    activeArticleFormLocale,
    setActiveArticleFormLocale,
    articleFormError,
    isUploadingImage,
    isUploadingThumbnail,
    handleUpload,
    showCalendar,
    setShowCalendar,
    calYear,
    setCalYear,
    calMonth,
    setCalMonth,
    handleCancelEditArticle,
    handleCreateOrUpdateArticle,
    getFirstDayOfMonth,
    getDaysInMonth,
}: ArticleFormProps) {
    const activeContentVal = activeArticleFormLocale === "es" 
        ? articleContentEs 
        : activeArticleFormLocale === "ca" 
            ? articleContentCa 
            : articleContentEn;

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-6">
            <h3 className="text-xl font-bold font-outfit text-secondary dark:text-white flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-primary" />
                {editingArticleId ? dict.admin.articles.edit_article : dict.admin.articles.add_article}
            </h3>
            <form onSubmit={handleCreateOrUpdateArticle} className="space-y-4">
                {/* Link */}
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 block">
                        {dict.admin.articles.article_link_label}
                    </label>
                    <input
                        type="url"
                        value={articleLink}
                        onChange={(e) => setArticleLink(e.target.value)}
                        placeholder="https://ejemplo.com/noticia"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground"
                    />
                </div>

                {/* Image and Thumbnail Upload */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 block">
                            {dict.admin.articles.large_image}
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleUpload(e, "image")}
                                className="hidden"
                                id="article-image-upload"
                            />
                            <label
                                htmlFor="article-image-upload"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-xs text-center block cursor-pointer text-slate-600 dark:text-slate-400 hover:border-primary transition-all"
                            >
                                {isUploadingImage ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : articleImage ? dict.admin.articles.change_image : dict.admin.articles.upload_image}
                            </label>
                        </div>
                        {articleImage && (
                            <div className="mt-2 relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 h-20 w-full animate-fadeIn">
                                <img src={articleImage} alt="Preview Grande" className="w-full h-full object-cover" />
                                <button 
                                    type="button" 
                                    onClick={() => setArticleImage("")} 
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 block">
                            {dict.admin.articles.thumbnail}
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleUpload(e, "thumbnail")}
                                className="hidden"
                                id="article-thumbnail-upload"
                            />
                            <label
                                htmlFor="article-thumbnail-upload"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-xs text-center block cursor-pointer text-slate-600 dark:text-slate-400 hover:border-primary transition-all"
                            >
                                {isUploadingThumbnail ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : articleThumbnail ? dict.admin.articles.change_image : dict.admin.articles.upload_image}
                            </label>
                        </div>
                        {articleThumbnail && (
                            <div className="mt-2 relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 h-20 w-full animate-fadeIn">
                                <img src={articleThumbnail} alt="Preview Min" className="w-full h-full object-cover" />
                                <button 
                                    type="button" 
                                    onClick={() => setArticleThumbnail("")} 
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Category Select */}
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 block">
                        {dict.admin.articles.category}
                    </label>
                    <select
                        value={articleCategory}
                        onChange={(e) => setArticleCategory(e.target.value as "news" | "blog")}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground cursor-pointer"
                    >
                        <option value="news">{dict.admin.articles.news}</option>
                        <option value="blog">{dict.admin.articles.blog}</option>
                    </select>
                </div>

                {/* Ordering Date with Popover Calendar */}
                <div className="space-y-1 relative">
                    <label className="text-xs font-semibold text-slate-500 block">
                        {dict.admin.articles.list_date}
                    </label>
                    <div className="relative">
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setShowCalendar(!showCalendar)}
                                className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm text-left flex items-center justify-between text-foreground hover:border-primary transition-all cursor-pointer h-[46px]"
                            >
                                <span>{articleListDate}</span>
                                <Calendar className="w-4 h-4 text-slate-400" />
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const today = new Date();
                                    const year = today.getFullYear();
                                    const month = String(today.getMonth() + 1).padStart(2, '0');
                                    const day = String(today.getDate()).padStart(2, '0');
                                    setArticleListDate(`${year}-${month}-${day}`);
                                    setCalYear(year);
                                    setCalMonth(today.getMonth());
                                    setShowCalendar(false);
                                }}
                                className="px-4 bg-primary/10 hover:bg-primary/20 text-primary font-bold font-outfit text-xs rounded-xl transition-all cursor-pointer h-[46px]"
                            >
                                {dict.admin.articles.today}
                            </button>
                        </div>

                        {showCalendar && (
                            <div className="absolute right-0 left-0 z-20 mt-1 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900 shadow-xl font-switzer animate-fadeIn">
                                <div className="flex justify-between items-center mb-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (calMonth === 0) {
                                                setCalMonth(11);
                                                setCalYear(prev => prev - 1);
                                            } else {
                                                setCalMonth(prev => prev - 1);
                                            }
                                        }}
                                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
                                    >
                                        ←
                                    </button>
                                    <span className="font-bold text-xs text-secondary dark:text-white capitalize">
                                        {dict.admin.orders.months[calMonth]} {calYear}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (calMonth === 11) {
                                                setCalMonth(0);
                                                setCalYear(prev => prev + 1);
                                            } else {
                                                setCalMonth(prev => prev + 1);
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
                                    {Array.from({ length: getFirstDayOfMonth(calYear, calMonth) }).map((_, i) => (
                                        <div key={`empty-${i}`} />
                                    ))}

                                    {Array.from({ length: getDaysInMonth(calYear, calMonth) }).map((_, i) => {
                                        const day = i + 1;
                                        const dayStr = String(day).padStart(2, "0");
                                        const monthStr = String(calMonth + 1).padStart(2, "0");
                                        const dateStr = `${calYear}-${monthStr}-${dayStr}`;
                                        const isSelected = articleListDate === dateStr;

                                        return (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => {
                                                    setArticleListDate(dateStr);
                                                    setShowCalendar(false);
                                                }}
                                                className={`h-8 w-8 mx-auto flex items-center justify-center rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
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
                            </div>
                        )}
                    </div>
                </div>

                {/* Translations tabs */}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-semibold text-slate-500">
                            {dict.admin.products.information_in}
                        </label>
                        <div className="flex bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
                            {(["es", "ca", "en"] as const).map((lang) => {
                                const label = lang === "es" ? "ES" : lang === "ca" ? "CA" : "EN";
                                const isFilled = lang === "es"
                                    ? !!articleTitleEs.trim()
                                    : lang === "ca"
                                        ? !!articleTitleCa.trim()
                                        : !!articleTitleEn.trim();
                                return (
                                    <button
                                        key={lang}
                                        type="button"
                                        onClick={() => setActiveArticleFormLocale(lang)}
                                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold font-outfit transition-all flex items-center gap-1 cursor-pointer ${
                                            activeArticleFormLocale === lang
                                                ? "bg-white dark:bg-slate-800 text-primary shadow-sm"
                                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                        }`}
                                    >
                                        {label}
                                        <span className={`w-1.5 h-1.5 rounded-full ${isFilled ? "bg-green-500" : "bg-amber-400"}`} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Title inputs */}
                    <div className="space-y-3">
                        {activeArticleFormLocale === "es" && (
                            <input
                                type="text"
                                value={articleTitleEs}
                                onChange={(e) => setArticleTitleEs(e.target.value)}
                                placeholder={`${dict.admin.articles.title_placeholder} (ES)`}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground"
                            />
                        )}
                        {activeArticleFormLocale === "ca" && (
                            <input
                                type="text"
                                value={articleTitleCa}
                                onChange={(e) => setArticleTitleCa(e.target.value)}
                                placeholder={`${dict.admin.articles.title_placeholder} (CA)`}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground"
                            />
                        )}
                        {activeArticleFormLocale === "en" && (
                            <input
                                type="text"
                                value={articleTitleEn}
                                onChange={(e) => setArticleTitleEn(e.target.value)}
                                placeholder={`${dict.admin.articles.title_placeholder} (EN)`}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground"
                            />
                        )}
                    </div>

                    {/* Content Markdown Editor */}
                    <MarkdownEditor
                        dict={dict}
                        value={activeContentVal}
                        onChange={(val) => {
                            if (activeArticleFormLocale === "es") setArticleContentEs(val);
                            else if (activeArticleFormLocale === "ca") setArticleContentCa(val);
                            else if (activeArticleFormLocale === "en") setArticleContentEn(val);
                        }}
                        placeholder={
                            activeArticleFormLocale === "es"
                                ? "Escribe el artículo aquí..."
                                : activeArticleFormLocale === "ca"
                                    ? "Escriu l'article aquí..."
                                    : "Write the article here..."
                        }
                    />
                </div>

                {articleFormError && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 font-switzer text-xs">
                        {articleFormError}
                    </div>
                )}

                <div className="flex gap-3">
                    {editingArticleId && (
                        <button
                            type="button"
                            onClick={handleCancelEditArticle}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold font-outfit py-4 rounded-xl transition-all text-center cursor-pointer"
                        >
                            {dict.admin.articles.cancel}
                        </button>
                    )}
                    <button
                        type="submit"
                        className="flex-1 bg-primary hover:bg-primary-light text-white font-bold font-outfit py-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/10"
                    >
                        {editingArticleId ? "Guardar" : <Plus size={18} />}
                        {editingArticleId ? dict.admin.articles.update : dict.admin.articles.create_article}
                    </button>
                </div>
            </form>
        </div>
    );
}
