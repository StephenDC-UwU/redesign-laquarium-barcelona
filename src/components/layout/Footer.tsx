"use client";

import { Dictionary } from "@/dictionaries";
import Link from "next/link";
import { useState } from "react";
import Modal from "@/components/ui/Modal";

interface FooterProps {
    dict: Dictionary;
}

function Footer({ dict }: FooterProps) {
    const [activeModal, setActiveModal] = useState<"aviso" | "privacidad" | "cookies" | null>(null);

    return (
        <footer className="w-full bg-secondary text-white py-20 px-6 md:px-12 font-switzer relative">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
                
                {/* Column 1: Brand & Contact (Left) */}
                <div className="flex flex-col items-start md:col-span-4">
                    {/* Abstract Blue Shape + Logo */}
                    <div className="relative w-28 h-28 bg-primary rounded-br-[60%] rounded-tl-[50%] rounded-tr-[40%] rounded-bl-[40%] flex items-center justify-center mb-6 transform -rotate-12">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-14 h-14 text-secondary rotate-12">
                            {/* Simple Fish Icon Placeholder */}
                            <path d="M22 12c0 0-4-6-10-6S2 12 2 12s4 6 10 6 10-6 10-6z" />
                            <path d="M2 12l5-3v6z" />
                            <circle cx="15" cy="12" r="1" fill="currentColor" />
                        </svg>
                    </div>
                    <h2 className="text-5xl font-bold font-outfit mb-0 leading-none">L'Aquarium</h2>
                    <h3 className="text-3xl font-bold font-outfit mb-8">Barcelona</h3>
                    
                    <div className="text-sm space-y-3 opacity-70 font-light tracking-wide">
                        <p>Moll D'Espanya Del Port Vell, S/N</p>
                        <p>Tel. +935 22 31 93</p>
                        <p>Info@Aquariumbcn.Com</p>
                    </div>
                </div>

                {/* Column 2: Links (Middle) */}
                <div className="grid grid-cols-2 gap-4 mt-8 md:mt-0 md:col-span-5 md:pl-8 pt-4">
                    <ul className="space-y-5 text-sm font-semibold tracking-wide">
                        <li><Link href="#" className="hover:text-primary transition-colors block">Contacto</Link></li>
                        <li><Link href="#" className="hover:text-primary transition-colors block">Noticias</Link></li>
                        <li><Link href="#" className="hover:text-primary transition-colors block">Experiencias</Link></li>
                        <li><Link href="#" className="hover:text-primary transition-colors block">Educación</Link></li>
                    </ul>
                    <ul className="space-y-5 text-sm font-semibold tracking-wide">
                        <li><button onClick={() => setActiveModal("aviso")} className="hover:text-primary transition-colors text-left block">Aviso Legal</button></li>
                        <li><button onClick={() => setActiveModal("privacidad")} className="hover:text-primary transition-colors text-left block">Política De Privacidad</button></li>
                        <li><button onClick={() => setActiveModal("cookies")} className="hover:text-primary transition-colors text-left block">Política De Cookies</button></li>
                        <li><Link href="#" className="hover:text-primary transition-colors block">Normas Del Parque</Link></li>
                    </ul>
                </div>

                {/* Column 3: Miembros (Right) */}
                <div className="flex flex-col items-start mt-8 md:mt-0 md:col-span-3 pt-4">
                    <h4 className="text-sm font-bold uppercase tracking-widest mb-6">MIEMBROS</h4>
                    <div className="flex flex-wrap gap-6 items-center">
                        {/* Placeholder logos for members. Usually these are images */}
                        <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-[10px] text-center opacity-70 hover:opacity-100 transition-opacity">Bio<br/>Sphere</div>
                        <div className="w-20 h-12 border border-white/20 rounded flex items-center justify-center text-[10px] text-center opacity-70 hover:opacity-100 transition-opacity">BCN<br/>Sostenible</div>
                        <div className="w-16 h-16 border border-white/20 rounded-full flex items-center justify-center text-xs opacity-70 hover:opacity-100 transition-opacity">WAZA</div>
                    </div>
                </div>

            </div>

            {/* Newsletter Section */}
            <div className="max-w-2xl mx-auto flex flex-col items-center text-center mt-8">
                <h4 className="text-primary font-bold text-sm mb-6 tracking-wide">Suscríbete A La Newsletter Del L'Aquàrium BCN</h4>
                
                <div className="w-full mb-6">
                    <input 
                        type="email" 
                        placeholder="Email" 
                        className="w-full bg-white/5 border-b-2 border-white/20 px-4 py-4 text-white placeholder-white/40 text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                </div>
                
                <div className="flex items-start gap-4 w-full text-left mb-8">
                    <div className="pt-1">
                        <input type="checkbox" id="terms" className="w-4 h-4 rounded border-white/20 bg-transparent text-primary focus:ring-primary accent-primary cursor-pointer" />
                    </div>
                    <label htmlFor="terms" className="text-xs text-primary opacity-80 leading-relaxed cursor-pointer font-light">
                        *Declaro Haber Entendido La <button onClick={() => setActiveModal("privacidad")} className="underline hover:text-white transition-colors">Información Facilitada</button> Y Consiento El Tratamiento Que Se Efectuará De Mis Datos De Carácter Personal.
                    </label>
                </div>

                <button className="px-16 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-sm transition-colors shadow-lg">
                    Enviar
                </button>
            </div>

            {/* Modals */}
            <Modal isOpen={activeModal === "aviso"} onClose={() => setActiveModal(null)} title="Aviso Legal">
                <h3 className="text-xl font-bold text-secondary dark:text-white mb-2">1. Datos Identificativos</h3>
                <p className="mb-6">
                    En cumplimiento con el deber de información recogido en artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico, a continuación se reflejan los siguientes datos: la empresa titular de dominio web es L'Aquàrium Barcelona, con domicilio a estos efectos en Moll d'Espanya del Port Vell, s/n, 08039 Barcelona.
                </p>

                <h3 className="text-xl font-bold text-secondary dark:text-white mb-2">2. Usuarios</h3>
                <p className="mb-6">
                    El acceso y/o uso de este portal atribuye la condición de USUARIO, que acepta, desde dicho acceso y/o uso, las Condiciones Generales de Uso aquí reflejadas.
                </p>

                <h3 className="text-xl font-bold text-secondary dark:text-white mb-2">3. Uso del portal</h3>
                <p className="mb-6">
                    El sitio web proporciona el acceso a multitud de informaciones, servicios, programas o datos en Internet pertenecientes a L'Aquàrium Barcelona o a sus licenciantes a los que el USUARIO pueda tener acceso. El USUARIO asume la responsabilidad del uso del portal.
                </p>

                <h3 className="text-xl font-bold text-secondary dark:text-white mb-2">4. Propiedad Intelectual e Industrial</h3>
                <p className="mb-6">
                    L'Aquàrium Barcelona por sí o como cesionaria, es titular de todos los derechos de propiedad intelectual e industrial de su página web, así como de los elementos contenidos en la misma.
                </p>
            </Modal>

            <Modal isOpen={activeModal === "privacidad"} onClose={() => setActiveModal(null)} title="Política de Privacidad">
                <h3 className="text-xl font-bold text-secondary dark:text-white mb-2">1. Responsable del Tratamiento</h3>
                <p className="mb-6">
                    El responsable del tratamiento de sus datos personales es L'Aquàrium Barcelona. Nos tomamos muy en serio la protección de su privacidad y sus datos personales.
                </p>

                <h3 className="text-xl font-bold text-secondary dark:text-white mb-2">2. Finalidad del Tratamiento</h3>
                <p className="mb-6">
                    Tratamos la información que nos facilitan las personas interesadas con el fin de gestionar el envío de la información que nos soliciten, proveer a los interesados con ofertas de productos y servicios de su interés, y para facturación en caso de compras online.
                </p>

                <h3 className="text-xl font-bold text-secondary dark:text-white mb-2">3. Legitimación</h3>
                <p className="mb-6">
                    La base legal para el tratamiento de sus datos es el consentimiento que se solicita, sin que en ningún caso la retirada del mismo condicione la ejecución del contrato de prestación de servicios.
                </p>

                <h3 className="text-xl font-bold text-secondary dark:text-white mb-2">4. Derechos de los Usuarios</h3>
                <p className="mb-6">
                    Cualquier persona tiene derecho a obtener confirmación sobre si en L'Aquàrium Barcelona estamos tratando datos personales que les conciernan, o no. Las personas interesadas tienen derecho a acceder a sus datos personales, así como a solicitar la rectificación de los datos inexactos.
                </p>
            </Modal>

            <Modal isOpen={activeModal === "cookies"} onClose={() => setActiveModal(null)} title="Política de Cookies">
                <h3 className="text-xl font-bold text-secondary dark:text-white mb-2">1. ¿Qué son las cookies?</h3>
                <p className="mb-6">
                    Una cookie es un fichero que se descarga en su ordenador al acceder a determinadas páginas web. Las cookies permiten a una página web, entre otras cosas, almacenar y recuperar información sobre los hábitos de navegación de un usuario o de su equipo y, dependiendo de la información que contengan y de la forma en que utilice su equipo, pueden utilizarse para reconocer al usuario.
                </p>

                <h3 className="text-xl font-bold text-secondary dark:text-white mb-2">2. ¿Qué tipos de cookies utiliza esta página web?</h3>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li><strong>Cookies técnicas:</strong> Son aquellas que permiten al usuario la navegación a través de una página web, plataforma o aplicación y la utilización de las diferentes opciones o servicios que en ella existan.</li>
                    <li><strong>Cookies de personalización:</strong> Son aquellas que permiten al usuario acceder al servicio con algunas características de carácter general predefinidas en función de una serie de criterios en el terminal del usuario.</li>
                    <li><strong>Cookies de análisis:</strong> Son aquellas que bien tratadas por nosotros o por terceros, nos permiten cuantificar el número de usuarios y así realizar la medición y análisis estadístico de la utilización que hacen los usuarios del servicio ofertado.</li>
                </ul>

                <h3 className="text-xl font-bold text-secondary dark:text-white mb-2">3. Revocación y eliminación de cookies</h3>
                <p className="mb-6">
                    Puedes permitir, bloquear o eliminar las cookies instaladas en tu equipo mediante la configuración de las opciones del navegador instalado en tu ordenador.
                </p>
            </Modal>

        </footer>
    );
}

export default Footer;