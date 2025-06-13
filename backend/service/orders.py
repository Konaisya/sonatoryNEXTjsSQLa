from fastapi import HTTPException
from schemas.orders import *
from crud.orders import *

class OrderService:
    def __init__(self, order_repository: OrderRepository):
        self.order_repository=order_repository

    def get_all_orders_filter_by(self, **filter):
        return self.order_repository.get_all_filter_by(**filter)
    
    def get_one_order_filter_by(self, **filter):
        return self.order_repository.get_one_filter_by(**filter)
    
    def create_order(self, new_order: dict):
        return self.order_repository.add(new_order)
    
    def update_order(self, id: int, entity: dict):
        entity['id'] = id
        entity = {k: v for k, v in entity.items() if v is not None}
        return self.order_repository.update(entity)
    
    def delete_order(self, id: int):
        return self.order_repository.delete(id)
        

        

