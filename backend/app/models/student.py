from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Text, Date, DateTime
from app.core.database import Base


class Student(Base):
    """SQLAlchemy model representing a registered student."""

    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String(100), nullable=False, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    date_of_birth = Column(Date, nullable=False)
    phone_number = Column(String(30), nullable=False)
    course = Column(String(100), nullable=False, index=True)
    address = Column(Text, nullable=True)
    enrollment_date = Column(Date, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    @property
    def age(self) -> int:
        """Dynamically compute student age from date of birth."""
        today = date.today()
        born = self.date_of_birth
        return today.year - born.year - ((today.month, today.day) < (born.month, born.day))

    def __repr__(self) -> str:
        return f"<Student(id={self.id}, name='{self.full_name}', email='{self.email}', course='{self.course}')>"
