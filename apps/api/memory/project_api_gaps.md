---
name: project-api-gaps
description: Known missing API endpoints that will be needed during UI development
metadata:
  type: project
---

These are gaps identified during UI planning. They don't block the core flows but will likely need to be added as the UI is built. All fixes should be made in the API project at `/Users/felipe/Documents/Proyectitos/smartFinances/smartfinances-api`.

**Why:** These were deprioritized to get the UI started; they should be added as each screen that needs them is built.
**How to apply:** When a UI screen needs one of these, go back to the API project and add it before building that screen.

## Missing endpoints

1. **Pagination on `GET /api/transactions`** — currently returns all transactions at once. A table with many rows will be slow. Add `page` and `size` query params using Spring Data `Pageable`.

2. **User profile** — no `GET /api/users/me` (fetch current user's name/email) and no `PUT /api/users/me` (update name, email, password). Needed for a settings/profile page.

3. **Budget update** — no `PUT /api/budgets/{id}`. To change a monthly limit the user must delete and recreate. Add a PATCH/PUT endpoint.

4. **Monthly trend data** — the dashboard only returns the current month. A "last 6 months" chart requires calling `/api/transactions/summary` multiple times from the frontend. A dedicated `GET /api/dashboard/trend?months=6` endpoint would be cleaner.

## Known infrastructure gaps (not UI-blocking)

- No unit or integration tests (zero coverage)
- No Flyway/Liquibase migrations (`ddl-auto=validate` in prod requires manual schema management)
- No CI/CD pipeline
- No rate limiting
