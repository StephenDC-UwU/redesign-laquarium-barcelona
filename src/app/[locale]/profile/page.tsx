import { getDictionary } from "@/dictionaries";
import { Locale } from "@/types/Locale";
import { Metadata } from "next";
import ProfileClient from "./ProfileClient";

interface ProfilePageProps {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
    const { locale } = await params;
    const currentLocale = locale as Locale;
    const dict = await getDictionary(currentLocale);
    
    return {
        title: `Mi Perfil | L'Aquàrium Barcelona`,
        description: "Accede a tu perfil de L'Aquàrium Barcelona, gestiona tus datos personales y revisa tus compras y descargas de entradas.",
    };
}

export default async function ProfilePage() {
    return <ProfileClient />;
}
