import pytest


@pytest.fixture(autouse=True)
def populate_sample_students(client):
    students = [
        {
            "full_name": "Alpha User",
            "email": "alpha@example.com",
            "date_of_birth": "2000-01-01",
            "phone_number": "1111111111",
            "course": "Computer Science",
            "enrollment_date": "2024-01-15",
        },
        {
            "full_name": "Beta Tester",
            "email": "beta@example.com",
            "date_of_birth": "2002-06-15",
            "phone_number": "2222222222",
            "course": "Data Science",
            "enrollment_date": "2024-06-10",
        },
        {
            "full_name": "Gamma Learner",
            "email": "gamma@example.com",
            "date_of_birth": "2004-12-20",
            "phone_number": "3333333333",
            "course": "Computer Science",
            "enrollment_date": "2025-01-20",
        },
        {
            "full_name": "Delta Student",
            "email": "delta@example.com",
            "date_of_birth": "2001-09-09",
            "phone_number": "4444444444",
            "course": "Artificial Intelligence",
            "enrollment_date": "2025-08-01",
        },
    ]
    for s in students:
        client.post("/students", json=s)


def test_list_students_pagination(client):
    res = client.get("/students?page=1&page_size=2")
    assert res.status_code == 200
    data = res.json()
    assert data["page"] == 1
    assert data["page_size"] == 2
    assert len(data["items"]) == 2
    assert data["total"] >= 4
    assert data["total_pages"] >= 2


def test_search_by_name_and_email(client):
    # Search by name substring
    res = client.get("/students?search=Alpha")
    assert res.status_code == 200
    data = res.json()
    assert any(s["full_name"] == "Alpha User" for s in data["items"])

    # Search by email substring
    res_email = client.get("/students?search=beta@example")
    assert res_email.status_code == 200
    assert any(s["email"] == "beta@example.com" for s in res_email.json()["items"])


def test_filter_by_course(client):
    res = client.get("/students?course=Computer+Science")
    assert res.status_code == 200
    items = res.json()["items"]
    assert len(items) >= 2
    assert all("Computer Science" in s["course"] for s in items)


def test_filter_by_enrollment_date(client):
    res = client.get("/students?enrollment_start=2025-01-01&enrollment_end=2025-12-31")
    assert res.status_code == 200
    items = res.json()["items"]
    for s in items:
        assert "2025-" in s["enrollment_date"]


def test_sorting(client):
    # Ascending by full_name
    res_asc = client.get("/students?sort_by=full_name&sort_order=asc")
    assert res_asc.status_code == 200
    names = [s["full_name"] for s in res_asc.json()["items"]]
    assert names == sorted(names)

    # Descending by full_name
    res_desc = client.get("/students?sort_by=full_name&sort_order=desc")
    assert res_desc.status_code == 200
    names_desc = [s["full_name"] for s in res_desc.json()["items"]]
    assert names_desc == sorted(names_desc, reverse=True)
