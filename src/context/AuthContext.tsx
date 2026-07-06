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

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserSession | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const storedUser = localStorage.getItem("aquarium_user");
        const storedAdmin = localStorage.getItem("aquarium_admin") === "true";

        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Error loading user context:", e);
            }
        }
        setIsAdmin(storedAdmin);
    }, []);

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
            localStorage.setItem("aquarium_user", JSON.stringify(session));
            if (session.role === "admin") {
                localStorage.setItem("aquarium_admin", "true");
            }
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
            localStorage.setItem("aquarium_user", JSON.stringify(session));
            return { success: true };
        }
        return { success: false, error: res.error };
    };

    const adminLogin = async (password: string) => {
        const res = await adminLoginAction(password);
        if (res.success) {
            const mockAdmin: UserSession = {
                id: "admin-root",
                email: "admin@aquarium.com",
                fullName: "Root Admin",
                role: "admin",
            };
            setUser(mockAdmin);
            setIsAdmin(true);
            localStorage.setItem("aquarium_user", JSON.stringify(mockAdmin));
            localStorage.setItem("aquarium_admin", "true");
            return { success: true };
        }
        return { success: false, error: res.error };
    };

    const logout = () => {
        setUser(null);
        setIsAdmin(false);
        localStorage.removeItem("aquarium_user");
        localStorage.removeItem("aquarium_admin");
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
