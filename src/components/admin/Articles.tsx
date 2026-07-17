import React, { useState, useEffect } from "react";
import { 
    createArticleAction, 
    updateArticleAction, 
    deleteArticleAction, 
    getArticleTranslationsAction 
} from "@/actions/articleActions";
import { uploadImageAction } from "@/actions/uploadActions";
import { Dictionary } from "@/dictionaries";

// Modular subcomponents
import ArticleFilters from "./components/ArticleFilters";
import ArticleList from "./components/ArticleList";
import ArticleForm from "./components/ArticleForm";

interface ArticlesProps {
    dict: Dictionary;
    articles: any[];
    setArticles: React.Dispatch<React.SetStateAction<any[]>>;
    articleFilterLocale: "es" | "ca" | "en";
    setArticleFilterLocale: (locale: "es" | "ca" | "en") => void;
    localeStr: string;
}

const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
};

// Formats YYYY-MM-DD into a localized visual date string using dictionary
function getFormattedVisualDate(dateStr: string, lang: "es" | "ca" | "en", dict: Dictionary) {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return "";
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    
    const monthName = dict.admin.orders.months[month];
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    
    if (lang === "es" || lang === "ca") {
        return `${day} de ${capitalizedMonth} de ${year}`;
    }
    // English
    return `${capitalizedMonth} ${day}, ${year}`;
}

export default function Articles({
    dict,
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

    // Form calendar states
    const [showCalendar, setShowCalendar] = useState(false);
    const [calYear, setCalYear] = useState(() => new Date().getFullYear());
    const [calMonth, setCalMonth] = useState(() => new Date().getMonth());

    // Filter calendar states
    const [filterCalYear, setFilterCalYear] = useState(() => new Date().getFullYear());
    const [filterCalMonth, setFilterCalMonth] = useState(() => new Date().getMonth());

    const articlesPerPage = 5;

    const handleCancelEditArticle = () => {
        setEditingArticleId(null);
        setArticleListDate(() => {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        });
        setArticleLink("");
        setArticleImage("");
        setArticleThumbnail("");
        setArticleCategory("news");

        setArticleTitleEs("");
        setArticleTitleCa("");
        setArticleTitleEn("");
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
        setArticleListDate(art.listDate);
        setArticleLink(art.link || "");
        setArticleImage(art.image || "");
        setArticleThumbnail(art.thumbnail || "");
        setArticleCategory(art.category as "news" | "blog");

        setArticleTitleEs(esTrans?.title || "");
        setArticleContentEs(esTrans?.content || "");

        setArticleTitleCa(caTrans?.title || "");
        setArticleContentCa(caTrans?.content || "");

        setArticleTitleEn(enTrans?.title || "");
        setArticleContentEn(enTrans?.content || "");
        setArticleFormError("");
    };

    const handleDeleteArticle = async (artId: string) => {
        if (!confirm(dict.admin.articles.confirm_delete)) return;
        const res = await deleteArticleAction(artId);
        if (res.success) {
            setArticles((prev) => prev.filter((a) => a.id !== artId));
        } else {
            alert(res.error || dict.admin.articles.error_delete);
        }
    };

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
                if (target === "image") setArticleImage(res.url);
                else setArticleThumbnail(res.url);
            } else {
                alert(res.error || dict.admin.products.error_upload);
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert(dict.admin.products.error_upload_connection);
        } finally {
            if (target === "image") setIsUploadingImage(false);
            else setIsUploadingThumbnail(false);
        }
    };

    const handleCreateOrUpdateArticle = async (e: React.FormEvent) => {
        e.preventDefault();
        setArticleFormError("");

        const isLinkArticle = !!articleLink.trim();

        if (!isLinkArticle) {
            if (!articleTitleEs.trim() || !articleTitleCa.trim() || !articleTitleEn.trim()) {
                setArticleFormError(dict.admin.articles.error_missing_title);
                return;
            }
            if (!articleContentEs.trim() || !articleContentCa.trim() || !articleContentEn.trim()) {
                setArticleFormError(dict.admin.articles.error_missing_content);
                return;
            }
        }

        const calculatedDateEs = getFormattedVisualDate(articleListDate, "es", dict);
        const calculatedDateCa = getFormattedVisualDate(articleListDate, "ca", dict);
        const calculatedDateEn = getFormattedVisualDate(articleListDate, "en", dict);

        if (editingArticleId) {
            const res = await updateArticleAction(editingArticleId, {
                link: articleLink || undefined,
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
                setArticleFormError(res.error || dict.admin.articles.error_update);
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
                setArticleFormError(res.error || dict.admin.articles.error_create);
            }
        }
    };

    // Filter and paginate articles
    const filteredArticles = articles.filter((art) => {
        if (articleFilterCategory !== "all" && art.category !== articleFilterCategory) {
            return false;
        }
        if (articleFilterDate && art.listDate !== articleFilterDate) {
            return false;
        }
        return true;
    });

    const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
    const paginatedArticles = filteredArticles.slice(
        (currentPage - 1) * articlesPerPage,
        currentPage * articlesPerPage
    );

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
                    dict={dict}
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
                    getFirstDayOfMonth={getFirstDayOfMonth}
                    getDaysInMonth={getDaysInMonth}
                />

                <ArticleList
                    dict={dict}
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
                dict={dict}
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
                getFirstDayOfMonth={getFirstDayOfMonth}
                getDaysInMonth={getDaysInMonth}
            />
        </div>
    );
}
