'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, X, Trash2, ChevronLeft, ChevronRight, User } from 'lucide-react'
import axios from 'axios'
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface Admin {
  id: number
  user: {
    id: number
    email: string
  }
  name: string
  position: string
  qualification: string
  hire_date: string
  department: string
  schedule: string
}

interface AdminFormData {
  email: string
  password: string
  staff: {
    name: string
    position: string
    qualification: string
    hire_date: string
    department: string
    schedule: string
  }
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [filteredAdmins, setFilteredAdmins] = useState<Admin[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<AdminFormData>({
    email: '',
    password: '',
    staff: {
      name: '',
      position: '',
      qualification: '',
      hire_date: new Date().toISOString().split('T')[0],
      department: '',
      schedule: ''
    }
  })
  const adminsPerPage = 8

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

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/users/staffs');
        const validAdmins = Array.isArray(response.data)
          ? response.data.filter((a) => typeof a?.name === "string")
          : [];
        setAdmins(validAdmins);
        setFilteredAdmins(validAdmins);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching admins:', error);
        setIsLoading(false);
      }
    }
    fetchAdmins();
  }, [])

  useEffect(() => {
    const validAdmins = admins.filter(admin => typeof admin?.name === "string");
    const filtered = validAdmins.filter(admin =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAdmins(filtered);
    setCurrentPage(1);
  }, [searchTerm, admins])

  const indexOfLastAdmin = currentPage * adminsPerPage
  const indexOfFirstAdmin = indexOfLastAdmin - adminsPerPage
  const currentAdmins = filteredAdmins.slice(indexOfFirstAdmin, indexOfLastAdmin)
  const totalPages = Math.ceil(filteredAdmins.length / adminsPerPage)

  const handleCreate = async (formData: AdminFormData) => {
    try {
      await axios.post('http://127.0.0.1:8000/api/auth/signup/staff', {
        role: 'ADMIN',
        ...formData
      });

      const response = await axios.get('http://127.0.0.1:8000/api/users/staffs');
      const validAdmins = Array.isArray(response.data)
        ? response.data.filter((a) => typeof a?.name === "string")
        : [];
      setAdmins(validAdmins);
      setFilteredAdmins(validAdmins);
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating admin:', error);
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/users/staffs/${id}`);

      const response = await axios.get('http://127.0.0.1:8000/api/users/staffs');
      const validAdmins = Array.isArray(response.data)
        ? response.data.filter((a) => typeof a?.name === "string")
        : [];
      setAdmins(validAdmins);
      setFilteredAdmins(validAdmins);
    } catch (error) {
      console.error('Error deleting admin:', error);
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === 'email' || name === 'password') {
      setFormData(prev => ({ ...prev, [name]: value }))
    } else {
      setFormData(prev => ({
        ...prev,
        staff: {
          ...prev.staff,
          [name]: value
        }
      }))
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleCreate(formData)
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      staff: {
        name: '',
        position: '',
        qualification: '',
        hire_date: new Date().toISOString().split('T')[0],
        department: '',
        schedule: ''
      }
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU')
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-lg bg-blue-100 text-blue-700">
          <User className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-blue-900">Управление администраторами</h1>
      </motion.div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Поиск администраторов..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Добавить администратора</span>
        </motion.button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredAdmins.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-gray-500">Администраторы не найдены</p>
        </motion.div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-12 bg-gray-50 p-4 border-b border-gray-200">
              <div className="col-span-2 font-medium text-gray-700">ФИО</div>
              <div className="col-span-2 font-medium text-gray-700">Должность</div>
              <div className="col-span-2 font-medium text-gray-700">Email</div>
              <div className="col-span-2 font-medium text-gray-700">Квалификация</div>
              <div className="col-span-2 font-medium text-gray-700">Отдел</div>
              <div className="col-span-2 font-medium text-gray-700 text-right">Действия</div>
            </div>

            <AnimatePresence>
              {currentAdmins.map((admin) => (
                <motion.div
                  key={admin.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-12 p-4 border-b border-gray-100 hover:bg-gray-50"
                >
                  <div className="col-span-2 font-medium text-gray-800">{admin.name}</div>
                  <div className="col-span-2 text-gray-600">{admin.position}</div>
                  <div className="col-span-2 text-gray-600">{admin.user.email}</div>
                  <div className="col-span-2 text-gray-600">{admin.qualification}</div>
                  <div className="col-span-2 text-gray-600">{admin.department}</div>
                  <div className="col-span-2 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(admin.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                      title="Удалить"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Назад</span>
              </motion.button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <motion.button
                      key={pageNum}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-full ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      {pageNum}
                    </motion.button>
                  )
                })}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <span>Вперед</span>
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-xl flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-y-auto"
            >
              <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  Добавить администратора
                </h2>
                <button
                  onClick={() => {
                    setIsFormOpen(false)
                    resetForm()
                  }}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    ФИО *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.staff.name}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                    Должность *
                  </label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={formData.staff.position}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Пароль *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="qualification" className="block text-sm font-medium text-gray-700 mb-1">
                    Квалификация
                  </label>
                  <input
                    type="text"
                    id="qualification"
                    name="qualification"
                    value={formData.staff.qualification}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                    Отдел
                  </label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.staff.department}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="schedule" className="block text-sm font-medium text-gray-700 mb-1">
                    График работы
                  </label>
                  <input
                    type="text"
                    id="schedule"
                    name="schedule"
                    value={formData.staff.schedule}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="hire_date" className="block text-sm font-medium text-gray-700 mb-1">
                    Дата приема
                  </label>
                  <input
                    type="date"
                    id="hire_date"
                    name="hire_date"
                    value={formData.staff.hire_date}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false)
                      resetForm()
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Создать администратора
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}