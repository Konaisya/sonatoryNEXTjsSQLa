'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, X, Edit, Trash2, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface Procedure {
  id: number
  name: string
  description: string
  contraindications: string
  frequency: string
  duration_min: number
}

interface Diagnosis {
  id: number
  name: string
  icd_code: string
  description: string
  symptoms: string
  contraindications: string
}

interface Course {
  id: number
  name: string
  description: string
  price: number
  duration_days: number
  diagnosis: Diagnosis
  procedures: Procedure[]
}


interface CourseFormData {
  name: string;
  description: string;
  price: number;
  duration_days: number;
  id_diagnosis: number;
 ids_procedures: number[];
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<CourseFormData>({
    name: '',
    description: '',
    price: 0,
    duration_days: 0,
    id_diagnosis: 0,
    ids_procedures: []
  })
  const coursesPerPage = 8
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
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/courses/');
        const validCourses = Array.isArray(response.data)
          ? response.data.filter((c) => typeof c?.name === "string")
          : [];
        setCourses(validCourses);
        setFilteredCourses(validCourses);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, [])

  useEffect(() => {
    const filtered = courses.filter(course =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setCurrentPage(1)
    setFilteredCourses(filtered)
  }, [searchTerm, courses])

  const indexOfLastCourse = currentPage * coursesPerPage
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse)
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage)


  const handleCreate = async (formData: CourseFormData) => {
    try {
      await axios.post('http://127.0.0.1:8000/api/courses/', formData);
      const response = await axios.get('http://127.0.0.1:8000/api/courses/');
      const validCourses = Array.isArray(response.data)
        ? response.data.filter((c) => typeof c?.name === "string")
        : [];
      setCourses(validCourses);
      setFilteredCourses(validCourses);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error creating course:', error);
    }
  }

  const handleUpdate = async (id: number, formData: CourseFormData) => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/courses/${id}`, formData);
      const response = await axios.get('http://127.0.0.1:8000/api/courses/');
      const validCourses = Array.isArray(response.data)
        ? response.data.filter((c) => typeof c?.name === "string")
        : [];
      setCourses(validCourses);
      setFilteredCourses(validCourses);
      setEditingCourse(null);
    } catch (error) {
      console.error('Error updating course:', error);
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/courses/${id}`);
      const response = await axios.get('http://127.0.0.1:8000/api/courses/');
      const validCourses = Array.isArray(response.data)
        ? response.data.filter((c) => typeof c?.name === "string")
        : [];
      setCourses(validCourses);
      setFilteredCourses(validCourses);
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  }

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "id_diagnosis" ? Number(value) : value
    }));
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }))
  }

  const handleProcedureSelect = (id: number) => {
    setFormData(prev => {
      const newProcedures = prev.ids_procedures.includes(id)
        ? prev.ids_procedures.filter(procId => procId !== id)
        : [...prev.ids_procedures, id]
      return { ...prev, ids_procedures: newProcedures }
    })
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingCourse) {
      handleUpdate(editingCourse.id, formData)
    } else {
      handleCreate(formData)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-lg bg-indigo-100 text-indigo-700">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-indigo-900">Курсы лечения</h1>
      </motion.div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Поиск курсов..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setEditingCourse(null)
            setFormData({
              name: '',
              description: '',
              price: 0,
              duration_days: 0,
              id_diagnosis: 0,
              ids_procedures: []
            })
            setIsFormOpen(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Добавить курс</span>
        </motion.button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-gray-500">Курсы не найдены</p>
        </motion.div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-12 bg-gray-50 p-4 border-b border-gray-200">
              <div className="col-span-3 font-medium text-gray-700">Название</div>
              <div className="col-span-2 font-medium text-gray-700">Диагноз</div>
              <div className="col-span-3 font-medium text-gray-700">Процедуры</div>
              <div className="col-span-2 font-medium text-gray-700">Длительность (дни)</div>
              <div className="col-span-2 font-medium text-gray-700 text-right">Действия</div>
            </div>

            <AnimatePresence>
              {currentCourses.map((course) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-12 p-4 border-b border-gray-100 hover:bg-gray-50"
                >
                  <div className="col-span-3 font-medium text-gray-800">{course.name}</div>
                  <div className="col-span-2 text-gray-600">{course.diagnosis.name}</div>
                  <div className="col-span-3 text-gray-600">
                    {course.procedures.map(p => p.name).join(', ') || 'Нет процедур'}
                  </div>
                  <div className="col-span-2 text-gray-600">{course.duration_days}</div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setEditingCourse(course)
                        setFormData({
                          name: course.name,
                          description: course.description,
                          price: course.price,
                          duration_days: course.duration_days,
                          id_diagnosis: course.diagnosis.id,
                          ids_procedures: course.procedures.map(p => p.id)
                        })
                        setIsFormOpen(true)
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                      title="Редактировать"
                    >
                      <Edit className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(course.id)}
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
                      className={`w-10 h-10 rounded-full ${currentPage === pageNum ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
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
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  {editingCourse ? 'Редактировать курс' : 'Добавить новый курс'}
                </h2>
                <button
                  onClick={() => {
                    setIsFormOpen(false)
                    setEditingCourse(null)
                  }}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Название курса *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="id_diagnosis" className="block text-sm font-medium text-gray-700 mb-1">
                      Диагноз *
                    </label>
                    <select
                      id="id_diagnosis"
                      name="id_diagnosis"
                      value={formData.id_diagnosis}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="0">Выберите диагноз</option>
                      {courses.length > 0 && courses[0].diagnosis && (
                        <option value={courses[0].diagnosis.id}>
                          {courses[0].diagnosis.name} ({courses[0].diagnosis.icd_code})
                        </option>
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Описание курса
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                      Цена (руб) *
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleNumberChange}
                      required
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="duration_days" className="block text-sm font-medium text-gray-700 mb-1">
                      Длительность (дни) *
                    </label>
                    <input
                      type="number"
                      id="duration_days"
                      name="duration_days"
                      value={formData.duration_days}
                      onChange={handleNumberChange}
                      required
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Процедуры *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                    {courses.length > 0 && courses[0].procedures.map(procedure => (
                      <div key={procedure.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`procedure-${procedure.id}`}
                          checked={formData.ids_procedures.includes(procedure.id)}
                          onChange={() => handleProcedureSelect(procedure.id)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`procedure-${procedure.id}`} className="ml-2 text-sm text-gray-700">
                          {procedure.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <motion.button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false)
                      setEditingCourse(null)
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Отмена
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    {editingCourse ? 'Сохранить изменения' : 'Добавить курс'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}