import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { UserSession } from "@/context/AuthContext";


export default function UserToggle({ user, currentLocale, logout, setIsAuthOpen }: { user: UserSession | null, currentLocale: string, logout: () => void, setIsAuthOpen: (open: boolean) => void }) {
    return (
        <>
            {user ? (
                <div className="flex items-center gap-3">
                    <Link
                        href={`/${currentLocale}/profile`}
                        className="flex items-center gap-1.5 hover:text-secondary transition-colors"
                        title="Ver mi perfil"
                    >
                        <User className="size-9 stroke-[1]" />
                        <span className="hidden xl:inline text-sm font-bold font-outfit truncate max-w-[80px]">
                            {user.fullName.split(" ")[0]}
                        </span>
                    </Link>
                    <button
                        onClick={logout}
                        className="p-1 hover:text-red-400 transition-colors cursor-pointer"
                        title="Cerrar sesión"
                    >
                        <LogOut className="size-9 stroke-[1]" />
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setIsAuthOpen(true)}
                    className="flex items-center gap-1 hover:text-secondary transition-colors cursor-pointer"
                    title="Iniciar sesión"
                >
                    <User className="size-9 stroke-[1]" />
                </button>
            )}

        </>
    )
}