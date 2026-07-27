from fastapi.testclient import TestClient

from app.main import app


def test_create_and_read_trace(tmp_path, monkeypatch):
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    from app import main
    from app.models import Base

    engine = create_engine(
        f"sqlite:///{tmp_path / 'test.db'}", connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(engine)
    monkeypatch.setattr(main, "SessionLocal", sessionmaker(bind=engine, expire_on_commit=False))

    with TestClient(app) as client:
        created = client.post("/v1/runs", json={"goal": "Create a reliable agent execution trace"})
        assert created.status_code == 201
        body = created.json()
        assert body["evaluation"]["passed"] is True
        assert [event["phase"] for event in body["trace"]] == [
            "plan",
            "act",
            "observe",
            "act",
            "observe",
        ]

        fetched = client.get(f"/v1/runs/{body['id']}")
        assert fetched.status_code == 200
        assert fetched.json()["output"] == body["output"]


def test_rejects_short_goal():
    with TestClient(app) as client:
        response = client.post("/v1/runs", json={"goal": "short"})
    assert response.status_code == 422
