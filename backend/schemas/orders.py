from pydantic import BaseModel, Field, field_validator, EmailStr
import re
from typing import Optional
from datetime import date
from schemas.childs import ShortChildResponse
from schemas.users import ShortParentResponse
from schemas.courses import ShortCourseResponse
from schemas.rooms import RoomResponse
from utils.enums import OrderStatus

class ShortOrderResponse(BaseModel):
    id: int
    id_child: int
    id_treatment_course: int
    id_room: int
    status: OrderStatus
    check_in_date: date
    check_out_date: date
    price: float
 
class OrderResponse(BaseModel):
    id: int
    child: 'ShortChildResponse'
    parent: 'ShortParentResponse'
    treatment_course: 'ShortCourseResponse'
    room: 'RoomResponse'
    status: OrderStatus
    check_in_date: date
    check_out_date: date
    price: float

class CreateOrder(BaseModel):
    id_child: int
    id_treatment_course: int
    id_room: int
    check_in_date: date
    check_out_date: date

class UpdateOrder(BaseModel):
    id_treatment_course: Optional[int] = None
    id_room: Optional[int] = None
    status: Optional[OrderStatus] = None
    check_in_date: Optional[date] = None
    check_out_date: Optional[date] = None
    price: Optional[float] = None