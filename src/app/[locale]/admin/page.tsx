"use client";

import { useParams } from "next/navigation";
import AdminClient from "./AdminClient";

export default function AdminPage() {
    const params = useParams();
    const localeStr = Array.isArray(params?.locale)
        ? params.locale[0]
        : params?.locale || "es";

    return <AdminClient localeStr={localeStr} />;
}
