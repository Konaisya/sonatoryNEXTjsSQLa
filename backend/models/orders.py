from config.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, Date, ForeignKey, DECIMAL, Text
from datetime import date

class Order(Base):
    __tablename__ = 'orders'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_child: Mapped[int] = mapped_column(ForeignKey('childs.id'))
    id_parent: Mapped[int] = mapped_column(ForeignKey('parents.id'))
    id_treatment_course: Mapped[int] = mapped_column(ForeignKey('treatment_courses.id'))
    id_room: Mapped[int] = mapped_column(ForeignKey('rooms.id'))
    status: Mapped[str] = mapped_column(String(255))
    check_in_date: Mapped[date] = mapped_column(Date)
    check_out_date: Mapped[date] = mapped_column(Date)
    price: Mapped[float] = mapped_column(DECIMAL(7, 2))

    child: Mapped["Child"] = relationship("Child", back_populates="orders")
    parent: Mapped["Parent"] = relationship("Parent", back_populates="orders")
    treatment_course: Mapped["TreatmentCourse"] = relationship("TreatmentCourse", back_populates="orders")
    room: Mapped["Room"] = relationship("Room", back_populates="orders")