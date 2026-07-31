"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Order } from "@prisma/client";

export interface LocalizedProduct {
    id: string;
    price: number;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string;
    tag: string | null;
}

export async function getAvailableProductsAction(locale: string = "es"): Promise<LocalizedProduct[]> {
    try {
        const products = await db.product.findMany({
            include: {
                translations: {
                    where: { locale }
                }
            }
        });
        return products.map(prod => ({
            id: prod.id,
            price: prod.price,
            image: prod.image,
            createdAt: prod.createdAt,
            updatedAt: prod.updatedAt,
            name: prod.translations[0]?.name || "",
            description: prod.translations[0]?.description || "",
            tag: prod.translations[0]?.tag || null,
        }));
    } catch (e) {
        console.error("Error in getAvailableProductsAction:", e);
        return [];
    }
}

export async function createOrderAction(formData: {
    email: string;
    fullName: string;
    items: {
        id: string;
        name: string;
        quantity: number;
        price: number;
    }[];
    total: number;
    visitDate: string;
    visitTime: string;
    promoCode?: string;
    discountApplied?: number;
}): Promise<{ success: boolean; order?: Order; error?: string }> {
    try {
        if (!formData.email || !formData.fullName || !formData.visitDate || !formData.visitTime) {
            return { success: false, error: "El email, nombre completo, fecha y hora de visita son obligatorios." };
        }
        if (formData.items.length === 0) {
            return { success: false, error: "El carrito está vacío." };
        }

        // 1. Obtener capacidad máxima de aforo por hora para la fecha de visita
        const dateSpecificCapacityKey = `capacity_${formData.visitDate}`;
        const dateSpecificCapacitySetting = await db.systemSetting.findUnique({
            where: { key: dateSpecificCapacityKey }
        });
        
        let maxCapacity = 50;
        if (dateSpecificCapacitySetting) {
            maxCapacity = parseInt(dateSpecificCapacitySetting.value, 10);
        } else {
            const capacitySetting = await db.systemSetting.findUnique({
                where: { key: "hourlyCapacity" }
            });
            maxCapacity = capacitySetting ? parseInt(capacitySetting.value, 10) : 50;
        }

        // 2. Sumar cantidad de personas reservadas en esa fecha y hora (órdenes pagadas o completadas)
        const existingOrders = await db.order.findMany({
            where: {
                visitDate: formData.visitDate,
                visitTime: formData.visitTime,
                status: { in: ["paid", "completed"] }
            }
        });

        let currentBooked = 0;
        for (const order of existingOrders) {
            const items = order.items as any[];
            if (Array.isArray(items)) {
                for (const item of items) {
                    currentBooked += item.quantity || 0;
                }
            }
        }

        // 3. Calcular cantidad del nuevo pedido
        const newItemsCount = formData.items.reduce((sum, item) => sum + item.quantity, 0);

        if (currentBooked + newItemsCount > maxCapacity) {
            const plazasDisponibles = Math.max(0, maxCapacity - currentBooked);
            return {
                success: false,
                error: `Aforo completo para las ${formData.visitTime} el día ${formData.visitDate}. Solo quedan ${plazasDisponibles} plazas disponibles.`
            };
        }

        if (formData.promoCode) {
            const promoRes = await validatePromoCodeAction(formData.promoCode);
            if (!promoRes.success) {
                return { success: false, error: promoRes.error || "El código promocional ya no es válido." };
            }
        }

        const newOrder = await db.order.create({
            data: {
                email: formData.email,
                fullName: formData.fullName,
                total: formData.total,
                items: formData.items as any, // Cast as Prisma JsonValue
                visitDate: formData.visitDate,
                visitTime: formData.visitTime,
                status: "pending",
                promoCode: formData.promoCode || null,
                discountApplied: formData.discountApplied || null,
            }
        });
        
        // Revalidate the admin paths so they see the new order instantly
        revalidatePath("/[locale]/admin", "layout");
        
        return { success: true, order: newOrder };
    } catch (e) {
        console.error("Error in createOrderAction:", e);
        return { success: false, error: "Hubo un error al procesar tu pedido." };
    }
}

import { stripe } from "@/lib/stripe";

export async function createStripeSessionAction(
    formData: {
        email: string;
        fullName: string;
        items: {
            id: string;
            name: string;
            quantity: number;
            price: number;
        }[];
        total: number;
        visitDate: string;
        visitTime: string;
        promoCode?: string;
        discountApplied?: number;
        discountPercentage?: number;
    },
    locale: string
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        // 1. Create the pending order first in the database
        const orderRes = await createOrderAction({
            email: formData.email,
            fullName: formData.fullName,
            items: formData.items,
            total: formData.total,
            visitDate: formData.visitDate,
            visitTime: formData.visitTime,
            promoCode: formData.promoCode,
            discountApplied: formData.discountApplied,
        });
        if (!orderRes.success || !orderRes.order) {
            return { success: false, error: orderRes.error || "No se pudo registrar la orden." };
        }

        const order = orderRes.order;
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        // 2. Prepare line items for Stripe (converting price to cents and applying percentage discount)
        const discountPercentage = formData.discountPercentage || 0;
        const lineItems = formData.items.map((item) => {
            const discountedPrice = item.price * (1 - discountPercentage / 100);
            return {
                price_data: {
                    currency: "eur",
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: Math.round(discountedPrice * 100),
                },
                quantity: item.quantity,
            };
        });

        // 3. Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            customer_email: formData.email,
            success_url: `${appUrl}/${locale}/cart?success=true&orderId=${order.id}`,
            cancel_url: `${appUrl}/${locale}/cart?canceled=true`,
            metadata: {
                orderId: order.id,
            },
        });

        if (!session.url) {
            return { success: false, error: "No se pudo generar la sesión de pago de Stripe." };
        }

        return { success: true, url: session.url };
    } catch (e) {
        console.error("Error in createStripeSessionAction:", e);
        return { success: false, error: "Error al iniciar el pago con Stripe." };
    }
}

export async function validatePromoCodeAction(code: string): Promise<{ success: boolean; discount?: number; error?: string }> {
    try {
        if (!code || !code.trim()) {
            return { success: false, error: "El código no puede estar vacío." };
        }
        const promo = await db.promoCode.findUnique({
            where: { code: code.toUpperCase().trim() }
        });
        if (!promo) {
            return { success: false, error: "Código promocional no válido." };
        }
        if (!promo.isActive) {
            return { success: false, error: "El código promocional está inactivo." };
        }
        if (promo.maxUses !== null && promo.uses >= promo.maxUses) {
            return { success: false, error: "El código promocional ha agotado su límite de usos." };
        }
        if (promo.expiresAt !== null && new Date() > new Date(promo.expiresAt)) {
            return { success: false, error: "El código promocional ha expirado." };
        }
        return { success: true, discount: promo.discount };
    } catch (e) {
        console.error("Error in validatePromoCodeAction:", e);
        return { success: false, error: "Error al validar el código promocional." };
    }
}

export async function getOrderByIdAction(id: string): Promise<Order | null> {
    try {
        return await db.order.findUnique({
            where: { id },
        });
    } catch (e) {
        console.error("Error in getOrderByIdAction:", e);
        return null;
    }
}

export async function getUserOrdersAction(email: string): Promise<Order[]> {
    try {
        if (!email) return [];
        return await db.order.findMany({
            where: { email: email.toLowerCase() },
            orderBy: { createdAt: "desc" },
        });
    } catch (e) {
        console.error("Error in getUserOrdersAction:", e);
        return [];
    }
}

export async function checkCapacityAction(date: string): Promise<{
    capacity: number;
    occupied: Record<string, number>;
}> {
    try {
        const dateSpecificCapacityKey = `capacity_${date}`;
        const dateSpecificCapacitySetting = await db.systemSetting.findUnique({
            where: { key: dateSpecificCapacityKey }
        });
        
        let capacity = 50;
        if (dateSpecificCapacitySetting) {
            capacity = parseInt(dateSpecificCapacitySetting.value, 10);
        } else {
            const capacitySetting = await db.systemSetting.findUnique({
                where: { key: "hourlyCapacity" }
            });
            capacity = capacitySetting ? parseInt(capacitySetting.value, 10) : 50;
        }

        const orders = await db.order.findMany({
            where: {
                visitDate: date,
                status: { in: ["paid", "completed"] }
            }
        });

        const occupied: Record<string, number> = {};
        
        // Inicializar franjas horarias
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

        return { capacity, occupied };
    } catch (e) {
        console.error("Error in checkCapacityAction:", e);
        return { capacity: 50, occupied: {} };
    }
}



