import { getDictionary } from "@/dictionaries";
import { Locale } from "@/types/Locale";
import { Metadata } from "next";
import CartClient from "./CartClient";

interface CartPageProps {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: CartPageProps): Promise<Metadata> {
    const { locale } = await params;
    const currentLocale = locale as Locale;
    const dict = await getDictionary(currentLocale);
    
    return {
        title: `${dict.nav.nav_tickets || "Entradas"} - Carrito | L'Aquàrium Barcelona`,
        description: "Revisa tu selección de entradas para L'Aquàrium Barcelona, introduce tus datos y completa tu pago de forma segura.",
    };
}

export default async function CartPage() {
    return <CartClient />;
}
