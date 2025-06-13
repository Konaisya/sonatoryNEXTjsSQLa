from fastapi import APIRouter, Depends, HTTPException, Query
from dependencies import DiagnosisService, get_diagnosis_service
from schemas.diagnosis import *
from utils.enums import Status

router = APIRouter()

@router.post('/', status_code=201)
async def create_diagnosis(data: CreateDiagnosis,
                           diagnosis_service: DiagnosisService = Depends(get_diagnosis_service)):
    new_diagnosis = diagnosis_service.create_diagnosis(data)
    if not new_diagnosis:
        raise HTTPException(status_code=400, detail={'status': Status.FAILED.value})
    return new_diagnosis

@router.get('/', status_code=200)
async def get_all_diagnosis(name: str | None = Query(None),
                            icd_code: str | None = Query(None),
                            diagnosis_service: DiagnosisService = Depends(get_diagnosis_service)):
    filter = {k: v for k, v in locals().items() if v is not None and k != 'diagnosis_service'}
    diagnoses = diagnosis_service.get_all_diagnosis_filter_by(**filter)
    if not diagnoses:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    return [DiagnosisResponse(**diagnosis.__dict__) for diagnosis in diagnoses]

@router.get('/{id}', status_code=200)
async def get_one_diagnosis(id: int,
                             diagnosis_service: DiagnosisService = Depends(get_diagnosis_service)):
    diagnosis = diagnosis_service.get_one_diagnosis_filter_by(id=id)
    if not diagnosis:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    return DiagnosisResponse(**diagnosis.__dict__)

@router.put('/{id}', status_code=200)
async def update_diagnosis(id: int,
                           data: UpdateDiagnosis,
                           diagnosis_service: DiagnosisService = Depends(get_diagnosis_service)):
    diagnosis = diagnosis_service.get_one_diagnosis_filter_by(id=id)
    if not diagnosis:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    updated_diagnosis = diagnosis_service.update_diagnosis(id=id, upd_diagnosis=data)
    return updated_diagnosis

@router.delete('/{id}', status_code=200)
async def delete_diagnosis(id: int,
                           diagnosis_service: DiagnosisService = Depends(get_diagnosis_service)):
    diagnosis = diagnosis_service.get_one_diagnosis_filter_by(id=id)
    if not diagnosis:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    diagnosis_service.delete_diagnosis(id=id)
    return {'status': Status.SUCCESS.value}