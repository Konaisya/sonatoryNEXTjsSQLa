from fastapi import HTTPException
from schemas.diagnosis import *
from crud.diagnosis import *

class DiagnosisService:
    def __init__(self, diagnosis_repository: DiagnosisRepository):
        self.diagnosis_repository=diagnosis_repository

    def get_all_diagnosis_filter_by(self, **filter):
        return self.diagnosis_repository.get_all_filter_by(**filter)

    def get_one_diagnosis_filter_by(self, **filter):
        return self.diagnosis_repository.get_one_filter_by(**filter)
    
    def create_diagnosis(self, new_diagnosis: CreateDiagnosis):
        return self.diagnosis_repository.add(new_diagnosis.model_dump())
    
    def update_diagnosis(self, id: int, upd_diagnosis: UpdateDiagnosis):
        entity = upd_diagnosis.model_dump()
        entity['id'] = id
        entity = {k: v for k, v in entity.items() if v is not None}
        return self.diagnosis_repository.update(entity)

    def delete_diagnosis(self, id: int):
        return self.diagnosis_repository.delete(id=id)