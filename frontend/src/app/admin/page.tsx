"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ClipboardList, Stethoscope, BookOpenCheck, BedDouble, UserPlus, NotebookPen, FileText, LayoutDashboard } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const adminLinks = [
  {
    href: "/admin/diagnosis",
    icon: <Stethoscope className="w-8 h-8" />,
    title: "Диагнозы",
    desc: "Список и управление диагнозами",
    color: "bg-sky-100 text-sky-700",
  },
  {
    href: "/admin/procedures",
    icon: <BookOpenCheck className="w-8 h-8" />,
    title: "Процедуры",
    desc: "Все лечебные процедуры",
    color: "bg-green-100 text-green-700",
  },
  {
    href: "/admin/courses",
    icon: <ClipboardList className="w-8 h-8" />,
    title: "Курсы",
    desc: "Оздоровительные курсы и программы",
    color: "bg-purple-100 text-purple-700",
  },
  {
    href: "/admin/rooms",
    icon: <BedDouble className="w-8 h-8" />,
    title: "Комнаты",
    desc: "Управление номерами и размещением",
    color: "bg-amber-100 text-amber-700",
  },
  {
    href: "/admin/staff-create",
    icon: <UserPlus className="w-8 h-8" />,
    title: "Создать аккаунт врача",
    desc: "Добавить нового врача или сотрудника",
    color: "bg-pink-100 text-pink-700",
  },
  {
    href: "/admin/procedure-journal",
    icon: <NotebookPen className="w-8 h-8" />,
    title: "Журнал процедур",
    desc: "Ведение и просмотр процедур",
    color: "bg-blue-100 text-blue-700",
  },
  {
    href: "/admin/orders",
    icon: <FileText className="w-8 h-8" />,
    title: "Заказы",
    desc: "Все заявки и заказы",
    color: "bg-red-100 text-red-700",
  },
];

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.replace("/auth");
      return;
    }
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      if (decoded.role !== "ADMIN") {
        router.replace("/profile");
      }
    } catch {
      router.replace("/auth");
    }
  }, [token, router]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <div className="p-3 rounded-lg bg-sky-100 text-sky-700">
          <LayoutDashboard className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-sky-900">Админ-панель</h1>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminLinks.map((link, index) => (
          <motion.div
            key={link.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={link.href}>
              <motion.div
                whileHover={{ y: -5 }}
                className={`group relative overflow-hidden rounded-xl shadow-sm hover:shadow-md border border-gray-100 p-6 transition-all ${link.color} hover:bg-opacity-80`}
              >
                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  {link.icon}
                </div>
                <div className="relative z-10">
                  <div className={`p-3 rounded-lg ${link.color.replace('text', 'bg').replace('700', '100')} w-fit mb-4`}>
                    {link.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{link.title}</h3>
                  <p className="text-gray-600 text-sm">{link.desc}</p>
                  <div className="mt-4 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    Перейти
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}