"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Product, Order } from "@prisma/client";

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

export async function createProductAction(product: {
    name: string;
    price: number;
    description: string;
    tag?: string;
}): Promise<{ success: boolean; product?: Product; error?: string }> {
    try {
        if (!product.name || product.price <= 0) {
            return { success: false, error: "El nombre y un precio válido son requeridos." };
        }
        const newProduct = await db.product.create({
            data: {
                name: product.name,
                price: product.price,
                description: product.description,
                tag: product.tag || null,
            },
        });
        revalidatePath("/[locale]", "layout");
        return { success: true, product: newProduct };
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
