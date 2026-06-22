"use client";

import { useActiveSection } from "@/utils/useActiveSection";

export default function SectionObserver() {
    // Activa la observación de todas las etiquetas <section> que tengan un atributo id
    useActiveSection("section[id]");
    
    // Este componente es invisible, solo sirve para ejecutar el Hook a nivel global
    return null;
}
