"use client"

import { Locale, locales } from '@/types/Locale'
import { useRouter } from 'next/navigation';
import { startTransition, useTransition } from 'react';

function LanguageSwitcher({ currentLocal }: { currentLocal: Locale }) {

    const router = useRouter();
    const [isPending, setIsPending] = useTransition();

    const changeLocale = (newLocale: Locale) => {
        if (newLocale === currentLocal) return;
        const path = window.location.pathname.replace(/^\/[a-z]{2}/, `/${newLocale}`);
        startTransition(() => router.push(path))
    }

    return (
        <div className='flex gap-2'>
            {
                locales.map((local) => (
                    <button key={local} onClick={() => changeLocale(local)}
                        className={`px-2 py-1 rounded ${local == currentLocal ? "bg-blue-500 " : "bg-gray-500"}`}
                    >
                        {local.toUpperCase()}
                    </button>
                ))
            }
        </div>
    );
}

export default LanguageSwitcher;