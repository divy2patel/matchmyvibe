import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app


@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


@pytest.mark.asyncio
async def test_match_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {"text": "I love classical dance and hosting cultural events"}
        response = await ac.post("/api/v1/match", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert len(data["recommendations"]) == 5
        assert "vibe" in data
        assert "meta" in data


@pytest.mark.asyncio
async def test_icebreaker_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {
            "item_id": "22222222-0000-0000-0000-000000000001",
            "item_type": "group",
            "item_name": "Aatmoday Cultural & Dance Society",
            "category": "Performing Arts",
            "contact_lead": "Zara Khan",
            "style": "introvert",
            "channel": "whatsapp",
            "user_context": "classical dance",
        }
        response = await ac.post("/api/v1/icebreaker", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "Zara" in data["icebreaker"]
        assert "whatsapp_share_url" in data
        assert data["whatsapp_share_url"].startswith("https://wa.me/?text=")


@pytest.mark.asyncio
async def test_groups_and_events_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        groups_res = await ac.get("/api/v1/groups")
        assert groups_res.status_code == 200
        assert len(groups_res.json()) >= 10

        events_res = await ac.get("/api/v1/events")
        assert events_res.status_code == 200
        assert len(events_res.json()) >= 5

        interests_res = await ac.get("/api/v1/interests")
        assert interests_res.status_code == 200


@pytest.mark.asyncio
async def test_saved_and_feedback_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        headers = {"x-user-id": "test-student-123"}

        # 1. Save item
        save_res = await ac.post(
            "/api/v1/saved",
            json={"group_id": "22222222-0000-0000-0000-000000000001"},
            headers=headers,
        )
        assert save_res.status_code == 200
        saved_item = save_res.json()
        saved_id = saved_item["id"]

        # 2. List saved items
        list_res = await ac.get("/api/v1/saved", headers=headers)
        assert list_res.status_code == 200
        items = list_res.json()
        assert any(i["id"] == saved_id for i in items)

        # 3. Delete saved item
        del_res = await ac.delete(f"/api/v1/saved/{saved_id}", headers=headers)
        assert del_res.status_code == 200

        # 4. Submit feedback
        feed_res = await ac.post(
            "/api/v1/feedback",
            json={
                "group_id": "22222222-0000-0000-0000-000000000001",
                "feedback": "positive",
            },
            headers=headers,
        )
        assert feed_res.status_code == 200
        assert feed_res.json()["success"] is True
