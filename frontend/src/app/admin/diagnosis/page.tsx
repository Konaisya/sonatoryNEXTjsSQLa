'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Stethoscope, Plus, Search, X, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface Diagnosis {
  id: number
  name: string
  icd_code: string
  description: string
  symptoms: string
  contraindications: string
}

export default function DiagnosisPage() {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([])
  const [filteredDiagnoses, setFilteredDiagnoses] = useState<Diagnosis[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingDiagnosis, setEditingDiagnosis] = useState<Diagnosis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    icd_code: '',
    description: '',
    symptoms: '',
    contraindications: ''
  })
  const diagnosesPerPage = 8
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
    const fetchDiagnoses = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/diagnosis/')
        setDiagnoses(response.data)
        setFilteredDiagnoses(response.data)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching diagnoses:', error)
        setIsLoading(false)
      }
    }
    fetchDiagnoses()
  }, [])

  useEffect(() => {
    const filtered = diagnoses.filter(diagnosis =>
      diagnosis.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diagnosis.icd_code.toLowerCase().includes(searchTerm.toLowerCase()))
    setFilteredDiagnoses(filtered)
    setCurrentPage(1)
  }, [searchTerm, diagnoses])

  const indexOfLastDiagnosis = currentPage * diagnosesPerPage
  const indexOfFirstDiagnosis = indexOfLastDiagnosis - diagnosesPerPage
  const currentDiagnoses = filteredDiagnoses.slice(indexOfFirstDiagnosis, indexOfLastDiagnosis)
  const totalPages = Math.ceil(filteredDiagnoses.length / diagnosesPerPage)

  const handleCreate = async (formData: Omit<Diagnosis, 'id'>) => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/diagnosis/', formData)
      setDiagnoses([...diagnoses, response.data])
      setIsFormOpen(false)
    } catch (error) {
      console.error('Error creating diagnosis:', error)
    }
  }

  const handleUpdate = async (id: number, formData: Omit<Diagnosis, 'id'>) => {
    try {
      const response = await axios.put(`http://127.0.0.1:8000/api/diagnosis/${id}`, formData)
      setDiagnoses(diagnoses.map(d => d.id === id ? response.data : d))
      setEditingDiagnosis(null)
    } catch (error) {
      console.error('Error updating diagnosis:', error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/diagnosis/${id}`)
      setDiagnoses(diagnoses.filter(d => d.id !== id))
    } catch (error) {
      console.error('Error deleting diagnosis:', error)
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingDiagnosis) {
      handleUpdate(editingDiagnosis.id, formData)
    } else {
      handleCreate(formData)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-lg bg-sky-100 text-sky-700">
          <Stethoscope className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-sky-900">Управление диагнозами</h1>
      </motion.div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Поиск диагнозов..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setEditingDiagnosis(null)
            setFormData({
              name: '',
              icd_code: '',
              description: '',
              symptoms: '',
              contraindications: ''
            })
            setIsFormOpen(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Добавить диагноз</span>
        </motion.button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
        </div>
      ) : filteredDiagnoses.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-gray-500">Диагнозы не найдены</p>
        </motion.div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-12 bg-gray-50 p-4 border-b border-gray-200">
              <div className="col-span-3 font-medium text-gray-700">Название</div>
              <div className="col-span-2 font-medium text-gray-700">Код МКБ</div>
              <div className="col-span-5 font-medium text-gray-700">Описание</div>
              <div className="col-span-2 font-medium text-gray-700 text-right">Действия</div>
            </div>

            <AnimatePresence>
              {currentDiagnoses.map((diagnosis) => (
                <motion.div
                  key={diagnosis.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-12 p-4 border-b border-gray-100 hover:bg-gray-50"
                >
                  <div className="col-span-3 font-medium text-gray-800">{diagnosis.name}</div>
                  <div className="col-span-2 text-gray-600">{diagnosis.icd_code}</div>
                  <div className="col-span-5 text-gray-600 truncate">{diagnosis.description}</div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setEditingDiagnosis(diagnosis)
                        setFormData({
                          name: diagnosis.name,
                          icd_code: diagnosis.icd_code,
                          description: diagnosis.description,
                          symptoms: diagnosis.symptoms,
                          contraindications: diagnosis.contraindications
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
                      onClick={() => handleDelete(diagnosis.id)}
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
                      className={`w-10 h-10 rounded-full ${currentPage === pageNum ? 'bg-sky-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
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
            className="fixed inset-0  backdrop-blur-xs flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  {editingDiagnosis ? 'Редактировать диагноз' : 'Добавить новый диагноз'}
                </h2>
                <button
                  onClick={() => {
                    setIsFormOpen(false)
                    setEditingDiagnosis(null)
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
                      Название диагноза *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="icd_code" className="block text-sm font-medium text-gray-700 mb-1">
                      Код МКБ *
                    </label>
                    <input
                      type="text"
                      id="icd_code"
                      name="icd_code"
                      value={formData.icd_code}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Описание
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                <div>
                  <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-1">
                    Симптомы
                  </label>
                  <textarea
                    id="symptoms"
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleFormChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <motion.button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false)
                      setEditingDiagnosis(null)
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
                    className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                  >
                    {editingDiagnosis ? 'Сохранить изменения' : 'Добавить диагноз'}
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