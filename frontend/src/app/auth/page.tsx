"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Lock, Mail, User, Phone, Home, CreditCard, LogIn, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const { signup, signin, loading, error } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    address: "",
    passport_data: "",
  });
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };

  function getRoleFromToken(token: string): string | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.role || null;
    } catch {
      return null;
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await signin(loginForm);
    setSuccess(true);
    const token = localStorage.getItem("token");
    if (token) {
      const role = getRoleFromToken(token);
      if (role === "ADMIN") {
        router.push("/admin");
      } else if (role === "USER") {
        router.push("/profile");
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await signup({
      email: registerForm.email,
      password: registerForm.password,
      parent: {
        name: registerForm.name,
        phone: registerForm.phone,
        address: registerForm.address,
        passport_data: registerForm.passport_data,
      },
    });
    setSuccess(true);
  };


  const formatError = (err: any) => {
    if (typeof err === 'string') return err;
    if (err?.message) return err.message;
    if (err?.msg) return err.msg;
    return 'Произошла ошибка';
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="flex">
          <button
            className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-all ${tab === "login" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            onClick={() => { setTab("login"); setSuccess(false); }}
          >
            <LogIn className="w-5 h-5" />
            Вход
          </button>
          <button
            className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-all ${tab === "register" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            onClick={() => { setTab("register"); setSuccess(false); }}
          >
            <UserPlus className="w-5 h-5" />
            Регистрация
          </button>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {tab === "login" ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleLogin}
                className="space-y-5"
              >
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input 
                    name="email" 
                    type="email" 
                    required 
                    placeholder="Email" 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={loginForm.email} 
                    onChange={handleLoginChange} 
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input 
                    name="password" 
                    type="password" 
                    required 
                    placeholder="Пароль" 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={loginForm.password} 
                    onChange={handleLoginChange} 
                  />
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Вход...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Войти
                    </>
                  )}
                </motion.button>

                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-red-500 bg-red-50 p-3 rounded-lg"
                    >
                      {error}
                    </motion.div>
                  )}
                  {success && !error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-green-600 bg-green-50 p-3 rounded-lg"
                    >
                      Вход выполнен успешно!
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleRegister}
                className="space-y-5"
              >
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input 
                    name="email" 
                    type="email" 
                    required 
                    placeholder="Email" 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={registerForm.email} 
                    onChange={handleRegisterChange} 
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input 
                    name="password" 
                    type="password" 
                    required 
                    placeholder="Пароль" 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={registerForm.password} 
                    onChange={handleRegisterChange} 
                  />
                </div>

                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input 
                    name="name" 
                    required 
                    placeholder="Имя" 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={registerForm.name} 
                    onChange={handleRegisterChange} 
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input 
                    name="phone" 
                    required 
                    placeholder="Телефон" 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={registerForm.phone} 
                    onChange={handleRegisterChange} 
                  />
                </div>

                <div className="relative">
                  <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input 
                    name="address" 
                    required 
                    placeholder="Адрес" 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={registerForm.address} 
                    onChange={handleRegisterChange} 
                  />
                </div>

                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input 
                    name="passport_data" 
                    required 
                    placeholder="Паспортные данные" 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={registerForm.passport_data} 
                    onChange={handleRegisterChange} 
                  />
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Регистрация...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Зарегистрироваться
                    </>
                  )}
                </motion.button>
                
                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-red-500 bg-red-50 p-3 rounded-lg"
                    >
                      {formatError(error)}
                    </motion.div>
                  )}
                  {success && !error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-green-600 bg-green-50 p-3 rounded-lg"
                    >
                      Регистрация успешно завершена!
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}