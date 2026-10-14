import json
import logging
from datetime import datetime, date
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.config import settings
from app.models.student import Student
from app.crud.student import student as crud_student

logger = logging.getLogger(__name__)


class AIService:
    """Service to process natural language questions grounded in deterministic database queries."""

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = settings.GEMINI_MODEL

    def _execute_intent(self, intent_data: Dict[str, Any], db: Session) -> Dict[str, Any]:
        """Execute deterministic database query based on structured intent."""
        intent = intent_data.get("intent", "general_stats")
        params = intent_data.get("parameters", {})

        if intent == "total_count":
            count = db.query(Student).count()
            return {
                "type": "count",
                "title": "Total Registered Students",
                "count": count,
                "summary": f"There are currently {count} students registered in the system.",
            }

        elif intent == "course_stats":
            results = (
                db.query(Student.course, func.count(Student.id).label("count"))
                .group_by(Student.course)
                .order_by(func.count(Student.id).desc())
                .all()
            )
            data = [{"course": r[0], "count": r[1]} for r in results]
            top_course = data[0]["course"] if data else "None"
            top_count = data[0]["count"] if data else 0
            return {
                "type": "course_distribution",
                "title": "Students by Course",
                "data": data,
                "top_course": top_course,
                "summary": f"The course with the highest enrollment is {top_course} with {top_count} students.",
            }

        elif intent == "enrolled_year":
            target_year = params.get("year", datetime.now().year)
            start_date = date(target_year, 1, 1)
            end_date = date(target_year, 12, 31)
            students = (
                db.query(Student)
                .filter(Student.enrollment_date >= start_date, Student.enrollment_date <= end_date)
                .all()
            )
            return {
                "type": "student_list",
                "title": f"Students Enrolled in {target_year}",
                "count": len(students),
                "summary": f"A total of {len(students)} students enrolled in {target_year}.",
                "students": [
                    {
                        "id": s.id,
                        "full_name": s.full_name,
                        "course": s.course,
                        "enrollment_date": s.enrollment_date.isoformat(),
                    }
                    for s in students[:15]
                ],
            }

        elif intent == "students_by_course":
            course_name = params.get("course", "")
            students = (
                db.query(Student)
                .filter(Student.course.ilike(f"%{course_name}%"))
                .order_by(Student.full_name.asc())
                .all()
            )
            return {
                "type": "student_list",
                "title": f"Students in {course_name or 'All Courses'}",
                "count": len(students),
                "summary": f"Found {len(students)} students matching course '{course_name}'.",
                "students": [
                    {
                        "id": s.id,
                        "full_name": s.full_name,
                        "course": s.course,
                        "enrollment_date": s.enrollment_date.isoformat(),
                    }
                    for s in students[:15]
                ],
            }

        elif intent == "born_after":
            cutoff_date_str = params.get("date", "2000-01-01")
            try:
                cutoff = datetime.strptime(cutoff_date_str, "%Y-%m-%d").date()
            except ValueError:
                cutoff = date(2000, 1, 1)

            students = (
                db.query(Student)
                .filter(Student.date_of_birth > cutoff)
                .order_by(Student.date_of_birth.asc())
                .all()
            )
            return {
                "type": "student_list",
                "title": f"Students Born After {cutoff}",
                "count": len(students),
                "summary": f"{len(students)} students were born after {cutoff}.",
                "students": [
                    {
                        "id": s.id,
                        "full_name": s.full_name,
                        "date_of_birth": s.date_of_birth.isoformat(),
                        "age": s.age,
                        "course": s.course,
                    }
                    for s in students[:15]
                ],
            }

        # Default: general statistics
        stats = crud_student.get_stats(db)
        return {
            "type": "general_overview",
            "title": "Student Database Overview",
            "total_students": stats["total_students"],
            "courses_count": len(stats["by_course"]),
            "summary": f"The database tracks {stats['total_students']} students across {len(stats['by_course'])} courses.",
            "data": stats["by_course"],
        }

    def _fallback_intent_classifier(self, question: str) -> Dict[str, Any]:
        """Local rule-based intent parsing when external LLM is not active."""
        q = question.lower()
        if any(w in q for w in ["how many students", "total students", "count of students", "number of students", "currently registered"]):
            return {"intent": "total_count", "parameters": {}}
        elif any(w in q for w in ["most students", "popular course", "course with highest", "which course", "by course", "course distribution"]):
            return {"intent": "course_stats", "parameters": {}}
        elif "enrolled this year" in q or "enrolled in 202" in q:
            current_year = datetime.now().year
            for year in range(2020, 2030):
                if str(year) in q:
                    return {"intent": "enrolled_year", "parameters": {"year": year}}
            return {"intent": "enrolled_year", "parameters": {"year": current_year}}
        elif "born after" in q or "born before" in q:
            import re
            match = re.search(r"\b(\d{4}-\d{2}-\d{2}|\d{4})\b", q)
            date_val = match.group(0) if match else "2000-01-01"
            if len(date_val) == 4:
                date_val = f"{date_val}-01-01"
            return {"intent": "born_after", "parameters": {"date": date_val}}
        elif "students in" in q or "taking" in q or "enrolled in" in q:
            # extract potential course name
            for keyword in ["students in ", "taking ", "enrolled in "]:
                if keyword in q:
                    course = q.split(keyword)[1].strip("? .")
                    return {"intent": "students_by_course", "parameters": {"course": course}}

        return {"intent": "general_stats", "parameters": {}}

    def process_query(self, question: str, db: Session) -> Dict[str, Any]:
        """Process user's natural language query with data grounding."""
        clean_question = question.strip()
        if not clean_question:
            return {
                "answer": "Please ask a question regarding student registrations, courses, or enrollment statistics.",
                "grounded_data": None,
                "source": "validation",
                "ai_enabled": bool(self.api_key),
            }

        # 1. Classify intent (using Gemini if key available, else local rule-based)
        intent_info = None
        if self.api_key:
            try:
                from google import genai
                from google.genai import types

                client = genai.Client(api_key=self.api_key)
                prompt = f"""
                You are a query classifier for a Student Management System.
                Classify the user query into a structured JSON with:
                - intent: one of ["total_count", "course_stats", "enrolled_year", "students_by_course", "born_after", "general_stats"]
                - parameters: dict with any extracted parameters (e.g. "year", "course", "date")
                
                User query: "{clean_question}"
                Respond ONLY with a JSON object.
                """
                response = client.models.generate_content(
                    model=self.model,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.0,
                        response_mime_type="application/json",
                    ),
                )
                intent_info = json.loads(response.text)
            except Exception as e:
                logger.warning(f"Gemini API intent classification fallback: {e}")
                intent_info = self._fallback_intent_classifier(clean_question)
        else:
            intent_info = self._fallback_intent_classifier(clean_question)

        # 2. Execute deterministic database query
        grounded_data = self._execute_intent(intent_info, db)

        # 3. Generate natural response
        if self.api_key:
            try:
                from google import genai

                client = genai.Client(api_key=self.api_key)
                explanation_prompt = f"""
                You are the AI Assistant for the EWB Student Management System.
                Answer the user's question clearly, concisely, and accurately based strictly on this verified database result.
                Never make up numbers or speculate beyond this data.
                
                User Question: "{clean_question}"
                Verified Database Data: {json.dumps(grounded_data, default=str)}
                """
                resp = client.models.generate_content(
                    model=self.model,
                    contents=explanation_prompt,
                )
                answer = resp.text.strip()
            except Exception as e:
                logger.warning(f"Gemini text generation failed: {e}")
                answer = grounded_data.get("summary", "Query answered using grounded database metrics.")
        else:
            answer = (
                f"{grounded_data.get('summary', 'Query answered using grounded database metrics.')} "
                f"(Note: Gemini API key is not configured; answering via deterministic local pipeline)."
            )

        return {
            "answer": answer,
            "intent": intent_info.get("intent"),
            "grounded_data": grounded_data,
            "ai_enabled": bool(self.api_key),
            "model": self.model if self.api_key else "local-deterministic-engine",
        }


ai_service = AIService()
