from fastapi import APIRouter, Depends, HTTPException, Query
from utils.enums import Status
from dependencies import (ChildService, get_child_service, 
                          DiagnosisService, get_diagnosis_service,
                          UserService, get_user_service)
from schemas.childs import *
from schemas.diagnosis import *
from schemas.users import ShortParentResponse

router = APIRouter()

@router.post('/', status_code=201)
async def create_child(data: CreateChild,
                       child_service: ChildService = Depends(get_child_service),
                       diagnosis_service: DiagnosisService = Depends(get_diagnosis_service)):
    new_child = child_service.create_child(data)
    if not new_child:
        raise HTTPException(status_code=400, detail={'status': Status.FAILED.value})
    return new_child

@router.get('/', status_code=200)
async def get_all_childs(name: str | None = Query(None),
                        birth_date: date | None = Query(None),
                        gender: GenderType | None = Query(None),
                        id_parent: int | None = Query(None),
                        height: float | None = Query(None),
                        weight: float | None = Query(None),
                        blood: BloodType | None = Query(None),
                        disability: str | None = Query(None),
                        child_service: ChildService = Depends(get_child_service),
                        diagnosis_service: DiagnosisService = Depends(get_diagnosis_service),
                        user_service: UserService = Depends(get_user_service)):
    filter = {k: v for k, v in locals().items() if v is not None and k not in {'child_service', 'diagnosis_service', 'user_service'}}
    childs = child_service.get_all_childs_filter_by(**filter)
    if not childs:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    response = []
    for child in childs:
        diagnoses_assoc = child_service.get_all_child_diagnosis_filter_by(id_child=child.id)
        diagnoses_list = []
        for diagnosis_assoc in diagnoses_assoc:
            
            diagnosis = diagnosis_service.get_one_diagnosis_filter_by(id=diagnosis_assoc.id_diagnosis)
            diagnosis_resp = DiagnosisResponse(**diagnosis.__dict__)

            diagnosis_record_dict = diagnosis_assoc.__dict__
            diagnosis_record_dict.update({
                'diagnosis': diagnosis_resp
            })
            diagnoses_list.append(ChildDiagnosisResponse(**diagnosis_record_dict))
        
        parent = user_service.get_one_parent_filter_by(id=child.id_parent)
        parent_response = ShortParentResponse(**parent.__dict__)

        child_response = ChildResponse(**child.__dict__, 
                                       parent=parent_response, 
                                       diagnoses=diagnoses_list)
        response.append(child_response)
    return response

@router.get('/{id}', status_code=200)
async def get_one_child(id: int,
                        child_service: ChildService = Depends(get_child_service),
                       diagnosis_service: DiagnosisService = Depends(get_diagnosis_service),
                       user_service: UserService = Depends(get_user_service)):
    child = child_service.get_one_child_filter_by(id=id)
    if not child:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    
    diagnoses_assoc = child_service.get_all_child_diagnosis_filter_by(id_child=child.id)
    diagnoses_list = []
    for diagnosis_assoc in diagnoses_assoc:
        diagnosis = diagnosis_service.get_one_diagnosis_filter_by(id=diagnosis_assoc.id_diagnosis)
        diagnosis_resp = DiagnosisResponse(**diagnosis.__dict__)

        diagnosis_record_dict = diagnosis_assoc.__dict__
        diagnosis_record_dict.update({
            'diagnosis': diagnosis_resp
        })
        diagnoses_list.append(ChildDiagnosisResponse(**diagnosis_record_dict))
    
    parent = user_service.get_one_parent_filter_by(id=child.id_parent)
    parent_response = ShortParentResponse(**parent.__dict__)

    return ChildResponse(**child.__dict__, 
                         parent=parent_response, 
                         diagnoses=diagnoses_list)

@router.put('/{id}', status_code=200)
async def update_child(id: int,
                       data: UpdateChild,
                       child_service: ChildService = Depends(get_child_service)):
    child = child_service.get_one_child_filter_by(id=id)
    if not child:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    updated_child = child_service.update_child(id=id, upd_data=data)
    return updated_child

@router.delete('/{id}', status_code=200)
async def delete_child(id: int,
                       child_service: ChildService = Depends(get_child_service)):
    child = child_service.get_one_child_filter_by(id=id)
    if not child:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    deleted_child = child_service.delete_child(id=id)
    return {'status': Status.SUCCESS.value}
