"""Seed the database with realistic sample student records."""
import sys
import os
from datetime import date, timedelta
import random

# Ensure backend root is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, Base, engine
from app.models.student import Student

SAMPLE_STUDENTS = [
    {
        "full_name": "Aarav Sharma",
        "email": "aarav.sharma@example.com",
        "date_of_birth": date(2003, 4, 15),
        "phone_number": "+91 98765 43210",
        "course": "Computer Science",
        "address": "42 Tech Park Road, Bengaluru, Karnataka",
        "enrollment_date": date(2025, 8, 1),
    },
    {
        "full_name": "Priya Patel",
        "email": "priya.patel@example.com",
        "date_of_birth": date(2002, 11, 23),
        "phone_number": "+91 98765 43211",
        "course": "Data Science",
        "address": "15 Heritage Lane, Ahmedabad, Gujarat",
        "enrollment_date": date(2025, 7, 15),
    },
    {
        "full_name": "Rohan Gupta",
        "email": "rohan.gupta@example.com",
        "date_of_birth": date(2004, 1, 9),
        "phone_number": "+91 98765 43212",
        "course": "Artificial Intelligence",
        "address": "88 Cyber City, Gurugram, Haryana",
        "enrollment_date": date(2025, 8, 10),
    },
    {
        "full_name": "Ananya Iyer",
        "email": "ananya.iyer@example.com",
        "date_of_birth": date(2001, 8, 30),
        "phone_number": "+91 98765 43213",
        "course": "Cloud Computing",
        "address": "102 Marina View, Chennai, Tamil Nadu",
        "enrollment_date": date(2025, 6, 20),
    },
    {
        "full_name": "Vikram Singh",
        "email": "vikram.singh@example.com",
        "date_of_birth": date(2003, 6, 18),
        "phone_number": "+91 98765 43214",
        "course": "Cyber Security",
        "address": "23 Mall Road, Jaipur, Rajasthan",
        "enrollment_date": date(2025, 9, 5),
    },
    {
        "full_name": "Sneha Reddy",
        "email": "sneha.reddy@example.com",
        "date_of_birth": date(2004, 3, 12),
        "phone_number": "+91 98765 43215",
        "course": "Web Development",
        "address": "7 Banjara Hills, Hyderabad, Telangana",
        "enrollment_date": date(2025, 8, 25),
    },
    {
        "full_name": "Aditya Verma",
        "email": "aditya.verma@example.com",
        "date_of_birth": date(2000, 12, 5),
        "phone_number": "+91 98765 43216",
        "course": "Computer Science",
        "address": "56 Civil Lines, Delhi",
        "enrollment_date": date(2025, 5, 10),
    },
    {
        "full_name": "Meera Nair",
        "email": "meera.nair@example.com",
        "date_of_birth": date(2003, 9, 27),
        "phone_number": "+91 98765 43217",
        "course": "Data Science",
        "address": "19 Palm Grove, Kochi, Kerala",
        "enrollment_date": date(2025, 8, 12),
    },
    {
        "full_name": "Karan Malhotra",
        "email": "karan.malhotra@example.com",
        "date_of_birth": date(2002, 5, 14),
        "phone_number": "+91 98765 43218",
        "course": "Artificial Intelligence",
        "address": "74 Bandra West, Mumbai, Maharashtra",
        "enrollment_date": date(2025, 7, 30),
    },
    {
        "full_name": "Ishita Roy",
        "email": "ishita.roy@example.com",
        "date_of_birth": date(2005, 2, 8),
        "phone_number": "+91 98765 43219",
        "course": "Web Development",
        "address": "31 Salt Lake, Kolkata, West Bengal",
        "enrollment_date": date(2025, 9, 1),
    },
    {
        "full_name": "Siddharth Joshi",
        "email": "siddharth.joshi@example.com",
        "date_of_birth": date(1999, 10, 19),
        "phone_number": "+91 98765 43220",
        "course": "Cloud Computing",
        "address": "12 FC Road, Pune, Maharashtra",
        "enrollment_date": date(2025, 4, 18),
    },
    {
        "full_name": "Divya Nambiar",
        "email": "divya.nambiar@example.com",
        "date_of_birth": date(2004, 7, 21),
        "phone_number": "+91 98765 43221",
        "course": "Cyber Security",
        "address": "45 Beach Road, Kozhikode, Kerala",
        "enrollment_date": date(2025, 8, 19),
    },
    {
        "full_name": "Kabir Das",
        "email": "kabir.das@example.com",
        "date_of_birth": date(2003, 1, 11),
        "phone_number": "+91 98765 43222",
        "course": "Computer Science",
        "address": "90 Gariahat, Kolkata, West Bengal",
        "enrollment_date": date(2025, 7, 10),
    },
    {
        "full_name": "Tanvi Deshmukh",
        "email": "tanvi.deshmukh@example.com",
        "date_of_birth": date(2002, 9, 4),
        "phone_number": "+91 98765 43223",
        "course": "Data Science",
        "address": "33 Shivaji Nagar, Nagpur, Maharashtra",
        "enrollment_date": date(2025, 8, 22),
    },
    {
        "full_name": "Arjun Menon",
        "email": "arjun.menon@example.com",
        "date_of_birth": date(2004, 11, 16),
        "phone_number": "+91 98765 43224",
        "course": "Artificial Intelligence",
        "address": "66 Panampilly Nagar, Kochi, Kerala",
        "enrollment_date": date(2025, 9, 14),
    },
    {
        "full_name": "Riya Kapoor",
        "email": "riya.kapoor@example.com",
        "date_of_birth": date(2003, 3, 29),
        "phone_number": "+91 98765 43225",
        "course": "Web Development",
        "address": "81 Model Town, Ludhiana, Punjab",
        "enrollment_date": date(2025, 6, 1),
    },
    {
        "full_name": "Zaid Khan",
        "email": "zaid.khan@example.com",
        "date_of_birth": date(2001, 4, 25),
        "phone_number": "+91 98765 43226",
        "course": "Cloud Computing",
        "address": "28 Hazratganj, Lucknow, Uttar Pradesh",
        "enrollment_date": date(2025, 7, 5),
    },
    {
        "full_name": "Kavya Bhat",
        "email": "kavya.bhat@example.com",
        "date_of_birth": date(2004, 5, 3),
        "phone_number": "+91 98765 43227",
        "course": "Computer Science",
        "address": "52 Indiranagar, Bengaluru, Karnataka",
        "enrollment_date": date(2025, 8, 15),
    },
]


def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        count = db.query(Student).count()
        if count > 0:
            print(f"Database already contains {count} students. Skipping seed.")
            return

        print(f"Seeding {len(SAMPLE_STUDENTS)} students into the database...")
        for item in SAMPLE_STUDENTS:
            student = Student(**item)
            db.add(student)

        db.commit()
        print("Database seeded successfully!")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
