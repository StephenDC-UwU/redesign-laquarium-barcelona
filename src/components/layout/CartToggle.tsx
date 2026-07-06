"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useParams } from "next/navigation";

export default function CartToggle() {
    const { itemCount } = useCart();
    const [mounted, setMounted] = useState(false);
    const params = useParams();
    const locale = params?.locale || "es";

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch by not rendering the badge until client-side is ready
    if (!mounted) return (
        <div className="p-2 opacity-50 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
        </div>
    );

    return (
        <Link href={`/${locale}/cart`} className="relative p-2 text-white dark:text-black hover:text-primary transition-colors cursor-pointer group flex items-center justify-center">
            <ShoppingBag className="size-9 stroke-[1]  transition-transform group-hover:scale-110 duration-300" />
            {itemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[20px] h-[20px] px-1 text-[11px] font-bold text-white bg-primary border-[2px] border-secondary dark:border-background rounded-full transform translate-x-1 -translate-y-1 animate-in zoom-in">
                    {itemCount}
                </span>
            )}
        </Link>
    );
}
