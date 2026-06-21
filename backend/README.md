# IWX-EarnLens — Backend

FastAPI service powering the EarnLens income analytics platform. Built with a clean **layered
architecture** and a feature-module structure that keeps files small and easy to extend.

## Stack

- **FastAPI** + **Uvicorn**
- **MongoDB** via **Motor** (async)
- **Pydantic v2** for schemas & settings
- **JWT** auth (access + refresh) with **bcrypt** password hashing

## Run

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate   |   macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env        # set MONGODB_URI, JWT secrets, CORS origins
python -m app.main          # or: uvicorn app.main:app --reload
```

- API: **http://localhost:8000**
- Docs: **http://localhost:8000/docs**

## Seed demo data

```bash
python scripts/seed.py      # demo@earnlens.app / Demo1234
```

## Tests

```bash
PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 python -m pytest -q
```

## Architecture

```
app/
├── main.py               # uvicorn entrypoint
├── application.py        # create_app() factory, lifespan, middleware, handlers
├── core/                 # config, security, constants, exceptions, logging, middleware
├── shared/               # BaseSchema, BaseRepository, pagination, datetime, taxonomy bases
├── db/                   # Mongo connection + index setup
├── api/                  # dependencies + aggregate router
└── modules/              # feature modules (each: routers/controllers/services/repositories/models/schemas)
    ├── auth/             # register, login, refresh, logout, password reset
    ├── users/            # profile, change password
    ├── incomes/          # CRUD + filtered/paginated list + recent
    ├── categories/       # taxonomy
    ├── sources/          # taxonomy
    ├── tags/             # taxonomy
    ├── analytics/        # dashboard, summary, graph, distribution
    ├── preferences/      # per-user settings
    ├── audit/            # activity log
    └── reports/          # JSON report + CSV export
```

### Layered flow

```
HTTP → Router → Controller → Service → Repository → MongoDB
```

- **Routers** declare endpoints and dependencies.
- **Controllers** translate between HTTP and the domain.
- **Services** hold business logic.
- **Repositories** own all data access (extend `BaseRepository`).
- **Schemas** (Pydantic) validate I/O; **models** describe stored documents.

### API responses

All endpoints return a consistent envelope:

```json
{ "success": true, "message": "...", "data": { } }
```

Paginated endpoints return `{ "success": true, "data": [...], "meta": { ... } }`.
