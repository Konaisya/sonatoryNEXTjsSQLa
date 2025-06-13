from pydantic import BaseModel, Field, field_validator, EmailStr
import re
from typing import Optional, List
from datetime import date, datetime
from schemas.diagnosis import DiagnosisResponse
from schemas.courses import ProcedureResponse
from schemas.users import ShortParentResponse, ShortStaffResponse
from utils.enums import *

class ChildDiagnosisResponse(BaseModel):
    id: int
    diagnosis: 'DiagnosisResponse'
    date_diagnosis: date
    doctor: str
    notes: str

class ChildDiagnosisForm(BaseModel):
    id: Optional[int] = None
    id_diagnosis: int
    date_diagnosis: date
    doctor: str
    notes: str


class ShortChildResponse(BaseModel):
    id: int
    name: str
    birth_date: date
    gender: str

class ChildResponse(BaseModel): 
    id: int
    name: str
    birth_date: date
    gender: GenderType
    parent: 'ShortParentResponse'
    height: float
    weight: float
    blood: BloodType
    disability: str
    vaccinations: str
    medical_note: str
    diagnoses: List[ChildDiagnosisResponse]

class CreateChild(BaseModel):
    name: str
    birth_date: date
    gender: GenderType
    id_parent: int
    height: float
    weight: float
    blood: BloodType
    disability: str
    vaccinations: str
    medical_note: str
    diagnoses: List[ChildDiagnosisForm]

class UpdateChild(BaseModel):
    name: Optional[str] = None
    birth_date: Optional[date] = None
    gender: Optional[GenderType] = None
    id_parent: Optional[int] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    blood: Optional[BloodType] = None
    disability: Optional[str] = None
    vaccinations: Optional[str] = None
    medical_note: Optional[str] = None
    diagnoses: Optional[List[ChildDiagnosisForm]] = None


class ProcedureRecordResponse(BaseModel):
    id: int
    child: ShortChildResponse
    procedure: ProcedureResponse
    staff: ShortStaffResponse
    procedure_time: datetime

class CreateProcedureRecord(BaseModel):
    id_child: int
    id_procedure: int
    id_staff: int

class UpdateProcedureRecord(BaseModel):
    id_child: Optional[int] = None
    id_procedure: Optional[int] = None
    id_staff: Optional[int] = None
    procedure_time: Optional[datetime] = None

