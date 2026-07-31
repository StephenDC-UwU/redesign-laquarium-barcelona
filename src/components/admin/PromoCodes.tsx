"use client";

import React, { useState, useEffect } from "react";
import { 
    getPromoCodesAction, 
    createPromoCodeAction, 
    togglePromoCodeAction, 
    deletePromoCodeAction 
} from "@/actions/adminActions";
import { Dictionary } from "@/dictionaries";
import { Tag, Plus, Trash2, Calendar, Check, X, RefreshCw } from "lucide-react";
import { PromoCode } from "@prisma/client";

interface PromoCodesProps {
    isAdmin: boolean;
    localeStr: string;
    dict: Dictionary;
}

export default function PromoCodes({ isAdmin, localeStr, dict }: PromoCodesProps) {
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [code, setCode] = useState("");
    const [discount, setDiscount] = useState("");
    const [maxUses, setMaxUses] = useState("");
    const [expiresAt, setExpiresAt] = useState("");
    const [formError, setFormError] = useState("");
    const [formSuccess, setFormSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const t = dict.admin.promos;

    const fetchCodes = async () => {
        if (!isAdmin) return;
        setLoading(true);
        try {
            const fetched = await getPromoCodesAction();
            setPromoCodes(fetched);
        } catch (e) {
            console.error(e);
            setFormError(t.error_fetching);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCodes();
    }, [isAdmin]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");
        setFormSuccess("");

        if (!code.trim()) {
            setFormError(t.error_empty_code);
            return;
        }

        const discountNum = parseFloat(discount);
        if (isNaN(discountNum) || discountNum <= 0 || discountNum > 100) {
            setFormError(t.error_invalid_discount);
            return;
        }

        let parsedMaxUses: number | null = null;
        if (maxUses.trim()) {
            const limit = parseInt(maxUses, 10);
            if (isNaN(limit) || limit <= 0) {
                setFormError(t.error_invalid_max_uses);
                return;
            }
            parsedMaxUses = limit;
        }

        setSubmitting(true);
        try {
            const res = await createPromoCodeAction({
                code: code.trim(),
                discount: discountNum,
                maxUses: parsedMaxUses,
                expiresAt: expiresAt.trim() || null,
            });

            if (res.success && res.promoCode) {
                setFormSuccess(t.success_create);
                setCode("");
                setDiscount("");
                setMaxUses("");
                setExpiresAt("");
                setPromoCodes((prev) => [res.promoCode!, ...prev]);
            } else {
                setFormError(res.error || t.error_create);
            }
        } catch (err) {
            console.error(err);
            setFormError(t.error_server);
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (id: string) => {
        try {
            const res = await togglePromoCodeAction(id);
            if (res.success && res.promoCode) {
                setPromoCodes((prev) =>
                    prev.map((p) => (p.id === id ? res.promoCode! : p))
                );
            } else {
                alert(res.error || t.error_status);
            }
        } catch (e) {
            console.error(e);
            alert(t.error_server);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t.confirm_delete)) return;
        try {
            const res = await deletePromoCodeAction(id);
            if (res.success) {
                setPromoCodes((prev) => prev.filter((p) => p.id !== id));
            } else {
                alert(res.error || t.error_delete);
            }
        } catch (e) {
            console.error(e);
            alert(t.error_server);
        }
    };

    const isExpired = (expiry: Date | null) => {
        if (!expiry) return false;
        return new Date() > new Date(expiry);
    };

    const isExhausted = (uses: number, maxUses: number | null) => {
        if (maxUses === null) return false;
        return uses >= maxUses;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Create Code Form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                <h3 className="text-xl font-bold font-outfit text-secondary dark:text-white flex items-center gap-2">
                    <Tag className="w-5 h-5 text-primary" />
                    {t.create_title}
                </h3>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                            {t.table_code}
                        </label>
                        <input
                            type="text"
                            placeholder={t.placeholder_code}
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-sm focus:outline-none focus:border-primary text-secondary dark:text-white font-bold uppercase placeholder:font-sans placeholder:font-normal"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                            {t.discount_label}
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            step="any"
                            placeholder={t.placeholder_discount}
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-secondary dark:text-white"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                            {t.max_uses_label}
                        </label>
                        <input
                            type="number"
                            min="1"
                            placeholder={t.max_uses_placeholder}
                            value={maxUses}
                            onChange={(e) => setMaxUses(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-secondary dark:text-white"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                            {t.expiry_label}
                        </label>
                        <input
                            type="date"
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-secondary dark:text-white"
                        />
                    </div>

                    {formError && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 font-switzer text-xs">
                            {formError}
                        </div>
                    )}
                    {formSuccess && (
                        <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-xl text-green-600 dark:text-green-400 font-switzer text-xs">
                            {formSuccess}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-[#00c0a5] hover:bg-[#00a890] disabled:bg-slate-300 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg shadow-teal-500/10"
                    >
                        {submitting ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Plus className="w-4 h-4" />
                        )}
                        {t.create_btn}
                    </button>
                </form>
            </div>

            {/* Codes List Table */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold font-outfit text-secondary dark:text-white">
                            {t.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-switzer">
                            {t.desc}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center py-20 text-slate-400">
                        <RefreshCw className="w-8 h-8 animate-spin text-primary mb-2" />
                        <span className="text-sm font-switzer">{t.loading_codes}</span>
                    </div>
                ) : promoCodes.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 p-8 font-switzer text-sm">
                        {t.no_promos}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 text-left text-xs font-bold uppercase tracking-wider text-slate-400 font-outfit">
                                    <th className="pb-3 pr-4">{t.table_code}</th>
                                    <th className="pb-3 px-4">{t.table_discount}</th>
                                    <th className="pb-3 px-4">{t.table_uses}</th>
                                    <th className="pb-3 px-4">{t.table_expiry}</th>
                                    <th className="pb-3 px-4">{t.table_status}</th>
                                    <th className="pb-3 pl-4 text-right">{t.table_actions}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-switzer text-secondary dark:text-slate-300">
                                {promoCodes.map((promo) => {
                                    const expired = isExpired(promo.expiresAt);
                                    const exhausted = isExhausted(promo.uses, promo.maxUses);
                                    let statusLabel = t.status_active;
                                    let statusColor = "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/50";
                                    
                                    if (!promo.isActive) {
                                        statusLabel = t.status_inactive;
                                        statusColor = "bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800";
                                    } else if (expired) {
                                        statusLabel = t.status_expired;
                                        statusColor = "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50";
                                    } else if (exhausted) {
                                        statusLabel = t.status_exhausted;
                                        statusColor = "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50";
                                    }

                                    return (
                                        <tr key={promo.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/50 transition-colors">
                                            <td className="py-4 pr-4 font-mono font-bold text-secondary dark:text-white">
                                                {promo.code}
                                            </td>
                                            <td className="py-4 px-4 font-semibold">
                                                {promo.discount}%
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="font-semibold text-slate-700 dark:text-slate-200">
                                                    {promo.uses}
                                                </span>
                                                <span className="text-slate-400">
                                                    {" "}/{" "}{promo.maxUses !== null ? promo.maxUses : "∞"}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                                                {promo.expiresAt ? (
                                                    <span className="flex items-center gap-1 font-mono">
                                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                        {new Date(promo.expiresAt).toLocaleDateString(localeStr, {
                                                            year: "numeric",
                                                            month: "2-digit",
                                                            day: "2-digit"
                                                        })}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic">{t.no_expiry}</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4">
                                                <button
                                                    onClick={() => handleToggleStatus(promo.id)}
                                                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase cursor-pointer transition-all hover:scale-105 active:scale-95 ${statusColor}`}
                                                    title={t.tooltip_toggle}
                                                >
                                                    {statusLabel}
                                                </button>
                                            </td>
                                            <td className="py-4 pl-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(promo.id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                                    title={t.tooltip_delete}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
