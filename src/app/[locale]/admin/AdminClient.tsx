"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Order } from "@prisma/client";
import {
    DollarSign,
    Ticket,
    FileText,
    ArrowLeft,
    RefreshCw,
    Lock,
    LogIn
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Components from src/components/admin
import Orders from "@/components/admin/Orders";
import Products from "@/components/admin/Products";
import Articles from "@/components/admin/Articles";
import Reservations from "@/components/admin/Reservations";

// Server Actions
import {
    getOrdersAction,
    updateOrderStatusAction,
    deleteOrderAction
} from "@/actions/adminActions";
import { getAvailableProductsAction, LocalizedProduct } from "@/actions/cartActions";
import { getArticlesAction } from "@/actions/articleActions";

interface AdminClientProps {
    localeStr: string;
}

export default function AdminClient({ localeStr }: AdminClientProps) {
    const { isAdmin, adminLogin } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<LocalizedProduct[]>([]);
    const [articles, setArticles] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<"orders" | "products" | "articles" | "capacity">("orders");
    const [loading, setLoading] = useState(true);

    const [productFilterLocale, setProductFilterLocale] = useState<"es" | "ca" | "en">("es");
    const [articleFilterLocale, setArticleFilterLocale] = useState<"es" | "ca" | "en">("es");

    // Login form states
    const [passInput, setPassInput] = useState("");
    const [authError, setAuthError] = useState("");
    const [isPending, startTransition] = useTransition();

    // Orders Filter and Sorting States
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid" | "completed">("all");
    const [dateFilter, setDateFilter] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "total_desc" | "total_asc">("date_desc");

    // Sync active filters with URL locale
    useEffect(() => {
        if (localeStr === "es" || localeStr === "ca" || localeStr === "en") {
            setProductFilterLocale(localeStr as "es" | "ca" | "en");
            setArticleFilterLocale(localeStr as "es" | "ca" | "en");
        }
    }, [localeStr]);

    // Load initial data
    const loadData = async () => {
        if (!isAdmin) return;
        setLoading(true);
        try {
            const fetchedOrders = await getOrdersAction();
            const fetchedProducts = await getAvailableProductsAction(productFilterLocale);
            const fetchedArticles = await getArticlesAction(articleFilterLocale);
            setOrders(fetchedOrders);
            setProducts(fetchedProducts);
            setArticles(fetchedArticles);
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

    // Refetch products on locale filter change
    useEffect(() => {
        if (isAdmin) {
            getAvailableProductsAction(productFilterLocale).then(setProducts);
        }
    }, [productFilterLocale, isAdmin]);

    // Refetch articles on locale filter change
    useEffect(() => {
        if (isAdmin) {
            getArticlesAction(articleFilterLocale).then(setArticles);
        }
    }, [articleFilterLocale, isAdmin]);

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

    // Filter orders
    const filteredOrders = orders.filter((order) => {
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            const matchId = order.id.toLowerCase().includes(query);
            const matchName = order.fullName.toLowerCase().includes(query);
            const matchEmail = order.email.toLowerCase().includes(query);
            if (!matchId && !matchName && !matchEmail) return false;
        }

        if (statusFilter !== "all" && order.status !== statusFilter) {
            return false;
        }

        if (dateFilter) {
            const orderDateStr = order.visitDate || new Date(order.createdAt).toISOString().split("T")[0];
            if (orderDateStr !== dateFilter) return false;
        }

        const orderTotal = order.total;
        if (minPrice && orderTotal < parseFloat(minPrice)) {
            return false;
        }
        if (maxPrice && orderTotal > parseFloat(maxPrice)) {
            return false;
        }

        return true;
    });

    // Sort orders
    const sortedOrders = [...filteredOrders].sort((a, b) => {
        if (sortBy === "date_desc") {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === "date_asc") {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === "total_desc") {
            return b.total - a.total;
        }
        if (sortBy === "total_asc") {
            return a.total - b.total;
        }
        return 0;
    });

    // Stats calculations based on filteredOrders
    const totalSales = filteredOrders
        .filter((o) => o.status === "paid" || o.status === "completed")
        .reduce((sum, o) => sum + o.total, 0);

    const totalTicketsCount = filteredOrders
        .filter((o) => o.status === "paid" || o.status === "completed")
        .reduce((sum, o) => sum + ((o.items as any[]) || []).reduce((acc: number, it: any) => acc + it.quantity, 0), 0);

    const pendingOrdersCount = filteredOrders.filter((o) => o.status === "pending").length;

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
                            href={`/${localeStr}`}
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
                <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 mb-8 overflow-x-auto whitespace-nowrap">
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
                    <button
                        onClick={() => setActiveTab("articles")}
                        className={`pb-4 px-2 font-bold font-outfit text-lg transition-all border-b-2 cursor-pointer ${activeTab === "articles"
                            ? "border-primary text-primary"
                            : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            }`}
                    >
                        Artículos de Prensa ({articles.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("capacity")}
                        className={`pb-4 px-2 font-bold font-outfit text-lg transition-all border-b-2 cursor-pointer ${activeTab === "capacity"
                            ? "border-primary text-primary"
                            : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            }`}
                    >
                        Aforo y Reservas
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
                        {activeTab === "orders" && (
                            <Orders
                                orders={sortedOrders}
                                onStatusChange={handleStatusChange}
                                onDeleteOrder={handleDeleteOrder}
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                                statusFilter={statusFilter}
                                setStatusFilter={setStatusFilter}
                                dateFilter={dateFilter}
                                setDateFilter={setDateFilter}
                                minPrice={minPrice}
                                setMinPrice={setMinPrice}
                                maxPrice={maxPrice}
                                setMaxPrice={setMaxPrice}
                                sortBy={sortBy}
                                setSortBy={setSortBy}
                            />
                        )}
                        {activeTab === "products" && (
                            <Products
                                products={products}
                                setProducts={setProducts}
                                productFilterLocale={productFilterLocale}
                                setProductFilterLocale={setProductFilterLocale}
                            />
                        )}
                        {activeTab === "articles" && (
                            <Articles
                                articles={articles}
                                setArticles={setArticles}
                                articleFilterLocale={articleFilterLocale}
                                setArticleFilterLocale={setArticleFilterLocale}
                                localeStr={localeStr}
                            />
                        )}
                        {activeTab === "capacity" && (
                            <Reservations isAdmin={isAdmin} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
