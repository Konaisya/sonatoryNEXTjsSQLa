from fastapi import APIRouter, Depends, HTTPException, Query
from dependencies import RoomService, get_room_service
from schemas.rooms import *
from utils.enums import Status

router = APIRouter()

@router.post('/', status_code=201)
async def create_room(data: CreateRoom,
                       room_service: RoomService = Depends(get_room_service)):
    new_room = room_service.create_room(data)
    if not new_room:
        raise HTTPException(status_code=400, detail={'status': Status.FAILED.value})
    return new_room

@router.get('/', status_code=200)
async def get_all_rooms(number: str | None = Query(None),
                        floor: int | None = Query(None),
                        capacity: int | None = Query(None),
                        room_service: RoomService = Depends(get_room_service)):
    filter = {k: v for k, v in locals().items() if v is not None and k != 'room_service'}
    rooms = room_service.get_all_rooms_filter_by(**filter)
    if not rooms:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    return [RoomResponse(**room.__dict__) for room in rooms]

@router.get('/{id}', status_code=200)
async def get_one_room(id: int,
                            room_service: RoomService = Depends(get_room_service)):
    room = room_service.get_one_room_filter_by(id=id)
    if not room:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    return RoomResponse(**room.__dict__)

@router.put('/{id}', status_code=200)
async def update_room(id: int,
                           data: UpdateRoom,
                           room_service: RoomService = Depends(get_room_service)):
    room = room_service.get_one_room_filter_by(id=id)
    if not room:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    updated_room = room_service.update_room(id=id, upd_room=data)
    return updated_room

@router.delete('/{id}', status_code=200)
async def delete_room(id: int,
                           room_service: RoomService = Depends(get_room_service)):
    room = room_service.get_one_room_filter_by(id=id)
    if not room:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    room_service.delete_room(id=id)
    return {'status': Status.SUCCESS.value}