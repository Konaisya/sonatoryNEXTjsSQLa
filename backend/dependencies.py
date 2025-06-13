from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from models import *
from crud import *
from config.database import get_session
from config.auth import oauth2_scheme
from utils.enums import Roles, AuthStatus
from service import *

# User and Auth
def get_user_repository(db: Session = Depends(get_session)):
    return UserRepository(model=User, session=db)

def get_staff_repository(db: Session = Depends(get_session)):
    return UserRepository(model=Staff, session=db)

def get_parent_repository(db: Session = Depends(get_session)):
    return UserRepository(model=Parent, session=db)

def get_auth_service(user_repository: UserRepository = Depends(get_user_repository)) -> AuthService:
    return AuthService(user_repository=user_repository)

def get_current_user(token: str=Depends(oauth2_scheme), 
                     user_repository: UserRepository = Depends(get_user_repository)) -> User:
    service = AuthService(user_repository=user_repository)
    return service.get_user_by_token(token)

def get_current_admin(token: str=Depends(oauth2_scheme), 
                      user_repository: UserRepository = Depends(get_user_repository)) -> User:
    service = AuthService(user_repository=user_repository)
    user = service.get_user_by_token(token)
    if user.role != Roles.ADMIN.value:
        raise HTTPException(status_code=403, detail={'status': AuthStatus.FORBIDDEN.value})
    return user

def get_user_service(user_repository: UserRepository = Depends(get_user_repository),
                     staff_repository: UserRepository = Depends(get_staff_repository),
                     parent_repository: UserRepository = Depends(get_parent_repository)) -> UserService:
    return UserService(user_repository=user_repository,
                       staff_repository=staff_repository,
                       parent_repository=parent_repository)


# Child
def get_child_repository(db: Session = Depends(get_session)):
    return ChildRepository(model=Child, session=db)

def get_child_diagnosis_repository(db: Session = Depends(get_session)):
    return ChildRepository(model=ChildDiagnosis, session=db)

def get_child_service(child_repository: ChildRepository = Depends(get_child_repository),
                      child_diagnosis_repository: ChildRepository = Depends(get_child_diagnosis_repository)):
    return ChildService(child_repository=child_repository,
                        child_diagnosis_repository=child_diagnosis_repository)


# ProcedureRecord
def get_procedure_record_repository(db: Session = Depends(get_session)):
    return ProcedureRecordRepository(model=ProcedureRecord, session=db)

def get_procedure_record_service(procedure_record_repository: ProcedureRecordRepository = Depends(get_procedure_record_repository)):
    return ProcedureRecordService(procedure_record_repository=procedure_record_repository)


# Course
def get_course_repository(db: Session = Depends(get_session)):
    return CourseRepository(model=TreatmentCourse, session=db)

def get_course_procedure_repository(db: Session = Depends(get_session)):
    return CourseRepository(model=CourseProcedure, session=db)

def get_procedure_repository(db: Session = Depends(get_session)):
    return CourseRepository(model=Procedure, session=db)

def get_course_service(course_repository: CourseRepository = Depends(get_course_repository),
                       course_procedure_repository: CourseRepository = Depends(get_course_procedure_repository),
                       procedure_repository: CourseRepository = Depends(get_procedure_repository)):
    return CourseService(course_repository=course_repository,
                         course_procedure_repository=course_procedure_repository,
                         procedure_repository=procedure_repository)


# Diagnosis
def get_diagnosis_repository(db: Session = Depends(get_session)):
    return DiagnosisRepository(model=Diagnosis, session=db)

def get_diagnosis_service(diagnosis_repository: DiagnosisRepository = Depends(get_diagnosis_repository)):
    return DiagnosisService(diagnosis_repository=diagnosis_repository)


# Order
def get_order_repository(db: Session = Depends(get_session)):
    return OrderRepository(model=Order, session=db)

def get_order_service(order_repository: OrderRepository = Depends(get_order_repository)):
    return OrderService(order_repository=order_repository)


# Room
def get_room_repository(db: Session = Depends(get_session)):
    return RoomRepository(model=Room, session=db)

def get_room_service(room_repository: RoomRepository = Depends(get_room_repository)):
    return RoomService(room_repository=room_repository)