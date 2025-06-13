from fastapi import HTTPException
from schemas.childs import *
from crud.childs import *
from utils.enums import Status

class ChildService:
    def __init__(self, child_repository: ChildRepository,
                 child_diagnosis_repository: ChildRepository):
        self.child_repository=child_repository
        self.child_diagnosis_repository=child_diagnosis_repository

    def get_all_child_diagnosis_filter_by(self, **filter):
        return self.child_diagnosis_repository.get_all_filter_by(**filter)
    
    def get_one_child_diagnosis_filter_by(self, **filter):
        return self.child_diagnosis_repository.get_one_filter_by(**filter)
    

    def get_all_childs_filter_by(self, **filter):
        return self.child_repository.get_all_filter_by(**filter)
    
    def get_one_child_filter_by(self, **filter):
        return self.child_repository.get_one_filter_by(**filter)
    
    def create_child(self, data: CreateChild):
        new_child = data.model_dump()
        diagnoses = new_child.pop('diagnoses', []) or []

        created_child = self.child_repository.add(new_child)
        if not created_child:
            raise HTTPException(status_code=400, detail={'status': Status.FAILED.value})
        
        for diagnosis in diagnoses:
            diagnosis['id_child'] = created_child.id
            created_diagnosis = self.child_diagnosis_repository.add(diagnosis)
            if not created_diagnosis:
                raise HTTPException(status_code=400, detail={'status': Status.FAILED.value})
        return created_child
    
    def update_child(self, id: int, upd_data: UpdateChild):
        entity = upd_data.model_dump()
        entity['id'] = id
        
        diagnoses = entity.pop('diagnoses', []) or []

        entity = {k: v for k, v in entity.items() if v is not None}
        updated_child = self.child_repository.update(entity)
        
        if diagnoses:
            for diagnosis in diagnoses:
                diagnosis['id_child'] = id
                if diagnosis.get('id') is not None:
                    updated_diagnosis = self.child_diagnosis_repository.update(diagnosis)
                else:
                    created_diagnosis = self.child_diagnosis_repository.add(diagnosis)
        return updated_child
    
    def delete_child(self, id: int):
        self.child_diagnosis_repository.delete_by_filter(id_child=id)
        return self.child_repository.delete(id=id)