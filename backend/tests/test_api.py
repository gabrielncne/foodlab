import json

import pytest
from fastapi.testclient import TestClient

from backend.catalog import DEFAULT_CATALOG, load_catalog
from backend.main import create_app


@pytest.fixture(scope="module")
def client():
    with TestClient(create_app()) as connection:
        yield connection


def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["restaurants"] == 12


def test_recommendations_wire_contract(client):
    response = client.post("/api/recommendations", json={"category": "Japonesa", "budget": 60, "description": "", "priority": "rating", "limit": 6})
    assert response.status_code == 200
    body = response.json()
    assert body["items"][0]["restaurant"]["id"] == "koji-sushi"
    assert body["items"][0]["estimated_cost"] == 48
    assert body["items"][0]["reason"]
    assert body["total_eligible"] == 1


@pytest.mark.parametrize("body", [
    {"budget": -1}, {"budget": 0}, {"budget": True}, {"budget": "60"},
    {"budget": "NaN"}, {"budget": 10001}, {"category": "Inexistente"},
    {"priority": "random"}, {"limit": 0}, {"limit": 13}, {"limit": True},
    {"description": "a" * 501}, {"description": None}, {"unexpected": True},
])
def test_invalid_requests_are_rejected(client, body):
    assert client.post("/api/recommendations", json=body).status_code == 422


def test_empty_results_are_success_not_server_error(client):
    response = client.post("/api/recommendations", json={"budget": 1})
    assert response.status_code == 200
    assert response.json()["items"] == []


@pytest.mark.parametrize("number", ["NaN", "Infinity", "-Infinity"])
def test_non_finite_json_numbers_return_validation_error(client, number):
    response = client.post("/api/recommendations", content='{"budget": ' + number + '}', headers={"content-type": "application/json"})
    assert response.status_code == 422
    assert response.json()["detail"]


def test_unknown_api_path_does_not_return_spa(client):
    response = client.get("/api/does-not-exist")
    assert response.status_code == 404
    assert response.headers["content-type"].startswith("application/json")


def test_only_local_cors_origins(client):
    headers = {"Origin": "http://localhost:5173", "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "content-type"}
    assert client.options("/api/recommendations", headers=headers).status_code == 200
    headers["Origin"] = "https://untrusted.example"
    assert client.options("/api/recommendations", headers=headers).status_code == 400


def test_catalog_resolution_does_not_depend_on_terminal_directory(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    assert len(load_catalog()) == 12


def test_duplicate_ids_fail_fast(tmp_path):
    raw = json.loads(DEFAULT_CATALOG.read_text(encoding="utf-8"))
    raw[1]["id"] = raw[0]["id"]
    target = tmp_path / "bad.json"
    target.write_text(json.dumps(raw), encoding="utf-8")
    with pytest.raises(ValueError, match="duplicados"):
        load_catalog(target)


def test_production_spa_routes_and_assets(client):
    # Production build is generated before the final test run.
    from backend.catalog import PROJECT_ROOT
    if not (PROJECT_ROOT / "dist" / "index.html").exists():
        pytest.skip("Build frontend before testing production SPA serving")
    response = client.get("/foodmatch/resultados")
    assert response.status_code == 200
    assert '<div id="root">' in response.text
    assert client.get("/missing.js").status_code == 404
