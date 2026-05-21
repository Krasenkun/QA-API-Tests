# Buggy Shop

Buggy Shop is a small full-stack e-commerce sandbox intentionally containing defects for QA portfolio testing.

It is designed for:
- Postman collection testing
- Negative API testing
- Bug report writing
- Newman CLI automation

## Tech Stack

### Frontend
- Vue 3
- Vite
- Pinia
- Vue Router
- Tailwind CSS

### Backend
- Node.js
- Express.js
- SQLite (direct usage, no ORM)
- JWT auth
- bcryptjs
- Swagger UI

## Project Structure

```text
buggy-shop/
├── frontend/
├── backend/
└── README.md
```

## Quick Start

Only requirement: Node.js installed.

### Option A: Super Simple (recommended for portfolio reviewers)

```bash
npm install
npm run setup
npm run dev
```

This starts both backend and frontend.

- Backend: `http://localhost:4000`
- Frontend: `http://localhost:5173`
- Swagger docs: `http://localhost:4000/docs`

### Option B: Run apps separately

### 1) Backend

```bash
cd backend
npm install
```

Start backend:

```bash
npm run dev
```

Backend runs on: `http://localhost:4000`

Swagger docs: `http://localhost:4000/docs`

### API Docs Notes

The Swagger page now includes:
- grouped tags (Auth, Products, Cart, Orders)
- request body schemas and response models
- example payloads and auth requirements
- endpoint-specific notes describing intentional bugs for QA testing

How to test secured endpoints in Swagger UI:
1. Call `POST /api/auth/login`
2. Copy the returned token
3. Click Authorize in Swagger UI
4. Paste: `Bearer YOUR_TOKEN`

### 2) Frontend

```bash
cd frontend
npm install
```

Optional env file:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Start frontend:

```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

## Test Credentials

Seeded users:

- Admin
  - Email: `admin@buggyshop.local`
  - Password: `admin123`
  - Access: product management + order visibility (all orders), no cart/checkout
- User
  - Email: `user@buggyshop.local`
  - Password: `user123`
  - Access: normal shopping flow (cart + checkout) and own orders only

## API Base URL

`http://localhost:4000/api`

## Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Products
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` (admin)
- `PUT /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)

### Cart
- `GET /api/cart`
- `POST /api/cart/items`
- `PUT /api/cart/items/:id`
- `DELETE /api/cart/items/:id`

### Orders
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:id`
- `DELETE /api/orders/:id` (admin or order owner)

## Intentional Bugs (for QA Portfolio)

These bugs are intentionally present and should be tested in Postman/Newman:

1. Login accepts empty password
- Location: `POST /api/auth/login`
- Behavior: users can authenticate with blank password in some cases

2. Login error message is unclear
- Location: `POST /api/auth/login`
- Behavior: generic `something went wrong`

3. Product allows negative price
- Location: `POST /api/products`, `PUT /api/products/:id`
- Behavior: no validation blocks negative values

4. Missing validation for long product names
- Location: `POST /api/products`, `PUT /api/products/:id`
- Behavior: no max-length validation

5. Cart accepts quantity = 0
- Location: `POST /api/cart/items`
- Behavior: quantity `0` is accepted

6. DELETE product returns success but does not delete
- Location: `DELETE /api/products/:id`
- Behavior: endpoint returns success response, item remains

7. Duplicate email registration sometimes succeeds
- Location: `POST /api/auth/register`
- Behavior: duplicate registration may return success response randomly

8. Expired JWT can still work in selected endpoints
- Location: cart/orders routes using lax auth middleware
- Behavior: expired token accepted on those endpoints

## Suggested Postman Coverage

Create a collection with:
- Auth happy path tests
- Product CRUD tests
- Cart and order flow tests
- Negative tests for each intentional bug
- Security tests (auth/expired token/role checks)

Example assertion:

```javascript
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});
```

## Newman Usage

From your QA repository:

```bash
newman run collections/buggy-shop.postman_collection.json -e environments/local.environment.json
```

Optional reporters:

```bash
newman run collections/buggy-shop.postman_collection.json \
  -e environments/local.environment.json \
  -r cli,html,junit
```

## Deployment Notes

- Frontend: Vercel
- Backend: Render
- DB:
  - local development: SQLite
  - deployment: PostgreSQL (recommended)

If switching to PostgreSQL, update:
- SQL schema logic in `backend/src/db.js`
- DB connection and SQL statements currently used by SQLite

## Portfolio Tips

For strong junior QA showcase, include:
- clean repo structure
- Postman collection with assertions
- bug reports with reproducible steps
- test case docs
- Newman execution proof (CLI output/screenshots)
- short video walkthrough

## Current Status

Implemented in this setup:
- backend API + auth + direct SQLite schema/seed bootstrap
- Swagger docs page
- frontend pages and route protection
- intentional QA bugs in backend behavior
- ready for Postman collection authoring
