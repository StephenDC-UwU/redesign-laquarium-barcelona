import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    let body = "";
    try {
        body = await req.text();
    } catch (e) {
        return NextResponse.json({ error: "No body provided" }, { status: 400 });
    }

    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
        return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET || ""
        );
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the event
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as any;
        const orderId = session.metadata?.orderId;

        if (orderId) {
            try {
                // Update order in database to "paid"
                await db.order.update({
                    where: { id: orderId },
                    data: { status: "paid" },
                });
                console.log(`Order ${orderId} successfully marked as paid.`);
            } catch (dbError) {
                console.error(`Failed to update order ${orderId} in database:`, dbError);
                return NextResponse.json({ error: "Database update failed" }, { status: 500 });
            }
        } else {
            console.warn("No orderId found in Stripe session metadata.");
        }
    }

    return NextResponse.json({ received: true }, { status: 200 });
}
