"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Order, PromoCode } from "@prisma/client";

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
        const oldOrder = await db.order.findUnique({ where: { id } });
        if (!oldOrder) {
            return { success: false, error: "Pedido no encontrado." };
        }

        const updated = await db.order.update({
            where: { id },
            data: { status },
        });

        const isPaidStatus = status === "paid" || status === "completed";
        const wasPaidStatus = oldOrder.status === "paid" || oldOrder.status === "completed";

        if (isPaidStatus && !wasPaidStatus && oldOrder.promoCode) {
            await db.promoCode.update({
                where: { code: oldOrder.promoCode.toUpperCase().trim() },
                data: {
                    uses: {
                        increment: 1
                    }
                }
            }).catch((err) => {
                console.error(`Failed to increment promo code uses for code ${oldOrder.promoCode}:`, err);
            });
        } else if (!isPaidStatus && wasPaidStatus && oldOrder.promoCode) {
            await db.promoCode.update({
                where: { code: oldOrder.promoCode.toUpperCase().trim() },
                data: {
                    uses: {
                        decrement: 1
                    }
                }
            }).catch((err) => {
                console.error(`Failed to decrement promo code uses for code ${oldOrder.promoCode}:`, err);
            });
        }

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
        image?: string;
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
                image: data.image || null,
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
                image: newProduct.image,
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

export async function getHourlyCapacityAction(): Promise<number> {
    try {
        const capacitySetting = await db.systemSetting.findUnique({
            where: { key: "hourlyCapacity" }
        });
        return capacitySetting ? parseInt(capacitySetting.value, 10) : 50;
    } catch (e) {
        console.error("Error in getHourlyCapacityAction:", e);
        return 50;
    }
}

export async function updateHourlyCapacityAction(capacity: number): Promise<{ success: boolean; error?: string }> {
    try {
        if (capacity <= 0) {
            return { success: false, error: "La capacidad debe ser un número positivo." };
        }
        await db.systemSetting.upsert({
            where: { key: "hourlyCapacity" },
            update: { value: capacity.toString() },
            create: { key: "hourlyCapacity", value: capacity.toString() }
        });
        revalidatePath("/[locale]/admin", "layout");
        revalidatePath("/[locale]/cart", "layout");
        return { success: true };
    } catch (e) {
        console.error("Error in updateHourlyCapacityAction:", e);
        return { success: false, error: "Hubo un error al actualizar la capacidad." };
    }
}

export async function getOccupancyReportAction(date: string): Promise<Record<string, number>> {
    try {
        const orders = await db.order.findMany({
            where: {
                visitDate: date,
                status: { in: ["paid", "completed"] }
            }
        });

        const occupied: Record<string, number> = {};
        const slots = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
        for (const slot of slots) {
            occupied[slot] = 0;
        }

        for (const order of orders) {
            if (order.visitTime && slots.includes(order.visitTime)) {
                const items = order.items as any[];
                if (Array.isArray(items)) {
                    for (const item of items) {
                        occupied[order.visitTime] += item.quantity || 0;
                    }
                }
            }
        }
        return occupied;
    } catch (e) {
        console.error("Error in getOccupancyReportAction:", e);
        return {};
    }
}

export async function getProductTranslationsAction(id: string): Promise<any[]> {
    try {
        return await db.productTranslation.findMany({
            where: { productId: id }
        });
    } catch (e) {
        console.error("Error in getProductTranslationsAction:", e);
        return [];
    }
}

export async function updateProductAction(
    id: string,
    data: {
        price: number;
        image?: string;
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

        await db.product.update({
            where: { id },
            data: { 
                price: data.price,
                image: data.image !== undefined ? data.image : undefined
            }
        });

        // ES translation
        await db.productTranslation.upsert({
            where: { productId_locale: { productId: id, locale: "es" } },
            update: { name: data.nameEs, description: data.descriptionEs, tag: data.tagEs || null },
            create: { productId: id, locale: "es", name: data.nameEs, description: data.descriptionEs, tag: data.tagEs || null }
        });

        // CA translation
        await db.productTranslation.upsert({
            where: { productId_locale: { productId: id, locale: "ca" } },
            update: { name: data.nameCa, description: data.descriptionCa, tag: data.tagCa || null },
            create: { productId: id, locale: "ca", name: data.nameCa, description: data.descriptionCa, tag: data.tagCa || null }
        });

        // EN translation
        await db.productTranslation.upsert({
            where: { productId_locale: { productId: id, locale: "en" } },
            update: { name: data.nameEn, description: data.descriptionEn, tag: data.tagEn || null },
            create: { productId: id, locale: "en", name: data.nameEn, description: data.descriptionEn, tag: data.tagEn || null }
        });

        const updatedProduct = await db.product.findUnique({
            where: { id },
            include: {
                translations: {
                    where: { locale }
                }
            }
        });

        revalidatePath("/[locale]", "layout");
        revalidatePath("/[locale]/admin", "layout");

        if (!updatedProduct) return { success: false, error: "Producto no encontrado." };

        return {
            success: true,
            product: {
                id: updatedProduct.id,
                price: updatedProduct.price,
                image: updatedProduct.image,
                createdAt: updatedProduct.createdAt,
                updatedAt: updatedProduct.updatedAt,
                name: updatedProduct.translations[0]?.name || "",
                description: updatedProduct.translations[0]?.description || "",
                tag: updatedProduct.translations[0]?.tag || null,
            }
        };
    } catch (e) {
        console.error("Error in updateProductAction:", e);
        return { success: false, error: "Error al actualizar el producto." };
    }
}

export async function getDailyCapacityAction(date: string): Promise<number> {
    try {
        const dateSpecificCapacityKey = `capacity_${date}`;
        const dateSpecificCapacitySetting = await db.systemSetting.findUnique({
            where: { key: dateSpecificCapacityKey }
        });
        if (dateSpecificCapacitySetting) {
            return parseInt(dateSpecificCapacitySetting.value, 10);
        }
        // Fallback to default
        const defaultCapacitySetting = await db.systemSetting.findUnique({
            where: { key: "hourlyCapacity" }
        });
        return defaultCapacitySetting ? parseInt(defaultCapacitySetting.value, 10) : 50;
    } catch (e) {
        console.error("Error in getDailyCapacityAction:", e);
        return 50;
    }
}

export async function updateDailyCapacityAction(date: string, capacity: number): Promise<{ success: boolean; error?: string }> {
    try {
        if (capacity <= 0) {
            return { success: false, error: "La capacidad debe ser un número positivo." };
        }
        const dateSpecificCapacityKey = `capacity_${date}`;
        await db.systemSetting.upsert({
            where: { key: dateSpecificCapacityKey },
            update: { value: capacity.toString() },
            create: { key: dateSpecificCapacityKey, value: capacity.toString() }
        });
        revalidatePath("/[locale]/admin", "layout");
        revalidatePath("/[locale]/cart", "layout");
        return { success: true };
    } catch (e) {
        console.error("Error in updateDailyCapacityAction:", e);
        return { success: false, error: "Hubo un error al actualizar la capacidad." };
    }
}

export async function getPromoCodesAction(): Promise<PromoCode[]> {
    try {
        return await db.promoCode.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
    } catch (e) {
        console.error("Error in getPromoCodesAction:", e);
        return [];
    }
}

export async function createPromoCodeAction(data: {
    code: string;
    discount: number;
    maxUses?: number | null;
    expiresAt?: string | null;
}): Promise<{ success: boolean; promoCode?: PromoCode; error?: string }> {
    try {
        if (!data.code || !data.code.trim()) {
            return { success: false, error: "El código es requerido." };
        }
        if (data.discount <= 0 || data.discount > 100) {
            return { success: false, error: "El descuento debe estar entre 1 y 100." };
        }

        const normalizedCode = data.code.toUpperCase().trim();
        const existing = await db.promoCode.findUnique({
            where: { code: normalizedCode }
        });
        if (existing) {
            return { success: false, error: "El código promocional ya existe." };
        }

        const newPromo = await db.promoCode.create({
            data: {
                code: normalizedCode,
                discount: data.discount,
                maxUses: data.maxUses !== undefined ? data.maxUses : null,
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
                isActive: true,
            }
        });

        revalidatePath("/[locale]/admin", "layout");
        return { success: true, promoCode: newPromo };
    } catch (e) {
        console.error("Error in createPromoCodeAction:", e);
        return { success: false, error: "Hubo un error al crear el código promocional." };
    }
}

export async function togglePromoCodeAction(id: string): Promise<{ success: boolean; promoCode?: PromoCode; error?: string }> {
    try {
        const promo = await db.promoCode.findUnique({ where: { id } });
        if (!promo) return { success: false, error: "Código promocional no encontrado." };

        const updated = await db.promoCode.update({
            where: { id },
            data: { isActive: !promo.isActive }
        });

        revalidatePath("/[locale]/admin", "layout");
        return { success: true, promoCode: updated };
    } catch (e) {
        console.error("Error in togglePromoCodeAction:", e);
        return { success: false, error: "Hubo un error al actualizar el código." };
    }
}

export async function deletePromoCodeAction(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await db.promoCode.delete({
            where: { id }
        });
        revalidatePath("/[locale]/admin", "layout");
        return { success: true };
    } catch (e) {
        console.error("Error in deletePromoCodeAction:", e);
        return { success: false, error: "Hubo un error al eliminar el código." };
    }
}

