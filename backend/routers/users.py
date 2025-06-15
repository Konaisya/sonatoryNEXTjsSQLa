from fastapi import APIRouter, Depends, HTTPException, Query
from dependencies import (UserService, get_user_service, 
                          get_current_user, get_current_admin, 
                          ChildService, get_child_service,
                          OrderService, get_order_service)
from schemas.users import *
from utils.enums import AuthStatus, Roles, Status
from schemas.childs import ShortChildResponse
from schemas.orders import ShortOrderResponse

router = APIRouter()

@router.get('/me')
async def get_me(user_service: UserService = Depends(get_user_service), 
                 child_service: ChildService = Depends(get_child_service),
                 order_service: OrderService = Depends(get_order_service),
                 current_user = Depends(get_current_user)):
    user = user_service.get_user_filter_by(id=current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail={'status': AuthStatus.USER_NOT_FOUND.value})
    user_resp = UserResponse(**user.__dict__)
    if user.role == Roles.USER.value:
        parent = user_service.get_one_parent_filter_by(id_user=user.id)

        childs = child_service.get_all_childs_filter_by(id_parent=parent.id)
        childs_resp = [ShortChildResponse(**child.__dict__).model_dump() for child in childs]

        orders = order_service.get_all_orders_filter_by(id_parent=parent.id)
        orders_resp = [ShortOrderResponse(**order.__dict__).model_dump() for order in orders]

        parent_dict = parent.__dict__
        parent_dict.update({
            'user': user_resp,
            'childs': childs_resp,
            'orders': orders_resp
        })
        parent_resp = ParentResponse(**parent_dict)
        return parent_resp
    elif user.role == Roles.ADMIN.value:
        staff = user_service.get_one_staff_filter_by(id_user=user.id)
        staff_dict = staff.__dict__
        staff_dict.update({
            'user': user_resp
        })
        staff_resp = StaffResponse(**staff_dict)
        return staff_resp
    else:
        raise HTTPException(status_code=400, detail={'status': AuthStatus.INVALID_ROLE.value})
    

# Parent
@router.get('/parents', status_code=200)
async def get_all_parents(id_user: int | None = Query(None),
                          name: str | None = Query(None),
                          phone: str | None = Query(None),
                          address: str | None = Query(None),
                          passport_data: str | None = Query(None),
                          user_service: UserService = Depends(get_user_service),
                          child_service: ChildService = Depends(get_child_service),
                          order_service: OrderService = Depends(get_order_service),
                          #current_admin = Depends(get_current_admin)
                          ):
    filter = {k: v for k, v in locals().items() if v is not None 
              and k not in {'user_service', 'child_service', 'order_service', 'current_admin'}}
    parents = user_service.get_all_parents_filter_by(**filter)
    if not parents:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    response = []
    for parent in parents:
        user = user_service.get_user_filter_by(id=parent.id_user)
        user_resp = UserResponse(**user.__dict__)

        childs = child_service.get_all_childs_filter_by(id_parent=parent.id)
        childs_resp = [ShortChildResponse(**child.__dict__) for child in childs]
        
        orders = order_service.get_all_orders_filter_by(id_parent=parent.id)
        orders_resp = [ShortOrderResponse(**order.__dict__) for order in orders]

        parent_dict = parent.__dict__
        parent_dict.update({
            'user': user_resp,
            'childs': childs_resp,
            'orders': orders_resp
        })
        response.append(ParentResponse(**parent_dict))
    return response

@router.get('/parents/{id}', status_code=200)
async def get_one_parent(id: int, 
                         user_service: UserService = Depends(get_user_service),
                         child_service: ChildService = Depends(get_child_service),
                         order_service: OrderService = Depends(get_order_service)):
    parent = user_service.get_one_parent_filter_by(id=id)
    if not parent:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    user = user_service.get_user_filter_by(id=parent.id_user)
    user_resp = UserResponse(**user.__dict__)

    childs = child_service.get_all_childs_filter_by(id_parent=parent.id)
    childs_resp = [ShortChildResponse(**child.__dict__) for child in childs]
    
    orders = order_service.get_all_orders_filter_by(id_parent=parent.id)
    orders_resp = [ShortOrderResponse(**order.__dict__) for order in orders]

    parent_dict = parent.__dict__
    parent_dict.update({
        'user': user_resp,
        'childs': childs_resp,
        'orders': orders_resp
    })

    parent_dict = parent.__dict__
    parent_dict.update({
        'user': user_resp
    })
    return ParentResponse(**parent_dict)

@router.put('/parents/{id}', status_code=200)
async def update_parent(id: int, 
                        data: UpdateParent,
                        user_service: UserService = Depends(get_user_service)):
    parent = user_service.get_one_parent_filter_by(id=id)
    if not parent:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    updated_parent = user_service.update_parent(id=id, upd_parent=data)
    return updated_parent

@router.delete('/parents/{id}', status_code=200)
async def delete_parent(id: int, 
                        user_service: UserService = Depends(get_user_service)):
    parent = user_service.get_one_parent_filter_by(id=id)
    if not parent:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    id_user = parent.id_user
    deleted_parent = user_service.delete_parent(id=id)
    deleted_user = user_service.delete_user(id=id_user)
    return Status.SUCCESS.value


# Staff 
@router.get('/staffs', status_code=200)
async def get_all_staffs(id_user: int | None = Query(None),
                          name: str | None = Query(None),
                          phone: str | None = Query(None),
                          address: str | None = Query(None),
                          passport_data: str | None = Query(None),
                          user_service: UserService = Depends(get_user_service),
                          #current_admin = Depends(get_current_admin)
                          ):
    filter = {k: v for k, v in locals().items() if v is not None 
              and k not in {'user_service', 'current_admin'}}
    staffs = user_service.get_all_staffs_filter_by(**filter)
    if not staffs:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    response = []
    for staff in staffs:
        user = user_service.get_user_filter_by(id=staff.id_user)
        user_resp = UserResponse(**user.__dict__)
        staff_dict = staff.__dict__
        staff_dict.update({
            'user': user_resp
        })
        response.append(StaffResponse(**staff_dict))
    return response

@router.get('/staffs/{id}', status_code=200)
async def get_one_staff(id: int, 
                         user_service: UserService = Depends(get_user_service)):
    staff = user_service.get_one_staff_filter_by(id=id)
    if not staff:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    user = user_service.get_user_filter_by(id=staff.id_user)
    user_resp = UserResponse(**user.__dict__)
    staff_dict = staff.__dict__
    staff_dict.update({
        'user': user_resp
    })
    return StaffResponse(**staff_dict)

@router.put('/staffs/{id}', status_code=200)
async def update_staff(id: int, 
                        data: UpdateStaff,
                        user_service: UserService = Depends(get_user_service)):
    staff = user_service.get_one_staff_filter_by(id=id)
    if not staff:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    updated_staff = user_service.update_staff(id=id, upd_staff=data)
    return updated_staff

@router.delete('/staffs/{id}', status_code=200)
async def delete_staff(id: int, 
                        user_service: UserService = Depends(get_user_service)):
    staff = user_service.get_one_staff_filter_by(id=id)
    if not staff:
        raise HTTPException(status_code=404, detail={'status': Status.NOT_FOUND.value})
    id_user = staff.id_user
    deleted_staff = user_service.delete_staff(id=id)
    deleted_user = user_service.delete_user(id=id_user)
    return Status.SUCCESS.value