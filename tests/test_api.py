import pytest
from app import create_app
from app.extensions import db
from app.config import Config


class TestConfig(Config):
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    TESTING = True


@pytest.fixture
def client():
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
        with app.test_client() as client:
            yield client
        db.drop_all()


def signup(client, email="user@test.com", role="customer"):
    return client.post("/api/auth/signup", json={
        "name": "Test User", "email": email, "password": "password123", "role": role
    })


def auth_header(token):
    return {"Authorization": f"Bearer {token}"}


def test_health(client):
    res = client.get("/api/health")
    assert res.status_code == 200


def test_signup_and_login(client):
    res = signup(client)
    assert res.status_code == 201
    assert "access_token" in res.json

    res = client.post("/api/auth/login", json={"email": "user@test.com", "password": "password123"})
    assert res.status_code == 200
    assert "access_token" in res.json


def test_duplicate_signup_fails(client):
    signup(client)
    res = signup(client)
    assert res.status_code == 409


def test_admin_can_create_product(client):
    res = signup(client, email="admin@test.com", role="admin")
    token = res.json["access_token"]

    res = client.post("/api/products", json={
        "name": "Test Product", "price": 10.0, "stock": 5
    }, headers=auth_header(token))
    assert res.status_code == 201
    assert res.json["name"] == "Test Product"


def test_customer_cannot_create_product(client):
    res = signup(client, email="customer@test.com", role="customer")
    token = res.json["access_token"]

    res = client.post("/api/products", json={
        "name": "Test Product", "price": 10.0
    }, headers=auth_header(token))
    assert res.status_code == 403


def test_add_to_cart_and_view(client):
    res = signup(client, email="admin@test.com", role="admin")
    admin_token = res.json["access_token"]
    res = client.post("/api/products", json={"name": "Mug", "price": 5.0, "stock": 10},
                       headers=auth_header(admin_token))
    product_id = res.json["id"]

    res = signup(client, email="buyer@test.com", role="customer")
    buyer_token = res.json["access_token"]

    res = client.post("/api/cart/add", json={"product_id": product_id, "quantity": 2},
                       headers=auth_header(buyer_token))
    assert res.status_code == 201

    res = client.get("/api/cart", headers=auth_header(buyer_token))
    assert res.status_code == 200
    assert res.json["total"] == 10.0


def test_cart_add_out_of_stock_fails(client):
    res = signup(client, email="admin2@test.com", role="admin")
    admin_token = res.json["access_token"]
    res = client.post("/api/products", json={"name": "Rare Item", "price": 5.0, "stock": 1},
                       headers=auth_header(admin_token))
    product_id = res.json["id"]

    res = signup(client, email="buyer2@test.com", role="customer")
    buyer_token = res.json["access_token"]

    res = client.post("/api/cart/add", json={"product_id": product_id, "quantity": 5},
                       headers=auth_header(buyer_token))
    assert res.status_code == 400
