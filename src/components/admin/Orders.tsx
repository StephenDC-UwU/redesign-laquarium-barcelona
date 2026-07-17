import React, { useState } from "react";
import { Order } from "@prisma/client";
import { Trash2, Calendar, Search, SlidersHorizontal, ArrowUpDown, Printer } from "lucide-react";
import { Dictionary } from "@/dictionaries";

interface OrdersProps {
    dict: Dictionary;
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

const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
};

export default function Orders({
    dict,
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

    // Print states
    const [printMode, setPrintMode] = useState<"ticket" | "list" | null>(null);
    const [selectedPrintOrder, setSelectedPrintOrder] = useState<Order | null>(null);

    // Reset filters helper
    const handleResetFilters = () => {
        setSearchQuery("");
        setStatusFilter("all");
        setDateFilter("");
        setMinPrice("");
        setMaxPrice("");
        setSortBy("date_desc");
    };

    // Print triggers
    const handlePrintTicket = (order: Order) => {
        setSelectedPrintOrder(order);
        setPrintMode("ticket");
        setTimeout(() => {
            window.print();
        }, 150);
    };

    const handlePrintList = () => {
        setSelectedPrintOrder(null);
        setPrintMode("list");
        setTimeout(() => {
            window.print();
        }, 150);
    };

    const isAnyFilterActive =
        searchQuery !== "" ||
        statusFilter !== "all" ||
        dateFilter !== "" ||
        minPrice !== "" ||
        maxPrice !== "" ||
        sortBy !== "date_desc";

    // Count and sums for list printing
    const printSalesSum = orders
        .filter((o) => o.status === "paid" || o.status === "completed")
        .reduce((sum, o) => sum + o.total, 0);

    const printTicketsCount = orders
        .filter((o) => o.status === "paid" || o.status === "completed")
        .reduce((sum, o) => sum + ((o.items as any[]) || []).reduce((acc: number, it: any) => acc + it.quantity, 0), 0);

    return (
        <div className="space-y-6">
            {/* Inline CSS overrides to handle window.print cleanly */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    /* Hide everything by default */
                    body * {
                        visibility: hidden;
                    }
                    /* Show only print-area container */
                    #print-area, #print-area * {
                        visibility: visible;
                    }
                    #print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        color: #000 !important;
                        background: #fff !important;
                    }
                    /* Ticket formatting */
                    .ticket-print-layout {
                        width: 78mm;
                        padding: 4mm;
                        font-family: monospace;
                        font-size: 11px;
                        line-height: 1.3;
                    }
                    /* General table styling for visitor list */
                    .list-print-layout {
                        width: 100%;
                        font-family: sans-serif;
                        font-size: 12px;
                    }
                    .list-print-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 15px;
                    }
                    .list-print-table th, .list-print-table td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }
                    .list-print-table th {
                        background-color: #f2f2f2;
                        font-weight: bold;
                    }
                }
            ` }} />

            {/* Hidden Print Container */}
            <div id="print-area" className="hidden print:block">
                {printMode === "ticket" && selectedPrintOrder && (
                    <div className="ticket-print-layout mx-auto">
                        <div className="text-center font-bold text-sm uppercase tracking-wider mb-1">
                            L'Aquàrium Barcelona
                        </div>
                        <div className="text-center text-[10px] uppercase text-slate-600 mb-3">
                            {dict.admin.orders.official_ticket}
                        </div>
                        <div className="border-t border-dashed border-black my-2" />

                        <div className="space-y-1">
                            <p><strong>{dict.admin.orders.order_id}:</strong> {selectedPrintOrder.id}</p>
                            <p><strong>{dict.admin.orders.holder}:</strong> {selectedPrintOrder.fullName}</p>
                            <p><strong>{dict.admin.orders.email}:</strong> {selectedPrintOrder.email}</p>
                            {selectedPrintOrder.visitDate && (
                                <p><strong>{dict.admin.orders.visit_date}:</strong> {selectedPrintOrder.visitDate}</p>
                            )}
                            {selectedPrintOrder.visitTime && (
                                <p><strong>{dict.admin.orders.access_time}:</strong> {selectedPrintOrder.visitTime}</p>
                            )}
                        </div>

                        <div className="border-t border-dashed border-black my-2" />

                        <div className="space-y-1">
                            <span className="font-bold block mb-1">{dict.admin.orders.ticket_details}:</span>
                            {((selectedPrintOrder.items as any[]) || []).map((item, idx) => (
                                <div key={idx} className="flex justify-between">
                                    <span>{item.name} x{item.quantity}</span>
                                    <span>{(item.price * item.quantity).toFixed(2)}€</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-dashed border-black my-2" />

                        <div className="flex justify-between font-bold text-xs uppercase">
                            <span>{dict.admin.orders.total_paid}:</span>
                            <span>{selectedPrintOrder.total.toFixed(2)}€</span>
                        </div>

                        <div className="border-t border-dashed border-black my-2" />

                        <div className="flex flex-col items-center justify-center pt-4 pb-2">
                            {/* QR Code image fetched using free api.qrserver.com */}
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${selectedPrintOrder.id}`}
                                alt="Validación QR"
                                className="w-32 h-32 object-contain"
                            />
                            <span className="text-[8px] mt-2 tracking-wider text-slate-500 uppercase text-center block">
                                {dict.admin.orders.present_access_to_scan}
                            </span>
                        </div>
                    </div>
                )}

                {printMode === "list" && (
                    <div className="list-print-layout p-6">
                        <div className="flex justify-between items-start border-b pb-4">
                            <div>
                                <h1 className="text-xl font-bold uppercase tracking-wide">
                                    L'Aquàrium Barcelona
                                </h1>
                                <p className="text-xs text-slate-500 mt-1">
                                    {dict.admin.orders.visitor_list_control}
                                </p>
                            </div>
                            <div className="text-right text-xs text-slate-600">
                                <p><strong>{dict.admin.orders.issue_date}:</strong> {new Date().toLocaleDateString()}</p>
                                <p><strong>{dict.admin.orders.time}:</strong> {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                            </div>
                        </div>

                        {/* Summary of filters applied */}
                        <div className="mt-4 p-3 bg-slate-50 border rounded-xl text-xs space-y-1">
                            <span className="font-bold text-slate-700 block">{dict.admin.orders.active_filters}:</span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600">
                                <p><strong>{dict.admin.orders.search}:</strong> {searchQuery || dict.admin.orders.none}</p>
                                <p><strong>{dict.admin.orders.status}:</strong> {statusFilter === "all" ? dict.admin.orders.all : (dict.admin.orders[statusFilter as keyof typeof dict.admin.orders] || statusFilter)}</p>
                                <p><strong>{dict.admin.orders.visit_date}:</strong> {dateFilter || dict.admin.orders.any_date}</p>
                                <p><strong>{dict.admin.orders.prices}:</strong> {minPrice || "0"}€ - {maxPrice || "Max"}€</p>
                            </div>
                        </div>

                        {/* Table */}
                        <table className="list-print-table">
                            <thead>
                                <tr>
                                    <th>{dict.admin.orders.table_order_id}</th>
                                    <th>{dict.admin.orders.table_client}</th>
                                    <th>{dict.admin.orders.table_visit_date}</th>
                                    <th>{dict.admin.orders.table_time}</th>
                                    <th>{dict.admin.orders.table_tickets_purchased}</th>
                                    <th>{dict.admin.orders.table_total}</th>
                                    <th>{dict.admin.orders.table_status}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => {
                                    const qty = ((order.items as any[]) || []).reduce((sum, it) => sum + it.quantity, 0);
                                    return (
                                        <tr key={order.id}>
                                            <td className="font-mono text-xs">{order.id}</td>
                                            <td>
                                                <p className="font-semibold">{order.fullName}</p>
                                                <p className="text-[10px] text-slate-500 font-mono">{order.email}</p>
                                            </td>
                                            <td>{order.visitDate || new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td>{order.visitTime || "-"}</td>
                                            <td className="text-xs">
                                                {((order.items as any[]) || []).map((it, i) => (
                                                    <span key={i} className="block">
                                                        {it.name} (x{it.quantity})
                                                    </span>
                                                ))}
                                            </td>
                                            <td className="font-bold">{order.total.toFixed(2)}€</td>
                                            <td className="capitalize text-xs font-semibold">
                                                {dict.admin.orders[order.status as keyof typeof dict.admin.orders] || order.status}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* List Footer stats */}
                        <div className="mt-6 border-t pt-4 grid grid-cols-3 gap-4 text-center">
                            <div className="p-3 bg-slate-50 border rounded-xl">
                                <span className="text-[10px] uppercase font-bold text-slate-500 block">{dict.admin.orders.total_transactions}</span>
                                <span className="text-lg font-bold">{orders.length}</span>
                            </div>
                            <div className="p-3 bg-slate-50 border rounded-xl">
                                <span className="text-[10px] uppercase font-bold text-slate-500 block">{dict.admin.orders.total_tickets}</span>
                                <span className="text-lg font-bold">{printTicketsCount}</span>
                            </div>
                            <div className="p-3 bg-slate-50 border rounded-xl">
                                <span className="text-[10px] uppercase font-bold text-slate-500 block">{dict.admin.orders.accumulated_income}</span>
                                <span className="text-lg font-bold text-primary">{printSalesSum.toFixed(2)}€</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Filters Bar UI */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h4 className="text-sm font-bold font-outfit text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-primary" />
                        {dict.admin.orders.search_filters}
                    </h4>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handlePrintList}
                            className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold font-outfit rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            {dict.admin.orders.print_list}
                        </button>

                        {isAnyFilterActive && (
                            <button
                                onClick={handleResetFilters}
                                className="text-xs text-primary font-bold hover:underline cursor-pointer flex items-center gap-1.5"
                            >
                                {dict.admin.orders.clear_filters}
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
                    {/* ID / Name Search */}
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-semibold text-slate-500 block">
                            {dict.admin.orders.search_order}
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={dict.admin.orders.search_placeholder}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-xs text-foreground focus:outline-none focus:border-primary h-[38px]"
                            />
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 block">
                            {dict.admin.orders.status}
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-xs text-foreground focus:outline-none focus:border-primary h-[38px] cursor-pointer"
                        >
                            <option value="all">{dict.admin.orders.all}</option>
                            <option value="pending">{dict.admin.orders.pending}</option>
                            <option value="paid">{dict.admin.orders.paid}</option>
                            <option value="completed">{dict.admin.orders.completed}</option>
                        </select>
                    </div>

                    {/* Date Picker Popover */}
                    <div className="space-y-1 relative">
                        <label className="text-xs font-semibold text-slate-500 block">
                            {dict.admin.orders.visit_date}
                        </label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowCalendar(!showCalendar)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-xs text-left flex items-center justify-between text-foreground hover:border-primary transition-all cursor-pointer h-[38px]"
                            >
                                <span className="truncate">{dateFilter || dict.admin.orders.any_date}</span>
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
                                            {dict.admin.orders.months[calMonth]} {calYear}
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
                                        {dict.admin.orders.days.map((d) => (
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
                                                    className={`h-7 w-7 mx-auto flex items-center justify-center rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${isSelected
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
                                            {dict.admin.orders.today}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 block">
                            {dict.admin.orders.total_range}
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
                            {dict.admin.orders.sort_by}
                        </label>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-xs text-foreground focus:outline-none focus:border-primary h-[38px] cursor-pointer"
                            >
                                <option value="date_desc">{dict.admin.orders.sort_date_desc}</option>
                                <option value="date_asc">{dict.admin.orders.sort_date_asc}</option>
                                <option value="total_desc">{dict.admin.orders.sort_total_desc}</option>
                                <option value="total_asc">{dict.admin.orders.sort_total_asc}</option>
                            </select>
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            {orders.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
                    <p className="font-switzer text-slate-500">{dict.admin.orders.no_orders}</p>
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
                                    <option value="pending">{dict.admin.orders.pending}</option>
                                    <option value="paid">{dict.admin.orders.paid}</option>
                                    <option value="completed">{dict.admin.orders.completed}</option>
                                </select>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePrintTicket(order)}
                                        className="p-2 text-slate-400 hover:text-primary rounded-full hover:bg-primary/10 transition-all cursor-pointer"
                                        aria-label={dict.admin.orders.aria_print_ticket}
                                    >
                                        <Printer className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={() => onDeleteOrder(order.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                                        aria-label={dict.admin.orders.aria_delete_order}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
