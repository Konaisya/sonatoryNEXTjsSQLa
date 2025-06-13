from fastapi import APIRouter, Depends, HTTPException, Query
from utils.enums import Status, OrderStatus
from dependencies import *
from schemas.childs import ShortChildResponse
from schemas.users import ShortParentResponse
from schemas.courses import ShortCourseResponse
from schemas.rooms import RoomResponse
from schemas.orders import *
from utils.enums import *

router = APIRouter()

@router.post('/', status_code=201)
async def create_order(data: CreateOrder,
                       order_service: OrderService = Depends(get_order_service),
                       user_service: UserService = Depends(get_user_service),
                       course_service: CourseService = Depends(get_course_service),
                       current_user: User = Depends(get_user_service),
                       ):
    data_dict = data.model_dump()

    parent = user_service.get_one_parent_filter_by(id_user=current_user.id)
    data_dict['id_parent'] = parent.id

    data_dict['status'] = OrderStatus.PENDING.value

    course = course_service.get_one_course_filter_by(id=data_dict['id_treatment_course'])

    data_dict['price'] = course.price

    new_order = order_service.create_order(data_dict)
    if not new_order:
        raise HTTPException(status_code=400, detail={'status': Status.FAILED.value})
    return new_order
    
@router.get('/', status_code=200)
async def get_all_orders(id_child: int = Query(None),
                         id_parent: int = Query(None),
                         id_treatment_course: int = Query(None),
                         id_room: int = Query(None),
                         status: OrderStatus = Query(None),
                         check_in_date: str = Query(None),
                         check_out_date: str = Query(None),
                         price: float = Query(None),
                         order_service: OrderService = Depends(get_order_service),
                         user_service: UserService = Depends(get_user_service),
                         course_service: CourseService = Depends(get_course_service),
                         child_service: ChildService = Depends(get_child_service),
                         room_service: RoomService = Depends(get_room_service),
                         current_user: User = Depends(get_user_service),
                        ):
    if current_user.role == Roles.ADMIN.value:
        filter = {k: v for k, v in locals().items() if v is not None 
                  and k not in ['order_service', 'current_user', 'user_service', 'course_service', 'room_service', 'child_service']}
    else:
        filter = {k: v for k, v in locals().items() if v is not None 
                  and k not in ['order_service', 'current_user', 'user_service', 'course_service', 'room_service', 'child_service']}
        parent = user_service.get_one_parent_filter_by(id_user=current_user.id)
        filter['id_parent'] = parent.id

    orders = order_service.get_all_orders_filter_by(**filter)
    if not orders:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    response = []
    for order in orders:
        child = child_service.get_one_child_filter_by(id=order.id_child)
        child_resp = ShortChildResponse(**child.__dict__)

        parent = user_service.get_one_parent_filter_by(id=order.id_parent)
        parent_resp = ShortParentResponse(**parent.__dict__)

        course = course_service.get_one_course_filter_by(id=order.id_treatment_course)
        course_resp = ShortCourseResponse(**course.__dict__)

        room = room_service.get_one_room_filter_by(id=order.id_room)
        room_resp = RoomResponse(**room.__dict__)

        order_dict = order.__dict__
        order_dict.update({
            'child': child_resp,
            'parent': parent_resp,
            'treatment_course': course_resp,
            'room': room_resp
        })

        response.append(OrderResponse(**order_dict))
    return response
        
@router.get('/{id}', status_code=200)
async def get_one_order(id: int,
                        order_service: OrderService = Depends(get_order_service),
                        user_service: UserService = Depends(get_user_service),
                        course_service: CourseService = Depends(get_course_service),
                        child_service: ChildService = Depends(get_child_service),
                        room_service: RoomService = Depends(get_room_service),
                        current_user: User = Depends(get_user_service),
                        ):
    order = order_service.get_one_order_filter_by(id=id)
    if not orders:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    child = child_service.get_one_child_filter_by(id=order.id_child)
    child_resp = ShortChildResponse(**child.__dict__)

    parent = user_service.get_one_parent_filter_by(id=order.id_parent)
    parent_resp = ShortParentResponse(**parent.__dict__)

    course = course_service.get_one_course_filter_by(id=order.id_treatment_course)
    course_resp = ShortCourseResponse(**course.__dict__)

    room = room_service.get_one_room_filter_by(id=order.id_room)
    room_resp = RoomResponse(**room.__dict__)

    order_dict = order.__dict__
    order_dict.update({
        'child': child_resp,
        'parent': parent_resp,
        'treatment_course': course_resp,
        'room': room_resp
    })

    return OrderResponse(**order_dict)
    
@router.put('/{id}', status_code=200)
async def update_order(id: int,
                       data: UpdateOrder,
                       order_service: OrderService = Depends(get_order_service),
                       course_service: CourseService = Depends(get_course_service),
                       current_user: User = Depends(get_user_service),
                       ):
    order = order_service.get_one_order_filter_by(id=id)
    if not order:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    
    data_dict = data.model_dump()
    if 'id_treatment_course' in data_dict:
        course = course_service.get_one_course_filter_by(id=data_dict['id_treatment_course'])
        data_dict['price'] = course.price

    updated_order = order_service.update_order(id, data_dict)
    return updated_order
    
@router.delete('/{id}', status_code=200)
async def delete_order(id: int,
                       order_service: OrderService = Depends(get_order_service),
                       current_user: User = Depends(get_user_service),
                       ):
    order = order_service.get_one_order_filter_by(id=id)
    if not order:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    deleted_order = order_service.delete_order(id=id)
    return {'status': Status.SUCCESS.value}