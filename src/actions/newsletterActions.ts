"use server";

import { db } from "@/lib/db";

export async function subscribeToNewsletterAction(email: string): Promise<{ success: boolean; error?: string }> {
    try {
        if (!email || !email.includes("@")) {
            return { success: false, error: "Por favor, introduce un correo electrónico válido." };
        }

        // Check if subscriber already exists
        const existing = await db.newsletterSubscriber.findUnique({
            where: { email: email.toLowerCase().trim() }
        });

        if (existing) {
            return { success: false, error: "Este correo ya está suscrito a la newsletter." };
        }

        // Create new subscriber
        await db.newsletterSubscriber.create({
            data: {
                email: email.toLowerCase().trim()
            }
        });

        return { success: true };
    } catch (error: any) {
        console.error("Error subscribing to newsletter:", error);
        return { success: false, error: "Hubo un error al procesar tu suscripción. Inténtalo de nuevo más tarde." };
    }
}
