"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Dictionary } from "@/dictionaries";

export default function MobileMenu({ dict }: { dict: Dictionary }) {
    const [isOpen, setIsOpen] = useState(false);
    const header = dict.header;

    const links = [
        { label: header.header_nav_visite, href: "/" },
        { label: header.header_nav_nosotros, href: "/" },
        { label: header.header_nav_exhibicion, href: "/" },
        { label: header.header_nav_educacion, href: "/" },
        { label: header.header_nav_noticias, href: "/" },
        { label: header.header_nav_blog, href: "/" },
    ];

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; }
    }, [isOpen]);

    return (
        <div className="xl:hidden z-50 flex items-center">
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-white dark:text-black hover:text-primary transition-colors cursor-pointer"
                aria-label="Menu"
            >
                <Menu className="w-8 h-8" />
            </button>

            {/* Fullscreen Overlay Menu */}
            {isOpen && (
                <div className="fixed inset-0 bg-secondary/95 dark:bg-slate-900/95 backdrop-blur-md z-[100] flex flex-col animate-in fade-in zoom-in-95 duration-300 text-white font-shadows overflow-y-auto">

                    {/* Header of mobile menu */}
                    <div className="flex justify-between items-center p-6 border-b border-white/10">
                        <span className="text-3xl font-outfit font-bold">L'Aquarium</span>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:text-primary transition-colors cursor-pointer bg-white/10 rounded-full"
                        >
                            <X className="w-8 h-8" />
                        </button>
                    </div>

                    {/* Links */}
                    <ul className="flex flex-col gap-6 text-4xl p-10 mt-4">
                        {links.map((link, idx) => (
                            <li key={idx} className="animate-in slide-in-from-left-8 fade-in duration-500" style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}>
                                <Link
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="hover:text-primary transition-colors block py-2 border-b border-white/5"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
