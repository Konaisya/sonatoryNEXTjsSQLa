from utils.enums import Roles, AuthStatus
from fastapi import HTTPException
from passlib.hash import pbkdf2_sha256
from schemas.users import *
from crud.users import UserRepository

class UserService:
    def __init__(self, user_repository: UserRepository,
                 parent_repository: UserRepository,
                 staff_repository: UserRepository):
        self.user_repository=user_repository
        self.parent_repository=parent_repository
        self.staff_repository=staff_repository

    def get_all_users_filter_by(self, **filter):
        users = self.user_repository.get_all_filter_by(**filter)
        return users

    def get_user_filter_by(self, **filter):
        user = self.user_repository.get_one_filter_by(**filter)
        return user

    def update(self, user_id: int, data: UserUpdate):
        entity = data.model_dump()
        user = self.user_repository.get_one_filter_by(id=user_id)
        if data.password and not pbkdf2_sha256.verify(data.password, user.password):
            raise HTTPException(status_code=403, detail={'status': AuthStatus.INVALID_PASSWORD.value})
        if data.password:
            entity['password'] = pbkdf2_sha256.hash(data.password)
        self.user_repository.update(user_id, entity)
        updated_user = self.user_repository.get_one_filter_by(id=user_id)
        return updated_user

    def delete_user(self, id: int):
        return self.user_repository.delete(id=id)
    

    def get_all_parents_filter_by(self, **filter):
        return self.parent_repository.get_all_filter_by(**filter)

    def get_one_parent_filter_by(self, **filter):
        return self.parent_repository.get_one_filter_by(**filter)
    
    def create_parent(self, new_parent: CreateModelParent):
        return self.parent_repository.add(new_parent.model_dump())
    
    def update_parent(self, id: int, upd_parent: UpdateParent):
        entity = upd_parent.model_dump()
        entity['id'] = id
        entity = {k: v for k, v in entity.items() if v is not None}
        return self.parent_repository.update(entity)

    def delete_parent(self, id: int):
        return self.parent_repository.delete(id=id)
    

    def get_all_staffs_filter_by(self, **filter):
        return self.staff_repository.get_all_filter_by(**filter)

    def get_one_staff_filter_by(self, **filter):
        return self.staff_repository.get_one_filter_by(**filter)
    
    def create_staff(self, new_staff: CreateModelStaff):
        return self.staff_repository.add(new_staff.model_dump())
    
    def update_staff(self, id: int, upd_staff: UpdateStaff):
        entity = upd_staff.model_dump()
        entity['id'] = id
        entity = {k: v for k, v in entity.items() if v is not None}
        return self.staff_repository.update(entity)

    def delete_staff(self, id: int):
        return self.staff_repository.delete(id=id)