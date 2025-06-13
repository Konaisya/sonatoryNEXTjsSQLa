from config.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, Date, ForeignKey, DECIMAL, Text
from datetime import date

class Diagnosis(Base):
    __tablename__ = "diagnosis"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100))  # Название диагноза
    icd_code: Mapped[str] = mapped_column(String(10)) # Код по МКБ
    description: Mapped[str] = mapped_column(Text)
    symptoms: Mapped[str] = mapped_column(Text)
    contraindications: Mapped[str] = mapped_column(Text)

    courses: Mapped[list["TreatmentCourse"]] = relationship("TreatmentCourse", back_populates="diagnosis")
    children: Mapped[list["ChildDiagnosis"]] = relationship("ChildDiagnosis", back_populates="diagnosis")

