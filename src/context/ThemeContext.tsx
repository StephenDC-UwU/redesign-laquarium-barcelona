"use client"

import { createContext, useContext, useEffect, useState } from "react";
import { Theme } from "@/types/Theme";

export interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(Theme.LIGHT);

    useEffect(() => {
        const stored = localStorage.getItem('theme') as Theme | null;

        if (stored) setTheme(stored);
        else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDark ? Theme.DARK : Theme.LIGHT);
            localStorage.setItem('theme', prefersDark ? Theme.DARK : Theme.LIGHT);
        }
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        if (theme === Theme.DARK) root.classList.add(Theme.DARK)
        else root.classList.remove(Theme.DARK)
        localStorage.setItem('theme', theme);

    }, [theme]);

    const toggleTheme = () => setTheme((prev) => (prev === Theme.DARK ? Theme.LIGHT : Theme.DARK))

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
};


export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
};