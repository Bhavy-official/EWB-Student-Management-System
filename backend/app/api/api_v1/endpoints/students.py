import math
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud.student import student as crud_student
from app.schemas.student import (
    StudentCreate,
    StudentUpdate,
    StudentPatch,
    StudentResponse,
    StudentPagination,
    StudentStats,
)

router = APIRouter()


@router.get("/students/stats", response_model=StudentStats, tags=["Students Analytics"])
def get_student_stats(db: Session = Depends(get_db)):
    """Retrieve aggregate statistics: counts, course distribution, trends, age groups."""
    return crud_student.get_stats(db)


@router.post(
    "/students",
    response_model=StudentResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Students"],
)
def create_student(
    student_in: StudentCreate,
    db: Session = Depends(get_db),
):
    """Register a new student."""
    existing = crud_student.get_by_email(db, email=student_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A student with email '{student_in.email}' already exists.",
        )
    return crud_student.create(db, obj_in=student_in)


@router.get(
    "/students",
    response_model=StudentPagination,
    status_code=status.HTTP_200_OK,
    tags=["Students"],
)
def list_students(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number starting at 1"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page (max 100)"),
    search: Optional[str] = Query(None, description="Search term for name, email, or phone"),
    course: Optional[str] = Query(None, description="Filter by course name"),
    enrollment_start: Optional[date] = Query(None, description="Enrollment date start (YYYY-MM-DD)"),
    enrollment_end: Optional[date] = Query(None, description="Enrollment date end (YYYY-MM-DD)"),
    dob_start: Optional[date] = Query(None, description="Date of birth start (YYYY-MM-DD)"),
    dob_end: Optional[date] = Query(None, description="Date of birth end (YYYY-MM-DD)"),
    sort_by: str = Query("id", pattern="^(id|full_name|email|course|date_of_birth|enrollment_date|created_at)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
):
    """Retrieve students with filtering, search, sorting, and pagination."""
    items, total = crud_student.get_multi(
        db,
        search=search,
        course=course,
        enrollment_start=enrollment_start,
        enrollment_end=enrollment_end,
        dob_start=dob_start,
        dob_end=dob_end,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size,
    )
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.get(
    "/students/{student_id}",
    response_model=StudentResponse,
    status_code=status.HTTP_200_OK,
    tags=["Students"],
)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
):
    """Retrieve a student record by ID."""
    student_obj = crud_student.get(db, student_id=student_id)
    if not student_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID {student_id} not found.",
        )
    return student_obj


@router.put(
    "/students/{student_id}",
    response_model=StudentResponse,
    status_code=status.HTTP_200_OK,
    tags=["Students"],
)
def update_student(
    student_id: int,
    student_in: StudentUpdate,
    db: Session = Depends(get_db),
):
    """Completely update / replace an existing student record."""
    student_obj = crud_student.get(db, student_id=student_id)
    if not student_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID {student_id} not found.",
        )

    # Check email conflict with another student
    existing_email = crud_student.get_by_email(db, email=student_in.email)
    if existing_email and existing_email.id != student_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A student with email '{student_in.email}' already exists.",
        )

    return crud_student.update(db, db_obj=student_obj, obj_in=student_in)


@router.patch(
    "/students/{student_id}",
    response_model=StudentResponse,
    status_code=status.HTTP_200_OK,
    tags=["Students"],
)
def patch_student(
    student_id: int,
    student_in: StudentPatch,
    db: Session = Depends(get_db),
):
    """Partially update an existing student record."""
    student_obj = crud_student.get(db, student_id=student_id)
    if not student_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID {student_id} not found.",
        )

    if student_in.email is not None:
        existing_email = crud_student.get_by_email(db, email=student_in.email)
        if existing_email and existing_email.id != student_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A student with email '{student_in.email}' already exists.",
            )

    return crud_student.update(db, db_obj=student_obj, obj_in=student_in)


@router.delete(
    "/students/{student_id}",
    status_code=status.HTTP_200_OK,
    tags=["Students"],
)
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
):
    """Delete a student record by ID."""
    student_obj = crud_student.get(db, student_id=student_id)
    if not student_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID {student_id} not found.",
        )
    crud_student.remove(db, student_id=student_id)
    return {"message": "Student successfully deleted", "id": student_id}
