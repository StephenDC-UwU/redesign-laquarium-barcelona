"use client";

import { useState, useEffect } from "react";

/**
 * Detects which section is currently active (visible in the center of the screen).
 * Injects a `data-active-section="id-name"` attribute on the <body> tag
 * so you can style your layout globally from your CSS.
 */
export function useActiveSection(sectionSelector: string = "section[id]") {
    const [activeSection, setActiveSection] = useState<string>("");

    useEffect(() => {
        const elements = document.querySelectorAll(sectionSelector);
        
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const id = entry.target.id;
                        if (id) {
                            setActiveSection(id);
                            
                            // 🔥 Injects the active section into the body for global CSS 🔥
                            // Example in globals.css:
                            // body[data-active-section="intro"] nav { background-color: white; }
                            document.body.setAttribute("data-active-section", id);
                        }
                    }
                });
            },
            {
                // The trigger fires when the section crosses the top 40% of the screen
                rootMargin: "-20% 0px -60% 0px", 
                threshold: 0
            }
        );

        elements.forEach((el) => observer.observe(el));

        return () => {
            observer.disconnect();
            document.body.removeAttribute("data-active-section");
        };
    }, [sectionSelector]);

    return activeSection;
}
