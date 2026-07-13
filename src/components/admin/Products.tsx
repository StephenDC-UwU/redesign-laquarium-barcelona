import React, { useState, useEffect } from "react";
import { Layers, Plus, Edit, Trash2 } from "lucide-react";
import { LocalizedProduct } from "@/actions/cartActions";
import { 
    createProductAction, 
    updateProductAction, 
    getProductTranslationsAction, 
    deleteProductAction 
} from "@/actions/adminActions";

interface ProductsProps {
    products: LocalizedProduct[];
    setProducts: React.Dispatch<React.SetStateAction<LocalizedProduct[]>>;
    productFilterLocale: "es" | "ca" | "en";
    setProductFilterLocale: (locale: "es" | "ca" | "en") => void;
}

export default function Products({ 
    products, 
    setProducts, 
    productFilterLocale, 
    setProductFilterLocale 
}: ProductsProps) {
    // Form fields
    const [newProductNameEs, setNewProductNameEs] = useState("");
    const [newProductNameCa, setNewProductNameCa] = useState("");
    const [newProductNameEn, setNewProductNameEn] = useState("");
    const [newProductPrice, setNewProductPrice] = useState("");
    const [newProductDescEs, setNewProductDescEs] = useState("");
    const [newProductDescCa, setNewProductDescCa] = useState("");
    const [newProductDescEn, setNewProductDescEn] = useState("");
    const [newProductTagEs, setNewProductTagEs] = useState("");
    const [newProductTagCa, setNewProductTagCa] = useState("");
    const [newProductTagEn, setNewProductTagEn] = useState("");
    const [formError, setFormError] = useState("");
    const [activeFormLocale, setActiveFormLocale] = useState<"es" | "ca" | "en">("es");
    const [editingProductId, setEditingProductId] = useState<string | null>(null);

    const handleCancelEditProduct = () => {
        setEditingProductId(null);
        setNewProductNameEs("");
        setNewProductNameCa("");
        setNewProductNameEn("");
        setNewProductPrice("");
        setNewProductDescEs("");
        setNewProductDescCa("");
        setNewProductDescEn("");
        setNewProductTagEs("");
        setNewProductTagCa("");
        setNewProductTagEn("");
        setFormError("");
    };

    const handleEditProduct = async (prod: any) => {
        const trans = await getProductTranslationsAction(prod.id);
        const esTrans = trans.find((t) => t.locale === "es");
        const caTrans = trans.find((t) => t.locale === "ca");
        const enTrans = trans.find((t) => t.locale === "en");

        setEditingProductId(prod.id);
        setNewProductPrice(prod.price.toString());

        setNewProductNameEs(esTrans?.name || "");
        setNewProductDescEs(esTrans?.description || "");
        setNewProductTagEs(esTrans?.tag || "");

        setNewProductNameCa(caTrans?.name || "");
        setNewProductDescCa(caTrans?.description || "");
        setNewProductTagCa(caTrans?.tag || "");

        setNewProductNameEn(enTrans?.name || "");
        setNewProductDescEn(enTrans?.description || "");
        setNewProductTagEn(enTrans?.tag || "");

        setFormError("");
    };

    const handleDeleteProduct = async (prodId: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este ticket/producto?")) return;
        const res = await deleteProductAction(prodId);
        if (res.success) {
            setProducts((prev) => prev.filter((p) => p.id !== prodId));
        } else {
            alert(res.error || "Error al eliminar");
        }
    };

    const handleCreateOrUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");

        const priceNum = parseFloat(newProductPrice);
        if (!newProductNameEs.trim() || !newProductNameCa.trim() || !newProductNameEn.trim() || isNaN(priceNum) || priceNum <= 0) {
            setFormError("Por favor, ingresa los nombres en todos los idiomas y un precio válido.");
            return;
        }

        if (editingProductId) {
            const res = await updateProductAction(editingProductId, {
                price: priceNum,
                nameEs: newProductNameEs,
                descriptionEs: newProductDescEs,
                tagEs: newProductTagEs || undefined,
                nameCa: newProductNameCa,
                descriptionCa: newProductDescCa,
                tagCa: newProductTagCa || undefined,
                nameEn: newProductNameEn,
                descriptionEn: newProductDescEn,
                tagEn: newProductTagEn || undefined,
            }, productFilterLocale);

            if (res.success && res.product) {
                setProducts((prev) => prev.map((p) => p.id === editingProductId ? res.product! : p));
                handleCancelEditProduct();
            } else {
                setFormError(res.error || "Error al actualizar el producto.");
            }
        } else {
            const res = await createProductAction({
                price: priceNum,
                nameEs: newProductNameEs,
                descriptionEs: newProductDescEs,
                tagEs: newProductTagEs || undefined,
                nameCa: newProductNameCa,
                descriptionCa: newProductDescCa,
                tagCa: newProductTagCa || undefined,
                nameEn: newProductNameEn,
                descriptionEn: newProductDescEn,
                tagEn: newProductTagEn || undefined,
            }, productFilterLocale);

            if (res.success && res.product) {
                setProducts((prev) => [...prev, res.product!]);
                handleCancelEditProduct();
            } else {
                setFormError(res.error || "Error al crear el producto.");
            }
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Product List */}
            <div className="lg:col-span-2 space-y-6">
                {/* Filters Bar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h4 className="text-sm font-bold font-outfit text-slate-500 uppercase tracking-wider">
                            Idioma de visualización
                        </h4>
                        <p className="text-xs text-slate-400 font-switzer mt-0.5">
                            Ver entradas en el idioma seleccionado
                        </p>
                    </div>
                    <div className="flex bg-slate-100 dark:bg-slate-950 p-0.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 w-full sm:w-auto">
                        {(["es", "ca", "en"] as const).map((lang) => {
                            const label = lang === "es" ? "ES" : lang === "ca" ? "CA" : "EN";
                            return (
                                <button
                                    key={lang}
                                    type="button"
                                    onClick={() => setProductFilterLocale(lang)}
                                    className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold font-outfit transition-all cursor-pointer text-center ${
                                        productFilterLocale === lang
                                            ? "bg-white dark:bg-slate-800 text-primary shadow-sm"
                                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                    }`}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {products.map((prod) => (
                    <div
                        key={prod.id}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                    >
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold font-outfit text-secondary dark:text-white">
                                    {prod.name}
                                </h3>
                                {prod.tag && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full font-outfit">
                                        {prod.tag}
                                    </span>
                                )}
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-switzer text-sm mt-1">
                                {prod.description}
                            </p>
                            <span className="font-mono text-xs text-slate-400 block mt-2">
                                ID: {prod.id}
                            </span>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-4 sm:pt-0">
                            <div className="font-bold font-outfit text-xl text-primary mr-3">
                                {prod.price.toFixed(2)}€
                            </div>

                            <button
                                onClick={() => handleEditProduct(prod)}
                                className="p-2 text-slate-400 hover:text-primary rounded-full hover:bg-primary/10 transition-all cursor-pointer"
                                aria-label="Editar entrada"
                            >
                                <Edit className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                                aria-label="Eliminar entrada"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Product Creation Form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-6">
                <h3 className="text-xl font-bold font-outfit text-secondary dark:text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" />
                    {editingProductId ? "Editar Entrada" : "Agregar Entrada"}
                </h3>
                <form onSubmit={handleCreateOrUpdateProduct} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 block">
                            Precio (€)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={newProductPrice}
                            onChange={(e) => setNewProductPrice(e.target.value)}
                            placeholder="Ej: 39.90"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground"
                            required
                        />
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-xs font-semibold text-slate-500">
                                Información en:
                            </label>
                            <div className="flex bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
                                {(["es", "ca", "en"] as const).map((lang) => {
                                    const label = lang === "es" ? "ES" : lang === "ca" ? "CA" : "EN";
                                    const isFilled = lang === "es"
                                        ? !!newProductNameEs.trim()
                                        : lang === "ca"
                                            ? !!newProductNameCa.trim()
                                            : !!newProductNameEn.trim();
                                    return (
                                        <button
                                            key={lang}
                                            type="button"
                                            onClick={() => setActiveFormLocale(lang)}
                                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold font-outfit transition-all flex items-center gap-1 cursor-pointer ${
                                                activeFormLocale === lang
                                                    ? "bg-white dark:bg-slate-800 text-primary shadow-sm"
                                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                            }`}
                                        >
                                            {label}
                                            <span className={`w-1.5 h-1.5 rounded-full ${isFilled ? "bg-green-500" : "bg-amber-400"}`} />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {activeFormLocale === "es" && (
                            <div className="space-y-3 animate-fadeIn">
                                <input
                                    type="text"
                                    value={newProductNameEs}
                                    onChange={(e) => setNewProductNameEs(e.target.value)}
                                    placeholder="Nombre (ES)"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground"
                                />
                                <input
                                    type="text"
                                    value={newProductTagEs}
                                    onChange={(e) => setNewProductTagEs(e.target.value)}
                                    placeholder="Etiqueta (ES) - Ej: Popular"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground"
                                />
                                <textarea
                                    value={newProductDescEs}
                                    onChange={(e) => setNewProductDescEs(e.target.value)}
                                    placeholder="Descripción (ES)"
                                    rows={3}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground resize-none"
                                />
                            </div>
                        )}

                        {activeFormLocale === "ca" && (
                            <div className="space-y-3 animate-fadeIn">
                                <input
                                    type="text"
                                    value={newProductNameCa}
                                    onChange={(e) => setNewProductNameCa(e.target.value)}
                                    placeholder="Nom (CA)"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground"
                                />
                                <input
                                    type="text"
                                    value={newProductTagCa}
                                    onChange={(e) => setNewProductTagCa(e.target.value)}
                                    placeholder="Etiqueta (CA)"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground"
                                />
                                <textarea
                                    value={newProductDescCa}
                                    onChange={(e) => setNewProductDescCa(e.target.value)}
                                    placeholder="Descripció (CA)"
                                    rows={3}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground resize-none"
                                />
                            </div>
                        )}

                        {activeFormLocale === "en" && (
                            <div className="space-y-3 animate-fadeIn">
                                <input
                                    type="text"
                                    value={newProductNameEn}
                                    onChange={(e) => setNewProductNameEn(e.target.value)}
                                    placeholder="Name (EN)"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground"
                                />
                                <input
                                    type="text"
                                    value={newProductTagEn}
                                    onChange={(e) => setNewProductTagEn(e.target.value)}
                                    placeholder="Tag (EN)"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground"
                                />
                                <textarea
                                    value={newProductDescEn}
                                    onChange={(e) => setNewProductDescEn(e.target.value)}
                                    placeholder="Description (EN)"
                                    rows={3}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground resize-none"
                                />
                            </div>
                        )}
                    </div>

                    {formError && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 font-switzer text-xs">
                            {formError}
                        </div>
                    )}

                    <div className="flex gap-3">
                        {editingProductId && (
                            <button
                                type="button"
                                onClick={handleCancelEditProduct}
                                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold font-outfit py-4 rounded-xl transition-all text-center cursor-pointer"
                            >
                                Cancelar
                            </button>
                        )}
                        <button
                            type="submit"
                            className="flex-1 bg-primary hover:bg-primary-light text-white font-bold font-outfit py-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/10"
                        >
                            {editingProductId ? "Guardar" : <Plus size={18} />}
                            {editingProductId ? "Actualizar" : "Crear Entrada"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
