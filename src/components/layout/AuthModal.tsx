"use client";

import React, { useState, useTransition } from "react";
import Modal from "../ui/Modal";
import { useAuth } from "@/context/AuthContext";
import { LogIn, UserPlus } from "lucide-react";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const { login, register } = useAuth();
    const [mode, setMode] = useState<"login" | "register">("login");
    const [isPending, startTransition] = useTransition();

    // Form states
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        if (!email || !password || (mode === "register" && !fullName)) {
            setErrorMsg("Todos los campos obligatorios deben ser rellenados.");
            return;
        }

        startTransition(async () => {
            if (mode === "login") {
                const res = await login(email, password);
                if (res.success) {
                    onClose();
                    // Reset fields
                    setPassword("");
                } else {
                    setErrorMsg(res.error || "Error al iniciar sesión.");
                }
            } else {
                const res = await register(fullName, email, password);
                if (res.success) {
                    setSuccessMsg("¡Registro exitoso! Iniciando sesión...");
                    setTimeout(() => {
                        onClose();
                        // Reset fields
                        setFullName("");
                        setPassword("");
                        setSuccessMsg("");
                    }, 1500);
                } else {
                    setErrorMsg(res.error || "Error al registrarse.");
                }
            }
        });
    };

    const toggleMode = () => {
        setMode((prev) => (prev === "login" ? "register" : "login"));
        setErrorMsg("");
        setSuccessMsg("");
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === "login" ? "Acceso de Usuario" : "Registro de Usuario"}
        >
            <div className="max-w-md mx-auto space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === "register" && (
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 block">
                                Nombre Completo
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Ej: Stephen Strange"
                                disabled={isPending}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground disabled:opacity-50"
                                required
                            />
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 block">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Ej: stephen@aquarium.com"
                            disabled={isPending}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground disabled:opacity-50"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 block">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            disabled={isPending}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-switzer text-sm focus:outline-none focus:border-primary text-foreground disabled:opacity-50"
                            required
                        />
                    </div>

                    {errorMsg && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 font-switzer text-xs">
                            {errorMsg}
                        </div>
                    )}

                    {successMsg && (
                        <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 rounded-xl text-green-600 dark:text-green-400 font-switzer text-xs">
                            {successMsg}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-primary hover:bg-primary-light disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold font-outfit py-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/10"
                    >
                        {mode === "login" ? (
                            <>
                                <LogIn size={18} />
                                {isPending ? "Iniciando Sesión..." : "Entrar"}
                            </>
                        ) : (
                            <>
                                <UserPlus size={18} />
                                {isPending ? "Registrando..." : "Crear Cuenta"}
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center pt-2">
                    <button
                        onClick={toggleMode}
                        disabled={isPending}
                        className="text-xs font-semibold text-primary hover:underline"
                    >
                        {mode === "login"
                            ? "¿No tienes una cuenta? Regístrate aquí"
                            : "¿Ya tienes cuenta? Inicia sesión aquí"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
