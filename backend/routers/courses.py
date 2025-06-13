from fastapi import APIRouter, Depends, HTTPException, Query
from dependencies import CourseService, get_course_service, DiagnosisService, get_diagnosis_service
from schemas.courses import *
from schemas.diagnosis import DiagnosisResponse
from utils.enums import Status

router = APIRouter()

@router.post('/', status_code=201)
async def create_course(data: CreateTreatmentCourse,
                        course_service: CourseService = Depends(get_course_service)):
    new_course = course_service.create_course(data)
    if not new_course:
        raise HTTPException(status_code=400, detail={'status': Status.FAILED.value})
    return new_course

@router.get('/', status_code=200)
async def get_all_courses(name: str = Query(None),
                          price: float = Query(None),
                          duration_days: int = Query(None),
                          id_diagnosis: int = Query(None),
                          course_service: CourseService = Depends(get_course_service),
                          diagnosis_service: DiagnosisService = Depends(get_diagnosis_service)):
    filter = {k: v for k, v in locals().items() if v is not None and k not in {'course_service', 'diagnosis_service'}}
    courses = course_service.get_all_courses_filter_by(**filter)
    if not courses:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    response = []
    for course in courses:
        procedures_assoc = course_service.get_all_course_procedures_filter_by(id_course=course.id)
        procedures_resp = []

        diagnosis = diagnosis_service.get_one_diagnosis_filter_by(id=course.id_diagnosis)
        diagnosis_resp = DiagnosisResponse(**diagnosis.__dict__)

        for procedure_assoc in procedures_assoc:
            procedure = course_service.get_one_procedure_filter_by(id=procedure_assoc.id_procedure)
            procedures_resp.append(ProcedureResponse(**procedure.__dict__))
        course_dict = course.__dict__
        course_dict.update({
            'procedures': procedures_resp,
            'diagnosis': diagnosis_resp
        })
        response.append(TreatmentCourseResponse(**course_dict))
    return response

@router.get('/{id}', status_code=200)
async def get_one_course(id: int,
                         course_service: CourseService = Depends(get_course_service),
                         diagnosis_service: DiagnosisService = Depends(get_diagnosis_service)):
    course = course_service.get_one_course_filter_by(id=id)
    if not course:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    procedures_assoc = course_service.get_all_course_procedures_filter_by(id_course=course.id)
    procedures_resp = []

    diagnosis = diagnosis_service.get_one_diagnosis_filter_by(id=course.id_diagnosis)
    diagnosis_resp = DiagnosisResponse(**diagnosis.__dict__)

    for procedure_assoc in procedures_assoc:
        procedure = course_service.get_one_procedure_filter_by(id=procedure_assoc.id_procedure)
        procedures_resp.append(ProcedureResponse(**procedure.__dict__))
    course_dict = course.__dict__
    course_dict.update({
        'procedures': procedures_resp,
        'diagnosis': diagnosis_resp
    })
    return TreatmentCourseResponse(**course_dict)

@router.put('/{id}', status_code=200)
async def update_course(id: int,
                        data: UpdateTreatmentCourse,
                        course_service: CourseService = Depends(get_course_service)):
    course = course_service.get_one_course_filter_by(id=id)
    if not course:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    updated_course = course_service.update_course(id=id, upd_course=data)
    return updated_course

@router.delete('/{id}', status_code=200)
async def delete_course(id: int,
                        course_service: CourseService = Depends(get_course_service)):
    course = course_service.get_one_course_filter_by(id=id)
    if not course:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    course_service.delete_course(id=id)
    return {'status': Status.SUCCESS.value}