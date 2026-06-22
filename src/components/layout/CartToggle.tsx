"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

interface CartItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
}

export default function CartToggle() {
    const [itemCount, setItemCount] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        // For testing purposes, let's inject a mock ticket if the cart is completely empty
        const storedCart = localStorage.getItem("aquarium_cart");
        if (!storedCart) {
            const mockCart: CartItem[] = [
                { id: "tkt-001", name: "Entrada General Acuario", quantity: 2, price: 25 },
            ];
            localStorage.setItem("aquarium_cart", JSON.stringify(mockCart));
            setItemCount(2); // We have 2 tickets in the mock cart
        } else {
            try {
                const cart: CartItem[] = JSON.parse(storedCart);
                const count = cart.reduce((total, item) => total + item.quantity, 0);
                setItemCount(count);
            } catch (e) {
                console.error("Error parsing cart", e);
            }
        }
    }, []);

    // Listen to storage events to update badge if another tab changes the cart
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "aquarium_cart" && e.newValue) {
                try {
                    const cart: CartItem[] = JSON.parse(e.newValue);
                    const count = cart.reduce((total, item) => total + item.quantity, 0);
                    setItemCount(count);
                } catch (e) {
                    console.error("Error parsing cart", e);
                }
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    // Prevent hydration mismatch by not rendering the badge until client-side is ready
    if (!mounted) return (
        <div className="p-2 opacity-50 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
        </div>
    );

    return (
        <Link href="/cart" className="relative p-2 text-white dark:text-black hover:text-primary transition-colors cursor-pointer group flex items-center justify-center">
            <ShoppingBag className="size-9 stroke-[1]  transition-transform group-hover:scale-110 duration-300" />
            {itemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[20px] h-[20px] px-1 text-[11px] font-bold text-white bg-primary border-[2px] border-secondary dark:border-background rounded-full transform translate-x-1 -translate-y-1 animate-in zoom-in">
                    {itemCount}
                </span>
            )}
        </Link>
    );
}
