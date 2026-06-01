# Inventory & Order Management System

A production-ready full-stack web application for managing products, customers, orders, and inventory tracking in real time.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Environment Variables](#environment-variables)
- [Setup Instructions](#setup-instructions)
- [Docker Commands](#docker-commands)
- [API Endpoints](#api-endpoints)
- [Business Rules](#business-rules)
- [Deployment](#deployment)
- [Screenshots](#screenshots)

---

## Project Overview

This application allows businesses to:

- Manage their product catalog with SKU tracking and stock levels
- Maintain a customer database
- Process orders with automatic inventory deduction
- Monitor business health through a live dashboard

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, shadcn/ui, wouter |
| Backend | Python 3.11, FastAPI, Uvicorn |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Validation | Pydantic v2 |
| API Client | TanStack React Query (Orval-generated hooks) |
| Containerization | Docker, Docker Compose |

---

## Project Structure

```
inventory-management-system/
│
├── frontend/                        # React + Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx        # Live stats, low-stock alerts, recent orders
│   │   │   ├── Products.tsx         # Full product CRUD with search
│   │   │   ├── Customers.tsx        # Full customer CRUD
│   │   │   └── Orders.tsx           # Order history + create order
│   │   ├── components/
│   │   │   ├── Layout.tsx           # Sidebar navigation
│   │   │   └── ui/                  # shadcn/ui components
│   │   ├── App.tsx                  # Router setup
│   │   ├── main.tsx                 # Entry point
│   │   └── index.css                # Tailwind + theme
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                         # Python FastAPI backend
│   ├── main.py                      # FastAPI app entry point + CORS
│   ├── database.py                  # SQLAlchemy engine + session
│   ├── models.py                    # ORM models (Product, Customer, Order)
│   ├── schemas.py                   # Pydantic request/response schemas
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── products.py              # GET/POST /api/products, PUT/DELETE /api/products/{id}
│   │   ├── customers.py             # GET/POST /api/customers, PUT/DELETE /api/customers/{id}
│   │   ├── orders.py                # GET/POST /api/orders
│   │   └── dashboard.py             # GET /api/dashboard/stats
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml               # Orchestrates frontend + backend + PostgreSQL
├── .env.example                     # Environment variable template
└── README.md
```

---

## Features

### Dashboard
- Total products, customers, orders, and revenue at a glance
- Low-stock alerts (products with fewer than 10 units)
- Recent orders feed (last 5 orders)

### Product Management
- Create, read, update, delete products
- Search/filter by product name
- SKU uniqueness enforced
- Price must be positive; stock cannot go negative

### Customer Management
- Create, read, update, delete customers
- Email uniqueness and format validation

### Order Management
- Create orders with automatic total price calculation
- Stock is automatically deducted upon order creation
- Orders blocked when stock is insufficient
- Full order history with customer and product details

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/inventory` |
| `POSTGRES_USER` | PostgreSQL username | `inventory_user` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `your_secure_password` |
| `POSTGRES_DB` | PostgreSQL database name | `inventory_db` |

---

## Setup Instructions

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose installed
- OR: Python 3.11+, Node.js 20+, and PostgreSQL 15+

### Option 1: Docker (Recommended)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd inventory-management-system

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# 3. Build and start all services
docker-compose up --build

# 4. Open your browser
#    Frontend: http://localhost:5173
#    Backend API: http://localhost:8080
#    API Docs (Swagger): http://localhost:8080/api/docs
```

### Option 2: Manual Setup

**Backend:**

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set environment variable
export DATABASE_URL=postgresql://user:password@localhost:5432/inventory_db

# Run the server
uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

---

## Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose down -v

# View logs
docker-compose logs -f

# Rebuild a specific service
docker-compose up --build backend
```

---

## API Endpoints

Base URL: `http://localhost:8080`

Interactive Swagger docs: `http://localhost:8080/api/docs`

### Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/healthz` | Health check |

### Products

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | List all products (supports `?search=` query param) |
| POST | `/api/products` | Create a product |
| PUT | `/api/products/{id}` | Update a product |
| DELETE | `/api/products/{id}` | Delete a product |

### Customers

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/customers` | List all customers |
| POST | `/api/customers` | Create a customer |
| PUT | `/api/customers/{id}` | Update a customer |
| DELETE | `/api/customers/{id}` | Delete a customer |

### Orders

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/orders` | List all orders |
| POST | `/api/orders` | Create an order (validates stock) |

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/stats` | Get dashboard statistics |

### Request / Response Examples

**Create Product:**
```json
POST /api/products
{
  "name": "Wireless Headphones",
  "sku": "WHP-001",
  "price": 149.99,
  "stockQuantity": 100
}
```

**Create Customer:**
```json
POST /api/customers
{
  "name": "Acme Corp",
  "email": "orders@acmecorp.com",
  "phone": "+1-555-0100"
}
```

**Create Order:**
```json
POST /api/orders
{
  "customerId": 1,
  "productId": 1,
  "quantity": 5
}
```

---

## Business Rules

- **SKU must be unique** — returns `409 Conflict` if duplicate
- **Customer email must be unique** — returns `409 Conflict` if duplicate
- **Stock cannot go negative** — order creation returns `400 Bad Request` if quantity exceeds available stock
- **Total price is auto-calculated** — `totalPrice = product.price × quantity`
- **Low stock threshold** — products with fewer than 10 units appear in dashboard alerts

---

## Deployment

### Frontend — Vercel / Netlify

```bash
cd frontend
npm run build
# Deploy the `dist/` folder to Vercel or Netlify
```

### Backend — Render / Railway

1. Connect your GitHub repository
2. Set the build command: `pip install -r requirements.txt`
3. Set the start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add `DATABASE_URL` environment variable pointing to your hosted PostgreSQL

### Database — Render PostgreSQL / Supabase

1. Create a PostgreSQL instance on Render or Supabase
2. Copy the connection string as `DATABASE_URL`
3. The application creates tables automatically on first startup

---

## Screenshots

<!-- Add screenshots after deployment -->

| Page | Description |
|---|---|
| Dashboard | Live metrics, low-stock alerts, recent orders |
| Products | Full CRUD table with search |
| Customers | Customer management table |
| Orders | Order history with create order modal |
