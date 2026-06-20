import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/header/logo-top.svg";
import bg_top from "@/assets/header/bg-top.svg";
import { Dictionary } from "@/dictionaries";
import LanguageSwitcher from "./LanguageSwitcher";
import { Locale } from "@/types/Locale";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
    dict: Dictionary;
    currentLocale: Locale;
}

function Header({ dict, currentLocale }: HeaderProps) {
    const header = dict.header;

    return (
        <nav className="fixed w-full h-42 flex pt-8 justify-center font-shadows text-3xl text-white dark:text-black z-50">
            <Image
                src={bg_top}
                fill
                priority
                className="object-cover object-bottom -z-10 pointer-events-none"
                alt="bg_top"
            />

            <div className="flex flex-row justify-around w-full z-10">
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
            </div>

            <div className="center w-50 z-10">
                <li className=" self-center justify-self-center">
                    <Image
                        src={logo}
                        style={{ objectFit: "contain" }}
                        alt="Logo Aquarium"
                    />
                </li>
            </div>

            <div className="flex flex-row justify-around w-full z-10">
                <li className="z-20 cursor-pointer hover:text-secondary">
                    <Link href={"/"}>{header.header_nav_noticias}</Link>
                </li>
                <li className="z-20 cursor-pointer hover:text-secondary">
                    <Link href={"/"}>{header.header_nav_blog}</Link>
                </li>
                <li className="z-20 cursor-pointer hover:text-secondary">
                    <LanguageSwitcher currentLocal={currentLocale} />
                </li>
                <li className="z-20 cursor-pointer hover:text-secondary">
                    <ThemeToggle />
                </li>
                <li className="z-20 cursor-pointer hover:text-secondary">
                    <Link href={"/"}>{header.header_nav_contact}</Link>
                </li>
            </div>
        </nav>
    );
}

export default Header;