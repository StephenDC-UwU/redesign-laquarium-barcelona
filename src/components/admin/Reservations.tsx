import React, { useState, useEffect } from "react";
import { 
    getOccupancyReportAction, 
    getDailyCapacityAction, 
    updateDailyCapacityAction 
} from "@/actions/adminActions";

interface ReservationsProps {
    isAdmin: boolean;
}

export default function Reservations({ isAdmin }: ReservationsProps) {
    const [selectedReportDate, setSelectedReportDate] = useState(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });

    const [reportDateCapacity, setReportDateCapacity] = useState(50);
    const [capacityInputValue, setCapacityInputValue] = useState(50);
    const [occupancyReport, setOccupancyReport] = useState<Record<string, number>>({});
    const [capacityError, setCapacityError] = useState("");
    const [capacitySuccessMsg, setCapacitySuccessMsg] = useState("");

    // Fetch capacity and occupancy when date changes
    useEffect(() => {
        if (isAdmin && selectedReportDate) {
            getOccupancyReportAction(selectedReportDate).then(setOccupancyReport);
            getDailyCapacityAction(selectedReportDate).then((cap) => {
                setReportDateCapacity(cap);
                setCapacityInputValue(cap);
            });
        }
    }, [selectedReportDate, isAdmin]);

    const handleUpdateCapacity = async (e: React.FormEvent) => {
        e.preventDefault();
        setCapacityError("");
        setCapacitySuccessMsg("");
        
        const res = await updateDailyCapacityAction(selectedReportDate, capacityInputValue);

        if (res.success) {
            setCapacitySuccessMsg("Aforo para el día seleccionado actualizado correctamente.");
            setReportDateCapacity(capacityInputValue);
        } else {
            setCapacityError(res.error || "Hubo un error al actualizar el aforo.");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Configuration Form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                <h3 className="text-xl font-bold font-outfit text-secondary dark:text-white flex items-center gap-2">
                    Configuración de Aforo
                </h3>
                <form onSubmit={handleUpdateCapacity} className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-outfit">
                            Fecha Seleccionada
                        </span>
                        <span className="text-sm font-bold text-secondary dark:text-white font-mono block">
                            {selectedReportDate}
                        </span>
                        <span className="text-[10px] text-slate-500 font-switzer block mt-1">
                            (Cambia la fecha desde el monitor de la derecha)
                        </span>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 block">
                            Capacidad Máxima por Hora
                        </label>
                        <input
                            type="number"
                            value={capacityInputValue}
                            onChange={(e) => setCapacityInputValue(parseInt(e.target.value, 10))}
                            min={1}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground"
                            required
                        />
                    </div>

                    {capacityError && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 font-switzer text-xs">
                            {capacityError}
                        </div>
                    )}
                    {capacitySuccessMsg && (
                        <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-xl text-green-600 dark:text-green-400 font-switzer text-xs">
                            {capacitySuccessMsg}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary-light text-white font-bold font-outfit py-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/10"
                    >
                        Guardar Configuración
                    </button>
                </form>
            </div>

            {/* Bookings Monitor */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <h3 className="text-xl font-bold font-outfit text-secondary dark:text-white">
                        Monitor de Reservas por Hora
                    </h3>
                    <div>
                        <input
                            type="date"
                            value={selectedReportDate}
                            onChange={(e) => setSelectedReportDate(e.target.value)}
                            className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground cursor-pointer"
                        />
                    </div>
                </div>

                <div className="space-y-3 pt-4">
                    {["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"].map((slot) => {
                        const booked = occupancyReport[slot] || 0;
                        const pct = Math.min(100, (booked / reportDateCapacity) * 100);

                        return (
                            <div key={slot} className="space-y-1">
                                <div className="flex justify-between text-sm font-switzer">
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{slot}</span>
                                    <span className="text-slate-500">
                                        {booked} / {reportDateCapacity} personas ({pct.toFixed(0)}%)
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                                    <div
                                        style={{ width: `${pct}%` }}
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            pct >= 100
                                                ? "bg-red-500"
                                                : pct >= 80
                                                    ? "bg-yellow-500"
                                                    : "bg-primary"
                                        }`}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
