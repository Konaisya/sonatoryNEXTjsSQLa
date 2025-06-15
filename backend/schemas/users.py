from pydantic import BaseModel, Field, field_validator, EmailStr
import re
from typing import Optional, List
from datetime import date
from utils.enums import *

class ShortChildResponse(BaseModel):
    id: int
    name: str
    birth_date: date
    gender: GenderType
    height: float
    weight: float
    blood: BloodType
    disability: str
    vaccinations: str
    medical_note: str


class ShortOrderResponse(BaseModel):
    id: int
    id_child: int
    id_treatment_course: int
    id_room: int
    status: OrderStatus
    check_in_date: date
    check_out_date: date
    price: float


class UserCreate(BaseModel):
    role: str
    email: EmailStr
    password: str

    @field_validator('email')
    @classmethod
    def validate_email(cls, val: str):
        if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', val):
            raise ValueError('Invalid email address')
        return val

    @field_validator('password')
    @classmethod
    def validate_password(cls, val: str):
        if not re.match(r'^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$', val):
            raise ValueError('Invalid password')
        return val 

class UserParentCreate(BaseModel):
    role: Optional[str] = Roles.USER.value
    email: EmailStr
    password: str
    parent: 'CreateParent'

    @field_validator('email')
    @classmethod
    def validate_email(cls, val: str):
        if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', val):
            raise ValueError('Invalid email address')
        return val

    @field_validator('password')
    @classmethod
    def validate_password(cls, val: str):
        if not re.match(r'^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$', val):
            raise ValueError('Invalid password')
        return val 
    
class UserStaffCreate(BaseModel):
    role: Optional[str] = Roles.ADMIN.value
    email: EmailStr
    password: str
    staff: 'CreateStaff'

    @field_validator('email')
    @classmethod
    def validate_email(cls, val: str):
        if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', val):
            raise ValueError('Invalid email address')
        return val

    @field_validator('password')
    @classmethod
    def validate_password(cls, val: str):
        if not re.match(r'^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$', val):
            raise ValueError('Invalid password')
        return val 
    
class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

    @field_validator('email')
    @classmethod
    def validate_email(cls, val: str):
        if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', val):
            raise ValueError('Invalid email address')
        return val

    @field_validator('password')
    @classmethod
    def validate_password(cls, val: str):
        if not re.match(r'^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$', val):
            raise ValueError('Invalid password')
        return val
    
class UserLogin(BaseModel):
    email: EmailStr
    password: str
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, val: str):
        if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', val):
            raise ValueError('Invalid email address')
        return val

    @field_validator('password')
    @classmethod
    def validate_password(cls, val: str):
        if not re.match(r'^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$', val):
            raise ValueError('Invalid password')
        return val
    
class User(BaseModel):
    id: int
    role: str
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str


class ShortStaffResponse(BaseModel):
    id: int
    name: str
    position: str
    qualification: str
    hire_date: date
    department: str
    schedule: str

class StaffResponse(BaseModel):
    id: int
    user: UserResponse
    name: str
    position: str
    qualification: str
    hire_date: date
    department: str
    schedule: str

class CreateStaff(BaseModel):
    name: str
    position: str      
    qualification: str 
    hire_date: date    
    department: str    
    schedule: str      

class UpdateStaff(BaseModel):
    name: Optional[str] = None
    position: Optional[str] = None
    qualification: Optional[str] = None
    hire_date: Optional[date] = None
    department: Optional[str] = None
    schedule: Optional[str] = None


class ShortParentResponse(BaseModel):
    id: int
    id_user: int
    name: str
    phone: str
    address: str
    passport_data: str

class ParentResponse(BaseModel):
    id: int
    user: UserResponse
    name: str
    phone: str
    address: str
    passport_data: str
    childs: List['ShortChildResponse']
    orders: List['ShortOrderResponse']

class CreateParent(BaseModel):
    name: str
    phone: str
    address: str
    passport_data: str

class UpdateParent(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    passport_data: Optional[str] = None
    

class CreateModelParent(BaseModel):
    id_user: int
    name: str
    phone: str
    address: str
    passport_data: str

class CreateModelStaff(BaseModel):
    id_user: int
    name: str
    position: str      
    qualification: str 
    hire_date: date    
    department: str    
    schedule: str