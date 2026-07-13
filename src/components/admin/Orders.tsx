import React, { useState } from "react";
import { Order } from "@prisma/client";
import { Trash2, Calendar, Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";

interface OrdersProps {
    orders: Order[]; // Already filtered and sorted orders passed from parent
    onStatusChange: (orderId: string, newStatus: string) => Promise<void>;
    onDeleteOrder: (orderId: string) => Promise<void>;
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    statusFilter: "all" | "pending" | "paid" | "completed";
    setStatusFilter: (val: "all" | "pending" | "paid" | "completed") => void;
    dateFilter: string;
    setDateFilter: (val: string) => void;
    minPrice: string;
    setMinPrice: (val: string) => void;
    maxPrice: string;
    setMaxPrice: (val: string) => void;
    sortBy: "date_desc" | "date_asc" | "total_desc" | "total_asc";
    setSortBy: (val: "date_desc" | "date_asc" | "total_desc" | "total_asc") => void;
}

const monthNames = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];
const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
};

export default function Orders({ 
    orders, 
    onStatusChange, 
    onDeleteOrder,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    sortBy,
    setSortBy
}: OrdersProps) {
    // Calendar Popover states
    const [showCalendar, setShowCalendar] = useState(false);
    const [calYear, setCalYear] = useState(() => new Date().getFullYear());
    const [calMonth, setCalMonth] = useState(() => new Date().getMonth());

    // Reset filters helper
    const handleResetFilters = () => {
        setSearchQuery("");
        setStatusFilter("all");
        setDateFilter("");
        setMinPrice("");
        setMaxPrice("");
        setSortBy("date_desc");
    };

    const isAnyFilterActive = 
        searchQuery !== "" || 
        statusFilter !== "all" || 
        dateFilter !== "" || 
        minPrice !== "" || 
        maxPrice !== "" || 
        sortBy !== "date_desc";

    return (
        <div className="space-y-6">
            {/* Filters Bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h4 className="text-sm font-bold font-outfit text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-primary" />
                        Filtros de Búsqueda
                    </h4>
                    {isAnyFilterActive && (
                        <button
                            onClick={handleResetFilters}
                            className="text-xs text-primary font-bold hover:underline cursor-pointer flex items-center gap-1 self-start sm:self-auto"
                        >
                            Limpiar filtros
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
                    {/* ID / Name Search */}
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-semibold text-slate-500 block">
                            Buscar Orden
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar por ID, nombre o email..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-xs text-foreground focus:outline-none focus:border-primary h-[38px]"
                            />
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 block">
                            Estado
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-xs text-foreground focus:outline-none focus:border-primary h-[38px] cursor-pointer"
                        >
                            <option value="all">Todos</option>
                            <option value="pending">Pendiente</option>
                            <option value="paid">Pagado</option>
                            <option value="completed">Completado</option>
                        </select>
                    </div>

                    {/* Date Picker Popover */}
                    <div className="space-y-1 relative">
                        <label className="text-xs font-semibold text-slate-500 block">
                            Fecha de Visita
                        </label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowCalendar(!showCalendar)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-xs text-left flex items-center justify-between text-foreground hover:border-primary transition-all cursor-pointer h-[38px]"
                            >
                                <span className="truncate">{dateFilter || "Cualquier fecha"}</span>
                                <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            </button>

                            {showCalendar && (
                                <div className="absolute right-0 left-0 z-20 mt-1 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900 shadow-xl font-switzer animate-fadeIn sm:w-60">
                                    <div className="flex justify-between items-center mb-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (calMonth === 0) {
                                                    setCalMonth(11);
                                                    setCalYear(prev => prev - 1);
                                                } else {
                                                    setCalMonth(prev => prev - 1);
                                                }
                                            }}
                                            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
                                        >
                                            ←
                                        </button>
                                        <span className="font-bold text-xs text-secondary dark:text-white capitalize">
                                            {monthNames[calMonth]} {calYear}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (calMonth === 11) {
                                                    setCalMonth(0);
                                                    setCalYear(prev => prev + 1);
                                                } else {
                                                    setCalMonth(prev => prev + 1);
                                                }
                                            }}
                                            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
                                        >
                                            →
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-bold text-slate-400 mb-2">
                                        {dayNames.map((d) => (
                                            <div key={d}>{d}</div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-7 gap-0.5">
                                        {Array.from({ length: getFirstDayOfMonth(calYear, calMonth) }).map((_, i) => (
                                            <div key={`empty-${i}`} />
                                        ))}

                                        {Array.from({ length: getDaysInMonth(calYear, calMonth) }).map((_, i) => {
                                            const day = i + 1;
                                            const dayStr = String(day).padStart(2, "0");
                                            const monthStr = String(calMonth + 1).padStart(2, "0");
                                            const dateStr = `${calYear}-${monthStr}-${dayStr}`;
                                            const isSelected = dateFilter === dateStr;

                                            return (
                                                <button
                                                    key={day}
                                                    type="button"
                                                    onClick={() => {
                                                        setDateFilter(dateStr);
                                                        setShowCalendar(false);
                                                    }}
                                                    className={`h-7 w-7 mx-auto flex items-center justify-center rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                                                        isSelected
                                                            ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                                                            : "text-secondary dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    }`}
                                                >
                                                    {day}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const today = new Date();
                                                const year = today.getFullYear();
                                                const month = String(today.getMonth() + 1).padStart(2, '0');
                                                const day = String(today.getDate()).padStart(2, '0');
                                                setDateFilter(`${year}-${month}-${day}`);
                                                setCalYear(year);
                                                setCalMonth(today.getMonth());
                                                setShowCalendar(false);
                                            }}
                                            className="px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary font-bold font-switzer text-[10px] rounded-lg transition-all cursor-pointer"
                                        >
                                            Hoy
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 block">
                            Rango Total (€)
                        </label>
                        <div className="flex gap-1 items-center">
                            <input
                                type="number"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                placeholder="Min"
                                className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-xs text-foreground focus:outline-none focus:border-primary h-[38px]"
                            />
                            <span className="text-slate-400 text-xs">-</span>
                            <input
                                type="number"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                placeholder="Max"
                                className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-xs text-foreground focus:outline-none focus:border-primary h-[38px]"
                            />
                        </div>
                    </div>

                    {/* Sorting dropdown */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 block">
                            Ordenar por
                        </label>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-xs text-foreground focus:outline-none focus:border-primary h-[38px] cursor-pointer"
                            >
                                <option value="date_desc">Fecha: Más nuevos</option>
                                <option value="date_asc">Fecha: Más viejos</option>
                                <option value="total_desc">Total: Mayor a menor</option>
                                <option value="total_asc">Total: Menor a mayor</option>
                            </select>
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            {orders.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
                    <p className="font-switzer text-slate-500">No hay órdenes que coincidan con los filtros.</p>
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
                                    onChange={(e) => onStatusChange(order.id, e.target.value)}
                                    className={`px-3 py-2 rounded-xl text-sm font-bold font-outfit focus:outline-none border border-slate-200 dark:border-slate-800 cursor-pointer ${order.status === "completed"
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
                                    onClick={() => onDeleteOrder(order.id)}
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
    );
}
