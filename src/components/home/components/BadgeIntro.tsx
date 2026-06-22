import React from "react";

interface BadgeIntroProps {
  className?: string;
  style?: React.CSSProperties;
  text: string;
  variant?: 1 | 2;
  layout?: "desktop" | "mobile";
}

export default function BadgeIntro({
  className = "",
  style,
  text,
  variant = 1,
  layout = "desktop",
}: BadgeIntroProps) {
  const isDesktop = layout === "desktop";

  const borderRadius =
    variant === 1
      ? "rounded-[55%_45%_65%_35%_/_45%_55%_35%_65%]"
      : "rounded-[45%_55%_35%_65%_/_55%_45%_65%_35%]";

  const textRotation = variant === 1 ? "rotate-6" : "-rotate-6";

  const containerClass = isDesktop
    ? `absolute bg-primary shadow-xl shadow-primary/20 flex items-center justify-center hover:scale-[1.05] transition-transform duration-300 cursor-pointer z-10 ${borderRadius} ${className}`
    : `w-36 h-36 bg-primary shadow-lg shadow-primary/20 flex items-center justify-center ${borderRadius} ${className}`;

  const textClass = isDesktop
    ? `text-fluid-title text-white font-shadows ${textRotation}`
    : `text-2xl text-white font-shadows font-semibold ${textRotation}`;

  return (
    <div style={style} className={containerClass}>
      <span className={textClass}>
        {text}
      </span>
    </div>
  );
}
