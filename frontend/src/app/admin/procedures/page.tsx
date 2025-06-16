'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, X, Edit, Trash2, ChevronLeft, ChevronRight, Activity } from 'lucide-react'
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

export default function ProceduresPage() {
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [filteredProcedures, setFilteredProcedures] = useState<Procedure[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contraindications: '',
    frequency: '',
    duration_min: 0
  })
  const proceduresPerPage = 8
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
    const fetchProcedures = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/procedures/')
        setProcedures(response.data)
        setFilteredProcedures(response.data)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching procedures:', error)
        setIsLoading(false)
      }
    }
    fetchProcedures()
  }, [])

  useEffect(() => {
    const filtered = procedures.filter(procedure =>
      procedure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      procedure.frequency.toLowerCase().includes(searchTerm.toLowerCase()))
    setFilteredProcedures(filtered)
    setCurrentPage(1)
  }, [searchTerm, procedures])

  const indexOfLastProcedure = currentPage * proceduresPerPage
  const indexOfFirstProcedure = indexOfLastProcedure - proceduresPerPage
  const currentProcedures = filteredProcedures.slice(indexOfFirstProcedure, indexOfLastProcedure)
  const totalPages = Math.ceil(filteredProcedures.length / proceduresPerPage)

  const handleCreate = async (formData: Omit<Procedure, 'id'>) => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/procedures/', formData)
      setProcedures([...procedures, response.data])
      setIsFormOpen(false)
    } catch (error) {
      console.error('Error creating procedure:', error)
    }
  }

  const handleUpdate = async (id: number, formData: Omit<Procedure, 'id'>) => {
    try {
      const response = await axios.put(`http://127.0.0.1:8000/api/procedures/${id}`, formData)
      setProcedures(procedures.map(p => p.id === id ? response.data : p))
      setEditingProcedure(null)
    } catch (error) {
      console.error('Error updating procedure:', error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/procedures/${id}`)
      setProcedures(procedures.filter(p => p.id !== id))
    } catch (error) {
      console.error('Error deleting procedure:', error)
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }))
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingProcedure) {
      handleUpdate(editingProcedure.id, formData)
    } else {
      handleCreate(formData)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-lg bg-green-100 text-green-700">
          <Activity className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-green-900">Управление процедурами</h1>
      </motion.div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Поиск процедур..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setEditingProcedure(null)
            setFormData({
              name: '',
              description: '',
              contraindications: '',
              frequency: '',
              duration_min: 0
            })
            setIsFormOpen(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Добавить процедуру</span>
        </motion.button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : filteredProcedures.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-gray-500">Процедуры не найдены</p>
        </motion.div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-12 bg-gray-50 p-4 border-b border-gray-200">
              <div className="col-span-3 font-medium text-gray-700">Название</div>
              <div className="col-span-3 font-medium text-gray-700">Частота</div>
              <div className="col-span-2 font-medium text-gray-700">Длительность (мин)</div>
              <div className="col-span-2 font-medium text-gray-700">Описание</div>
              <div className="col-span-2 font-medium text-gray-700 text-right">Действия</div>
            </div>

            <AnimatePresence>
              {currentProcedures.map((procedure) => (
                <motion.div
                  key={procedure.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-12 p-4 border-b border-gray-100 hover:bg-gray-50"
                >
                  <div className="col-span-3 font-medium text-gray-800">{procedure.name}</div>
                  <div className="col-span-3 text-gray-600">{procedure.frequency}</div>
                  <div className="col-span-2 text-gray-600">{procedure.duration_min}</div>
                  <div className="col-span-2 text-gray-600 truncate">{procedure.description}</div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setEditingProcedure(procedure)
                        setFormData({
                          name: procedure.name,
                          description: procedure.description,
                          contraindications: procedure.contraindications,
                          frequency: procedure.frequency,
                          duration_min: procedure.duration_min
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
                      onClick={() => handleDelete(procedure.id)}
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
                      className={`w-10 h-10 rounded-full ${currentPage === pageNum ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
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
            className="fixed inset-0 backdrop-blur-xs flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  {editingProcedure ? 'Редактировать процедуру' : 'Добавить новую процедуру'}
                </h2>
                <button
                  onClick={() => {
                    setIsFormOpen(false)
                    setEditingProcedure(null)
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
                      Название процедуры *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
                      Частота выполнения *
                    </label>
                    <input
                      type="text"
                      id="frequency"
                      name="frequency"
                      value={formData.frequency}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="duration_min" className="block text-sm font-medium text-gray-700 mb-1">
                      Длительность (минут) *
                    </label>
                    <input
                      type="number"
                      id="duration_min"
                      name="duration_min"
                      value={formData.duration_min}
                      onChange={handleNumberChange}
                      required
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Описание процедуры
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label htmlFor="contraindications" className="block text-sm font-medium text-gray-700 mb-1">
                    Противопоказания
                  </label>
                  <textarea
                    id="contraindications"
                    name="contraindications"
                    value={formData.contraindications}
                    onChange={handleFormChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <motion.button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false)
                      setEditingProcedure(null)
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
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    {editingProcedure ? 'Сохранить изменения' : 'Добавить процедуру'}
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