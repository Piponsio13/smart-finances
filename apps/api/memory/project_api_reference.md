---
name: project-api-reference
description: Full SmartFinances API contract — endpoints, request/response shapes, auth — needed for building the UI
metadata:
  type: project
---

## SmartFinances API

**Base URL (local):** `http://localhost:8080`
**Swagger UI:** `http://localhost:8080/swagger-ui.html`
**Auth:** JWT Bearer token. All endpoints except `/api/auth/**` require `Authorization: Bearer <token>`.

---

## Response Envelope

Every endpoint (except CSV export) returns:
```json
{
  "data": <payload or null>,
  "message": "string",
  "statusCode": 200
}
```

Validation errors (400) return a field→message map in `data`:
```json
{
  "data": { "email": "Must be a valid email address" },
  "message": "Validation failed",
  "statusCode": 400
}
```

| Status | Meaning |
|--------|---------|
| 400 | Validation failed |
| 401 | Bad credentials / expired token |
| 404 | Resource not found |
| 409 | Conflict (duplicate email, duplicate budget, category has transactions) |
| 500 | Unexpected error |

---

## Authentication

### Register
`POST /api/auth/register`
```json
{ "name": "string", "email": "string (valid email)", "password": "string (min 8 chars)" }
```
Response 201, data: null.

### Login
`POST /api/auth/login`
```json
{ "email": "string", "password": "string" }
```
Response 200, data: `{ "token": "<jwt>" }`.

---

## Categories

Default categories created on register:
- **INCOME:** Salary, Freelance, Investments, Other Income
- **EXPENSE:** Food & Dining, Transportation, Utilities, Housing, Healthcare, Shopping, Education, Subscriptions, Personal Care, Other Expenses

### Get all
`GET /api/category/all`
Response data: `[ { "id": 1, "name": "Salary", "type": "INCOME" } ]`

### Create custom
`POST /api/category`
```json
{ "categoryName": "string", "type": "INCOME" | "EXPENSE" }
```
Response 201, data: `"categoryName"`.

### Delete
`DELETE /api/category/{id}`
Returns 409 if the category has existing transactions.

---

## Transactions

### Create
`POST /api/transactions`
```json
{
  "amount": 150.00,
  "description": "string",
  "type": "INCOME" | "EXPENSE",
  "categoryId": 1,
  "date": "2026-01-20T10:30:00"
}
```
Response 201, data: null.

### List (with optional filters)
`GET /api/transactions`
Query params (all optional): `type`, `categoryId`, `dateFrom` (ISO datetime), `dateTo`, `minAmount`, `maxAmount`, `description`
Response data: array of transaction objects.

Transaction object:
```json
{
  "id": 1,
  "amount": 150.0,
  "description": "string",
  "type": "EXPENSE",
  "categoryName": "Food & Dining",
  "date": "2026-01-20T10:30:00"
}
```

### Get by ID
`GET /api/transactions/{id}`
Response data: single transaction object.

### Update
`PUT /api/transactions/{id}`
Same body as Create. Response 200, data: null.

### Delete
`DELETE /api/transactions/{id}`
Response 200, data: null.

### Summary
`GET /api/transactions/summary?month=7&year=2026`
`month` and `year` are optional — omit for all-time summary.
Response data:
```json
{
  "totalIncome": 2000.0,
  "totalExpenses": 1500.0,
  "balance": 500.0,
  "transactionCount": 12
}
```

### Export CSV
`GET /api/transactions/export`
Accepts same filter params as list. Returns `text/csv` file download.
Columns: `id, date, amount, type, category, description`

---

## Dashboard

`GET /api/dashboard`
Current month summary + per-category spending breakdown (sorted by highest spend).
Response data:
```json
{
  "month": 7,
  "year": 2026,
  "totalIncome": 2000.0,
  "totalExpenses": 1200.0,
  "balance": 800.0,
  "transactionCount": 15,
  "spendingByCategory": [
    { "categoryName": "Food & Dining", "total": 400.0, "percentage": 33.33 }
  ]
}
```

---

## Budgets

### Create
`POST /api/budgets`
```json
{
  "categoryId": 5,
  "monthlyLimit": 400.00,
  "month": 7,
  "year": 2026
}
```
Response 201. Returns 409 if budget already exists for that category + period.

### Get all
`GET /api/budgets`
Response data: array of budget objects with live status.
```json
{
  "id": 1,
  "categoryName": "Food & Dining",
  "monthlyLimit": 400.00,
  "actualSpending": 320.00,
  "remaining": 80.00,
  "exceeded": false,
  "month": 7,
  "year": 2026
}
```

### Delete
`DELETE /api/budgets/{id}`
Response 200, data: null.

---

## Enum Values

- `type`: `"INCOME"` | `"EXPENSE"`
