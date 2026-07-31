import { getDictionary } from "@/dictionaries";
import { Locale } from "@/types/Locale";
import { Metadata } from "next";
import TicketsClient from "./TicketsClient";
import { getAvailableProductsAction } from "@/actions/cartActions";

interface TicketsPageProps {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: TicketsPageProps): Promise<Metadata> {
    const { locale } = await params;
    const currentLocale = locale as Locale;
    const dict = await getDictionary(currentLocale);
    
    return {
        title: `${dict.nav.nav_tickets || "Entradas"} | L'Aquàrium Barcelona`,
        description: "Compra tus entradas oficiales en línea para L'Aquàrium Barcelona. Elige tu pase, reserva tu fecha y disfruta de una experiencia inolvidable.",
    };
}

export default async function TicketsPage({ params }: TicketsPageProps) {
    const { locale } = await params;
    const currentLocale = locale as Locale;
    const products = await getAvailableProductsAction(currentLocale);
    const dict = await getDictionary(currentLocale);

    return <TicketsClient initialProducts={products} dict={dict} />;
}
