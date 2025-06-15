"use client";
import { useEffect, useState } from "react";
import { HeartPulse, Clock, Thermometer, AlertTriangle, Activity, ChevronDown, ChevronUp, User, Lock } from "lucide-react";
import { motion, AnimatePresence, easeInOut } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";

interface Diagnosis {
  id: number;
  name: string;
  icd_code: string;
  description: string;
  symptoms: string;
  contraindications: string;
}

interface Procedure {
  id: number;
  name: string;
  description: string;
  contraindications: string;
  frequency: string;
  duration_min: number;
}

interface Course {
  id: number;
  name: string;
  description: string;
  price: number | { source: string; parsedValue: number };
  duration_days: number;
  diagnosis: Diagnosis;
  procedures: Procedure[];
}

interface Room {
  id: number;
  number: string;
  floor: number;
  capacity: number;
  description?: string;
}

interface Child {
  id: number;
  name: string;
  birth_date: string;
}

interface OrderData {
  id_child: number;
  id_treatment_course: number;
  id_room: number;
  check_in_date: string;
  check_out_date: string;
}

async function getCourses(token?: string): Promise<Course[]> {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axios.get("http://127.0.0.1:8000/api/courses/", { headers });
  return res.data;
}


async function getRooms(token?: string): Promise<Room[]> {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axios.get("http://127.0.0.1:8000/api/rooms/", { headers });
  return res.data;
}


async function createOrder(orderData: OrderData, token: string): Promise<void> {
  await axios.post("http://127.0.0.1:8000/api/orders/", orderData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
}

function formatPrice(price: Course["price"]): string {
  if (typeof price === "object" && price !== null && "parsedValue" in price) {
    return new Intl.NumberFormat('ru-RU').format(price.parsedValue);
  }
  return new Intl.NumberFormat('ru-RU').format(price);
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

const sectionVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { 
    opacity: 1, 
    height: "auto",
    transition: { duration: 0.3, ease: easeInOut }
  },
  exit: { 
    opacity: 0, 
    height: 0,
    transition: { duration: 0.2, ease: easeInOut }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3
    }
  })
};

export default function ServicePage() {
  const { token } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [userChildren, setUserChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [selectedChild, setSelectedChild] = useState<number | null>(null);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesData, roomsData] = await Promise.all([
          getCourses(token || undefined),
          getRooms(token || undefined)
        ]);
        setCourses(coursesData);
        setRooms(roomsData);

        // Получаем детей пользователя через /api/users/me
        if (token) {
          const meRes = await axios.get("http://127.0.0.1:8000/api/users/me", {
            headers: { Authorization: `Bearer ${token}` }
          });
          const childs = meRes.data.childs || [];
          setUserChildren(childs);
          if (childs.length > 0) setSelectedChild(childs[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const toggleCourse = (id: number) => {
    setExpandedCourse(expandedCourse === id ? null : id);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

   const handleOrderSubmit = async (courseId: number) => {
    if (!token) {
      router.push("/auth");
      return;
    }

    if (!selectedChild || !selectedRoom || !checkInDate || !checkOutDate) {
      setOrderError("Пожалуйста, заполните все поля");
      return;
    }

    setOrderLoading(true);
    setOrderError(null);

    try {
      await createOrder({
        id_child: selectedChild,
        id_treatment_course: courseId,
        id_room: selectedRoom,
        check_in_date: checkInDate,
        check_out_date: checkOutDate
      }, token);

      setOrderSuccess(true);
      setTimeout(() => {
        setOrderSuccess(false);
        setSelectedCourse(null);
      }, 3000);
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : "Ошибка при оформлении заказа");
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 text-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="inline-block rounded-full h-8 w-8 border-4 border-sky-500 border-t-transparent"
      />
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-2 text-sky-700"
      >
        Загружаем информацию о курсах...
      </motion.p>
    </motion.div>
  );

  if (error) return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-8 text-center bg-red-50 rounded-lg mx-4"
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <AlertTriangle className="inline-block text-red-500 w-8 h-8 mb-2" />
      </motion.div>
      <p className="text-red-600 font-medium">Ошибка загрузки данных</p>
      <p className="text-red-500">{error}</p>
    </motion.div>
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-sky-800 mb-2">Курсы оздоровления</h1>
        <p className="text-lg text-sky-600 max-w-2xl mx-auto">
          Специальные программы для восстановления здоровья вашего ребенка
        </p>
      </motion.div>

      {courses.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-sky-50 rounded-xl"
        >
          <p className="text-sky-700 text-lg">В настоящее время нет доступных курсов</p>
        </motion.div>
      ) : (
        <div className="grid gap-6">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
              className="border border-sky-100 rounded-xl p-6 shadow-lg bg-white hover:shadow-xl transition-shadow"
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-sky-900">{course.name}</h2>
                <div className="flex items-center space-x-3">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-sky-100 text-sky-800 px-3 py-1 rounded-full text-sm font-medium flex items-center"
                  >
                    <HeartPulse className="w-4 h-4 mr-1" />
                    {course.duration_days} дней
                  </motion.div>
                  <motion.button 
                    onClick={() => toggleCourse(course.id)}
                    className="text-sky-600 hover:text-sky-800 transition-colors"
                    whileTap={{ scale: 0.95 }}
                  >
                    {expandedCourse === course.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </motion.button>
                </div>
              </div>

              <p className="text-gray-700 mb-5">{course.description}</p>

              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="bg-sky-50 p-4 rounded-lg mb-5 flex justify-between items-center"
              >
                <div className="text-lg font-medium text-sky-900">
                  <span className="text-gray-600">Стоимость:</span> {formatPrice(course.price)} ₽
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-sky-600 hover:bg-sky-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm"
                  onClick={() => setSelectedCourse(course.id)}
                >
                  Записаться
                </motion.button>
              </motion.div>

              <AnimatePresence>
                {expandedCourse === course.id && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={sectionVariants}
                    className="space-y-6 pt-4 border-t border-sky-100 overflow-hidden"
                  >
                    <div>
                      <motion.button 
                        onClick={() => toggleSection(`diagnosis-${course.id}`)}
                        className="flex items-center w-full text-lg font-semibold text-sky-800 mb-3"
                        whileHover={{ color: "#0369a1" }}
                      >
                        <Thermometer className="w-5 h-5 mr-2 text-sky-600" />
                        Диагноз
                        {expandedSections[`diagnosis-${course.id}`] ? (
                          <ChevronUp className="w-5 h-5 ml-2" />
                        ) : (
                          <ChevronDown className="w-5 h-5 ml-2" />
                        )}
                      </motion.button>
                      
                      <AnimatePresence>
                        {expandedSections[`diagnosis-${course.id}`] && (
                          <motion.div
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            variants={{
                              hidden: { opacity: 0, height: 0 },
                              visible: { opacity: 1, height: "auto" }
                            }}
                            className="bg-white p-4 rounded-lg border border-sky-200"
                          >
                            <h3 className="font-medium text-gray-900">
                              {course.diagnosis.name} <span className="text-gray-500">({course.diagnosis.icd_code})</span>
                            </h3>
                            <p className="text-gray-700 mt-1 mb-2">{course.diagnosis.description}</p>
                            
                            <div className="grid gap-2 sm:grid-cols-2 mt-3">
                              <motion.div 
                                custom={0}
                                initial="hidden"
                                animate="visible"
                                variants={itemVariants}
                                className="text-sm"
                              >
                                <span className="font-medium text-gray-900">Симптомы:</span> {course.diagnosis.symptoms}
                              </motion.div>
                              <motion.div 
                                custom={1}
                                initial="hidden"
                                animate="visible"
                                variants={itemVariants}
                                className="text-sm"
                              >
                                <span className="font-medium text-gray-900">Противопоказания:</span> {course.diagnosis.contraindications}
                              </motion.div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div>
                      <motion.button 
                        onClick={() => toggleSection(`procedures-${course.id}`)}
                        className="flex items-center w-full text-lg font-semibold text-sky-800 mb-3"
                        whileHover={{ color: "#0369a1" }}
                      >
                        <Activity className="w-5 h-5 mr-2 text-sky-600" />
                        Процедуры {course.procedures.length > 0 && `(${course.procedures.length})`}
                        {expandedSections[`procedures-${course.id}`] ? (
                          <ChevronUp className="w-5 h-5 ml-2" />
                        ) : (
                          <ChevronDown className="w-5 h-5 ml-2" />
                        )}
                      </motion.button>
                      
                      <AnimatePresence>
                        {expandedSections[`procedures-${course.id}`] && (
                          <motion.div
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            variants={{
                              hidden: { opacity: 0, height: 0 },
                              visible: { opacity: 1, height: "auto" }
                            }}
                          >
                            {course.procedures.length === 0 ? (
                              <div className="text-center py-4 bg-sky-50 rounded-lg text-gray-500">
                                Нет назначенных процедур
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {course.procedures.map((proc, i) => (
                                  <motion.div 
                                    key={proc.id}
                                    custom={i}
                                    initial="hidden"
                                    animate="visible"
                                    variants={itemVariants}
                                    whileHover={{ x: 5 }}
                                    className="bg-white p-4 rounded-lg border border-sky-200"
                                  >
                                    <div className="flex justify-between items-start">
                                      <h3 className="font-medium text-gray-900">{proc.name}</h3>
                                      <div className="flex items-center text-sm text-gray-500">
                                        <Clock className="w-4 h-4 mr-1" />
                                        {proc.duration_min} мин
                                      </div>
                                    </div>
                                    <p className="text-gray-700 text-sm mt-1 mb-2">{proc.description}</p>
                                    
                                    <div className="grid gap-2 sm:grid-cols-2 text-sm">
                                      <div>
                                        <span className="font-medium text-gray-900">Частота:</span> {proc.frequency}
                                      </div>
                                      <div>
                                        <span className="font-medium text-gray-900">Противопоказания:</span> {proc.contraindications}
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {selectedCourse === course.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-4 bg-sky-50 rounded-lg border border-sky-200"
                  >
                    <h3 className="text-lg font-semibold text-sky-800 mb-3">Оформление заказа</h3>
                    
                    {!token && (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                        <div className="flex items-center">
                          <Lock className="w-5 h-5 text-yellow-500 mr-2" />
                          <p className="text-yellow-700">
                            Для оформления заказа необходимо <a href="/auth" className="font-medium underline">войти в систему</a>
                          </p>
                        </div>
                      </div>
                    )}

                    {token && userChildren.length === 0 && (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                        <div className="flex items-center">
                          <User className="w-5 h-5 text-yellow-500 mr-2" />
                          <p className="text-yellow-700">
                            У вас нет добавленных детей. Пожалуйста, добавьте ребенка в профиле.
                          </p>
                        </div>
                      </div>
                    )}

                    {token && userChildren.length > 0 && (
                      <>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ребенок</label>
                            <select 
                              className="w-full p-2 border rounded"
                              value={selectedChild || ""}
                              onChange={(e) => setSelectedChild(Number(e.target.value))}
                            >
                              {userChildren.map((child: Child) => (
                                <option key={child.id} value={child.id}>{child.name}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Комната</label>
                            <select 
                              className="w-full p-2 border rounded"
                              value={selectedRoom || ""}
                              onChange={(e) => setSelectedRoom(Number(e.target.value))}
                            >
                              <option value="">Выберите комнату</option>
                              {rooms.map(room => (
                                <option key={room.id} value={room.id}>
                                  №{room.number} ({room.floor} этаж, {room.capacity} мест)
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Дата заезда</label>
                            <input
                              type="date"
                              className="w-full p-2 border rounded"
                              value={checkInDate}
                              onChange={(e) => setCheckInDate(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Дата выезда</label>
                            <input
                              type="date"
                              className="w-full p-2 border rounded"
                              value={checkOutDate}
                              onChange={(e) => setCheckOutDate(e.target.value)}
                              min={checkInDate || new Date().toISOString().split('T')[0]}
                            />
                          </div>
                        </div>

                        {orderError && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm"
                          >
                            {orderError}
                          </motion.div>
                        )}

                        {orderSuccess && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-green-50 text-green-700 p-3 rounded mb-4 text-sm"
                          >
                            Заказ успешно оформлен!
                          </motion.div>
                        )}

                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedCourse(null)}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
                          >
                            Отмена
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOrderSubmit(course.id)}
                            disabled={orderLoading}
                            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm flex items-center"
                          >
                            {orderLoading ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Оформление...
                              </>
                            ) : (
                              "Подтвердить заказ"
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}