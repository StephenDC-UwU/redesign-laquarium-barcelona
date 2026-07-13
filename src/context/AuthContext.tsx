"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { loginUserAction, registerUserAction, adminLoginAction } from "@/actions/authActions";

export interface UserSession {
    id: string;
    email: string;
    fullName: string;
    role: string;
}

interface AuthContextType {
    user: UserSession | null;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    adminLogin: (password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SECRET_KEY = "laquarium-bcn-session-salt-and-pepper";
const SESSION_EXPIRATION_TIME = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

// Client-side obfuscation cipher to secure stored user details from simple inspection
function encryptSession(data: any): string {
    const jsonStr = JSON.stringify(data);
    let result = "";
    for (let i = 0; i < jsonStr.length; i++) {
        const charCode = jsonStr.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
        result += String.fromCharCode(charCode);
    }
    return btoa(unescape(encodeURIComponent(result)));
}

function decryptSession(cipherText: string): any {
    try {
        const decoded = decodeURIComponent(escape(atob(cipherText)));
        let result = "";
        for (let i = 0; i < decoded.length; i++) {
            const charCode = decoded.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
            result += String.fromCharCode(charCode);
        }
        return JSON.parse(result);
    } catch (e) {
        return null;
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserSession | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const storedEncryptedUser = localStorage.getItem("aquarium_user_secure");

        if (storedEncryptedUser) {
            const sessionData = decryptSession(storedEncryptedUser);
            if (sessionData && sessionData.expiresAt && sessionData.expiresAt > Date.now()) {
                setUser(sessionData.data);
                setIsAdmin(sessionData.data.role === "admin");
            } else {
                // Session expired or corrupted
                localStorage.removeItem("aquarium_user_secure");
                setUser(null);
                setIsAdmin(false);
            }
        }
    }, []);

    // Session timeout watchdog
    useEffect(() => {
        const interval = setInterval(() => {
            const storedEncryptedUser = localStorage.getItem("aquarium_user_secure");
            if (storedEncryptedUser) {
                const sessionData = decryptSession(storedEncryptedUser);
                if (sessionData && sessionData.expiresAt && sessionData.expiresAt <= Date.now()) {
                    logout();
                    alert("Tu sesión ha expirado por inactividad. Por favor, inicia sesión de nuevo.");
                }
            }
        }, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const saveSession = (session: UserSession) => {
        const expiresAt = Date.now() + SESSION_EXPIRATION_TIME;
        const payload = {
            data: session,
            expiresAt,
        };
        const encrypted = encryptSession(payload);
        localStorage.setItem("aquarium_user_secure", encrypted);
    };

    const login = async (email: string, password: string) => {
        const res = await loginUserAction({ email, password });
        if (res.success && res.user) {
            const session: UserSession = {
                id: res.user.id,
                email: res.user.email,
                fullName: res.user.fullName,
                role: res.user.role,
            };
            setUser(session);
            setIsAdmin(session.role === "admin");
            saveSession(session);
            return { success: true };
        }
        return { success: false, error: res.error };
    };

    const register = async (fullName: string, email: string, password: string) => {
        const res = await registerUserAction({ fullName, email, password });
        if (res.success && res.user) {
            const session: UserSession = {
                id: res.user.id,
                email: res.user.email,
                fullName: res.user.fullName,
                role: res.user.role,
            };
            setUser(session);
            saveSession(session);
            return { success: true };
        }
        return { success: false, error: res.error };
    };

    const adminLogin = async (password: string) => {
        const res = await adminLoginAction(password);
        if (res.success && res.user) {
            setUser(res.user);
            setIsAdmin(true);
            saveSession(res.user);
            return { success: true };
        }
        return { success: false, error: res.error || "Error al iniciar sesión como administrador" };
    };

    const logout = () => {
        setUser(null);
        setIsAdmin(false);
        localStorage.removeItem("aquarium_user_secure");
    };

    return (
        <AuthContext.Provider value={{ user, isAdmin, login, register, adminLogin, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
