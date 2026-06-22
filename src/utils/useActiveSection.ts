"use client";

import { useState, useEffect } from "react";

/**
 * Detecta qué sección está actualmente activa (visible en el centro de la pantalla).
 * Inyecta un atributo `data-active-section="nombre-del-id"` en la etiqueta <body> 
 * para que puedas estilizar tu layout globalmente desde tu CSS.
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
                            
                            // 🔥 Inyecta la sección activa en el body para CSS global 🔥
                            // Ejemplo en globals.css:
                            // body[data-active-section="intro"] nav { background-color: white; }
                            document.body.setAttribute("data-active-section", id);
                        }
                    }
                });
            },
            {
                // El disparador se activa cuando la sección cruza el 40% superior de la pantalla
                rootMargin: "-40% 0px -60% 0px", 
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
