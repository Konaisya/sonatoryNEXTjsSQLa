"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useRef } from "react";
import { Baby, Calendar, Scale, Droplet, Plus, User, Phone, Home, CreditCard, ClipboardList, Bed, ChevronDown, ChevronUp, BriefcaseMedical, NotebookText, Edit, Search } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

interface ShortChildResponse {
  id: number;
  name: string;
  birth_date: string;
  gender: GenderType;
  height?: number;
  weight?: number;
  blood?: BloodType;
  disability?: string;
  vaccinations?: string;
  medical_note?: string;
  diagnoses?: ChildDiagnosis[];
}

interface ChildDiagnosis {
  id_diagnosis: number;
  date_diagnosis: string;
  doctor: string;
  notes: string;
}

interface ShortOrderResponse {
  id: number;
  id_child: number;
  id_treatment_course: number;
  id_room: number;
  status: OrderStatus;
  check_in_date: string;
  check_out_date: string;
  price: number;
}

interface ParentResponse {
  id: number;
  user: { id: number; email: string };
  name: string;
  phone: string;
  address: string;
  passport_data: string;
  childs: ShortChildResponse[];
  orders: ShortOrderResponse[];
}

interface Diagnosis {
  id: number;
  name: string;
  icd_code: string;
}

enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  APPROVED = 'APPROVED',
  WAITING_PAYMENT = 'WAITING_PAYMENT',
  PAID = 'PAID',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

enum BloodType {
  FIRST_POSITIVE = '1+',
  FIRST_NEGATIVE = '1-',
  SECOND_POSITIVE = '2+',
  SECOND_NEGATIVE = '2-',
  THIRD_POSITIVE = '3+',
  THIRD_NEGATIVE = '3-',
  FOURTH_POSITIVE = '4+',
  FOURTH_NEGATIVE = '4-'
}

enum GenderType {
  MALE = 'M',
  FEMALE = 'F'
}

const orderStatusMap = {
  [OrderStatus.PENDING]: { text: 'На рассмотрении', color: 'bg-yellow-100 text-yellow-800' },
  [OrderStatus.PROCESSING]: { text: 'В обработке', color: 'bg-blue-100 text-blue-800' },
  [OrderStatus.APPROVED]: { text: 'Подтвержден', color: 'bg-green-100 text-green-800' },
  [OrderStatus.WAITING_PAYMENT]: { text: 'Ожидает оплаты', color: 'bg-purple-100 text-purple-800' },
  [OrderStatus.PAID]: { text: 'Оплачен', color: 'bg-green-100 text-green-800' },
  [OrderStatus.ACTIVE]: { text: 'Активен', color: 'bg-blue-100 text-blue-800' },
  [OrderStatus.COMPLETED]: { text: 'Завершен', color: 'bg-gray-100 text-gray-800' },
  [OrderStatus.CANCELLED]: { text: 'Отменен', color: 'bg-red-100 text-red-800' }
};

const genderMap = {
  [GenderType.MALE]: 'Мальчик',
  [GenderType.FEMALE]: 'Девочка'
};

const bloodTypeOptions = [
  { value: BloodType.FIRST_POSITIVE, label: 'I+' },
  { value: BloodType.FIRST_NEGATIVE, label: 'I-' },
  { value: BloodType.SECOND_POSITIVE, label: 'II+' },
  { value: BloodType.SECOND_NEGATIVE, label: 'II-' },
  { value: BloodType.THIRD_POSITIVE, label: 'III+' },
  { value: BloodType.THIRD_NEGATIVE, label: 'III-' },
  { value: BloodType.FOURTH_POSITIVE, label: 'IV+' },
  { value: BloodType.FOURTH_NEGATIVE, label: 'IV-' }
];

export default function ProfilePage() {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<ParentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedChild, setExpandedChild] = useState<number | null>(null);
  const [editingChild, setEditingChild] = useState<ShortChildResponse | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    birth_date: "",
    gender: GenderType.MALE,
    height: "",
    weight: "",
    blood: BloodType.FIRST_POSITIVE,
    disability: "",
    vaccinations: "",
    medical_note: "",
    diagnoses: [] as ChildDiagnosis[]
  });
  const [diagnosesList, setDiagnosesList] = useState<Diagnosis[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [payingOrderId, setPayingOrderId] = useState<number | null>(null);
  const [cardForm, setCardForm] = useState({
    cardNumber: "",
    cardName: "",
    cardMonth: "",
    cardYear: "",
    cardCVC: ""
  });
  const [cardError, setCardError] = useState<string | null>(null);
  const [cardLoading, setCardLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchProfile();
    fetchDiagnoses();
  }, [token, searchTerm]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Если в ответе есть поле childs, сохраняем его отдельно (если нужно)
      if (response.data && Array.isArray(response.data.childs)) {
        setProfile(response.data);
      } else {
        setProfile({ ...response.data, childs: [] });
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiagnoses = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/diagnosis/", {
        params: { name: searchTerm || null, icd_code: searchTerm || null },
        headers: { Authorization: `Bearer ${token}` }
      });
      setDiagnosesList(response.data);
    } catch (err) {
      console.error("Ошибка при загрузке диагнозов:", err);
    }
  };

  const handleSubmitChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        id_parent: profile?.id,
        height: Number(formData.height),
        weight: Number(formData.weight)
      };

      if (editingChild) {
        await axios.put(`http://127.0.0.1:8000/api/childs/${editingChild.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post("http://127.0.0.1:8000/api/childs/", payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      await fetchProfile();
      setShowAddForm(false);
      setEditingChild(null);
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      birth_date: "",
      gender: GenderType.MALE,
      height: "",
      weight: "",
      blood: BloodType.FIRST_POSITIVE,
      disability: "",
      vaccinations: "",
      medical_note: "",
      diagnoses: []
    });
  };

  const startEditing = (child: ShortChildResponse) => {
    setEditingChild(child);
    setFormData({
      name: child.name,
      birth_date: child.birth_date,
      gender: child.gender,
      height: child.height?.toString() || "",
      weight: child.weight?.toString() || "",
      blood: child.blood || BloodType.FIRST_POSITIVE,
      disability: child.disability || "",
      vaccinations: child.vaccinations || "",
      medical_note: child.medical_note || "",
      diagnoses: child.diagnoses || []
    });
    setShowAddForm(true);
  };

  const addDiagnosis = () => {
    setFormData({
      ...formData,
      diagnoses: [...formData.diagnoses, {
        id_diagnosis: 0,
        date_diagnosis: new Date().toISOString().split('T')[0],
        doctor: "",
        notes: ""
      }]
    });
  };

  const updateDiagnosis = (index: number, field: keyof ChildDiagnosis, value: string) => {
    const updated = [...formData.diagnoses];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, diagnoses: updated });
  };

  const removeDiagnosis = (index: number) => {
    const updated = [...formData.diagnoses];
    updated.splice(index, 1);
    setFormData({ ...formData, diagnoses: updated });
  };

  const toggleChildExpansion = (childId: number) => {
    setExpandedChild(expandedChild === childId ? null : childId);
  };

  // Валидация карты
  function validateCardForm() {
    const { cardNumber, cardName, cardMonth, cardYear, cardCVC } = cardForm;
    if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ""))) return "Введите 16-значный номер карты";
    if (!/^[A-Za-zА-Яа-яЁё\s]+$/.test(cardName.trim())) return "Введите имя владельца (только буквы)";
    if (!/^(0[1-9]|1[0-2])$/.test(cardMonth)) return "Месяц должен быть от 01 до 12";
    if (!/^\d{2}$/.test(cardYear)) return "Год должен быть в формате YY";
    if (!/^\d{3}$/.test(cardCVC)) return "CVC должен содержать 3 цифры";
    return null;
  }

  async function handlePay(orderId: number) {
    setCardError(null);
    const err = validateCardForm();
    if (err) {
      setCardError(err);
      return;
    }
    setCardLoading(true);
    try {
      await axios.put(
        `http://127.0.0.1:8000/api/orders/${orderId}`,
        { status: "PAID" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchProfile();
      setPayingOrderId(null);
      setCardForm({
        cardNumber: "",
        cardName: "",
        cardMonth: "",
        cardYear: "",
        cardCVC: ""
      });
    } catch (err: any) {
      setCardError(err.response?.data?.detail || err.message);
    } finally {
      setCardLoading(false);
    }
  }

  async function handleCancel(orderId: number) {
    setCardLoading(true);
    setCardError(null);
    try {
      await axios.put(
        `http://127.0.0.1:8000/api/orders/${orderId}`,
        { status: "CANCELLED" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchProfile();
    } catch (err: any) {
      setCardError(err.response?.data?.detail || err.message);
    } finally {
      setCardLoading(false);
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="p-4 bg-red-100 text-red-700 rounded-lg max-w-md mx-auto mt-8">
      Ошибка: {error}
    </div>
  );

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md overflow-hidden"
      >
        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <p className="text-blue-100">{profile.user.email}</p>
            </div>
            <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
              ID: {profile.id}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              <span>{profile.phone}</span>
            </div>
            <div className="flex items-center">
              <Home className="w-5 h-5 mr-2" />
              <span>{profile.address}</span>
            </div>
            <div className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              <span>{profile.passport_data}</span>
            </div>
          </div>
        </div>

        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <Baby className="w-5 h-5 mr-2 text-blue-600" />
              Дети ({profile.childs.length})
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingChild(null);
                setShowAddForm(!showAddForm);
              }}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm"
            >
              <Plus size={16} /> Добавить
            </motion.button>
          </div>

          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <form onSubmit={handleSubmitChild} className="bg-gray-50 p-4 rounded-lg mb-4 space-y-4">
                  <h3 className="text-lg font-medium">
                    {editingChild ? `Редактирование ${editingChild.name}` : 'Добавление нового ребенка'}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Имя ребенка*</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Дата рождения*</label>
                      <input
                        type="date"
                        value={formData.birth_date}
                        onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Пол*</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value as GenderType})}
                        className="w-full p-2 border rounded"
                        required
                      >
                        <option value={GenderType.MALE}>Мальчик</option>
                        <option value={GenderType.FEMALE}>Девочка</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Рост (см)</label>
                      <input
                        type="number"
                        value={formData.height}
                        onChange={(e) => setFormData({...formData, height: e.target.value})}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Вес (кг)</label>
                      <input
                        type="number"
                        value={formData.weight}
                        onChange={(e) => setFormData({...formData, weight: e.target.value})}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Группа крови</label>
                      <select
                        value={formData.blood}
                        onChange={(e) => setFormData({...formData, blood: e.target.value as BloodType})}
                        className="w-full p-2 border rounded"
                      >
                        {bloodTypeOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Инвалидность</label>
                      <input
                        type="text"
                        value={formData.disability}
                        onChange={(e) => setFormData({...formData, disability: e.target.value})}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Прививки</label>
                    <textarea
                      value={formData.vaccinations}
                      onChange={(e) => setFormData({...formData, vaccinations: e.target.value})}
                      className="w-full p-2 border rounded"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Медицинские заметки</label>
                    <textarea
                      value={formData.medical_note}
                      onChange={(e) => setFormData({...formData, medical_note: e.target.value})}
                      className="w-full p-2 border rounded"
                      rows={2}
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Диагнозы</h3>
                      <button
                        type="button"
                        onClick={addDiagnosis}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                      >
                        <Plus size={14} className="mr-1" /> Добавить диагноз
                      </button>
                    </div>

                    {formData.diagnoses.map((diag, index) => (
                      <div key={index} className="bg-white p-3 rounded border mb-2">
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500">Диагноз*</label>
                            <div className="relative">
                              <select
                                value={diag.id_diagnosis}
                                onChange={(e) => updateDiagnosis(index, 'id_diagnosis', e.target.value)}
                                className="w-full p-1 border rounded text-sm"
                                required
                              >
                                <option value="">Выберите диагноз</option>
                                {diagnosesList.map(d => (
                                  <option key={d.id} value={d.id}>
                                    {d.name} ({d.icd_code})
                                  </option>
                                ))}
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500">Дата диагноза*</label>
                            <input
                              type="date"
                              value={diag.date_diagnosis}
                              onChange={(e) => updateDiagnosis(index, 'date_diagnosis', e.target.value)}
                              className="w-full p-1 border rounded text-sm"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500">Врач*</label>
                            <input
                              type="text"
                              value={diag.doctor}
                              onChange={(e) => updateDiagnosis(index, 'doctor', e.target.value)}
                              className="w-full p-1 border rounded text-sm"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500">Заметки</label>
                            <input
                              type="text"
                              value={diag.notes}
                              onChange={(e) => updateDiagnosis(index, 'notes', e.target.value)}
                              className="w-full p-1 border rounded text-sm"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDiagnosis(index)}
                          className="mt-2 text-red-600 hover:text-red-800 text-xs"
                        >
                          Удалить диагноз
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingChild(null);
                        resetForm();
                      }}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Сохранение...
                        </>
                      ) : (
                        editingChild ? "Обновить" : "Сохранить"
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {profile.childs.length === 0 ? (
            <p className="text-gray-500">Нет добавленных детей</p>
          ) : (
            <div className="space-y-3">
              {profile.childs.map((child) => (
                <div key={child.id} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                  <div 
                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleChildExpansion(child.id)}
                  >
                    <div>
                      <h3 className="font-medium">{child.name}</h3>
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{new Date(child.birth_date).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <span>{genderMap[child.gender]}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(child);
                        }}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Редактировать"
                      >
                        <Edit size={16} />
                      </button>
                      <span className="text-sm text-gray-500">ID: {child.id}</span>
                      {expandedChild === child.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedChild === child.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 border-t bg-white">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <h4 className="font-medium flex items-center">
                                <Scale className="w-4 h-4 mr-2 text-blue-500" />
                                Физические параметры
                              </h4>
                              <div className="text-sm space-y-1">
                                <p>Рост: {child.height ? `${child.height} см` : 'не указан'}</p>
                                <p>Вес: {child.weight ? `${child.weight} кг` : 'не указан'}</p>
                                <p>Группа крови: {child.blood || 'не указана'}</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-medium flex items-center">
                                <BriefcaseMedical className="w-4 h-4 mr-2 text-blue-500" />
                                Медицинская информация
                              </h4>
                              <div className="text-sm space-y-1">
                                <p>Инвалидность: {child.disability || 'нет'}</p>
                                <p>Прививки: {child.vaccinations || 'нет данных'}</p>
                              </div>
                            </div>
                          </div>
                          
                          {child.medical_note && (
                            <div className="mt-4 space-y-2">
                              <h4 className="font-medium flex items-center">
                                <NotebookText className="w-4 h-4 mr-2 text-blue-500" />
                                Медицинские заметки
                              </h4>
                              <p className="text-sm whitespace-pre-line">{child.medical_note}</p>
                            </div>
                          )}

                          {child.diagnoses && child.diagnoses.length > 0 && (
                            <div className="mt-4 space-y-2">
                              <h4 className="font-medium flex items-center">
                                <BriefcaseMedical className="w-4 h-4 mr-2 text-blue-500" />
                                Диагнозы
                              </h4>
                              <div className="space-y-2">
                                {child.diagnoses.map((diag, idx) => {
                                  const diagnosis = diagnosesList.find(d => d.id === diag.id_diagnosis);
                                  return (
                                    <div key={idx} className="bg-gray-50 p-2 rounded">
                                      <p className="font-medium">
                                        {diagnosis ? `${diagnosis.name} (${diagnosis.icd_code})` : `Диагноз ID: ${diag.id_diagnosis}`}
                                      </p>
                                      <p className="text-sm">Дата: {new Date(diag.date_diagnosis).toLocaleDateString()}</p>
                                      <p className="text-sm">Врач: {diag.doctor}</p>
                                      {diag.notes && <p className="text-sm">Заметки: {diag.notes}</p>}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6">
          <h2 className="text-xl font-semibold flex items-center mb-4">
            <ClipboardList className="w-5 h-5 mr-2 text-blue-600" />
            Заказы ({profile.orders.length})
          </h2>
          {profile.orders.length === 0 ? (
            <p className="text-gray-500">Нет оформленных заказов</p>
          ) : (
            <div className="space-y-3">
              {profile.orders.map((order) => (
                <motion.div 
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg overflow-hidden hover:shadow transition-shadow"
                >
                  <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                    <div>
                      <span className="font-medium">Заказ #{order.id}</span>
                      <span className="text-sm text-gray-600 ml-3">
                        Ребенок: {profile.childs.find(c => c.id === order.id_child)?.name || 'Неизвестный ребенок'}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${orderStatusMap[order.status].color}`}>
                      {orderStatusMap[order.status].text}
                    </span>
                  </div>
                  <div className="p-4 grid md:grid-cols-3 gap-4">
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      <span>
                        {new Date(order.check_in_date).toLocaleDateString()} - {new Date(order.check_out_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Bed className="w-4 h-4 mr-2 text-gray-500" />
                      <span>Комната №{order.id_room || "не назначена"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Курс: #{order.id_treatment_course}</span>
                      <span className="font-medium">{order.price.toLocaleString()} ₽</span>
                    </div>
                  </div>
                  {/* Кнопки оплаты и отмены */}
                  {(order.status === OrderStatus.WAITING_PAYMENT || order.status === OrderStatus.PENDING) && (
                    <div className="p-4 border-t flex flex-col md:flex-row gap-3 md:gap-6 items-center">
                      {payingOrderId === order.id ? (
                        <form
                          onSubmit={e => {
                            e.preventDefault();
                            handlePay(order.id);
                          }}
                          className="w-full max-w-md space-y-2"
                        >
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Номер карты</label>
                            <input
                              type="text"
                              maxLength={19}
                              inputMode="numeric"
                              autoComplete="cc-number"
                              placeholder="0000 0000 0000 0000"
                              value={cardForm.cardNumber}
                              onChange={e => setCardForm(f => ({
                                ...f,
                                cardNumber: e.target.value.replace(/[^\d]/g, "").replace(/(.{4})/g, "$1 ").trim()
                              }))}
                              className="w-full p-2 border rounded"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Имя владельца</label>
                            <input
                              type="text"
                              autoComplete="cc-name"
                              placeholder="IVAN IVANOV"
                              value={cardForm.cardName}
                              onChange={e => setCardForm(f => ({ ...f, cardName: e.target.value }))
                              }
                              className="w-full p-2 border rounded"
                              required
                            />
                          </div>
                          <div className="flex gap-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Месяц</label>
                              <input
                                type="text"
                                maxLength={2}
                                inputMode="numeric"
                                placeholder="MM"
                                value={cardForm.cardMonth}
                                onChange={e => setCardForm(f => ({ ...f, cardMonth: e.target.value.replace(/[^\d]/g, "") }))
                                }
                                className="w-full p-2 border rounded"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Год</label>
                              <input
                                type="text"
                                maxLength={2}
                                inputMode="numeric"
                                placeholder="YY"
                                value={cardForm.cardYear}
                                onChange={e => setCardForm(f => ({ ...f, cardYear: e.target.value.replace(/[^\d]/g, "") }))
                                }
                                className="w-full p-2 border rounded"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">CVC</label>
                              <input
                                type="text"
                                maxLength={3}
                                inputMode="numeric"
                                placeholder="CVC"
                                value={cardForm.cardCVC}
                                onChange={e => setCardForm(f => ({ ...f, cardCVC: e.target.value.replace(/[^\d]/g, "") }))
                                }
                                className="w-full p-2 border rounded"
                                required
                              />
                            </div>
                          </div>
                          {cardError && (
                            <div className="text-red-600 text-xs">{cardError}</div>
                          )}
                          <div className="flex gap-2 pt-2">
                            <button
                              type="submit"
                              disabled={cardLoading}
                              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              {cardLoading ? "Оплата..." : "Оплатить"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPayingOrderId(null);
                                setCardForm({
                                  cardNumber: "",
                                  cardName: "",
                                  cardMonth: "",
                                  cardYear: "",
                                  cardCVC: ""
                                });
                                setCardError(null);
                              }}
                              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                              Отмена
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setPayingOrderId(order.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Оплатить
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancel(order.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            disabled={cardLoading}
                          >
                            Отменить заказ
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}