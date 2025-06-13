from pydantic import BaseModel, Field, field_validator, EmailStr
import re
from typing import Optional, List
from datetime import date

class RoomResponse(BaseModel):
    id: int
    number: str
    floor: int
    capacity: int
    description: str

class CreateRoom(BaseModel):
    number: str
    floor: int
    capacity: int
    description: str

class UpdateRoom(BaseModel):
    number: Optional[str] = None
    floor: Optional[int] = None
    capacity: Optional[int] = None
    description: Optional[str] = None
