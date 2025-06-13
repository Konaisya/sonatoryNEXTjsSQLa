from config.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, Date, ForeignKey, DECIMAL, Text
from datetime import date

class TreatmentCourse(Base):
    __tablename__ = 'treatment_courses'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    price: Mapped[float] = mapped_column(DECIMAL(7, 2))
    duration_days: Mapped[int] = mapped_column(Integer)  
    id_diagnosis: Mapped[int] = mapped_column(ForeignKey('diagnosis.id'))

    diagnosis: Mapped["Diagnosis"] = relationship("Diagnosis", back_populates="courses")
    procedures: Mapped[list["CourseProcedure"]] = relationship("CourseProcedure", back_populates="course")
    orders: Mapped[list["Order"]] = relationship("Order", back_populates="treatment_course")

class CourseProcedure(Base):
    __tablename__ = 'courses_procedures'

    id_course: Mapped[int] = mapped_column(ForeignKey('treatment_courses.id'), primary_key=True)
    id_procedure: Mapped[int] = mapped_column(ForeignKey('procedures.id'), primary_key=True)

    course: Mapped["TreatmentCourse"] = relationship("TreatmentCourse", back_populates="procedures")
    procedure: Mapped["Procedure"] = relationship("Procedure", back_populates="course_procedures")
    
class Procedure(Base):
    __tablename__ = 'procedures'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    contraindications: Mapped[str] = mapped_column(Text) # Противопоказания
    frequency: Mapped[str] = mapped_column(String(50)) # Частота выполнения
    duration_min: Mapped[int] = mapped_column(Integer) # Длительность в мин 

    child_procedures: Mapped[list["ProcedureRecord"]] = relationship("ProcedureRecord", back_populates="procedure")
    course_procedures: Mapped[list["CourseProcedure"]] = relationship("CourseProcedure", back_populates="procedure")
