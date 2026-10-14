from datetime import date, datetime
from typing import Optional, List, Tuple, Dict, Any, Union
from sqlalchemy import func, or_, desc, asc
from sqlalchemy.orm import Session
from app.models.student import Student
from app.schemas.student import StudentCreate, StudentUpdate, StudentPatch


class CRUDStudent:
    ALLOWED_SORT_FIELDS = {
        "id": Student.id,
        "full_name": Student.full_name,
        "email": Student.email,
        "course": Student.course,
        "date_of_birth": Student.date_of_birth,
        "enrollment_date": Student.enrollment_date,
        "created_at": Student.created_at,
    }

    def get(self, db: Session, student_id: int) -> Optional[Student]:
        """Fetch single student by primary key ID."""
        return db.query(Student).filter(Student.id == student_id).first()

    def get_by_email(self, db: Session, email: str) -> Optional[Student]:
        """Fetch student by unique email address."""
        return db.query(Student).filter(func.lower(Student.email) == email.lower().strip()).first()

    def get_multi(
        self,
        db: Session,
        *,
        search: Optional[str] = None,
        course: Optional[str] = None,
        enrollment_start: Optional[date] = None,
        enrollment_end: Optional[date] = None,
        dob_start: Optional[date] = None,
        dob_end: Optional[date] = None,
        sort_by: str = "id",
        sort_order: str = "desc",
        page: int = 1,
        page_size: int = 10,
    ) -> Tuple[List[Student], int]:
        """Query students with search, filters, sorting, and pagination."""
        query = db.query(Student)

        # Search across full_name, email, phone_number
        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Student.full_name.ilike(term),
                    Student.email.ilike(term),
                    Student.phone_number.ilike(term),
                )
            )

        # Course filtering (exact or case-insensitive)
        if course and course.strip():
            query = query.filter(Student.course.ilike(f"%{course.strip()}%"))

        # Enrollment date range filtering
        if enrollment_start:
            query = query.filter(Student.enrollment_date >= enrollment_start)
        if enrollment_end:
            query = query.filter(Student.enrollment_date <= enrollment_end)

        # Date of birth range filtering
        if dob_start:
            query = query.filter(Student.date_of_birth >= dob_start)
        if dob_end:
            query = query.filter(Student.date_of_birth <= dob_end)

        # Total count before pagination
        total = query.count()

        # Sorting
        sort_col = self.ALLOWED_SORT_FIELDS.get(sort_by, Student.id)
        if sort_order.lower() == "asc":
            query = query.order_by(asc(sort_col))
        else:
            query = query.order_by(desc(sort_col))

        # Secondary deterministic sorting
        if sort_by != "id":
            query = query.order_by(desc(Student.id))

        # Pagination
        offset = (page - 1) * page_size
        items = query.offset(offset).limit(page_size).all()

        return items, total

    def create(self, db: Session, *, obj_in: StudentCreate) -> Student:
        """Create a new student record."""
        db_obj = Student(
            full_name=obj_in.full_name,
            email=obj_in.email.lower().strip(),
            date_of_birth=obj_in.date_of_birth,
            phone_number=obj_in.phone_number.strip(),
            course=obj_in.course.strip(),
            address=obj_in.address.strip() if obj_in.address else None,
            enrollment_date=obj_in.enrollment_date,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: Student,
        obj_in: Union[StudentUpdate, StudentPatch, Dict[str, Any]],
    ) -> Student:
        """Update existing student (supports full or partial updates)."""
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            if hasattr(db_obj, field) and value is not None:
                if field == "email" and isinstance(value, str):
                    value = value.lower().strip()
                elif isinstance(value, str):
                    value = value.strip()
                setattr(db_obj, field, value)

        db_obj.updated_at = datetime.utcnow()
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, student_id: int) -> Optional[Student]:
        """Delete student record by ID."""
        obj = db.get(Student, student_id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj


    def get_stats(self, db: Session) -> Dict[str, Any]:
        """Compute aggregate statistics for dashboard analytics."""
        total_students = db.query(Student).count()

        # Students grouped by course
        course_counts = (
            db.query(Student.course, func.count(Student.id).label("count"))
            .group_by(Student.course)
            .order_by(desc("count"))
            .all()
        )
        by_course = [{"course": c[0], "count": c[1]} for c in course_counts]

        # Enrollment trends (by Year-Month formatted)
        students = db.query(Student.enrollment_date, Student.date_of_birth).all()

        trend_dict: Dict[str, int] = {}
        age_dist = {"< 18": 0, "18 - 21": 0, "22 - 25": 0, "26+": 0}
        today = date.today()

        for s in students:
            if s.enrollment_date:
                period = s.enrollment_date.strftime("%Y-%m")
                trend_dict[period] = trend_dict.get(period, 0) + 1

            if s.date_of_birth:
                dob = s.date_of_birth
                age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
                if age < 18:
                    age_dist["< 18"] += 1
                elif age <= 21:
                    age_dist["18 - 21"] += 1
                elif age <= 25:
                    age_dist["22 - 25"] += 1
                else:
                    age_dist["26+"] += 1

        # Sort trends chronologically
        sorted_trends = sorted(trend_dict.items(), key=lambda x: x[0])
        enrollment_trends = [{"period": k, "count": v} for k, v in sorted_trends[-12:]]

        # Recent 5 students
        recent_students = (
            db.query(Student)
            .order_by(desc(Student.created_at))
            .limit(5)
            .all()
        )

        return {
            "total_students": total_students,
            "by_course": by_course,
            "enrollment_trends": enrollment_trends,
            "age_distribution": age_dist,
            "recent_students": recent_students,
        }


student = CRUDStudent()
