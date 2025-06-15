"use client";
import { Home, CalendarDays, Mountain, CircleUser, LogOut } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export const Navbar = () => {
  const { token, signout } = useAuth();
  const router = useRouter();

  function getRoleFromToken(token: string): string | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.role || null;
    } catch {
      return null;
    }
  }

  return (
    <header className="bg-sky-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Mountain className="h-10 w-10 text-yellow-300" />
            <span className="text-2xl font-bold font-comic">
              Юность
              <span className="block text-sm font-normal">Детский санаторий</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            <NavLink href="/" icon={<Home size={18} />}>
              Главная
            </NavLink>
            <NavLink href="/service" icon={<CalendarDays size={18} />}>
              Курсы лечения
            </NavLink>
          </nav>

          <div className="flex items-center space-x-4">
            {!token ? (
              <Link
                href="/auth"
                className="bg-yellow-400 hover:bg-yellow-500 text-sky-800 px-4 py-2 rounded-full font-medium flex items-center transition-colors"
              >
                <CircleUser className="mr-2" size={18} />
                Войти
              </Link>
            ) : (
              <>
                <Link
                  href={
                    getRoleFromToken(token || "") === "ADMIN"
                      ? "/admin"
                      : "/profile"
                  }
                  className="bg-yellow-400 hover:bg-yellow-500 text-sky-800 px-4 py-2 rounded-full font-medium flex items-center transition-colors"
                >
                  <CircleUser className="mr-2" size={18} />
                  {getRoleFromToken(token || "") === "ADMIN"
                    ? "Админ-панель"
                    : "Личный кабинет"}
                </Link>
                <button
                  onClick={() => {
                    signout();
                    router.push("/");
                  }}
                  className="flex items-center px-3 py-2 rounded-full bg-red-100 hover:bg-red-200 text-red-700 font-medium transition-colors"
                  title="Выйти"
                >
                  <LogOut className="mr-1" size={18} />
                  Выйти
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const NavLink = ({ href, icon, children }: { href: string; icon: React.ReactNode; children: string }) => (
  <Link
    href={href}
    className="flex items-center px-4 py-2 rounded-lg hover:bg-sky-500 transition-colors group"
  >
    <span className="mr-2 group-hover:text-yellow-300 transition-colors">
      {icon}
    </span>
    <span>{children}</span>
  </Link>
);