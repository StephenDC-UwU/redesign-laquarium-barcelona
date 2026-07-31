"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { getAvailableProductsAction, LocalizedProduct } from "@/actions/cartActions";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Check } from "lucide-react";
import { Dictionary } from "@/dictionaries";

interface TicketsClientProps {
    initialProducts?: LocalizedProduct[];
    dict: Dictionary;
}

export default function TicketsClient({ initialProducts = [], dict }: TicketsClientProps) {
    const { addToCart, applyPromoCode, promoCode: appliedPromoCode } = useCart();
    const params = useParams();
    const locale = params?.locale || "es";
    const localeStr = Array.isArray(locale) ? locale[0] : locale;
    const [products, setProducts] = useState<LocalizedProduct[]>(initialProducts);
    const [loading, setLoading] = useState(initialProducts.length === 0);
    const [promoCodeInput, setPromoCodeInput] = useState(appliedPromoCode || "");
    const [promoError, setPromoError] = useState("");
    const [addedIds, setAddedIds] = useState<string[]>([]);

    useEffect(() => {
        if (initialProducts.length > 0) return;
        const fetchProducts = async () => {
            try {
                const fetched = await getAvailableProductsAction(localeStr);
                setProducts(fetched);
            } catch (e) {
                console.error("Error fetching tickets:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [localeStr, initialProducts]);

    const handleAddToCart = (product: LocalizedProduct) => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            description: product.description,
        });

        // Trigger visual feedback
        setAddedIds((prev) => [...prev, product.id]);
        setTimeout(() => {
            setAddedIds((prev) => prev.filter((id) => id !== product.id));
        }, 1500);
    };

    const handleApplyPromo = async (e: React.FormEvent) => {
        e.preventDefault();
        setPromoError("");
        if (promoCodeInput.trim()) {
            const res = await applyPromoCode(promoCodeInput);
            if (!res.success) {
                setPromoError(res.error || dict.tickets.promo_error);
            }
        }
    };

    return (
        <div className="min-h-screen pt-40 pb-20 bg-white dark:bg-slate-950 text-slate-900 dark:text-white px-4 md:px-8 xl:px-24">
            <div className="max-w-6xl mx-auto">

                {/* Header & Promo Code Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-16">
                    <div>
                        <h1 className="text-5xl md:text-6xl font-bold font-outfit text-slate-900 dark:text-white">
                            {dict.tickets.buy_tickets}
                        </h1>
                    </div>

                    <div className="flex flex-col gap-1 max-w-sm w-full">
                        <form onSubmit={handleApplyPromo} className="flex items-center w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-none overflow-hidden">
                            <input
                                type="text"
                                placeholder={dict.tickets.promo_placeholder}
                                value={promoCodeInput}
                                onChange={(e) => setPromoCodeInput(e.target.value)}
                                className="flex-1 px-4 py-2 focus:outline-none text-sm text-slate-900 dark:text-white bg-transparent"
                            />
                            <button
                                type="submit"
                                className="bg-[#00c0a5] hover:bg-[#00a890] text-white font-bold px-6 py-2.5 text-xs uppercase tracking-wider transition-colors cursor-pointer"
                            >
                                {appliedPromoCode ? dict.tickets.applied : dict.tickets.apply}
                            </button>
                        </form>
                        {promoError && (
                            <p className="text-red-500 text-xs font-semibold mt-1 font-switzer">{promoError}</p>
                        )}
                        {appliedPromoCode && !promoError && (
                            <p className="text-green-600 dark:text-green-400 text-xs font-semibold mt-1 font-switzer">{dict.tickets.promo_success}</p>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="font-switzer text-slate-500">{dict.tickets.loading_catalog}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map((product, index) => {
                            const isAdded = addedIds.includes(product.id);
                            // Highlight the first card as top sales
                            const showTopSalesBadge = index === 0;

                            return (
                                <div
                                    key={product.id}
                                    className={`bg-white dark:bg-slate-900 border ${showTopSalesBadge
                                        ? "border-[#00c0a5]"
                                        : "border-slate-200 dark:border-slate-800"
                                        } rounded-none shadow-sm hover:shadow-lg transition-all duration-300
                                        h-[480px]
                                        flex flex-col`}
                                >
                                    {/* Top Sales Badge */}
                                    {showTopSalesBadge && (
                                        <div className="bg-[#00c0a5] text-white text-center py-2 font-bold font-outfit text-xs uppercase tracking-widest">
                                            {dict.tickets.top_sales}
                                        </div>
                                    )}

                                    {/* Image Section */}
                                    <div className="relative h-full w-full bg-slate-100 overflow-hidden">
                                        <Image
                                            src="/promotions/shark.png"
                                            alt={product.name}
                                            fill
                                            priority={index < 3}
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-6 flex flex-col ">
                                        <h3 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white mb-2 leading-tight">
                                            {product.name}
                                        </h3>
                                        <p className="text-slate-500 dark:text-slate-400 font-switzer text-sm mb-4 line-clamp-3 flex-1">
                                            {product.description || dict.tickets.default_desc}
                                        </p>

                                        <div className="font-bold font-outfit text-lg text-slate-950 dark:text-white mb-4">
                                            {dict.tickets.from_price} {product.price.toFixed(2)}€
                                        </div>

                                        <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mb-4 flex justify-center">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    alert(dict.tickets.recommendations_text)
                                                }
                                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors text-[11px] font-medium font-switzer flex items-center gap-1.5 cursor-pointer"
                                            >
                                                {dict.tickets.recommendations_title}
                                                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-slate-400 text-[10px] font-bold">i</span>
                                            </button>
                                        </div>

                                        <div className="flex justify-center mt-2">
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                className={`px-8 py-3 rounded-none text-sm font-bold font-outfit text-white transition-all flex items-center gap-2 cursor-pointer shadow-md ${isAdded
                                                    ? "bg-green-600 hover:bg-green-700"
                                                    : "bg-[#00c0a5] hover:bg-[#00a890]"
                                                    }`}
                                            >
                                                {isAdded ? (
                                                    <>
                                                        <Check size={16} /> {dict.tickets.added}
                                                    </>
                                                ) : (
                                                    <>
                                                        {dict.tickets.buy} <span className="text-base">→</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
