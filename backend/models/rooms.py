from config.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, Date, ForeignKey, DECIMAL, Text
from datetime import date

class Room(Base):
    __tablename__ = 'rooms'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    number: Mapped[str] = mapped_column(String(10))
    floor: Mapped[int] = mapped_column(Integer)
    capacity: Mapped[int] = mapped_column(Integer)
    description: Mapped[str] = mapped_column(Text) # Общее описание удобств

    orders: Mapped[list["Order"]] = relationship("Order", back_populates="room")