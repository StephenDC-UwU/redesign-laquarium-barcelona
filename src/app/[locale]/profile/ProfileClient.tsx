"use client";

import { useEffect, useState, useTransition } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserOrdersAction } from "@/actions/cartActions";
import { Order } from "@prisma/client";
import { User, Ticket, Calendar, Clock, CreditCard, ArrowLeft, RefreshCw, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function ProfileClient() {
    const { user, logout } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const params = useParams();
    const router = useRouter();
    const locale = params?.locale || "es";

    const loadOrders = () => {
        if (!user?.email) return;
        setLoading(true);
        startTransition(async () => {
            const fetched = await getUserOrdersAction(user.email);
            setOrders(fetched);
            setLoading(false);
        });
    };

    useEffect(() => {
        if (!user) {
            router.push(`/${locale}`);
            return;
        }
        loadOrders();
    }, [user]);

    if (!user) {
        return (
            <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-background px-4">
                <div className="max-w-md w-full text-center">
                    <RefreshCw className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                    <p className="font-switzer text-slate-500">Cargando perfil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 bg-background text-foreground px-4 md:px-8 xl:px-24">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href={`/${locale}`}
                        className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-primary hover:text-white transition-all cursor-pointer"
                        aria-label="Volver a Inicio"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-4xl font-bold font-outfit text-secondary dark:text-white">
                            Mi Perfil
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-switzer text-sm mt-1">
                            Consulta tus datos y revisa tu historial de entradas adquiridas
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sidebar / Info */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm text-center">
                            <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                <User className="w-10 h-10 stroke-[2]" />
                            </div>
                            <h3 className="text-xl font-bold font-outfit text-secondary dark:text-white truncate">
                                {user.fullName}
                            </h3>
                            <p className="text-slate-400 font-switzer text-xs mt-1 truncate">
                                {user.email}
                            </p>
                            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    onClick={logout}
                                    className="w-full bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-bold font-outfit py-3 rounded-xl transition-all cursor-pointer text-sm"
                                >
                                    Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Orders History */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold font-outfit text-secondary dark:text-white flex items-center gap-2">
                                <Ticket className="w-6 h-6 text-primary" />
                                Mis Entradas
                            </h2>
                            <button
                                onClick={loadOrders}
                                disabled={loading}
                                className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Recargar compras"
                            >
                                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                            </button>
                        </div>

                        {loading ? (
                            <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
                                <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                                <p className="font-switzer text-slate-500 text-sm">Cargando tus compras...</p>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                    <ShoppingBag className="w-6 h-6" />
                                </div>
                                <h4 className="text-lg font-bold font-outfit text-secondary dark:text-white mb-1">
                                    No tienes entradas
                                </h4>
                                <p className="text-slate-400 font-switzer text-sm mb-6 max-w-xs mx-auto">
                                    Aún no has comprado ninguna entrada para el acuario.
                                </p>
                                <Link
                                    href={`/${locale}`}
                                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-white font-bold font-outfit px-6 py-3 rounded-xl transition-all shadow-md cursor-pointer text-sm"
                                >
                                    Ver Entradas
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                                            <div className="space-y-1">
                                                <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-slate-600 dark:text-slate-300">
                                                    ID: {order.id.slice(0, 8)}...
                                                </span>
                                                <div className="flex items-center gap-3 text-slate-400 text-xs font-switzer mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold font-outfit uppercase tracking-wider ${order.status === "completed"
                                                            ? "bg-green-500/10 text-green-500"
                                                            : order.status === "paid"
                                                                ? "bg-blue-500/10 text-blue-500"
                                                                : "bg-yellow-500/10 text-yellow-500"
                                                        }`}
                                                >
                                                    {order.status === "paid" ? "Pagado" : order.status === "completed" ? "Completado" : "Pendiente"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="py-4 space-y-2">
                                            {(order.items as any[]).map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-sm font-switzer">
                                                    <span className="text-slate-600 dark:text-slate-400">
                                                        {item.name} <span className="font-bold">x {item.quantity}</span>
                                                    </span>
                                                    <span className="font-semibold text-secondary dark:text-white">
                                                        {(item.price * item.quantity).toFixed(2)}€
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                                                <CreditCard size={14} /> Total pagado
                                            </span>
                                            <span className="font-bold font-outfit text-lg text-primary">
                                                {order.total.toFixed(2)}€
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
