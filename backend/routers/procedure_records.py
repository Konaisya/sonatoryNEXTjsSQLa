from fastapi import APIRouter, Depends, HTTPException, Query
from utils.enums import Status
from dependencies import (ProcedureRecordService, get_procedure_record_service,
                          ChildService, get_child_service,
                          UserService, get_user_service,
                          CourseService, get_course_service)
from schemas.childs import *
from schemas.users import ShortStaffResponse
from schemas.courses import *

router = APIRouter()

@router.post('/', status_code=201)
async def create_procedure_record(data: CreateProcedureRecord,
                                  procedure_record_service: ProcedureRecordService = Depends(get_procedure_record_service)):
    data_dict = data.model_dump()
    data_dict['procedure_time'] = datetime.now().replace(second=0, microsecond=0)
    new_record = procedure_record_service.create_procedure_record(data_dict)
    if not new_record:
        raise HTTPException(status_code=400, detail={'status': Status.FAILED.value})
    return new_record

@router.get('/', status_code=200)
async def get_all_procedure_records(id_child: int | None = Query(None),
                                    id_procedure: int | None = Query(None),
                                    id_staff: int | None = Query(None),
                                    procedure_time: datetime | None = Query(None),
                                    procedure_record_service: ProcedureRecordService = Depends(get_procedure_record_service),
                                    child_service: ChildService = Depends(get_child_service),
                                    user_service: UserService = Depends(get_user_service),
                                    course_service: CourseService = Depends(get_course_service)
                                    ):
    filter = {k: v for k, v in locals().items() if v is not None and k 
              not in {'procedure_record_service', 'child_service', 'user_service', 'course_service'}}
    records = procedure_record_service.get_all_procedure_records_filter_by(**filter)
    if not records:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    response = []
    for record in records:
        child = child_service.get_one_child_filter_by(id=record.id_child)
        procedure = course_service.get_one_procedure_filter_by(id=record.id_procedure)
        staff = user_service.get_one_staff_filter_by(id=record.id_staff)

        child_response = ShortChildResponse(**child.__dict__)
        procedure_response = ProcedureResponse(**procedure.__dict__)
        staff_response = ShortStaffResponse(**staff.__dict__)

        record_dict = record.__dict__
        record_dict.update({
            'child': child_response,
            'procedure': procedure_response,
            'staff': staff_response
        })
        response.append(ProcedureRecordResponse(**record_dict))
    return response

@router.get('/{id}', status_code=200)
async def get_one_procedure_record(id: int,
                                    procedure_record_service: ProcedureRecordService = Depends(get_procedure_record_service),
                                    child_service: ChildService = Depends(get_child_service),
                                    user_service: UserService = Depends(get_user_service),
                                    course_service: CourseService = Depends(get_course_service)):
    record = procedure_record_service.get_one_procedure_record_filter_by(id=id)
    if not record:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})

    child = child_service.get_one_child_filter_by(id=record.id_child)
    procedure = course_service.get_one_procedure_filter_by(id=record.id_procedure)
    staff = user_service.get_one_staff_filter_by(id=record.id_staff)

    child_response = ShortChildResponse(**child.__dict__)
    procedure_response = ProcedureResponse(**procedure.__dict__)
    staff_response = ShortStaffResponse(**staff.__dict__)

    record_dict = record.__dict__
    record_dict.update({
        'child': child_response,
        'procedure': procedure_response,
        'staff': staff_response
    })
    return ProcedureRecordResponse(**record_dict)

@router.put('/{id}', status_code=200)
async def update_procedure_record(id: int,
                                  data: UpdateProcedureRecord,
                                  procedure_record_service: ProcedureRecordService = Depends(get_procedure_record_service)):
    record = procedure_record_service.get_one_procedure_record_filter_by(id=id)
    if not record:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    updated_record = procedure_record_service.update_procedure_record(id=id, upd_record=data)
    return updated_record

@router.delete('/{id}', status_code=200)
async def delete_procedure_record(id: int,
                                   procedure_record_service: ProcedureRecordService = Depends(get_procedure_record_service)):
    record = procedure_record_service.get_one_procedure_record_filter_by(id=id)
    if not record:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    procedure_record_service.delete_procedure_record(id=id)
    return {'status': Status.SUCCESS.value}