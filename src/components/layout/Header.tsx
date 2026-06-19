import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/header/logo-top.svg";

function Header() {
    return (
        <nav className="bg-primary h-28 flex items-center justify-center">
            <div className="flex flex-row justify-around w-full">
                <li>
                    <Link href={"/"}>Visita</Link>
                </li>
                <li>
                    <Link href={"/"}>Nosotros</Link>
                </li>
                <li>
                    <Link href={"/"}>Exhibicion</Link>
                </li>
                <li>
                    <Link href={"/"}>Educación</Link>
                </li>
            </div>

            <div className="center max-w-50">
                <li className=" self-center justify-self-center">
                    <Image
                        src={logo}
                        objectFit="contain"
                        alt={`Logo Aquarium`}
                    />
                </li>

            </div>

            <div className="flex flex-row justify-around w-full">
                <li>
                    <Link href={"/"}>Nosotros</Link>
                </li>
                <li>
                    <Link href={"/"}>Nosotros</Link>
                </li>
                <li>
                    <Link href={"/"}>Nosotros</Link>
                </li>
                <li>
                    <Link href={"/"}>Nosotros</Link>
                </li>
                <li>
                    <Link href={"/"}>Nosotros</Link>
                </li>
            </div>
        </nav>
    );
}

export default Header;