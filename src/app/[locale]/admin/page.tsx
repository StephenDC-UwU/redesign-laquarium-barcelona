import { getDictionary } from "@/dictionaries";
import AdminClient from "./AdminClient";

interface AdminPageProps {
    params: Promise<{ locale: string }>;
}

export default async function AdminPage({ params }: AdminPageProps) {
    const { locale } = await params;
    const dict = await getDictionary(locale);

    return <AdminClient localeStr={locale} dict={dict} />;
}
