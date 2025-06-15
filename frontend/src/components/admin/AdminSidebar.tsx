"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { 
  Home, 
  ClipboardList, 
  FlaskConical, 
  BookOpen, 
  Building2, 
  UserPlus, 
  Calendar, 
  ShoppingCart 
} from "lucide-react";

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  path: string;
}

export default function AdminSidebar() {
  const router = useRouter();

  const menuItems: MenuItem[] = [
    { name: "Дашборд", icon: <Home className="w-5 h-5" />, path: "/admin" },
    { name: "Диагнозы", icon: <ClipboardList className="w-5 h-5" />, path: "/admin/diagnoses" },
    { name: "Процедуры", icon: <FlaskConical className="w-5 h-5" />, path: "/admin/procedures" },
    { name: "Курсы", icon: <BookOpen className="w-5 h-5" />, path: "/admin/courses" },
    { name: "Комнаты", icon: <Building2 className="w-5 h-5" />, path: "/admin/rooms" },
    { name: "Врачи", icon: <UserPlus className="w-5 h-5" />, path: "/admin/doctors" },
    { name: "Журнал", icon: <Calendar className="w-5 h-5" />, path: "/admin/journal" },
    { name: "Заказы", icon: <ShoppingCart className="w-5 h-5" />, path: "/admin/orders" },
  ];

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="fixed left-0 top-0 h-screen w-64 bg-white shadow-lg border-r border-gray-200 z-10"
    >
      <div className="p-6 text-2xl font-bold text-indigo-600 flex items-center gap-2">
        <FlaskConical className="w-6 h-6" />
        <span>MedAdmin</span>
      </div>
      <nav className="mt-6 px-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <motion.li
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href={item.path} passHref>
                <a
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    router.pathname === item.path
                      ? "bg-indigo-50 text-indigo-600 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </a>
              </Link>
            </motion.li>
          ))}
        </ul>
      </nav>
    </motion.div>
  );
}