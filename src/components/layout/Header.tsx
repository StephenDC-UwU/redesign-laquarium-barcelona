import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/header/logo-top.svg";
import bg_top from "@/assets/header/bg-top.svg";
import { Dictionary } from "@/dictionaries";
import { Locale } from "@/types/Locale";

import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import MobileMenu from "./MobileMenu";
import CartToggle from "./CartToggle";

interface HeaderProps {
    dict: Dictionary;
    currentLocale: Locale;
}

function Header({ dict, currentLocale }: HeaderProps) {
    const header = dict.header;

    return (
        <nav className="fixed w-full h-42 justify-center font-shadows text-fluid-xl pt-3 lg:pt-2 text-white dark:text-black z-50">
            <Image
                src={bg_top}
                fill
                priority
                className="object-cover object-bottom -z-10 pointer-events-none"
                alt="bg_top"
            />

            {/* Changed from flex-row to grid to ensure perfect logo centering on mobile */}
            <div className="w-[95%] xl:w-[85%] mx-auto grid grid-cols-[1fr_1fr_1fr] lg:grid-cols-[1fr_auto_1fr] items-center ">

                {/* 1. LEFT: Hamburger (Mobile) + Left Links (Desktop) */}
                <div className="flex items-center justify-start gap-4">
                    {/* Mobile Hamburger (Only visible < xl) */}
                    <MobileMenu dict={dict} />

                    {/* Left Links (Hidden < xl) */}
                    <ul className="hidden xl:flex flex-row justify-around w-full z-10 gap-6">
                        <li className="z-20 cursor-pointer hover:text-secondary">
                            <Link href={"/"}>{header.header_nav_visite}</Link>
                        </li>
                        <li className="z-20 cursor-pointer hover:text-secondary">
                            <Link href={"/"}>{header.header_nav_nosotros}</Link>
                        </li>
                        <li className="z-20 cursor-pointer hover:text-secondary">
                            <Link href={"/"}>{header.header_nav_exhibicion}</Link>
                        </li>
                        <li className="z-20 cursor-pointer hover:text-secondary">
                            <Link href={"/"}>{header.header_nav_educacion}</Link>
                        </li>
                    </ul>
                </div>

                {/* 2. CENTER: Logo */}
                <div className="flex justify-start lg:justify-center items-start lg:items-center z-10">
                    <div className="z-20 cursor-pointer transition-transform duration-500 hover:scale-110">
                        <Link href={"/"} className="block">
                            <Image
                                src={logo}
                                className="w-24"
                                style={{ objectFit: "contain" }}
                                alt="Logo Aquarium"
                            />
                        </Link>
                    </div>
                </div>

                {/* 3. RIGHT: Right Links */}
                <ul className="flex flex-row items-center justify-around z-10 ml-2 lg:ml-0 gap-0 md:gap-4 xl:gap-6 w-full">
                    <li className="hidden xl:block z-20 cursor-pointer hover:text-secondary">
                        <Link href={"/"}>{header.header_nav_noticias}</Link>
                    </li>
                    <li className="hidden xl:block z-20 cursor-pointer hover:text-secondary">
                        <Link href={"/"}>{header.header_nav_blog}</Link>
                    </li>
                    <li className="z-20 flex items-center flex-row gap-2">
                        <LanguageSwitcher currentLocal={currentLocale} />
                        <ThemeToggle />
                    </li>
                    <li className="z-20">
                        <CartToggle />
                    </li>
                </ul>

            </div>
        </nav>
    );
}

export default Header;