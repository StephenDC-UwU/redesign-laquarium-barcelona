"use server";

import { db } from "@/lib/db";
import { Article } from "@prisma/client";
import { revalidatePath } from "next/cache";

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
            image: art.image,
            thumbnail: art.thumbnail,
            link: art.link,
            listDate: art.listDate,
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
        const newArticle = await db.article.create({
            data: {
                listDate: data.listDate,
                image: data.image,
                thumbnail: data.thumbnail,
                link: data.link || "#",
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
        });
        revalidatePath("/[locale]/admin", "layout");
        revalidatePath("/[locale]", "layout");
        return {
            success: true,
            article: {
                id: newArticle.id,
                image: newArticle.image,
                thumbnail: newArticle.thumbnail,
                link: newArticle.link,
                listDate: newArticle.listDate,
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


