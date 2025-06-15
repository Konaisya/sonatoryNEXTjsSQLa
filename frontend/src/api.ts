import axios from "axios";


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


export interface User {
  id: number;
  user: { id: number; email: string };
  name: string;
  phone: string;
  address: string;
  passport_data: string;
  childs: Child[];
}

export interface Child {
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
};


export interface Diagnosis {
  id: number;
  name: string;
  icd_code: string;
  description: string;
  symptoms: string;
  contraindications: string;
}

export interface Procedure {
  id: number;
  name: string;
  description: string;
  contraindications: string;
  frequency: string;
  duration_min: number;
}

export interface Course {
  id: number;
  name: string;
  description: string;
  price: number | { source: string; parsedValue: number };
  duration_days: number;
  diagnosis: Diagnosis;
  procedures: Procedure[];
}

export interface GetCoursesParams {
  name?: string;
  price?: number;
  duration_days?: number;
  id_diagnosis?: number;
}

export interface Room {
  id: number;
  number: string;
  floor: number;
  capacity: number;
  description?: string;
}

export interface GetRoomsParams {
  number?: string;
  floor?: number;
  capacity?: number;
}

export interface Order {
  id: number;
  id_child: number;
  id_treatment_course: number;
  id_room: number;
  status: string;
  check_in_date: string;
  check_out_date: string;
  price: number;
}

export interface CreateOrderData {
  id_child: number;
  id_treatment_course: number;
  id_room: number;
  check_in_date: string;
  check_out_date: string;
}

export interface ParentSignupData {
  role?: string;
  email: string;
  password: string;
  parent: {
    name: string;
    phone: string;
    address: string;
    passport_data: string;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user?: any;
}

export async function getCourses(params: GetCoursesParams = {}): Promise<Course[]> {
  const query = new URLSearchParams();
  if (params.name) query.append('name', params.name);
  if (params.price !== undefined) query.append('price', params.price.toString());
  if (params.duration_days !== undefined) query.append('duration_days', params.duration_days.toString());
  if (params.id_diagnosis !== undefined) query.append('id_diagnosis', params.id_diagnosis.toString());

  const res = await axios.get(`http://127.0.0.1:8000/api/courses/?${query.toString()}`);
  return res.data;
}

export async function getRooms(params: GetRoomsParams = {}): Promise<Room[]> {
  const query = new URLSearchParams();
  if (params.number) query.append('number', params.number);
  if (params.floor !== undefined) query.append('floor', params.floor.toString());
  if (params.capacity !== undefined) query.append('capacity', params.capacity.toString());

  const res = await axios.get(`http://127.0.0.1:8000/api/rooms/?${query.toString()}`);
  return res.data;
}

export async function createOrder(orderData: CreateOrderData, token: string): Promise<Order> {
  const res = await axios.post("http://127.0.0.1:8000/api/orders/", orderData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return res.data;
}

export async function signupParent(data: ParentSignupData): Promise<AuthResponse> {
  const res = await axios.post("http://127.0.0.1:8000/api/auth/signup/parent", {
    role: data.role ?? "USER",
    email: data.email,
    password: data.password,
    parent: data.parent,
  });
  return res.data;
}

export async function login(data: LoginData): Promise<AuthResponse> {
  const res = await axios.post("http://127.0.0.1:8000/api/auth/login", data, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return res.data;
}

export async function getCurrentUser(token: string): Promise<any> {
  const res = await axios.get("http://127.0.0.1:8000/api/users/me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
}