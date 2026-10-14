def test_analytics_stats(client):
    res = client.get("/students/stats")
    assert res.status_code == 200
    data = res.json()
    assert "total_students" in data
    assert "by_course" in data
    assert "enrollment_trends" in data
    assert "age_distribution" in data
    assert "recent_students" in data
    assert isinstance(data["by_course"], list)
    assert isinstance(data["age_distribution"], dict)
    assert "< 18" in data["age_distribution"]
    assert "18 - 21" in data["age_distribution"]
