import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Calendar, Newspaper, RefreshCw } from "lucide-react";
import { 
    createArticleAction, 
    updateArticleAction, 
    deleteArticleAction, 
    getArticleTranslationsAction, 
    getArticlesAction 
} from "@/actions/articleActions";
import { uploadImageAction } from "@/actions/uploadActions";

interface ArticlesProps {
    articles: any[];
    setArticles: React.Dispatch<React.SetStateAction<any[]>>;
    articleFilterLocale: "es" | "ca" | "en";
    setArticleFilterLocale: (locale: "es" | "ca" | "en") => void;
    localeStr: string;
}

const monthNames = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];
const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
};

export default function Articles({
    articles,
    setArticles,
    articleFilterLocale,
    setArticleFilterLocale,
    localeStr
}: ArticlesProps) {
    // Form fields
    const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
    const [articleListDate, setArticleListDate] = useState(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });
    const [articleLink, setArticleLink] = useState("");
    const [articleImage, setArticleImage] = useState("");
    const [articleThumbnail, setArticleThumbnail] = useState("");
    const [articleCategory, setArticleCategory] = useState<"news" | "blog">("news");

    // Translations states
    const [articleTitleEs, setArticleTitleEs] = useState("");
    const [articleTitleCa, setArticleTitleCa] = useState("");
    const [articleTitleEn, setArticleTitleEn] = useState("");
    const [articleDateEs, setArticleDateEs] = useState("");
    const [articleDateCa, setArticleDateCa] = useState("");
    const [articleDateEn, setArticleDateEn] = useState("");
    const [articleContentEs, setArticleContentEs] = useState("");
    const [articleContentCa, setArticleContentCa] = useState("");
    const [articleContentEn, setArticleContentEn] = useState("");

    const [activeArticleFormLocale, setActiveArticleFormLocale] = useState<"es" | "ca" | "en">("es");
    const [articleFormError, setArticleFormError] = useState("");

    // Image upload states
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

    // Filter states
    const [articleFilterCategory, setArticleFilterCategory] = useState<"all" | "news" | "blog">("all");
    const [articleFilterDate, setArticleFilterDate] = useState("");
    const [showFilterCalendar, setShowFilterCalendar] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // Form calendar popover states
    const [showCalendar, setShowCalendar] = useState(false);
    const [calYear, setCalYear] = useState(() => new Date().getFullYear());
    const [calMonth, setCalMonth] = useState(() => new Date().getMonth());

    // Filter calendar popover states
    const [filterCalYear, setFilterCalYear] = useState(() => new Date().getFullYear());
    const [filterCalMonth, setFilterCalMonth] = useState(() => new Date().getMonth());

    // Reset filters if category/date change
    const filteredArticles = articles.filter((art) => {
        if (articleFilterCategory !== "all" && art.category !== articleFilterCategory) {
            return false;
        }
        if (articleFilterDate && art.listDate !== articleFilterDate) {
            return false;
        }
        return true;
    });

    const itemsPerPage = 5;
    const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
    const paginatedArticles = filteredArticles.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Sync form active locale with page locale
    useEffect(() => {
        if (localeStr === "es" || localeStr === "ca" || localeStr === "en") {
            setActiveArticleFormLocale(localeStr as "es" | "ca" | "en");
        }
    }, [localeStr]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "image" | "thumbnail") => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (target === "image") setIsUploadingImage(true);
        else setIsUploadingThumbnail(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await uploadImageAction(formData);
            if (res.success && res.url) {
                if (target === "image") {
                    setArticleImage(res.url);
                } else {
                    setArticleThumbnail(res.url);
                }
            } else {
                alert(res.error || "Error al subir la imagen");
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Error al conectar con el servidor de subidas.");
        } finally {
            if (target === "image") setIsUploadingImage(false);
            else setIsUploadingThumbnail(false);
        }
    };

    const handleCancelEditArticle = () => {
        setEditingArticleId(null);
        setArticleLink("");
        setArticleImage("");
        setArticleThumbnail("");
        setArticleCategory("news");

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        setArticleListDate(`${year}-${month}-${day}`);

        setArticleTitleEs("");
        setArticleTitleCa("");
        setArticleTitleEn("");
        setArticleDateEs("");
        setArticleDateCa("");
        setArticleDateEn("");
        setArticleContentEs("");
        setArticleContentCa("");
        setArticleContentEn("");
        setArticleFormError("");
    };

    const handleEditArticle = async (art: any) => {
        const trans = await getArticleTranslationsAction(art.id);
        const esTrans = trans.find((t) => t.locale === "es");
        const caTrans = trans.find((t) => t.locale === "ca");
        const enTrans = trans.find((t) => t.locale === "en");

        setEditingArticleId(art.id);
        setArticleLink(art.link);
        setArticleImage(art.image || "");
        setArticleThumbnail(art.thumbnail || "");
        setArticleCategory(art.category === "blog" ? "blog" : "news");
        setArticleListDate(art.listDate || "");

        setArticleTitleEs(esTrans?.title || "");
        setArticleDateEs(esTrans?.date || "");
        setArticleContentEs(esTrans?.content || "");

        setArticleTitleCa(caTrans?.title || "");
        setArticleDateCa(caTrans?.date || "");
        setArticleContentCa(caTrans?.content || "");

        setArticleTitleEn(enTrans?.title || "");
        setArticleDateEn(enTrans?.date || "");
        setArticleContentEn(enTrans?.content || "");

        setArticleFormError("");
    };

    const handleDeleteArticle = async (id: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar esta noticia?")) return;
        const res = await deleteArticleAction(id);
        if (res.success) {
            setArticles((prev) => prev.filter((a) => a.id !== id));
        } else {
            alert(res.error || "Error al eliminar la noticia");
        }
    };

    const handleCreateOrUpdateArticle = async (e: React.FormEvent) => {
        e.preventDefault();
        setArticleFormError("");

        if (!articleTitleEs.trim() || !articleTitleCa.trim() || !articleTitleEn.trim()) {
            setArticleFormError("Por favor, introduce el título en todos los idiomas.");
            return;
        }
        if (!articleLink.trim()) {
            setArticleFormError("Por favor, introduce el enlace del artículo.");
            return;
        }

        if (editingArticleId) {
            const res = await updateArticleAction(editingArticleId, {
                link: articleLink,
                image: articleImage || undefined,
                thumbnail: articleThumbnail || undefined,
                listDate: articleListDate,
                category: articleCategory,
                titleEs: articleTitleEs,
                dateEs: articleDateEs,
                contentEs: articleContentEs,
                titleCa: articleTitleCa,
                dateCa: articleDateCa,
                contentCa: articleContentCa,
                titleEn: articleTitleEn,
                dateEn: articleDateEn,
                contentEn: articleContentEn,
            }, articleFilterLocale);

            if (res.success && res.article) {
                setArticles((prev) => prev.map((a) => a.id === editingArticleId ? res.article! : a));
                handleCancelEditArticle();
            } else {
                setArticleFormError(res.error || "Error al actualizar el artículo.");
            }
        } else {
            const res = await createArticleAction({
                link: articleLink,
                image: articleImage || undefined,
                thumbnail: articleThumbnail || undefined,
                listDate: articleListDate,
                category: articleCategory,
                titleEs: articleTitleEs,
                dateEs: articleDateEs,
                contentEs: articleContentEs,
                titleCa: articleTitleCa,
                dateCa: articleDateCa,
                contentCa: articleContentCa,
                titleEn: articleTitleEn,
                dateEn: articleDateEn,
                contentEn: articleContentEn,
            }, articleFilterLocale);

            if (res.success && res.article) {
                setArticles((prev) => [res.article!, ...prev]);
                handleCancelEditArticle();
            } else {
                setArticleFormError(res.error || "Error al crear el artículo.");
            }
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Articles List */}
            <div className="lg:col-span-2 space-y-6">
                {/* Filters Bar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h4 className="text-sm font-bold font-outfit text-slate-500 uppercase tracking-wider">
                            Filtros de Búsqueda
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
                                Limpiar filtros
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Language Filter */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 block">
                                Idioma
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
                                Categoría
                            </label>
                            <select
                                value={articleFilterCategory}
                                onChange={(e) => {
                                    setArticleFilterCategory(e.target.value as any);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-xs text-foreground focus:outline-none focus:border-primary h-[38px] cursor-pointer"
                            >
                                <option value="all">Todos</option>
                                <option value="news">Noticia (News)</option>
                                <option value="blog">Blog</option>
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div className="space-y-1 relative">
                            <label className="text-xs font-semibold text-slate-500 block">
                                Fecha
                            </label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowFilterCalendar(!showFilterCalendar)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-xs text-left flex items-center justify-between text-foreground hover:border-primary transition-all cursor-pointer h-[38px]"
                                >
                                    <span className="truncate">{articleFilterDate || "Cualquier fecha"}</span>
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
                                                {monthNames[filterCalMonth]} {filterCalYear}
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
                                            {dayNames.map((d) => (
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
                                                Hoy
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Paginated List */}
                {paginatedArticles.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
                        <p className="font-switzer text-slate-500">No hay artículos de prensa que coincidan con los filtros.</p>
                    </div>
                ) : (
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
                                                {art.category === "blog" ? "Blog" : "Noticia"}
                                            </span>
                                            <span className="text-slate-400 text-xs font-mono">
                                                {art.listDate}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold font-outfit text-secondary dark:text-white truncate">
                                            {art.title}
                                        </h3>
                                        <p className="text-slate-500 dark:text-slate-400 font-mono text-xs truncate">
                                            Enlace: {art.link}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-4 sm:pt-0">
                                    <button
                                        onClick={() => handleEditArticle(art)}
                                        className="p-2 text-slate-400 hover:text-primary rounded-full hover:bg-primary/10 transition-all cursor-pointer"
                                        aria-label="Editar artículo"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteArticle(art.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                                        aria-label="Eliminar artículo"
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
                                    « Inicio
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold font-outfit text-xs rounded-xl transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ‹ Anterior
                                </button>
                                <span className="text-xs font-semibold text-slate-500 font-switzer px-2">
                                    Página {currentPage} de {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold font-outfit text-xs rounded-xl transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Siguiente ›
                                </button>
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold font-outfit text-xs rounded-xl transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Último »
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Articles Form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-6">
                <h3 className="text-xl font-bold font-outfit text-secondary dark:text-white flex items-center gap-2">
                    <Newspaper className="w-5 h-5 text-primary" />
                    {editingArticleId ? "Editar Artículo" : "Agregar Artículo"}
                </h3>
                <form onSubmit={handleCreateOrUpdateArticle} className="space-y-4">
                    {/* Link */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 block">
                            Enlace del Artículo / Noticia
                        </label>
                        <input
                            type="url"
                            value={articleLink}
                            onChange={(e) => setArticleLink(e.target.value)}
                            placeholder="https://ejemplo.com/noticia"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground"
                            required
                        />
                    </div>

                    {/* Image and Thumbnail Upload */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 block">
                                Imagen Grande
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
                                    {isUploadingImage ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : articleImage ? "Cambiar Imagen" : "Subir Imagen"}
                                </label>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 block">
                                Miniatura (Thumbnail)
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
                                    {isUploadingThumbnail ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : articleThumbnail ? "Cambiar Min." : "Subir Min."}
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Category Select */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 block">
                            Categoría
                        </label>
                        <select
                            value={articleCategory}
                            onChange={(e) => setArticleCategory(e.target.value as "news" | "blog")}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground cursor-pointer"
                        >
                            <option value="news">Noticia (News)</option>
                            <option value="blog">Blog</option>
                        </select>
                    </div>

                    {/* Ordering Date with Popover Calendar */}
                    <div className="space-y-1 relative">
                        <label className="text-xs font-semibold text-slate-500 block">
                            Fecha de Ordenamiento
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
                                    Hoy
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
                                            {monthNames[calMonth]} {calYear}
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
                                        {dayNames.map((d) => (
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
                                Información en:
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

                        {activeArticleFormLocale === "es" && (
                            <div className="space-y-3 animate-fadeIn">
                                <input
                                    type="text"
                                    value={articleTitleEs}
                                    onChange={(e) => setArticleTitleEs(e.target.value)}
                                    placeholder="Título (ES)"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground"
                                />
                                <input
                                    type="text"
                                    value={articleDateEs}
                                    onChange={(e) => setArticleDateEs(e.target.value)}
                                    placeholder="Fecha visual (ES) - Ej: 12 de Julio"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground"
                                />
                                <textarea
                                    value={articleContentEs}
                                    onChange={(e) => setArticleContentEs(e.target.value)}
                                    placeholder="Contenido/Copete (ES)"
                                    rows={3}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground resize-none"
                                />
                            </div>
                        )}

                        {activeArticleFormLocale === "ca" && (
                            <div className="space-y-3 animate-fadeIn">
                                <input
                                    type="text"
                                    value={articleTitleCa}
                                    onChange={(e) => setArticleTitleCa(e.target.value)}
                                    placeholder="Títol (CA)"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground"
                                />
                                <input
                                    type="text"
                                    value={articleDateCa}
                                    onChange={(e) => setArticleDateCa(e.target.value)}
                                    placeholder="Data visual (CA)"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground"
                                />
                                <textarea
                                    value={articleContentCa}
                                    onChange={(e) => setArticleContentCa(e.target.value)}
                                    placeholder="Contingut (CA)"
                                    rows={3}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground resize-none"
                                />
                            </div>
                        )}

                        {activeArticleFormLocale === "en" && (
                            <div className="space-y-3 animate-fadeIn">
                                <input
                                    type="text"
                                    value={articleTitleEn}
                                    onChange={(e) => setArticleTitleEn(e.target.value)}
                                    placeholder="Title (EN)"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground"
                                />
                                <input
                                    type="text"
                                    value={articleDateEn}
                                    onChange={(e) => setArticleDateEn(e.target.value)}
                                    placeholder="Visual date (EN)"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground"
                                />
                                <textarea
                                    value={articleContentEn}
                                    onChange={(e) => setArticleContentEn(e.target.value)}
                                    placeholder="Content (EN)"
                                    rows={3}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground resize-none"
                                />
                            </div>
                        )}
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
                                Cancelar
                            </button>
                        )}
                        <button
                            type="submit"
                            className="flex-1 bg-primary hover:bg-primary-light text-white font-bold font-outfit py-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/10"
                        >
                            {editingArticleId ? "Guardar" : <Plus size={18} />}
                            {editingArticleId ? "Actualizar" : "Crear Artículo"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
