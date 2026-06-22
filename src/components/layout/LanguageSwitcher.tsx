"use client"

import { Locale, locales } from '@/types/Locale'
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect, useTransition } from 'react';
import { ChevronDown } from 'lucide-react';

function LanguageSwitcher({ currentLocal }: { currentLocal: Locale }) {
    const router = useRouter();
    const [isPending, setIsPending] = useTransition();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const changeLocale = (newLocale: Locale) => {
        if (newLocale === currentLocal) {
            setIsOpen(false);
            return;
        }
        const path = window.location.pathname.replace(/^\/[a-z]{2}/, `/${newLocale}`);
        setIsPending(() => router.push(path));
        setIsOpen(false);
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block text-left font-outfit" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center gap-x-1.5 cursor-pointer lg:text-2xl"
            >
                {currentLocal.toUpperCase()}
                <ChevronDown aria-hidden="true" className={`size-6 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 z-[100] mt-2 w-24 origin-top-right rounded-md bg-white shadow-lg outline-1 outline-black/5 animate-in fade-in zoom-in-95 duration-100">
                    <div className="py-1">
                        {locales.map((locale) => (
                            <button
                                key={locale}
                                onClick={() => changeLocale(locale)}
                                className={`block w-full text-left px-4 py-2 text-sm cursor-pointer transition-colors hover:bg-gray-100 ${locale === currentLocal ? 'bg-gray-50 text-primary font-bold' : 'text-gray-700'}`}
                            >
                                {locale.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default LanguageSwitcher;