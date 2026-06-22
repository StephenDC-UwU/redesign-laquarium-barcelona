import React from "react";

interface CardIntroProps {
    className?: string;
    style?: React.CSSProperties;
    text: string;
    buttonText: string;
    buttonVariant?: "primary" | "tertiary";
    layout?: "desktop" | "mobile";
}

export default function CardIntro({
    className = "",
    style,
    text,
    buttonText,
    buttonVariant = "primary",
    layout = "desktop",
}: CardIntroProps) {
    const isDesktop = layout === "desktop";

    const btnClass = isDesktop
        ? (buttonVariant === "primary"
            ? "bg-primary hover:bg-primary-light text-white font-bold px-6 py-2.5 transition-all duration-200 self-end shadow-md shadow-primary/20 text-fluid-lg cursor-pointer"
            : "bg-tertiary hover:opacity-90 text-white font-bold px-6 py-2.5 transition-all duration-200 self-end shadow-md shadow-tertiary/20 text-fluid-lg cursor-pointer")
        : (buttonVariant === "primary"
            ? "bg-primary hover:bg-primary-light text-white font-bold px-5 py-2 transition-all duration-200 self-end shadow-md rounded-lg cursor-pointer"
            : "bg-tertiary hover:opacity-90 text-white font-bold px-5 py-2 transition-all duration-200 self-end shadow-md rounded-lg cursor-pointer");

    const containerClass = isDesktop
        ? `absolute bg-secondary text-white dark:bg-slate-900 border border-white/10 rounded-[2rem] p-7 shadow-2xl flex flex-col justify-between hover:scale-[1.03] transition-transform duration-300 z-10 ${className}`
        : `bg-secondary text-white dark:bg-slate-900 border border-white/10 rounded-[1.5rem] p-6 shadow-xl flex flex-col gap-4 ${className}`;

    const textClass = isDesktop
        ? "text-2xl lg:text-3xl xl:text-4xl 2xl:text-6xl font-semibold font-outfit"
        : "text-lg font-medium font-switzer leading-relaxed";

    return (
        <div style={style} className={containerClass}>
            <p className={textClass}>
                {text}
            </p>
            <button className={btnClass}>
                {buttonText}
            </button>
        </div>
    );
}
