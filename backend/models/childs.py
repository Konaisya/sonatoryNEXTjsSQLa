from config.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, DateTime, ForeignKey, DECIMAL, Text, Date
from datetime import datetime, date

class Child(Base):
    __tablename__ = 'childs'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255))
    birth_date: Mapped[date] = mapped_column(Date)
    gender: Mapped[str] = mapped_column(String(1)) # M/F
    id_parent: Mapped[int] = mapped_column(ForeignKey('parents.id'))
    height: Mapped[float] = mapped_column(DECIMAL(4, 1))
    weight: Mapped[float] = mapped_column(DECIMAL(4, 1))
    blood: Mapped[str] = mapped_column(String(5)) # A+, B-, AB+ OR 1+, 2-
    disability: Mapped[str] = mapped_column(String(255)) # Инвалидность
    vaccinations: Mapped[str] = mapped_column(Text) # Прививки
    medical_note: Mapped[str] = mapped_column(Text) # Любые другие мед записи об особенностях организма 

    parent: Mapped["Parent"] = relationship("Parent", back_populates="children")
    diagnoses: Mapped[list["ChildDiagnosis"]] = relationship("ChildDiagnosis", back_populates="child")
    procedures: Mapped[list["ProcedureRecord"]] = relationship("ProcedureRecord", back_populates="child")
    orders: Mapped[list["Order"]] = relationship("Order", back_populates="child")
    
class ProcedureRecord(Base):
    __tablename__ = 'procedure_records'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_child: Mapped[int] = mapped_column(ForeignKey('childs.id'))
    id_procedure: Mapped[int] = mapped_column(ForeignKey('procedures.id'))
    id_staff: Mapped[int] = mapped_column(ForeignKey('staff.id'))
    procedure_time: Mapped[datetime] = mapped_column(DateTime)

    child: Mapped["Child"] = relationship("Child", back_populates="procedures")
    procedure: Mapped["Procedure"] = relationship("Procedure", back_populates="child_procedures")
    staff: Mapped["Staff"] = relationship("Staff", back_populates="procedures")

class ChildDiagnosis(Base):
    __tablename__ = 'child_diagnosis'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_child: Mapped[int] = mapped_column(ForeignKey('childs.id'))
    id_diagnosis: Mapped[int] = mapped_column(ForeignKey('diagnosis.id'))
    date_diagnosis: Mapped[date] = mapped_column(Date)
    doctor: Mapped[str] = mapped_column(String(255))
    notes: Mapped[str] = mapped_column(Text)

    child: Mapped["Child"] = relationship("Child", back_populates="diagnoses")
    diagnosis: Mapped["Diagnosis"] = relationship("Diagnosis", back_populates="children")