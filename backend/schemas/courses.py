from pydantic import BaseModel, Field, field_validator, EmailStr
import re
from typing import Optional, List
from datetime import date
from schemas.diagnosis import DiagnosisResponse

class ProcedureResponse(BaseModel):
    id: int
    name: str
    description: str
    contraindications: str
    frequency: str
    duration_min: int

class CreateProcedure(BaseModel):
    name: str
    description: str
    contraindications: str
    frequency: str
    duration_min: int

class UpdateProcedure(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    contraindications: Optional[str] = None
    frequency: Optional[str] = None
    duration_min: Optional[int] = None

class ShortCourseResponse(BaseModel):
    id: int
    name: str
    description: str
    price: float
    duration_days: int
    
class TreatmentCourseResponse(BaseModel):
    id: int
    name: str
    description: str
    price: float
    duration_days: int
    diagnosis: DiagnosisResponse
    procedures: List[ProcedureResponse]
    
class CreateTreatmentCourse(BaseModel):
    name: str
    description: str
    price: float
    duration_days: int
    id_diagnosis: int
    ids_procedures: List[int]

class UpdateTreatmentCourse(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    duration_days: Optional[int] = None
    id_diagnosis: Optional[int] = None
    ids_procedures: Optional[List[int]] = None


class CourseProcedureForm(BaseModel):
    id_course: int
    id_procedure: int