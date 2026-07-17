import Link from "next/link";
import Image from "next/image";
import { Dictionary } from "@/dictionaries";

interface FloatingTicketsProps {
    dict: Dictionary;
    locale: string;
}

export default function FloatingTickets({ dict, locale }: FloatingTicketsProps) {
    return (
        <Link
            href={`/${locale}/tickets`}
            className="hidden md:fixed md:flex bottom-2 md:bottom-6 right-6 z-50 group justify-center transition-transform hover:scale-105 duration-300 active:scale-95"
        >
            <div className="relative w-64 h-64 flex items-center justify-center">
                <Image
                    src="/mini-shark-blue.svg"
                    alt="Mini Shark Tickets"
                    fill
                    className="object-contain pointer-events-none"
                />
                <span className="absolute z-10  font-outfit text-lg md:text-xl text-left  pr-22 
                leading-none select-none text-white">
                    {dict.nav.nav_tickets}
                </span>
            </div>
        </Link>
    );
}
