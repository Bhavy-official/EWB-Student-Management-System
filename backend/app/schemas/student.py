from datetime import date, datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, field_validator


class StudentBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100, description="Full name of student")
    email: EmailStr = Field(..., max_length=255, description="Unique email address")
    date_of_birth: date = Field(..., description="Date of birth")
    phone_number: str = Field(..., min_length=5, max_length=30, description="Contact phone number")
    course: str = Field(..., min_length=2, max_length=100, description="Course or academic program")
    address: Optional[str] = Field(None, max_length=500, description="Residential or postal address")
    enrollment_date: date = Field(default_factory=date.today, description="Date of enrollment")

    @field_validator("full_name")
    def validate_full_name(cls, v: str) -> str:
        clean_name = " ".join(v.strip().split())
        if len(clean_name) < 2:
            raise ValueError("Student full name must be at least 2 characters.")
        return clean_name

    @field_validator("course")
    def validate_course(cls, v: str) -> str:
        clean_course = " ".join(v.strip().split())
        if len(clean_course) < 2:
            raise ValueError("Course name must be at least 2 characters.")
        return clean_course

    @field_validator("date_of_birth")
    def validate_dob(cls, v: date) -> date:
        today = date.today()
        if v >= today:
            raise ValueError("Date of birth must be in the past.")
        age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
        if age < 3 or age > 120:
            raise ValueError("Age must be between 3 and 120 years.")
        return v

    @field_validator("enrollment_date")
    def validate_enrollment_date(cls, v: date) -> date:
        # Prevent absurd historical or future dates (within reason: 1980 to 5 years in future)
        today = date.today()
        if v.year < 1980 or v.year > today.year + 5:
            raise ValueError(f"Enrollment date year must be between 1980 and {today.year + 5}.")
        return v


class StudentCreate(StudentBase):
    pass


class StudentUpdate(StudentBase):
    """Schema for complete replacement (PUT)."""
    pass


class StudentPatch(BaseModel):
    """Schema for partial update (PATCH)."""
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = Field(None, max_length=255)
    date_of_birth: Optional[date] = None
    phone_number: Optional[str] = Field(None, min_length=5, max_length=30)
    course: Optional[str] = Field(None, min_length=2, max_length=100)
    address: Optional[str] = Field(None, max_length=500)
    enrollment_date: Optional[date] = None

    @field_validator("full_name")
    def validate_full_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            clean_name = " ".join(v.strip().split())
            if len(clean_name) < 2:
                raise ValueError("Student full name must be at least 2 characters.")
            return clean_name
        return v

    @field_validator("course")
    def validate_course(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            clean_course = " ".join(v.strip().split())
            if len(clean_course) < 2:
                raise ValueError("Course name must be at least 2 characters.")
            return clean_course
        return v

    @field_validator("date_of_birth")
    def validate_dob(cls, v: Optional[date]) -> Optional[date]:
        if v is not None:
            today = date.today()
            if v >= today:
                raise ValueError("Date of birth must be in the past.")
            age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
            if age < 3 or age > 120:
                raise ValueError("Age must be between 3 and 120 years.")
        return v


class StudentResponse(StudentBase):
    id: int
    age: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}



class StudentPagination(BaseModel):
    items: List[StudentResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class CourseStat(BaseModel):
    course: str
    count: int


class TrendStat(BaseModel):
    period: str
    count: int


class StudentStats(BaseModel):
    total_students: int
    by_course: List[CourseStat]
    enrollment_trends: List[TrendStat]
    age_distribution: Dict[str, int]
    recent_students: List[StudentResponse]
