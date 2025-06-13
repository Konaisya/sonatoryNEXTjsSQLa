from fastapi import HTTPException
from schemas.courses import *
from crud.courses import *
from utils.enums import Status

class CourseService:
    def __init__(self, course_repository: CourseRepository,
                 course_procedure_repository: CourseRepository,
                 procedure_repository: CourseRepository):
        self.course_repository=course_repository
        self.course_procedure_repository=course_procedure_repository
        self.procedure_repository=procedure_repository

    def get_all_procedures_filter_by(self, **kwargs):
        return self.procedure_repository.get_all_filter_by(**kwargs)
    
    def get_one_procedure_filter_by(self, **kwargs):
        return self.procedure_repository.get_one_filter_by(**kwargs)
    
    def create_procedure(self, new_procedure: CreateProcedure):
        return self.procedure_repository.add(new_procedure.model_dump())
    
    def update_procedure(self, id: int, upd_procedure: UpdateProcedure):
        entity = upd_procedure.model_dump()
        entity['id'] = id
        entity = {k: v for k, v in entity.items() if v is not None}
        return self.procedure_repository.update(entity)
    
    def delete_procedure(self, id: int):
        return self.procedure_repository.delete(id=id)
    

    def get_all_course_procedures_filter_by(self, **kwargs):
        return self.course_procedure_repository.get_all_filter_by(**kwargs)
    
    def get_one_course_procedure_filter_by(self, **kwargs):
        return self.course_procedure_repository.get_one_filter_by(**kwargs)
    
    def create_course_procedure(self, new_course_procedure: CourseProcedureForm):
        return self.course_procedure_repository.add(new_course_procedure.model_dump())
    
    def update_course_procedure(self, id: int, upd_course_procedure: CourseProcedureForm):
        entity = upd_course_procedure.model_dump()
        entity['id'] = id
        entity = {k: v for k, v in entity.items() if v is not None}
        return self.course_procedure_repository.update(entity)
    
    def delete_course_procedure(self, id: int):
        return self.course_procedure_repository.delete(id=id)
    

    def get_all_courses_filter_by(self, **kwargs):
        return self.course_repository.get_all_filter_by(**kwargs)
    
    def get_one_course_filter_by(self, **kwargs):
        return self.course_repository.get_one_filter_by(**kwargs)
    
    def create_course(self, new_course: CreateTreatmentCourse):
        new_course_dict = new_course.model_dump()
        ids_procedures = new_course_dict.pop('ids_procedures', []) or []

        created_course = self.course_repository.add(new_course_dict)
        if not created_course:
            return Status.FAILED.value
        
        if ids_procedures:
            for id_procedure in ids_procedures:
                course_procedure = CourseProcedureForm(id_course=created_course.id, id_procedure=id_procedure)
                self.course_procedure_repository.add(course_procedure.model_dump())
        return created_course
    
    def update_course(self, id: int, upd_course: UpdateTreatmentCourse):
        entity = upd_course.model_dump()
        entity['id'] = id

        ids_procedures = entity.pop('ids_procedures', []) or []

        entity = {k: v for k, v in entity.items() if v is not None}
        updated_product = self.course_repository.update(entity)

        if ids_procedures:
            self.course_procedure_repository.delete_by_filter(id_course=id)
            for id_procedure in ids_procedures:
                course_procedure = CourseProcedureForm(id_course=id, id_procedure=id_procedure)
                self.course_procedure_repository.add(course_procedure.model_dump())
        return updated_product
        
    def delete_course(self, id: int):
        self.course_procedure_repository.delete_by_filter(id_course=id)
        return self.course_repository.delete(id=id)