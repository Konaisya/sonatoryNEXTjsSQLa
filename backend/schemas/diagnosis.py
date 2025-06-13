from pydantic import BaseModel, Field, field_validator, EmailStr
import re
from typing import Optional
from datetime import date

class DiagnosisResponse(BaseModel):
    id: int
    name: str
    icd_code: str
    description: str
    symptoms: str
    contraindications: str

class CreateDiagnosis(BaseModel):
    name: str
    icd_code: str
    description: str
    symptoms: str
    contraindications: str

class UpdateDiagnosis(BaseModel):
    name: Optional[str] = None
    icd_code: Optional[str] = None
    description: Optional[str] = None
    symptoms: Optional[str] = None
    contraindications: Optional[str] = None