from fastapi import APIRouter
from routers.users import router as user_router
from routers.auth import router as auth_router
from routers.diagnosis import router as diagnosis_router
from routers.procedures import router as procedures_router
from routers.rooms import router as rooms_router
from routers.courses import router as course_router
from routers.childs import router as child_router
from routers.procedure_records import router as procedure_records_router
from routers.orders import router as order_router

routers = APIRouter(prefix='/api')
routers.include_router(auth_router, prefix='/auth', tags=['auth'])
routers.include_router(user_router, prefix='/users', tags=['users'])
routers.include_router(diagnosis_router, prefix='/diagnosis', tags=['diagnosis'])
routers.include_router(procedures_router, prefix='/procedures', tags=['procedures'])
routers.include_router(rooms_router, prefix='/rooms', tags=['rooms'])
routers.include_router(course_router, prefix='/courses', tags=['courses'])
routers.include_router(child_router, prefix='/childs', tags=['childs'])
routers.include_router(procedure_records_router, prefix='/procedure_records', tags=['procedure_records'])
routers.include_router(order_router, prefix='/orders', tags=['orders'])