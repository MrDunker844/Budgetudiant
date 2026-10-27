from datetime import datetime


def test_list_categories(client, fake_db):
    fake_db.responses = [[
        {
            "cat_id": 1,
            "cat_name": "Alimentation",
            "cat_color": "#4CAF50",
            "cat_description": "Courses",
            "cat_created_at": datetime(2026, 10, 27, 10, 0),
        }
    ]]

    response = client.get("/api/categories/")

    assert response.status_code == 200
    assert response.json()[0]["cat_name"] == "Alimentation"
    assert (
        fake_db.queries[0][0]
        == "SELECT cat_id, cat_name, cat_color, cat_description, cat_created_at "
        "FROM categories ORDER BY cat_name"
    )
