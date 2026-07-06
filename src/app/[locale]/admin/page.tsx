"use client";

import { useEffect, useState, useTransition } from "react";
import { getOrdersAction, updateOrderStatusAction, deleteOrderAction, createProductAction, deleteProductAction } from "@/actions/adminActions";
import { getAvailableProductsAction } from "@/actions/cartActions";
import { Product, Order } from "@prisma/client";
import { DollarSign, Ticket, FileText, Trash2, Plus, ArrowLeft, RefreshCw, Layers, Lock, LogIn } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AdminPage() {
    const params = useParams();
    const locale = params?.locale || "es";
    const { isAdmin, adminLogin, logout } = useAuth();

    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [activeTab, setActiveTab] = useState<"orders" | "products">("orders");
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    // Admin login form states
    const [passInput, setPassInput] = useState("");
    const [authError, setAuthError] = useState("");

    // New Product form fields
    const [newProductName, setNewProductName] = useState("");
    const [newProductPrice, setNewProductPrice] = useState("");
    const [newProductDesc, setNewProductDesc] = useState("");
    const [newProductTag, setNewProductTag] = useState("");
    const [formError, setFormError] = useState("");


    // Load initial data
    const loadData = async () => {
        if (!isAdmin) return;
        setLoading(true);
        try {
            const fetchedOrders = await getOrdersAction();
            const fetchedProducts = await getAvailableProductsAction();
            setOrders(fetchedOrders);
            setProducts(fetchedProducts);
        } catch (e) {
            console.error("Error loading admin data:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            loadData();
        }
    }, [isAdmin]);

    const handleAdminAuth = (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError("");
        startTransition(async () => {
            const res = await adminLogin(passInput);
            if (!res.success) {
                setAuthError(res.error || "Contraseña incorrecta.");
            }
        });
    };


    // Handlers
    const handleStatusChange = async (orderId: string, newStatus: string) => {
        const res = await updateOrderStatusAction(orderId, newStatus);
        if (res.success && res.order) {
            setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order! : o)));
        } else {
            alert(res.error || "Error al actualizar el estado");
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este pedido?")) return;
        const res = await deleteOrderAction(orderId);
        if (res.success) {
            setOrders((prev) => prev.filter((o) => o.id !== orderId));
        } else {
            alert(res.error || "Error al eliminar");
        }
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

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");

        const priceNum = parseFloat(newProductPrice);
        if (!newProductName.trim() || isNaN(priceNum) || priceNum <= 0) {
            setFormError("Por favor, ingresa un nombre y precio válidos.");
            return;
        }

        const res = await createProductAction({
            name: newProductName,
            price: priceNum,
            description: newProductDesc,
            tag: newProductTag || undefined
        });

        if (res.success && res.product) {
            setProducts((prev) => [...prev, res.product!]);
            setNewProductName("");
            setNewProductPrice("");
            setNewProductDesc("");
            setNewProductTag("");
        } else {
            setFormError(res.error || "Error al crear el producto.");
        }
    };

    // Calculations for dashboard stats
    const totalSales = orders
        .filter((o) => o.status === "paid" || o.status === "completed")
        .reduce((sum, o) => sum + o.total, 0);

    const totalTicketsCount = orders
        .filter((o) => o.status === "paid" || o.status === "completed")
        .reduce((sum, o) => sum + ((o.items as any[]) || []).reduce((acc: number, it: any) => acc + it.quantity, 0), 0);

    const pendingOrdersCount = orders.filter((o) => o.status === "pending").length;

    if (!isAdmin) {
        return (
            <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-background px-4">
                <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
                            <Lock className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold font-outfit text-secondary dark:text-white">
                            Acceso Administrador
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-switzer text-sm">
                            Introduce la contraseña del administrador root para acceder.
                        </p>
                    </div>

                    <form onSubmit={handleAdminAuth} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 block">
                                Contraseña Root
                            </label>
                            <input
                                type="password"
                                value={passInput}
                                onChange={(e) => setPassInput(e.target.value)}
                                placeholder="••••••••"
                                disabled={isPending}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground disabled:opacity-50"
                                required
                            />
                        </div>

                        {authError && (
                            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 font-switzer text-xs">
                                {authError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-primary hover:bg-primary-light disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold font-outfit py-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/10"
                        >
                            <LogIn size={18} />
                            {isPending ? "Verificando..." : "Acceder al Panel"}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 bg-background text-foreground px-4 md:px-8 xl:px-24">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/${locale}`}
                            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-primary hover:text-white transition-all cursor-pointer"
                            aria-label="Volver a Inicio"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-4xl font-bold font-outfit text-secondary dark:text-white">
                                Panel de Control Admin
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 font-switzer text-sm mt-1">
                                Gestión de órdenes y catálogo de entradas de L'Aquàrium
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="self-start md:self-auto flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-outfit font-bold text-sm cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        Recargar Datos
                    </button>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-5">
                        <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-switzer">Ingresos Totales</p>
                            <h3 className="text-2xl font-bold font-outfit text-secondary dark:text-white mt-1">
                                {totalSales.toFixed(2)}€
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-5">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                            <Ticket className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-switzer">Entradas Vendidas</p>
                            <h3 className="text-2xl font-bold font-outfit text-secondary dark:text-white mt-1">
                                {totalTicketsCount}
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-5">
                        <div className="w-12 h-12 bg-yellow-500/10 text-yellow-500 rounded-2xl flex items-center justify-center">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-switzer">Órdenes Pendientes</p>
                            <h3 className="text-2xl font-bold font-outfit text-secondary dark:text-white mt-1">
                                {pendingOrdersCount}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab("orders")}
                        className={`pb-4 px-2 font-bold font-outfit text-lg transition-all border-b-2 cursor-pointer ${activeTab === "orders"
                                ? "border-primary text-primary"
                                : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            }`}
                    >
                        Órdenes de Compra ({orders.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("products")}
                        className={`pb-4 px-2 font-bold font-outfit text-lg transition-all border-b-2 cursor-pointer ${activeTab === "products"
                                ? "border-primary text-primary"
                                : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            }`}
                    >
                        Catálogo de Entradas ({products.length})
                    </button>
                </div>

                {/* Loading state */}
                {loading ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
                        <RefreshCw className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                        <p className="font-switzer text-slate-500">Cargando datos del servidor...</p>
                    </div>
                ) : (
                    <div>
                        {/* TAB 1: ORDERS */}
                        {activeTab === "orders" && (
                            <div className="space-y-6">
                                {orders.length === 0 ? (
                                    <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl">
                                        <p className="font-switzer text-slate-500">No se han registrado compras aún.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {orders.map((order) => (
                                            <div
                                                key={order.id}
                                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                                            >
                                                <div className="space-y-2 flex-1">
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <span className="font-mono text-sm font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-700 dark:text-slate-300">
                                                            {order.id}
                                                        </span>
                                                        <span className="text-slate-400 text-xs font-switzer">
                                                            {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold font-outfit text-lg text-secondary dark:text-white">
                                                            {order.fullName}
                                                        </h4>
                                                        <p className="text-slate-500 font-switzer text-sm">{order.email}</p>
                                                    </div>
                                                    {/* Items list */}
                                                    <div className="flex flex-wrap gap-2 pt-1">
                                                        {(order.items as any[]).map((item, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 px-3 py-1 rounded-xl text-slate-600 dark:text-slate-400 font-switzer"
                                                            >
                                                                {item.name} x {item.quantity} ({item.price.toFixed(2)}€)
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                                                    <div className="font-bold font-outfit text-xl text-primary md:text-right md:w-24">
                                                        {order.total.toFixed(2)}€
                                                    </div>

                                                    {/* Status Selector */}
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                        className={`px-3 py-2 rounded-xl text-sm font-bold font-outfit focus:outline-none border border-slate-200 dark:border-slate-800 ${order.status === "completed"
                                                                ? "bg-green-500/10 text-green-500"
                                                                : order.status === "paid"
                                                                    ? "bg-blue-500/10 text-blue-500"
                                                                    : "bg-yellow-500/10 text-yellow-500"
                                                            }`}
                                                    >
                                                        <option value="pending">Pendiente</option>
                                                        <option value="paid">Pagado</option>
                                                        <option value="completed">Completado</option>
                                                    </select>

                                                    <button
                                                        onClick={() => handleDeleteOrder(order.id)}
                                                        className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                                                        aria-label="Eliminar orden"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 2: PRODUCTS */}
                        {activeTab === "products" && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                                {/* Product List */}
                                <div className="lg:col-span-2 space-y-4">
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

                                            <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0">
                                                <div className="font-bold font-outfit text-xl text-primary">
                                                    {prod.price.toFixed(2)}€
                                                </div>

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
                                        Agregar Entrada
                                    </h3>

                                    <form onSubmit={handleCreateProduct} className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-500 block">
                                                Nombre de la Entrada
                                            </label>
                                            <input
                                                type="text"
                                                value={newProductName}
                                                onChange={(e) => setNewProductName(e.target.value)}
                                                placeholder="Ej: Entrada Familia Ahorro"
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground"
                                                required
                                            />
                                        </div>

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

                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-500 block">
                                                Etiqueta / Badge (Opcional)
                                            </label>
                                            <input
                                                type="text"
                                                value={newProductTag}
                                                onChange={(e) => setNewProductTag(e.target.value)}
                                                placeholder="Ej: Popular, Descuento"
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-500 block">
                                                Descripción
                                            </label>
                                            <textarea
                                                value={newProductDesc}
                                                onChange={(e) => setNewProductDesc(e.target.value)}
                                                placeholder="Detalles sobre lo que incluye esta entrada..."
                                                rows={3}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground resize-none"
                                            />
                                        </div>

                                        {formError && (
                                            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 font-switzer text-xs">
                                                {formError}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            className="w-full bg-primary hover:bg-primary-light text-white font-bold font-outfit py-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/10"
                                        >
                                            <Plus size={18} />
                                            Crear Entrada
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
