from fastapi import HTTPException
from schemas.rooms import *
from crud.rooms import *

class RoomService:
    def __init__(self, room_repository: RoomRepository):
        self.room_repository=room_repository

    def get_all_rooms_filter_by(self, **kwargs):
        return self.room_repository.get_all_filter_by(**kwargs)
    
    def get_one_room_filter_by(self, **kwargs):
        return self.room_repository.get_one_filter_by(**kwargs)
    
    def create_room(self, new_room: CreateRoom):
        return self.room_repository.add(new_room.model_dump())
    
    def update_room(self, id: int, upd_room: UpdateRoom):
        entity = upd_room.model_dump()
        entity['id'] = id
        entity = {k: v for k, v in entity.items() if v is not None}
        return self.room_repository.update(entity)
    
    def delete_room(self, id: int):
        return self.room_repository.delete(id=id)