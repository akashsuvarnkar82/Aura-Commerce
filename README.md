# E-Commerce API

A REST API for an e-commerce platform built with Flask. Supports user authentication, product
catalog with search, shopping cart, and checkout with Stripe payments.

Project spec: https://roadmap.sh/projects/ecommerce-api

## Architecture

```
Client → Flask App (Blueprints: auth, products, cart, orders, admin)
              ↓
        SQLAlchemy ORM
              ↓
        SQLite (dev) / PostgreSQL (prod-ready)

Payments → Stripe API (PaymentIntent)
```

## Features

- **Auth**: signup/login with JWT (`Flask-JWT-Extended`), password hashing with bcrypt
- **Products**: CRUD (admin-only writes), search by name, filter by category/price, pagination
- **Cart**: add/update/remove items, stock validation
- **Checkout**: converts cart to an order, creates a Stripe PaymentIntent, decrements stock
- **Admin**: view all orders, low-stock report
- **Tests**: pytest suite covering auth, permissions, cart, and stock edge cases

## Setup

```bash
# 1. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# edit .env and add your Stripe test secret key (https://dashboard.stripe.com/test/apikeys)

# 4. Seed the database (creates tables + admin user + sample products)
python seed.py

# 5. Run the server
python run.py
```

Server runs at `http://localhost:5000`. Default admin login: `admin@example.com` / `admin123`.

## Running Tests

```bash
pytest tests/ -v
```

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | - | `{name, email, password, role?}` → creates user, returns token |
| POST | `/api/auth/login` | - | `{email, password}` → returns token |

### Products
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | - | List products. Query: `search`, `category`, `min_price`, `max_price`, `page`, `per_page` |
| GET | `/api/products/<id>` | - | Get single product |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/<id>` | Admin | Update product |
| DELETE | `/api/products/<id>` | Admin | Delete product |

### Cart
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/cart` | User | View current cart + total |
| POST | `/api/cart/add` | User | `{product_id, quantity}` |
| PUT | `/api/cart/update/<item_id>` | User | `{quantity}` |
| DELETE | `/api/cart/remove/<item_id>` | User | Remove item |

### Orders / Checkout
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/orders/checkout` | User | Converts cart → order, creates Stripe PaymentIntent |
| POST | `/api/orders/<id>/confirm` | User | Confirms payment status after frontend completes Stripe payment |
| GET | `/api/orders` | User | List own orders |
| GET | `/api/orders/<id>` | User | Get single order |

### Admin
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/orders` | Admin | View all orders across all users |
| GET | `/api/admin/low-stock` | Admin | Products with stock ≤ 5 |

## Example: Full Flow with curl

```bash
# Sign up
curl -X POST localhost:5000/api/auth/signup -H "Content-Type: application/json" \
  -d '{"name":"Akash","email":"akash@test.com","password":"pass123"}'

# Browse products
curl localhost:5000/api/products?search=mouse

# Add to cart (replace TOKEN with access_token from signup response)
curl -X POST localhost:5000/api/cart/add -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" -d '{"product_id":1,"quantity":2}'

# Checkout
curl -X POST localhost:5000/api/orders/checkout -H "Authorization: Bearer TOKEN"
```

## Design Notes

- **Stock is decremented at checkout**, not at cart-add — prevents cart hoarding without a
  reservation system, at the cost of possible race conditions under high concurrency (documented
  trade-off, not fixed here — would need row-level locking or a reservation queue for scale).
- **Prices are copied onto `OrderItem`** at purchase time (`price_at_purchase`) so historical
  orders remain accurate even if a product's price changes later.
- **Stripe test mode**: use card `4242 4242 4242 4242`, any future expiry, any CVC.

## Future Work

- Rate limiting on auth endpoints
- Refresh tokens (currently access-token only)
- Order status webhook from Stripe instead of manual `/confirm` call
- Docker + docker-compose for one-command local setup
- Migrate SQLite → PostgreSQL for production
