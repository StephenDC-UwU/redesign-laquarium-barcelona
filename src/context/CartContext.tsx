"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { validatePromoCodeAction } from "@/actions/cartActions";

export interface CartItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
    description?: string;
}

export interface CartContextType {
    cart: CartItem[];
    addToCart: (item: Omit<CartItem, "quantity">) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    itemCount: number;
    totalAmount: number;
    promoCode: string;
    discountPercentage: number;
    discountAmount: number;
    finalAmount: number;
    applyPromoCode: (code: string) => Promise<{ success: boolean; error?: string }>;
    removePromoCode: () => void;
}

export const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [mounted, setMounted] = useState(false);
    const [promoCode, setPromoCode] = useState("");
    const [discountPercentage, setDiscountPercentage] = useState(0);

    // Load initial cart state on client mount to prevent SSR hydration mismatch
    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem("aquarium_cart");
        if (stored) {
            try {
                setCart(JSON.parse(stored));
            } catch (e) {
                console.error("Error parsing cart storage:", e);
            }
        } else {
            // Seed a mock item if the cart is empty to show user something on first load
            const mockCart: CartItem[] = [
                { id: "tkt-001", name: "Entrada General Acuario", quantity: 2, price: 25.00, description: "Acceso ilimitado al acuario principal y exhibiciones temporales." }
            ];
            setCart(mockCart);
            localStorage.setItem("aquarium_cart", JSON.stringify(mockCart));
        }

        const storedPromo = localStorage.getItem("aquarium_promo_code");
        if (storedPromo) {
            setPromoCode(storedPromo);
        }
        const storedDiscount = localStorage.getItem("aquarium_promo_discount");
        if (storedDiscount) {
            setDiscountPercentage(parseFloat(storedDiscount));
        }
    }, []);

    // Save cart whenever it changes
    useEffect(() => {
        if (mounted) {
            localStorage.setItem("aquarium_cart", JSON.stringify(cart));
            localStorage.setItem("aquarium_promo_code", promoCode);
            localStorage.setItem("aquarium_promo_discount", discountPercentage.toString());
            // Trigger storage event manually for same-tab updates if needed
            window.dispatchEvent(new Event("storage"));
        }
    }, [cart, promoCode, discountPercentage, mounted]);

    const addToCart = (newItem: Omit<CartItem, "quantity">) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === newItem.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...newItem, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId: string) => {
        setCart((prev) => prev.filter((item) => item.id !== itemId));
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }
        setCart((prev) =>
            prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
        );
    };

    const applyPromoCode = async (code: string) => {
        const res = await validatePromoCodeAction(code);
        if (res.success && res.discount !== undefined) {
            setPromoCode(code.toUpperCase().trim());
            setDiscountPercentage(res.discount);
            return { success: true };
        } else {
            return { success: false, error: res.error || "Código promocional no válido" };
        }
    };

    const removePromoCode = () => {
        setPromoCode("");
        setDiscountPercentage(0);
    };

    const clearCart = () => {
        setCart([]);
        removePromoCode();
    };

    const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const totalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const discountAmount = totalAmount * (discountPercentage / 100);
    const finalAmount = Math.max(0, totalAmount - discountAmount);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                itemCount,
                totalAmount,
                promoCode,
                discountPercentage,
                discountAmount,
                finalAmount,
                applyPromoCode,
                removePromoCode,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};
