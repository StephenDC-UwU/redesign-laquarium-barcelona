import React, { useState, useEffect } from "react";
import { 
    createArticleAction, 
    updateArticleAction, 
    deleteArticleAction, 
    getArticleTranslationsAction 
} from "@/actions/articleActions";
import { uploadImageAction } from "@/actions/uploadActions";

// Modular subcomponents
import ArticleFilters from "./components/ArticleFilters";
import ArticleList from "./components/ArticleList";
import ArticleForm from "./components/ArticleForm";

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

// Formats YYYY-MM-DD into a localized visual date string
function getFormattedVisualDate(dateStr: string, lang: "es" | "ca" | "en") {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return "";
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    
    if (lang === "es") {
        const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        return `${day} de ${months[month]} de ${year}`;
    }
    if (lang === "ca") {
        const months = ["Gener", "Febrer", "Març", "Abril", "Maig", "Juny", "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"];
        return `${day} de ${months[month]} de ${year}`;
    }
    // English
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${months[month]} ${day}, ${year}`;
}

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

    // Restore draft from localStorage
    useEffect(() => {
        const savedDraft = localStorage.getItem("article_form_draft");
        if (savedDraft) {
            try {
                const draft = JSON.parse(savedDraft);
                if (draft.editingArticleId) setEditingArticleId(draft.editingArticleId);
                if (draft.articleListDate) setArticleListDate(draft.articleListDate);
                if (draft.articleLink) setArticleLink(draft.articleLink);
                if (draft.articleImage) setArticleImage(draft.articleImage);
                if (draft.articleThumbnail) setArticleThumbnail(draft.articleThumbnail);
                if (draft.articleCategory) setArticleCategory(draft.articleCategory);
                if (draft.articleTitleEs) setArticleTitleEs(draft.articleTitleEs);
                if (draft.articleTitleCa) setArticleTitleCa(draft.articleTitleCa);
                if (draft.articleTitleEn) setArticleTitleEn(draft.articleTitleEn);
                if (draft.articleContentEs) setArticleContentEs(draft.articleContentEs);
                if (draft.articleContentCa) setArticleContentCa(draft.articleContentCa);
                if (draft.articleContentEn) setArticleContentEn(draft.articleContentEn);
            } catch (e) {
                console.error("Failed to restore article draft:", e);
            }
        }
    }, []);

    // Save draft to localStorage on changes
    useEffect(() => {
        const draft = {
            editingArticleId,
            articleListDate,
            articleLink,
            articleImage,
            articleThumbnail,
            articleCategory,
            articleTitleEs,
            articleTitleCa,
            articleTitleEn,
            articleContentEs,
            articleContentCa,
            articleContentEn,
        };
        localStorage.setItem("article_form_draft", JSON.stringify(draft));
    }, [
        editingArticleId,
        articleListDate,
        articleLink,
        articleImage,
        articleThumbnail,
        articleCategory,
        articleTitleEs,
        articleTitleCa,
        articleTitleEn,
        articleContentEs,
        articleContentCa,
        articleContentEn,
    ]);

    const clearDraft = () => {
        localStorage.removeItem("article_form_draft");
    };

    // Filter logic
    const filteredArticles = articles.filter((art) => {
        if (articleFilterCategory !== "all" && art.category !== articleFilterCategory) {
            return false;
        }
        if (articleFilterDate && art.listDate !== articleFilterDate) {
            return false;
        }
        return true;
    });

    const itemsPerPage = 6;
    const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
    const paginatedArticles = filteredArticles.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Sync active locale
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
        setArticleContentEs("");
        setArticleContentCa("");
        setArticleContentEn("");
        setArticleFormError("");
        clearDraft();
    };

    const handleEditArticle = async (art: any) => {
        const trans = await getArticleTranslationsAction(art.id);
        const esTrans = trans.find((t) => t.locale === "es");
        const caTrans = trans.find((t) => t.locale === "ca");
        const enTrans = trans.find((t) => t.locale === "en");

        setEditingArticleId(art.id);
        setArticleLink(art.link || "");
        setArticleImage(art.image || "");
        setArticleThumbnail(art.thumbnail || "");
        setArticleCategory(art.category === "blog" ? "blog" : "news");
        setArticleListDate(art.listDate || "");

        setArticleTitleEs(esTrans?.title || "");
        setArticleContentEs(esTrans?.content || "");

        setArticleTitleCa(caTrans?.title || "");
        setArticleContentCa(caTrans?.content || "");

        setArticleTitleEn(enTrans?.title || "");
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

        const hasLink = !!articleLink.trim();

        if (!hasLink) {
            if (!articleTitleEs.trim() || !articleTitleCa.trim() || !articleTitleEn.trim()) {
                setArticleFormError("Al no ingresar un enlace, por favor introduce el título en todos los idiomas.");
                return;
            }
            if (!articleContentEs.trim() || !articleContentCa.trim() || !articleContentEn.trim()) {
                setArticleFormError("Al no ingresar un enlace, por favor introduce el contenido/copete en todos los idiomas.");
                return;
            }
        }

        const calculatedDateEs = getFormattedVisualDate(articleListDate, "es");
        const calculatedDateCa = getFormattedVisualDate(articleListDate, "ca");
        const calculatedDateEn = getFormattedVisualDate(articleListDate, "en");

        if (editingArticleId) {
            const res = await updateArticleAction(editingArticleId, {
                link: articleLink,
                image: articleImage || undefined,
                thumbnail: articleThumbnail || undefined,
                listDate: articleListDate,
                category: articleCategory,
                titleEs: articleTitleEs,
                dateEs: calculatedDateEs,
                contentEs: articleContentEs,
                titleCa: articleTitleCa,
                dateCa: calculatedDateCa,
                contentCa: articleContentCa,
                titleEn: articleTitleEn,
                dateEn: calculatedDateEn,
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
                dateEs: calculatedDateEs,
                contentEs: articleContentEs,
                titleCa: articleTitleCa,
                dateCa: calculatedDateCa,
                contentCa: articleContentCa,
                titleEn: articleTitleEn,
                dateEn: calculatedDateEn,
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
            {/* CSS styles for rendering markdown preview cleanly */}
            <style dangerouslySetInnerHTML={{ __html: `
                .markdown-preview h1 { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem; color: #1e293b; margin-top: 1rem; }
                .markdown-preview h2 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; color: #1e293b; margin-top: 1rem; }
                .markdown-preview h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; color: #1e293b; margin-top: 1rem; }
                .markdown-preview p { font-size: 0.85rem; line-height: 1.6; margin-bottom: 0.75rem; color: #475569; }
                .markdown-preview ul { list-style-type: disc; padding-left: 1.25rem; margin-bottom: 0.75rem; font-size: 0.85rem; }
                .markdown-preview ol { list-style-type: decimal; padding-left: 1.25rem; margin-bottom: 0.75rem; font-size: 0.85rem; }
                .markdown-preview a { color: #0284c7; text-decoration: underline; }
                .markdown-preview img { max-width: 100%; height: auto; border-radius: 8px; margin: 0.5rem 0; display: block; }
                .markdown-preview strong { font-weight: bold; color: #0f172a; }
                .markdown-preview em { font-style: italic; }
                .markdown-preview blockquote { border-left: 3px solid #0284c7; padding-left: 0.75rem; font-style: italic; color: #64748b; margin: 0.75rem 0; }
                .dark .markdown-preview h1, .dark .markdown-preview h2, .dark .markdown-preview h3 { color: #f1f5f9; }
                .dark .markdown-preview p { color: #cbd5e1; }
                .dark .markdown-preview strong { color: #f8fafc; }
                .dark .markdown-preview blockquote { color: #94a3b8; }
            ` }} />

            {/* Left Column: Filters and Articles List */}
            <div className="lg:col-span-2 space-y-6">
                <ArticleFilters
                    articleFilterLocale={articleFilterLocale}
                    setArticleFilterLocale={setArticleFilterLocale}
                    articleFilterCategory={articleFilterCategory}
                    setArticleFilterCategory={setArticleFilterCategory}
                    articleFilterDate={articleFilterDate}
                    setArticleFilterDate={setArticleFilterDate}
                    showFilterCalendar={showFilterCalendar}
                    setShowFilterCalendar={setShowFilterCalendar}
                    filterCalYear={filterCalYear}
                    setFilterCalYear={setFilterCalYear}
                    filterCalMonth={filterCalMonth}
                    setFilterCalMonth={setFilterCalMonth}
                    setCurrentPage={setCurrentPage}
                    monthNames={monthNames}
                    dayNames={dayNames}
                    getFirstDayOfMonth={getFirstDayOfMonth}
                    getDaysInMonth={getDaysInMonth}
                />

                <ArticleList
                    paginatedArticles={paginatedArticles}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    setCurrentPage={setCurrentPage}
                    handleEditArticle={handleEditArticle}
                    handleDeleteArticle={handleDeleteArticle}
                />
            </div>

            {/* Right Column: Article form */}
            <ArticleForm
                editingArticleId={editingArticleId}
                articleLink={articleLink}
                setArticleLink={setArticleLink}
                articleImage={articleImage}
                setArticleImage={setArticleImage}
                articleThumbnail={articleThumbnail}
                setArticleThumbnail={setArticleThumbnail}
                articleCategory={articleCategory}
                setArticleCategory={setArticleCategory}
                articleListDate={articleListDate}
                setArticleListDate={setArticleListDate}
                articleTitleEs={articleTitleEs}
                setArticleTitleEs={setArticleTitleEs}
                articleTitleCa={articleTitleCa}
                setArticleTitleCa={setArticleTitleCa}
                articleTitleEn={articleTitleEn}
                setArticleTitleEn={setArticleTitleEn}
                articleContentEs={articleContentEs}
                setArticleContentEs={setArticleContentEs}
                articleContentCa={articleContentCa}
                setArticleContentCa={setArticleContentCa}
                articleContentEn={articleContentEn}
                setArticleContentEn={setArticleContentEn}
                activeArticleFormLocale={activeArticleFormLocale}
                setActiveArticleFormLocale={setActiveArticleFormLocale}
                articleFormError={articleFormError}
                isUploadingImage={isUploadingImage}
                isUploadingThumbnail={isUploadingThumbnail}
                handleUpload={handleUpload}
                showCalendar={showCalendar}
                setShowCalendar={setShowCalendar}
                calYear={calYear}
                setCalYear={setCalYear}
                calMonth={calMonth}
                setCalMonth={setCalMonth}
                handleCancelEditArticle={handleCancelEditArticle}
                handleCreateOrUpdateArticle={handleCreateOrUpdateArticle}
                monthNames={monthNames}
                dayNames={dayNames}
                getFirstDayOfMonth={getFirstDayOfMonth}
                getDaysInMonth={getDaysInMonth}
            />
        </div>
    );
}
