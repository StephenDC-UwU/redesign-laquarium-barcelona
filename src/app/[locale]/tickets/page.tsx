"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { getAvailableProductsAction, LocalizedProduct } from "@/actions/cartActions";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Check } from "lucide-react";

export default function TicketsPage() {
    const { addToCart } = useCart();
    const params = useParams();
    const locale = params?.locale || "es";
    const localeStr = Array.isArray(locale) ? locale[0] : locale;
    const [products, setProducts] = useState<LocalizedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [promoCode, setPromoCode] = useState("");
    const [appliedPromo, setAppliedPromo] = useState(false);
    const [addedIds, setAddedIds] = useState<string[]>([]);

    useEffect(() => {
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
    }, [localeStr]);

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

    const handleApplyPromo = (e: React.FormEvent) => {
        e.preventDefault();
        if (promoCode.trim()) {
            setAppliedPromo(true);
            alert("Código promocional aplicado con éxito!");
        }
    };

    return (
        <div className="min-h-screen pt-40 pb-20 bg-white dark:bg-slate-950 text-slate-900 dark:text-white px-4 md:px-8 xl:px-24">
            <div className="max-w-6xl mx-auto">
                
                {/* Header & Promo Code Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-16">
                    <div>
                        <h1 className="text-5xl md:text-6xl font-bold font-outfit text-slate-900 dark:text-white">
                            Compra Tus Entradas
                        </h1>
                    </div>

                    <form onSubmit={handleApplyPromo} className="flex items-center max-w-sm w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-none overflow-hidden">
                        <input
                            type="text"
                            placeholder="Codigo promocional"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className="flex-1 px-4 py-2 focus:outline-none text-sm text-slate-900 dark:text-white bg-transparent"
                        />
                        <button
                            type="submit"
                            className="bg-[#00c0a5] hover:bg-[#00a890] text-white font-bold px-6 py-2.5 text-xs uppercase tracking-wider transition-colors cursor-pointer"
                        >
                            {appliedPromo ? "Aplicado" : "APLICAR"}
                        </button>
                    </form>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="font-switzer text-slate-500">Cargando catálogo de entradas...</p>
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
                                    className={`bg-white dark:bg-slate-900 border ${
                                        showTopSalesBadge
                                            ? "border-[#00c0a5]"
                                            : "border-slate-200 dark:border-slate-800"
                                    } rounded-none shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col`}
                                >
                                    {/* Top Sales Badge */}
                                    {showTopSalesBadge && (
                                        <div className="bg-[#00c0a5] text-white text-center py-2 font-bold font-outfit text-xs uppercase tracking-widest">
                                            TOP VENTAS
                                        </div>
                                    )}

                                    {/* Image Section */}
                                    <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                                        <Image
                                            src="/promotions/shark.png"
                                            alt={product.name}
                                            fill
                                            priority={index < 3}
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-6 flex flex-col flex-1">
                                        <h3 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white mb-2 leading-tight">
                                            {product.name}
                                        </h3>
                                        <p className="text-slate-500 dark:text-slate-400 font-switzer text-sm mb-4 flex-1">
                                            {product.description || "!Tu entrada a L'Aquarium con reserva !"}
                                        </p>

                                        <div className="font-bold font-outfit text-lg text-slate-950 dark:text-white mb-4">
                                            Desde {product.price.toFixed(2)}€
                                        </div>

                                        <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mb-4 flex justify-center">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    alert("Recomendación: Traer ropa cómoda. Bases legales: Entradas no reembolsables.")
                                                }
                                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors text-[11px] font-medium font-switzer flex items-center gap-1.5 cursor-pointer"
                                            >
                                                Recomendaciones y Bases Legales
                                                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-slate-400 text-[10px] font-bold">i</span>
                                            </button>
                                        </div>

                                        <div className="flex justify-center mt-2">
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                className={`px-8 py-3 rounded-none text-sm font-bold font-outfit text-white transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                                                    isAdded
                                                        ? "bg-green-600 hover:bg-green-700"
                                                        : "bg-[#00c0a5] hover:bg-[#00a890]"
                                                }`}
                                            >
                                                {isAdded ? (
                                                    <>
                                                        <Check size={16} /> Añadido
                                                    </>
                                                ) : (
                                                    <>
                                                        Comprar <span className="text-base">→</span>
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
