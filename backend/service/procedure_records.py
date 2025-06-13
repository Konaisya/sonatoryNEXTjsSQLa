from fastapi import HTTPException
from schemas.childs import *
from crud.procedure_records import *

class ProcedureRecordService:
    def __init__(self, procedure_record_repository: ProcedureRecordRepository):
        self.procedure_record_repository = procedure_record_repository

    def get_all_procedure_records_filter_by(self, **filter):
        return self.procedure_record_repository.get_all_filter_by(**filter)
    
    def get_one_procedure_record_filter_by(self, **filter):
        return self.procedure_record_repository.get_one_filter_by(**filter)

    def create_procedure_record(self, new_record: dict):
        return self.procedure_record_repository.add(new_record)
    
    def update_procedure_record(self, id: int, upd_record: UpdateProcedureRecord):
        entity = upd_record.model_dump()
        entity['id'] = id
        entity = {k: v for k, v in entity.items() if v is not None}
        return self.procedure_record_repository.update(entity)
    
    def delete_procedure_record(self, id: int):
        return self.procedure_record_repository.delete(id=id)
    
