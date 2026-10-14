def test_ai_status(client):
    res = client.get("/ai/status")
    assert res.status_code == 200
    data = res.json()
    assert data["provider"] == "google-gemini"
    assert "configured" in data
    assert "model" in data


def test_ai_grounded_query(client):
    res = client.post("/ai/query", json={"query": "How many students are currently registered?"})
    assert res.status_code == 200
    data = res.json()
    assert "answer" in data
    assert "grounded_data" in data
    assert data["grounded_data"]["type"] == "count"
    assert "total_count" == data["intent"]


def test_ai_empty_query_validation(client):
    res = client.post("/ai/query", json={"query": " "})
    assert res.status_code == 422
