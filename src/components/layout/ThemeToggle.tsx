"use client"

import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { Theme } from "@/types/Theme";

export default function ThemeToggle() {

    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2"
        >
            {theme === Theme.LIGHT ? <Sun className="size-9 stroke-[1]" /> : <Moon className="size-9 stroke-[1]" />}
        </button>
    );
}