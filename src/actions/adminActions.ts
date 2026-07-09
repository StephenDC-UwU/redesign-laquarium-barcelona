"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Order } from "@prisma/client";

export async function getOrdersAction(): Promise<Order[]> {
    try {
        return await db.order.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
    } catch (e) {
        console.error("Error in getOrdersAction:", e);
        return [];
    }
}

export async function updateOrderStatusAction(
    id: string,
    status: string
): Promise<{ success: boolean; order?: Order; error?: string }> {
    try {
        const updated = await db.order.update({
            where: { id },
            data: { status },
        });
        revalidatePath("/[locale]/admin", "layout");
        return { success: true, order: updated };
    } catch (e) {
        console.error("Error in updateOrderStatusAction:", e);
        return { success: false, error: "Error al actualizar el estado." };
    }
}

export async function deleteOrderAction(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await db.order.delete({
            where: { id },
        });
        revalidatePath("/[locale]/admin", "layout");
        return { success: true };
    } catch (e) {
        console.error("Error in deleteOrderAction:", e);
        return { success: false, error: "Error al eliminar el pedido." };
    }
}

export async function createProductAction(
    data: {
        price: number;
        nameEs: string;
        descriptionEs: string;
        tagEs?: string;
        nameCa: string;
        descriptionCa: string;
        tagCa?: string;
        nameEn: string;
        descriptionEn: string;
        tagEn?: string;
    },
    locale: string = "es"
): Promise<{ success: boolean; product?: any; error?: string }> {
    try {
        if (!data.nameEs || !data.nameCa || !data.nameEn || data.price <= 0) {
            return { success: false, error: "El nombre en todos los idiomas y un precio válido son requeridos." };
        }
        const newProduct = await db.product.create({
            data: {
                price: data.price,
                translations: {
                    create: [
                        { locale: "es", name: data.nameEs, description: data.descriptionEs, tag: data.tagEs || null },
                        { locale: "ca", name: data.nameCa, description: data.descriptionCa, tag: data.tagCa || null },
                        { locale: "en", name: data.nameEn, description: data.descriptionEn, tag: data.tagEn || null },
                    ]
                }
            },
            include: {
                translations: {
                    where: { locale }
                }
            }
        });
        revalidatePath("/[locale]", "layout");
        revalidatePath("/[locale]/admin", "layout");
        return {
            success: true,
            product: {
                id: newProduct.id,
                price: newProduct.price,
                createdAt: newProduct.createdAt,
                updatedAt: newProduct.updatedAt,
                name: newProduct.translations[0]?.name || "",
                description: newProduct.translations[0]?.description || "",
                tag: newProduct.translations[0]?.tag || null,
            }
        };
    } catch (e) {
        console.error("Error in createProductAction:", e);
        return { success: false, error: "Error al crear el ticket/producto." };
    }
}

export async function deleteProductAction(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await db.product.delete({
            where: { id },
        });
        revalidatePath("/[locale]", "layout");
        return { success: true };
    } catch (e) {
        console.error("Error in deleteProductAction:", e);
        return { success: false, error: "Error al eliminar el producto." };
    }
}
