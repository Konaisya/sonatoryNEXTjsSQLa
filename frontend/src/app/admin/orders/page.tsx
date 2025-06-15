'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react'
import axios from 'axios'

interface Child {
  id: number
  name: string
  birth_date: string
  gender: string
  height: { parsedValue: number }
  weight: { parsedValue: number }
  blood: string
  disability: string
  vaccinations: string
  medical_note: string
}

interface Parent {
  id: number
  name: string
  phone: string
  address: string
  passport_data: string
}

interface TreatmentCourse {
  id: number
  name: string
  description: string
  price: { parsedValue: number }
  duration_days: number
}

interface Room {
  id: number
  number: string
  floor: number
  capacity: number
  description: string
}

interface Order {
  id: number
  child: Child
  parent: Parent
  treatment_course: TreatmentCourse
  room: Room
  status: string
  check_in_date: string
  check_out_date: string
  price:  number 
}

const statusTranslations: Record<string, string> = {
  'PENDING': 'Ожидание',
  'PROCESSING': 'В обработке',
  'APPROVED': 'Подтвержден',
  'WAITING_PAYMENT': 'Ожидает оплаты',
  'PAID': 'Оплачен',
  'ACTIVE': 'Активен',
  'COMPLETED': 'Завершен',
  'CANCELLED': 'Отменен'
}

const statusOptions = Object.keys(statusTranslations)

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const ordersPerPage = 8

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('http://127.0.0.1:8000/api/orders/', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setOrders(response.data)
        setFilteredOrders(response.data)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching orders:', error)
        setIsLoading(false)
      }
    }
    fetchOrders()
  }, [])

  useEffect(() => {
    const filtered = orders.filter(order =>
      order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm) ||
      order.child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.parent.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredOrders(filtered)
    setCurrentPage(1)
  }, [searchTerm, orders])

  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `http://127.0.0.1:8000/api/orders/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setOrders(orders.map(order => 
        order.id === id ? { ...order, status: newStatus } : order
      ))
      setEditingOrder(null)
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://127.0.0.1:8000/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setOrders(orders.filter(order => order.id !== id))
    } catch (error) {
      console.error('Error deleting order:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU')
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Поиск заказов..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-gray-500">Заказы не найдены</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-12 bg-gray-50 p-4 border-b border-gray-200">
              <div className="col-span-1 font-medium text-gray-700">ID</div>
              <div className="col-span-2 font-medium text-gray-700">Ребенок</div>
              <div className="col-span-2 font-medium text-gray-700">Родитель</div>
              <div className="col-span-2 font-medium text-gray-700">Статус</div>
              <div className="col-span-2 font-medium text-gray-700">Даты</div>
              <div className="col-span-2 font-medium text-gray-700">Цена</div>
              <div className="col-span-1 font-medium text-gray-700 text-right">Действия</div>
            </div>

            <AnimatePresence>
              {currentOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-12 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={(e) => {
                    if (
                      (e.target as HTMLElement).tagName === "SELECT" ||
                      (e.target as HTMLElement).tagName === "BUTTON" ||
                      (e.target as HTMLElement).closest("button") ||
                      (e.target as HTMLElement).closest("select")
                    ) {
                      return;
                    }
                    setSelectedOrder(order);
                  }}
                >
                  <div className="col-span-1 text-gray-800">{order.id}</div>
                  <div className="col-span-2 text-gray-600">{order.child.name}</div>
                  <div className="col-span-2 text-gray-600">{order.parent.name}</div>
                  <div className="col-span-2 text-gray-600">
                    {editingOrder?.id === order.id ? (
                      <select
                        value={editingOrder.status}
                        onChange={(e) => 
                          setEditingOrder({...editingOrder, status: e.target.value})
                        }
                        className="border border-gray-300 rounded px-2 py-1"
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>{statusTranslations[status]}</option>
                        ))}
                      </select>
                    ) : (
                      statusTranslations[order.status] || order.status
                    )}
                  </div>
                  <div className="col-span-2 text-gray-600">
                    {formatDate(order.check_in_date)} - {formatDate(order.check_out_date)}
                  </div>
                  <div className="col-span-2 text-gray-600">{order.price} ₽</div>
                  <div className="col-span-1 flex justify-end gap-2">
                    {editingOrder?.id === order.id ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStatusChange(order.id, editingOrder.status)
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Сохранить
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingOrder(null)
                          }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          Отмена
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingOrder(order)
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(order.id)
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Назад</span>
              </button>

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
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-full ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <span>Вперед</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-xl flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  Детали заказа #{selectedOrder.id}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Информация о ребенке</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Имя:</span> {selectedOrder.child.name}</p>
                      <p><span className="font-medium">Дата рождения:</span> {formatDate(selectedOrder.child.birth_date)}</p>
                      <p><span className="font-medium">Пол:</span> {selectedOrder.child.gender === 'M' ? 'Мужской' : 'Женский'}</p>
                      <p><span className="font-medium">Группа крови:</span> {selectedOrder.child.blood}</p>
                      <p><span className="font-medium">Инвалидность:</span> {selectedOrder.child.disability}</p>
                      <p><span className="font-medium">Прививки:</span> {selectedOrder.child.vaccinations}</p>
                      <p><span className="font-medium">Мед. заметки:</span> {selectedOrder.child.medical_note}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Информация о родителе</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Имя:</span> {selectedOrder.parent.name}</p>
                      <p><span className="font-medium">Телефон:</span> {selectedOrder.parent.phone}</p>
                      <p><span className="font-medium">Адрес:</span> {selectedOrder.parent.address}</p>
                      <p><span className="font-medium">Паспортные данные:</span> {selectedOrder.parent.passport_data}</p>
                    </div>

                    <h3 className="text-lg font-medium text-gray-900 mt-6 mb-4">Информация о номере</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Номер:</span> {selectedOrder.room.number}</p>
                      <p><span className="font-medium">Этаж:</span> {selectedOrder.room.floor}</p>
                      <p><span className="font-medium">Вместимость:</span> {selectedOrder.room.capacity}</p>
                      <p><span className="font-medium">Описание:</span> {selectedOrder.room.description}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Курс лечения</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Название:</span> {selectedOrder.treatment_course.name}</p>
                      <p><span className="font-medium">Описание:</span> {selectedOrder.treatment_course.description}</p>
                      <p><span className="font-medium">Цена:</span> {selectedOrder.treatment_course.price.parsedValue} ₽</p>
                      <p><span className="font-medium">Длительность:</span> {selectedOrder.treatment_course.duration_days} дней</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Информация о заказе</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Статус:</span> {statusTranslations[selectedOrder.status] || selectedOrder.status}</p>
                      <p><span className="font-medium">Дата заезда:</span> {formatDate(selectedOrder.check_in_date)}</p>
                      <p><span className="font-medium">Дата выезда:</span> {formatDate(selectedOrder.check_out_date)}</p>
                      <p><span className="font-medium">Цена:</span> {selectedOrder.price} ₽</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}