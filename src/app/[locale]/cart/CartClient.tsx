"use client";

import { useCart } from "@/context/CartContext";
import { createStripeSessionAction, getOrderByIdAction, checkCapacityAction } from "@/actions/cartActions";
import { useState, useTransition, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Trash2, Plus, Minus, CreditCard, ShoppingBag, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Dictionary } from "@/dictionaries";

interface CartClientProps {
    dict: Dictionary;
}

export default function CartClient({ dict }: CartClientProps) {
    const { cart, updateQuantity, removeFromCart, clearCart, totalAmount, itemCount } = useCart();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [visitDate, setVisitDate] = useState("");
    const [visitTime, setVisitTime] = useState("");
    const [capacityData, setCapacityData] = useState<{ capacity: number; occupied: Record<string, number> } | null>(null);
    const [loadingCapacity, setLoadingCapacity] = useState(false);
    const [successOrder, setSuccessOrder] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [isPending, startTransition] = useTransition();
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const locale = params?.locale || "es";

    // Custom calendar helper states
    const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());

    const monthNames = dict.admin.orders.months.map(m => m.charAt(0).toUpperCase() + m.slice(1));
    const dayNames = dict.admin.orders.days;

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Align with Monday as index 0
    };

    const handlePrevMonth = () => {
        const today = new Date();
        const minMonth = today.getMonth();
        const minYear = today.getFullYear();
        if (currentYear === minYear && currentMonth === minMonth) return;

        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(prev => prev - 1);
        } else {
            setCurrentMonth(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(prev => prev + 1);
        } else {
            setCurrentMonth(prev => prev + 1);
        }
    };

    // Track if cart has been cleared on success
    const clearedRef = useRef(false);

    // Obtener la fecha mínima (hoy) para el selector de fecha
    const getMinDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Consultar aforo cuando cambia la fecha o la cantidad de ítems
    useEffect(() => {
        if (!visitDate) {
            setCapacityData(null);
            return;
        }
        setLoadingCapacity(true);
        checkCapacityAction(visitDate)
            .then((data) => {
                setCapacityData(data);
                setLoadingCapacity(false);
                // Si la hora previamente seleccionada ya no tiene aforo, limpiarla
                if (visitTime) {
                    const maxCapacity = data.capacity;
                    const currentBooked = data.occupied[visitTime] || 0;
                    if (currentBooked + itemCount > maxCapacity) {
                        setVisitTime("");
                    }
                }
            })
            .catch((err) => {
                console.error("Error al verificar aforo:", err);
                setLoadingCapacity(false);
            });
    }, [visitDate, itemCount, visitTime]);

    // Check if redirected from Stripe after success
    useEffect(() => {
        const isSuccess = searchParams.get("success") === "true";
        const orderId = searchParams.get("orderId");

        if (isSuccess && orderId) {
            startTransition(async () => {
                const order = await getOrderByIdAction(orderId);
                if (order) {
                    setSuccessOrder(order);
                    if (!clearedRef.current) {
                        clearCart();
                        clearedRef.current = true;
                    }
                }
            });
        }
    }, [searchParams, clearCart]);

    const handleCheckout = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        if (!fullName.trim() || !email.trim()) {
            setErrorMsg(dict.cart.error_fill_fields);
            return;
        }

        if (!visitDate || !visitTime) {
            setErrorMsg(dict.cart.error_select_date_time);
            return;
        }

        const itemsPayload = cart.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
        }));

        startTransition(async () => {
            const res = await createStripeSessionAction({
                email,
                fullName,
                items: itemsPayload,
                total: totalAmount,
                visitDate,
                visitTime,
            }, locale as string);

            if (res.success && res.url) {
                // Redirect to Stripe checkout page
                window.location.href = res.url;
            } else {
                setErrorMsg(res.error || dict.cart.error_payment_init);
            }
        });
    };


    if (successOrder) {
        return (
            <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-background px-4">
                <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl text-center animate-in fade-in-50 zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                        <CheckCircle className="w-12 h-12 stroke-[2]" />
                    </div>
                    <h1 className="text-3xl font-bold font-outfit text-secondary dark:text-white mb-2">
                        {dict.cart.purchase_completed}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 font-switzer text-sm">
                        {dict.cart.order_registered_details}
                    </p>
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl mb-6 text-left font-switzer text-sm border border-slate-100 dark:border-slate-900">
                        <div className="flex justify-between mb-2">
                            <span className="text-slate-500 font-medium">{dict.cart.order_id}:</span>
                            <span className="font-bold text-secondary dark:text-white font-mono">{successOrder.id}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="text-slate-500 font-medium">{dict.cart.client}:</span>
                            <span className="font-bold text-secondary dark:text-white">{successOrder.fullName}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="text-slate-500 font-medium">{dict.cart.email}:</span>
                            <span className="text-secondary dark:text-white">{successOrder.email}</span>
                        </div>
                        {successOrder.visitDate && (
                            <div className="flex justify-between mb-2">
                                <span className="text-slate-500 font-medium">{dict.cart.visit_date}:</span>
                                <span className="font-bold text-secondary dark:text-white">{successOrder.visitDate}</span>
                            </div>
                        )}
                        {successOrder.visitTime && (
                            <div className="flex justify-between mb-2">
                                <span className="text-slate-500 font-medium">{dict.cart.visit_time}:</span>
                                <span className="font-bold text-secondary dark:text-white">{successOrder.visitTime}</span>
                            </div>
                        )}
                        <div className="border-t border-slate-200 dark:border-slate-800 my-2 pt-2 flex justify-between font-bold text-base">
                            <span className="text-slate-500">{dict.cart.total}:</span>
                            <span className="text-primary">{successOrder.total.toFixed(2)}€</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <Link
                            href={`/${locale}/profile`}
                            className="w-full bg-secondary dark:bg-white text-white dark:text-black py-4 rounded-full font-bold font-outfit hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                        >
                            {dict.cart.view_orders}
                        </Link>
                        <Link
                            href={`/${locale}`}
                            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-4 rounded-full font-bold font-outfit hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <ArrowLeft size={16} /> {dict.cart.back_to_home}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 bg-background text-foreground px-4 md:px-8 xl:px-24">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href={`/${locale}`}
                        className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-primary hover:text-white transition-all cursor-pointer"
                        aria-label={dict.cart.back_to_home}
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold font-outfit text-secondary dark:text-white">
                        {dict.cart.your_cart}
                    </h1>
                </div>

                {cart.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 rounded-3xl p-8 shadow-xl">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                            <ShoppingBag className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold font-outfit mb-2 text-slate-800 dark:text-slate-200">
                            {dict.cart.cart_empty}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 font-switzer max-w-sm mx-auto">
                            {dict.cart.cart_empty_desc}
                        </p>
                        <Link
                            href={`/${locale}/tickets`}
                            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-white font-bold font-outfit px-8 py-4 rounded-full transition-all shadow-lg shadow-primary/20 cursor-pointer"
                        >
                            {dict.cart.explore_tickets}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* List Column */}
                        <div className="lg:col-span-2 space-y-4">
                            {cart.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold font-outfit text-secondary dark:text-white">
                                            {item.name}
                                        </h3>
                                        <p className="text-slate-500 dark:text-slate-400 font-switzer text-sm mt-1 max-w-md">
                                            {item.description || dict.cart.default_product_desc}
                                        </p>
                                        <div className="text-primary font-bold font-outfit text-lg mt-3">
                                            {item.price.toFixed(2)}€ / c.u.
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0">
                                        {/* Quantity Selector */}
                                        <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-full p-1">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                                                aria-label="Disminuir cantidad"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="font-bold font-switzer text-slate-800 dark:text-slate-200 px-1 w-6 text-center">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                                                aria-label="Aumentar cantidad"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="font-bold font-outfit text-xl text-secondary dark:text-white w-20 text-right">
                                                {(item.price * item.quantity).toFixed(2)}€
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                                                aria-label="Eliminar entrada"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="flex justify-between items-center pt-2">
                                <button
                                    onClick={clearCart}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium font-switzer text-sm underline cursor-pointer"
                                >
                                    {dict.cart.clear_cart}
                                </button>
                            </div>
                        </div>

                        {/* Summary / Form Column */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
                            <h2 className="text-2xl font-bold font-outfit text-secondary dark:text-white">
                                {dict.cart.purchase_summary}
                            </h2>

                            <div className="space-y-3 font-switzer text-sm border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div className="flex justify-between text-slate-500">
                                    <span>{dict.cart.total_tickets}</span>
                                    <span>{itemCount}</span>
                                </div>
                                <div className="flex justify-between text-slate-500">
                                    <span>{dict.cart.subtotal}</span>
                                    <span>{totalAmount.toFixed(2)}€</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg text-secondary dark:text-white pt-2">
                                    <span>{dict.cart.total_to_pay}</span>
                                    <span className="text-primary">{totalAmount.toFixed(2)}€</span>
                                </div>
                            </div>

                            {/* Checkout Form */}
                            <form onSubmit={handleCheckout} className="space-y-4">
                                <h3 className="text-base font-bold font-outfit text-secondary dark:text-white">
                                    {dict.cart.contact_details}
                                </h3>

                                <div className="space-y-1">
                                    <label htmlFor="fullName" className="text-xs font-semibold text-slate-500 block">
                                        {dict.cart.full_name}
                                    </label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Ej: Stephen Strange"
                                        disabled={isPending}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground disabled:opacity-50"
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label htmlFor="email" className="text-xs font-semibold text-slate-500 block">
                                        {dict.cart.email}
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Ej: stephen@aquarium.com"
                                        disabled={isPending}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground disabled:opacity-50"
                                        required
                                    />
                                </div>

                                <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <h3 className="text-base font-bold font-outfit text-secondary dark:text-white">
                                        {dict.cart.date_time_visit}
                                    </h3>

                                    <div className="space-y-3">
                                        <label className="text-xs font-semibold text-slate-500 block">
                                            {dict.cart.select_date}
                                        </label>

                                        {/* Custom Calendar Card */}
                                        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50 dark:bg-slate-950 font-switzer">
                                            {/* Header */}
                                            <div className="flex justify-between items-center mb-4">
                                                <button
                                                    type="button"
                                                    onClick={handlePrevMonth}
                                                    className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer disabled:opacity-30"
                                                    disabled={currentYear === new Date().getFullYear() && currentMonth === new Date().getMonth()}
                                                >
                                                    ←
                                                </button>
                                                <span className="font-bold text-sm text-secondary dark:text-white capitalize">
                                                    {monthNames[currentMonth]} {currentYear}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={handleNextMonth}
                                                    className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
                                                >
                                                    →
                                                </button>
                                            </div>

                                            {/* Weekday Labels */}
                                            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
                                                {dayNames.map((d) => (
                                                    <div key={d}>{d}</div>
                                                ))}
                                            </div>

                                            {/* Days Grid */}
                                            <div className="grid grid-cols-7 gap-1">
                                                {/* Offset Empty Cells */}
                                                {Array.from({ length: getFirstDayOfMonth(currentYear, currentMonth) }).map((_, i) => (
                                                    <div key={`empty-${i}`} />
                                                ))}

                                                {/* Days of Month */}
                                                {Array.from({ length: getDaysInMonth(currentYear, currentMonth) }).map((_, i) => {
                                                    const day = i + 1;
                                                    const dayStr = String(day).padStart(2, "0");
                                                    const monthStr = String(currentMonth + 1).padStart(2, "0");
                                                    const dateStr = `${currentYear}-${monthStr}-${dayStr}`;
                                                    const isSelected = visitDate === dateStr;
                                                    const isPast = dateStr < getMinDate();

                                                    return (
                                                        <button
                                                            key={day}
                                                            type="button"
                                                            disabled={isPast || isPending}
                                                            onClick={() => setVisitDate(dateStr)}
                                                            className={`h-9 w-9 mx-auto flex items-center justify-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${isSelected
                                                                ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                                                                : isPast
                                                                    ? "text-slate-300 dark:text-slate-700 cursor-not-allowed"
                                                                    : "text-secondary dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                                                                }`}
                                                        >
                                                            {day}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        {visitDate && (
                                            <p className="text-xs text-primary font-bold">
                                                {dict.cart.selected_date} {visitDate}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-500 block">
                                            {dict.cart.select_time}
                                        </label>

                                        {!visitDate ? (
                                            <div className="text-xs text-slate-400 p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center font-switzer">
                                                {dict.cart.select_date_first}
                                            </div>
                                        ) : loadingCapacity ? (
                                            <div className="text-xs text-slate-400 p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center font-switzer">
                                                {dict.cart.checking_capacity}
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"].map((slot) => {
                                                    const booked = capacityData?.occupied[slot] || 0;
                                                    const limit = capacityData?.capacity || 50;

                                                    // Check if slot has already passed today
                                                    const isPassed = (() => {
                                                        if (visitDate !== getMinDate()) return false;
                                                        const [slotHour] = slot.split(":").map(Number);
                                                        const currentHour = new Date().getHours();
                                                        return slotHour <= currentHour;
                                                    })();

                                                    const isFull = booked + itemCount > limit;
                                                    const isDisabled = isPassed || isFull;
                                                    const isSelected = visitTime === slot;
                                                    const available = Math.max(0, limit - booked);

                                                    return (
                                                        <button
                                                            key={slot}
                                                            type="button"
                                                            disabled={isDisabled || isPending}
                                                            onClick={() => setVisitTime(slot)}
                                                            className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center border cursor-pointer ${isSelected
                                                                ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                                                                : isDisabled
                                                                    ? "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-50"
                                                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-secondary dark:text-slate-300 hover:border-primary hover:text-primary"
                                                                }`}
                                                        >
                                                            <span className="text-sm font-bold font-outfit">{slot}</span>
                                                            <span className="text-[9px] opacity-80 mt-0.5">
                                                                {isPassed
                                                                    ? dict.cart.passed
                                                                    : isFull
                                                                        ? dict.cart.sold_out
                                                                        : `${available} ${dict.cart.spots}`
                                                                }
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {errorMsg && (
                                    <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 font-switzer text-xs">
                                        {errorMsg}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full bg-primary hover:bg-primary-light disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold font-outfit py-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/10 disabled:shadow-none"
                                >
                                    <CreditCard size={18} />
                                    {isPending ? dict.cart.processing_purchase : dict.cart.checkout_and_pay}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
