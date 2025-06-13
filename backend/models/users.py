from config.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, DATE, ForeignKey
from datetime import date

class User(Base):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    role: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255))
    password: Mapped[str] = mapped_column(String(255))

    parent: Mapped["Parent"] = relationship("Parent", back_populates="user", uselist=False)
    staff: Mapped["Staff"] = relationship("Staff", back_populates="user", uselist=False)

class Staff(Base):
    __tablename__ = 'staff'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_user: Mapped[int] = mapped_column(ForeignKey('users.id'))
    name: Mapped[str] = mapped_column(String(255))
    position: Mapped[str] = mapped_column(String(255)) # Должность
    qualification: Mapped[str] = mapped_column(String(255)) # Образование
    hire_date: Mapped[date] = mapped_column(DATE) # Дата приема на работу
    department: Mapped[str] = mapped_column(String(100)) # Отдел
    schedule: Mapped[str] = mapped_column(String(255)) # График

    user: Mapped["User"] = relationship("User", back_populates="staff")
    procedures: Mapped[list["ProcedureRecord"]] = relationship("ProcedureRecord", back_populates="staff")

class Parent(Base):
    __tablename__ = 'parents'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_user: Mapped[int] = mapped_column(ForeignKey('users.id'))
    name: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str] = mapped_column(String(20))
    address: Mapped[str] = mapped_column(String(255))
    passport_data: Mapped[str] = mapped_column(String(100))

    user: Mapped["User"] = relationship("User", back_populates="parent")
    children: Mapped[list["Child"]] = relationship("Child", back_populates="parent")
    orders: Mapped[list["Order"]] = relationship("Order", back_populates="parent")
