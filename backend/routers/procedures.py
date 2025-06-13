from fastapi import APIRouter, Depends, HTTPException, Query
from dependencies import CourseService, get_course_service
from schemas.courses import *
from utils.enums import Status

router = APIRouter()

@router.post('/', status_code=201)
async def create_procedure(data: CreateProcedure,
                           course_service: CourseService = Depends(get_course_service)):
    new_procedure = course_service.create_procedure(data)
    if not new_procedure:
        raise HTTPException(status_code=400, detail={'status': Status.FAILED.value})
    return new_procedure

@router.get('/', status_code=200)
async def get_all_procedures(name: str | None = Query(None),
                            description: str | None = Query(None),
                            contraindications: str | None = Query(None),
                            frequency: str | None = Query(None),
                            duration_min: int | None = Query(None),
                            course_service: CourseService = Depends(get_course_service)):
    filter = {k: v for k, v in locals().items() if v is not None and k != 'course_service'}
    procedures = course_service.get_all_procedures_filter_by(**filter)
    if not procedures:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    return [ProcedureResponse(**procedure.__dict__) for procedure in procedures]

@router.get('/{id}', status_code=200)
async def get_one_procedure(id: int,
                            course_service: CourseService = Depends(get_course_service)):
    procedure = course_service.get_one_procedure_filter_by(id=id)
    if not procedure:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    return ProcedureResponse(**procedure.__dict__)

@router.put('/{id}', status_code=200)
async def update_procedure(id: int,
                           data: UpdateProcedure,
                           course_service: CourseService = Depends(get_course_service)):
    procedure = course_service.get_one_procedure_filter_by(id=id)
    if not procedure:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    updated_procedure = course_service.update_procedure(id=id, upd_procedure=data)
    return updated_procedure

@router.delete('/{id}', status_code=200)
async def delete_procedure(id: int,
                           course_service: CourseService = Depends(get_course_service)):
    procedure = course_service.get_one_procedure_filter_by(id=id)
    if not procedure:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    course_service.delete_procedure(id=id)
    return {'status': Status.SUCCESS.value}