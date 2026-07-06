"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Product, Order } from "@prisma/client";

export async function getAvailableProductsAction(): Promise<Product[]> {
    try {
        return await db.product.findMany();
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
}): Promise<{ success: boolean; order?: Order; error?: string }> {
    try {
        if (!formData.email || !formData.fullName) {
            return { success: false, error: "El email y el nombre completo son obligatorios." };
        }
        if (formData.items.length === 0) {
            return { success: false, error: "El carrito está vacío." };
        }

        const newOrder = await db.order.create({
            data: {
                email: formData.email,
                fullName: formData.fullName,
                total: formData.total,
                items: formData.items as any, // Cast as Prisma JsonValue
                status: "pending",
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
    },
    locale: string
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        // 1. Create the pending order first in the database
        const orderRes = await createOrderAction(formData);
        if (!orderRes.success || !orderRes.order) {
            return { success: false, error: orderRes.error || "No se pudo registrar la orden." };
        }

        const order = orderRes.order;
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        // 2. Prepare line items for Stripe (converting price to cents)
        const lineItems = formData.items.map((item) => ({
            price_data: {
                currency: "eur",
                product_data: {
                    name: item.name,
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }));

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



