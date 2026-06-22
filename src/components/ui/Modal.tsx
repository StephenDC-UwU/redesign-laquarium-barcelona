import { useEffect, useRef } from "react";
import gsap from "gsap";
import { X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    const backdropRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            
            // Initial states for GSAP
            gsap.set(backdropRef.current, { opacity: 0 });
            gsap.set(modalRef.current, { opacity: 0, y: 30, scale: 0.95 });

            // Animate in
            gsap.to(backdropRef.current, { opacity: 1, duration: 0.3 });
            gsap.to(modalRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power3.out", delay: 0.1 });
        } else {
            document.body.style.overflow = "unset";
        }

        // Cleanup function in case component unmounts while open
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div 
            ref={backdropRef} 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-secondary/80 backdrop-blur-sm p-4"
            onClick={(e) => {
                if (e.target === backdropRef.current) onClose();
            }}
        >
            <div 
                ref={modalRef} 
                className="bg-background relative w-full max-w-3xl max-h-[85vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-3xl font-bold font-outfit text-secondary dark:text-white">
                        {title}
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                        aria-label="Cerrar"
                    >
                        <X className="w-6 h-6 text-slate-500 group-hover:text-primary transition-colors" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 overflow-y-auto scrollbar-none pb-12">
                    <div className="prose dark:prose-invert max-w-none font-switzer text-slate-600 dark:text-slate-300 leading-relaxed">
                        {children}
                    </div>
                </div>

                {/* Optional Footer Gradient for Scroll Indicator */}
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
            </div>
        </div>
    );
}
