"use server";

import { db } from "@/lib/db";
import { Article } from "@prisma/client";   
import { revalidatePath } from "next/cache";

function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

export async function getArticlesAction(locale: string = "es"): Promise<any[]> {
    try {
        const articles = await db.article.findMany({
            include: {
                translations: {
                    where: { locale }
                }
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return articles.map(art => ({
            id: art.id,
            slug: art.slug,
            image: art.image,
            thumbnail: art.thumbnail,
            link: art.link,
            listDate: art.listDate,
            category: art.category,
            topic: art.topic,
            featured: art.featured,
            createdAt: art.createdAt,
            updatedAt: art.updatedAt,
            title: art.translations[0]?.title || "",
            date: art.translations[0]?.date || "",
            content: art.translations[0]?.content || "",
        }));
    } catch (e) {
        console.error("Error in getArticlesAction:", e);
        return [];
    }
}

export async function createArticleAction(
    data: {
        listDate: string;
        image: string;
        thumbnail: string;
        link?: string;
        category?: string;
        titleEs: string;
        dateEs: string;
        contentEs?: string;
        titleCa: string;
        dateCa: string;
        contentCa?: string;
        titleEn: string;
        dateEn: string;
        contentEn?: string;
    },
    locale: string = "es"
): Promise<{ success: boolean; article?: any; error?: string }> {
    try {
        if (!data.listDate || !data.image || !data.thumbnail || !data.titleEs || !data.titleCa || !data.titleEn) {
            return { success: false, error: "Todos los campos obligatorios deben estar completos." };
        }
        const slug = slugify(data.titleEs);
        const newArticle = await db.article.create({
            data: {
                slug,
                listDate: data.listDate,
                image: data.image,
                thumbnail: data.thumbnail,
                link: data.link || "#",
                category: data.category || "news",
                translations: {
                    create: [
                        { locale: "es", title: data.titleEs, date: data.dateEs, content: data.contentEs || "" },
                        { locale: "ca", title: data.titleCa, date: data.dateCa, content: data.contentCa || "" },
                        { locale: "en", title: data.titleEn, date: data.dateEn, content: data.contentEn || "" },
                    ]
                }
            },
            include: {
                translations: {
                    where: { locale }
                }
            }
        }) as any;
        revalidatePath("/[locale]/admin", "layout");
        revalidatePath("/[locale]", "layout");
        return {
            success: true,
            article: {
                id: newArticle.id,
                slug: newArticle.slug,
                image: newArticle.image,
                thumbnail: newArticle.thumbnail,
                link: newArticle.link,
                listDate: newArticle.listDate,
                category: newArticle.category,
                createdAt: newArticle.createdAt,
                updatedAt: newArticle.updatedAt,
                title: newArticle.translations[0]?.title || "",
                date: newArticle.translations[0]?.date || "",
                content: newArticle.translations[0]?.content || "",
            }
        };
    } catch (e) {
        console.error("Error in createArticleAction:", e);
        return { success: false, error: "Error al crear el artículo." };
    }
}

export async function updateArticleAction(
    id: string,
    data: {
        listDate?: string;
        image?: string;
        thumbnail?: string;
        link?: string;
        category?: string;
        titleEs?: string;
        dateEs?: string;
        contentEs?: string;
        titleCa?: string;
        dateCa?: string;
        contentCa?: string;
        titleEn?: string;
        dateEn?: string;
        contentEn?: string;
    },
    locale: string = "es"
): Promise<{ success: boolean; article?: any; error?: string }> {
    try {
        const updateData: any = {};
        if (data.listDate !== undefined) updateData.listDate = data.listDate;
        if (data.image !== undefined) updateData.image = data.image;
        if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
        if (data.link !== undefined) updateData.link = data.link;
        if (data.category !== undefined) updateData.category = data.category;

        await db.article.update({
            where: { id },
            data: updateData
        });

        // Update or upsert translations for ES
        if (data.titleEs !== undefined || data.dateEs !== undefined || data.contentEs !== undefined) {
            await db.articleTranslation.upsert({
                where: { articleId_locale: { articleId: id, locale: "es" } },
                update: { 
                    title: data.titleEs, 
                    date: data.dateEs,
                    content: data.contentEs 
                },
                create: { 
                    articleId: id, 
                    locale: "es", 
                    title: data.titleEs || "", 
                    date: data.dateEs || "",
                    content: data.contentEs || ""
                }
            });
        }
        // Update or upsert translations for CA
        if (data.titleCa !== undefined || data.dateCa !== undefined || data.contentCa !== undefined) {
            await db.articleTranslation.upsert({
                where: { articleId_locale: { articleId: id, locale: "ca" } },
                update: { 
                    title: data.titleCa, 
                    date: data.dateCa,
                    content: data.contentCa 
                },
                create: { 
                    articleId: id, 
                    locale: "ca", 
                    title: data.titleCa || "", 
                    date: data.dateCa || "",
                    content: data.contentCa || ""
                }
            });
        }
        // Update or upsert translations for EN
        if (data.titleEn !== undefined || data.dateEn !== undefined || data.contentEn !== undefined) {
            await db.articleTranslation.upsert({
                where: { articleId_locale: { articleId: id, locale: "en" } },
                update: { 
                    title: data.titleEn, 
                    date: data.dateEn,
                    content: data.contentEn 
                },
                create: { 
                    articleId: id, 
                    locale: "en", 
                    title: data.titleEn || "", 
                    date: data.dateEn || "",
                    content: data.contentEn || ""
                }
            });
        }

        const finalArticle = await db.article.findUnique({
            where: { id },
            include: {
                translations: {
                    where: { locale }
                }
            }
        });

        revalidatePath("/[locale]/admin", "layout");
        revalidatePath("/[locale]", "layout");

        if (!finalArticle) return { success: false, error: "Artículo no encontrado tras actualizar." };

        return {
            success: true,
            article: {
                id: finalArticle.id,
                image: finalArticle.image,
                thumbnail: finalArticle.thumbnail,
                link: finalArticle.link,
                listDate: finalArticle.listDate,
                category: finalArticle.category,
                createdAt: finalArticle.createdAt,
                updatedAt: finalArticle.updatedAt,
                title: finalArticle.translations[0]?.title || "",
                date: finalArticle.translations[0]?.date || "",
                content: finalArticle.translations[0]?.content || "",
            }
        };
    } catch (e) {
        console.error("Error in updateArticleAction:", e);
        return { success: false, error: "Error al actualizar el artículo." };
    }
}

export async function deleteArticleAction(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await db.article.delete({
            where: { id },
        });
        revalidatePath("/[locale]/admin", "layout");
        revalidatePath("/[locale]", "layout");
        return { success: true };
    } catch (e) {
        console.error("Error in deleteArticleAction:", e);
        return { success: false, error: "Error al eliminar el artículo." };
    }
}

export async function getArticleTranslationsAction(id: string): Promise<any[]> {
    try {
        return await db.articleTranslation.findMany({
            where: { articleId: id }
        });
    } catch (e) {
        console.error("Error in getArticleTranslationsAction:", e);
        return [];
    }
}

export async function getFilteredArticlesAction(
    params: {
        locale?: string;
        category?: string;
        topics?: string[];
        years?: string[];
        months?: string[];
        searchQuery?: string;
        skip?: number;
        take?: number;
    }
): Promise<{ articles: any[]; totalCount: number }> {
    try {
        const locale = params.locale || "es";
        const category = params.category || "news";
        const topics = params.topics || [];
        const years = params.years || [];
        const months = params.months || [];
        const searchQuery = params.searchQuery || "";
        const skip = params.skip || 0;
        const take = params.take || 9;

        const whereClause: any = {
            category,
        };

        if (topics.length > 0) {
            whereClause.topic = { in: topics };
        }

        if (searchQuery.trim()) {
            whereClause.translations = {
                some: {
                    locale,
                    OR: [
                        { title: { contains: searchQuery, mode: "insensitive" } },
                        { content: { contains: searchQuery, mode: "insensitive" } }
                    ]
                }
            };
        }

        const allArticles = await db.article.findMany({
            where: whereClause,
            include: {
                translations: {
                    where: { locale }
                }
            },
            orderBy: {
                listDate: "desc",
            }
        });

        let mappedArticles = allArticles.map(art => {
            const listDate = art.listDate || ""; 
            const year = listDate.substring(0, 4);
            const month = listDate.substring(5, 7);

            return {
                id: art.id,
                slug: art.slug,
                image: art.image,
                thumbnail: art.thumbnail,
                link: art.link,
                listDate: art.listDate,
                category: art.category,
                topic: art.topic,
                featured: art.featured,
                year,
                month,
                createdAt: art.createdAt,
                updatedAt: art.updatedAt,
                title: art.translations[0]?.title || "",
                date: art.translations[0]?.date || "",
                content: art.translations[0]?.content || "",
            };
        });

        if (years.length > 0) {
            mappedArticles = mappedArticles.filter(art => years.includes(art.year));
        }
        if (months.length > 0) {
            mappedArticles = mappedArticles.filter(art => months.includes(art.month));
        }

        const totalCount = mappedArticles.length;
        const slicedArticles = mappedArticles.slice(skip, skip + take);

        return {
            articles: slicedArticles,
            totalCount
        };
    } catch (e) {
        console.error("Error in getFilteredArticlesAction:", e);
        return { articles: [], totalCount: 0 };
    }
}

export async function getArticlesFilterMetadataAction(
    category: string = "news"
): Promise<{ topics: string[]; years: string[] }> {
    try {
        const articlesWithTopics = await db.article.findMany({
            where: { category },
            select: { topic: true },
            distinct: ["topic"]
        });
        const topics = articlesWithTopics.map(a => a.topic).filter(Boolean);

        const oldestArticle = await db.article.findFirst({
            where: { category },
            orderBy: { listDate: "asc" }
        });

        const currentYear = new Date().getFullYear();
        let startYear = currentYear;
        if (oldestArticle && oldestArticle.listDate) {
            const parsedYear = parseInt(oldestArticle.listDate.substring(0, 4));
            if (!isNaN(parsedYear)) {
                startYear = parsedYear;
            }
        }

        const years: string[] = [];
        for (let y = startYear; y <= currentYear; y++) {
            years.push(y.toString());
        }

        return {
            topics,
            years
        };
    } catch (e) {
        console.error("Error in getArticlesFilterMetadataAction:", e);
        return { topics: [], years: [] };
    }
}

export async function getArticleByIdAction(id: string, locale: string = "es"): Promise<any | null> {
    try {
        const art = await db.article.findUnique({
            where: { id },
            include: {
                translations: {
                    where: { locale }
                }
            }
        });
        if (!art) return null;
        return {
            id: art.id,
            slug: art.slug,
            image: art.image,
            thumbnail: art.thumbnail,
            link: art.link,
            listDate: art.listDate,
            category: art.category,
            topic: art.topic,
            featured: art.featured,
            createdAt: art.createdAt,
            updatedAt: art.updatedAt,
            title: art.translations[0]?.title || "",
            date: art.translations[0]?.date || "",
            content: art.translations[0]?.content || "",
        };
    } catch (e) {
        console.error("Error in getArticleByIdAction:", e);
        return null;
    }
}

export async function getArticleBySlugAction(slug: string, locale: string = "es"): Promise<any | null> {
    try {
        const art = await db.article.findUnique({
            where: { slug },
            include: {
                translations: {
                    where: { locale }
                }
            }
        });
        if (!art) return null;
        return {
            id: art.id,
            slug: art.slug,
            image: art.image,
            thumbnail: art.thumbnail,
            link: art.link,
            listDate: art.listDate,
            category: art.category,
            topic: art.topic,
            featured: art.featured,
            createdAt: art.createdAt,
            updatedAt: art.updatedAt,
            title: art.translations[0]?.title || "",
            date: art.translations[0]?.date || "",
            content: art.translations[0]?.content || "",
        };
    } catch (e) {
        console.error("Error in getArticleBySlugAction:", e);
        return null;
    }
}


