from datetime import date


def test_create_student_success(client):
    payload = {
        "full_name": "Test Student",
        "email": "test.student@example.com",
        "date_of_birth": "2002-05-15",
        "phone_number": "+91 99999 11111",
        "course": "Computer Science",
        "address": "123 Campus Road",
        "enrollment_date": "2025-08-01",
    }
    response = client.post("/students", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["full_name"] == "Test Student"
    assert data["email"] == "test.student@example.com"
    assert data["age"] > 0
    assert "created_at" in data
    assert "updated_at" in data


def test_create_student_duplicate_email(client):
    payload = {
        "full_name": "Unique User",
        "email": "duplicate@example.com",
        "date_of_birth": "2001-01-01",
        "phone_number": "+91 99999 22222",
        "course": "Data Science",
        "enrollment_date": "2025-08-01",
    }
    # First creation should succeed
    res1 = client.post("/students", json=payload)
    assert res1.status_code == 201

    # Second creation with identical email should yield 409 Conflict
    res2 = client.post("/students", json=payload)
    assert res2.status_code == 409
    assert "already exists" in res2.json()["detail"]


def test_create_student_validation_errors(client):
    # Future birth date
    res = client.post(
        "/students",
        json={
            "full_name": "Invalid DOB",
            "email": "invaliddob@example.com",
            "date_of_birth": "2099-01-01",
            "phone_number": "12345678",
            "course": "AI",
        },
    )
    assert res.status_code == 422

    # Invalid email format
    res = client.post(
        "/students",
        json={
            "full_name": "Invalid Email",
            "email": "not-an-email",
            "date_of_birth": "2000-01-01",
            "phone_number": "12345678",
            "course": "AI",
        },
    )
    assert res.status_code == 422

    # Name too short
    res = client.post(
        "/students",
        json={
            "full_name": "A",
            "email": "shortname@example.com",
            "date_of_birth": "2000-01-01",
            "phone_number": "12345678",
            "course": "AI",
        },
    )
    assert res.status_code == 422


def test_get_student_by_id(client):
    # Create a student
    create_res = client.post(
        "/students",
        json={
            "full_name": "Lookup Student",
            "email": "lookup@example.com",
            "date_of_birth": "2003-04-10",
            "phone_number": "9876543210",
            "course": "Web Development",
            "enrollment_date": "2025-08-01",
        },
    )
    assert create_res.status_code == 201
    student_id = create_res.json()["id"]

    # Retrieve by ID
    get_res = client.get(f"/students/{student_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == student_id
    assert get_res.json()["full_name"] == "Lookup Student"

    # Nonexistent ID
    bad_res = client.get("/students/999999")
    assert bad_res.status_code == 404


def test_put_update_student(client):
    create_res = client.post(
        "/students",
        json={
            "full_name": "Before Update",
            "email": "put.test@example.com",
            "date_of_birth": "2002-02-02",
            "phone_number": "11111111",
            "course": "Cyber Security",
            "enrollment_date": "2025-08-01",
        },
    )
    student_id = create_res.json()["id"]

    put_payload = {
        "full_name": "After Full Update",
        "email": "put.updated@example.com",
        "date_of_birth": "2002-02-02",
        "phone_number": "22222222",
        "course": "Cloud Computing",
        "address": "Updated Address",
        "enrollment_date": "2025-09-01",
    }
    put_res = client.put(f"/students/{student_id}", json=put_payload)
    assert put_res.status_code == 200
    data = put_res.json()
    assert data["full_name"] == "After Full Update"
    assert data["email"] == "put.updated@example.com"
    assert data["course"] == "Cloud Computing"
    assert data["address"] == "Updated Address"


def test_patch_partial_update_student(client):
    create_res = client.post(
        "/students",
        json={
            "full_name": "Patch Target",
            "email": "patch.test@example.com",
            "date_of_birth": "2001-05-10",
            "phone_number": "33333333",
            "course": "Computer Science",
            "enrollment_date": "2025-08-01",
        },
    )
    student_id = create_res.json()["id"]

    # Only patch phone and course
    patch_res = client.patch(
        f"/students/{student_id}",
        json={"phone_number": "99998888", "course": "Artificial Intelligence"},
    )
    assert patch_res.status_code == 200
    data = patch_res.json()
    assert data["phone_number"] == "99998888"
    assert data["course"] == "Artificial Intelligence"
    # Name should remain untouched
    assert data["full_name"] == "Patch Target"


def test_delete_student(client):
    create_res = client.post(
        "/students",
        json={
            "full_name": "To Be Deleted",
            "email": "delete.me@example.com",
            "date_of_birth": "2003-07-07",
            "phone_number": "44444444",
            "course": "Data Science",
            "enrollment_date": "2025-08-01",
        },
    )
    student_id = create_res.json()["id"]

    del_res = client.delete(f"/students/{student_id}")
    assert del_res.status_code == 200
    assert del_res.json()["id"] == student_id

    # Confirm it is no longer found
    get_res = client.get(f"/students/{student_id}")
    assert get_res.status_code == 404

    # Deleting nonexistent ID returns 404
    del_again = client.delete(f"/students/{student_id}")
    assert del_again.status_code == 404
