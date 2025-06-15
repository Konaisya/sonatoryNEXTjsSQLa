'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, X, Edit, Trash2, ChevronLeft, ChevronRight, Calendar, Activity } from 'lucide-react'
import axios from 'axios'
import dayjs from 'dayjs'

interface ProcedureRecord {
  id: number
  child: {
    id: number
    name: string
    birth_date: string
    gender: string
    height: {
      source: string
      parsedValue: number
    }
    weight: {
      source: string
      parsedValue: number
    }
    blood: string
    disability: string
    vaccinations: string
    medical_note: string
  }
  procedure: {
    id: number
    name: string
    description: string
    contraindications: string
    frequency: string
    duration_min: number
  }
  staff: {
    id: number
    name: string
    position: string
    qualification: string
    hire_date: string
    department: string
    schedule: string
  }
  procedure_time: string
}

interface Child {
  id: number
  name: string
}

interface Procedure {
  id: number
  name: string
}

interface Staff {
  id: number
  name: string
}

export default function ProcedureRecordsPage() {
  const [records, setRecords] = useState<ProcedureRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<ProcedureRecord[]>([])
  const [children, setChildren] = useState<Child[]>([])
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [staffs, setStaffs] = useState<Staff[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<ProcedureRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    id_child: 0,
    id_procedure: 0,
    id_staff: 0,
    procedure_time: dayjs().format('YYYY-MM-DDTHH:mm')
  })
  const recordsPerPage = 8

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recordsRes, childrenRes, proceduresRes, staffsRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/procedure_records/'),
          axios.get('http://127.0.0.1:8000/api/childs/'),
          axios.get('http://127.0.0.1:8000/api/procedures/'),
          axios.get('http://127.0.0.1:8000/api/users/staffs/')
        ])

        setRecords(recordsRes.data)
        setFilteredRecords(recordsRes.data)
        setChildren(childrenRes.data)
        setProcedures(proceduresRes.data)
        setStaffs(staffsRes.data)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const filtered = records.filter(record =>
      record.child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.procedure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.staff.name.toLowerCase().includes(searchTerm.toLowerCase()))
    setFilteredRecords(filtered)
    setCurrentPage(1)
  }, [searchTerm, records])

  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord)
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage)

  const handleCreate = async (formData: {id_child: number, id_procedure: number, id_staff: number, procedure_time: string}) => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/procedure_records/', {
        id_child: formData.id_child,
        id_procedure: formData.id_procedure,
        id_staff: formData.id_staff,
        procedure_time: new Date(formData.procedure_time).toISOString()
      })

      const child = children.find(c => c.id === formData.id_child)
      const procedure = procedures.find(p => p.id === formData.id_procedure)
      const staff = staffs.find(s => s.id === formData.id_staff)

      const newRecord = {
        ...response.data,
        child: child ? {id: child.id, name: child.name} : {id: 0, name: 'Неизвестно'},
        procedure: procedure ? {id: procedure.id, name: procedure.name} : {id: 0, name: 'Неизвестно'},
        staff: staff ? {id: staff.id, name: staff.name} : {id: 0, name: 'Неизвестно'}
      }

      setRecords([...records, newRecord])
      setIsFormOpen(false)
    } catch (error) {
      console.error('Error creating record:', error)
    }
  }

  const handleUpdate = async (id: number, formData: {id_child: number, id_procedure: number, id_staff: number, procedure_time: string}) => {
    try {
      const response = await axios.put(`http://127.0.0.1:8000/api/procedure_records/${id}`, {
        id_child: formData.id_child,
        id_procedure: formData.id_procedure,
        id_staff: formData.id_staff,
        procedure_time: new Date(formData.procedure_time).toISOString()
      })

      const child = children.find(c => c.id === formData.id_child)
      const procedure = procedures.find(p => p.id === formData.id_procedure)
      const staff = staffs.find(s => s.id === formData.id_staff)

      const updatedRecord = {
        ...response.data,
        child: child ? {id: child.id, name: child.name} : {id: 0, name: 'Неизвестно'},
        procedure: procedure ? {id: procedure.id, name: procedure.name} : {id: 0, name: 'Неизвестно'},
        staff: staff ? {id: staff.id, name: staff.name} : {id: 0, name: 'Неизвестно'}
      }

      setRecords(records.map(r => r.id === id ? updatedRecord : r))
      setEditingRecord(null)
    } catch (error) {
      console.error('Error updating record:', error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/procedure_records/${id}`)
      setRecords(records.filter(r => r.id !== id))
    } catch (error) {
      console.error('Error deleting record:', error)
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }))
  }

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, procedure_time: e.target.value }))
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingRecord) {
      handleUpdate(editingRecord.id, formData)
    } else {
      handleCreate(formData)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-lg bg-blue-100 text-blue-700">
          <Activity className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-blue-900">Журнал процедур</h1>
      </motion.div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Поиск записей..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setEditingRecord(null)
            setFormData({
              id_child: 0,
              id_procedure: 0,
              id_staff: 0,
              procedure_time: dayjs().format('YYYY-MM-DDTHH:mm')
            })
            setIsFormOpen(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Добавить запись</span>
        </motion.button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredRecords.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-gray-500">Записи не найдены</p>
        </motion.div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-12 bg-gray-50 p-4 border-b border-gray-200">
              <div className="col-span-3 font-medium text-gray-700">Ребенок</div>
              <div className="col-span-2 font-medium text-gray-700">Процедура</div>
              <div className="col-span-2 font-medium text-gray-700">Специалист</div>
              <div className="col-span-3 font-medium text-gray-700">Дата и время</div>
              <div className="col-span-2 font-medium text-gray-700 text-right">Действия</div>
            </div>

            <AnimatePresence>
              {currentRecords.map((record) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-12 p-4 border-b border-gray-100 hover:bg-gray-50"
                >
                  <div className="col-span-3 font-medium text-gray-800">{record.child.name}</div>
                  <div className="col-span-2 text-gray-600">{record.procedure.name}</div>
                  <div className="col-span-2 text-gray-600">{record.staff.name}</div>
                  <div className="col-span-3 text-gray-600">
                    {dayjs(record.procedure_time).format('DD.MM.YYYY HH:mm')}
                  </div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setEditingRecord(record)
                        setFormData({
                          id_child: record.child.id,
                          id_procedure: record.procedure.id,
                          id_staff: record.staff.id,
                          procedure_time: dayjs(record.procedure_time).format('YYYY-MM-DDTHH:mm')
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
                      onClick={() => handleDelete(record.id)}
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
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  {editingRecord ? 'Редактировать запись' : 'Добавить новую запись'}
                </h2>
                <button
                  onClick={() => {
                    setIsFormOpen(false)
                    setEditingRecord(null)
                  }}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="id_child" className="block text-sm font-medium text-gray-700 mb-1">
                      Ребенок *
                    </label>
                    <select
                      id="id_child"
                      name="id_child"
                      value={formData.id_child}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="0">Выберите ребенка</option>
                      {children.map(child => (
                        <option key={child.id} value={child.id}>{child.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="id_procedure" className="block text-sm font-medium text-gray-700 mb-1">
                      Процедура *
                    </label>
                    <select
                      id="id_procedure"
                      name="id_procedure"
                      value={formData.id_procedure}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="0">Выберите процедуру</option>
                      {procedures.map(procedure => (
                        <option key={procedure.id} value={procedure.id}>{procedure.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="id_staff" className="block text-sm font-medium text-gray-700 mb-1">
                      Специалист *
                    </label>
                    <select
                      id="id_staff"
                      name="id_staff"
                      value={formData.id_staff}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="0">Выберите специалиста</option>
                      {staffs.map(staff => (
                        <option key={staff.id} value={staff.id}>{staff.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="procedure_time" className="block text-sm font-medium text-gray-700 mb-1">
                      Дата и время *
                    </label>
                    <div className="relative">
                      <input
                        type="datetime-local"
                        id="procedure_time"
                        name="procedure_time"
                        value={formData.procedure_time}
                        onChange={handleDateTimeChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <motion.button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false)
                      setEditingRecord(null)
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingRecord ? 'Сохранить изменения' : 'Добавить запись'}
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