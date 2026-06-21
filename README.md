# IWX-EarnLens

> A production-ready, end-to-end **personal income analytics platform** — track, categorize and analyze every income stream with a calm, premium workspace.

| Layer | Stack |
| --- | --- |
| **Frontend** | Angular 21 (standalone, signals) · Tailwind CSS 4 |
| **Backend** | FastAPI · layered architecture |
| **Database** | MongoDB (Motor async driver) |
| **Auth** | Email/password · JWT access + refresh tokens (rotation & revocation) |

---

## ✨ Features

- **Secure auth** — register, login, refresh-token rotation, logout, password reset, change password.
- **Flexible income model** — salary, freelance, dividends, gifts and more, with custom fields, tags, attachments and metadata.
- **Taxonomy** — categories, sources and tags with colors and icons.
- **Unified analytics** — one switchable graph (line / area / bar / stacked) with grouping (day → year) and splits (type / category / source / recurrence).
- **Dashboard** — totals, growth, recurring split, period summaries, top sources, category breakdown and recent income.
- **Reports** — generate JSON summaries and export CSV.
- **Preferences** — theme (light / dark / system), default currency, grouping and chart style.
- **Activity log** — an audit timeline of account actions.

---

## 🗂️ Project structure

```
IWX-EarnLens/
├── backend/      # FastAPI app (layered: routers → controllers → services → repositories → models)
└── frontend/     # Angular 21 app (core / shared / features / layout)
```

Each major feature lives in its own module with dedicated subfolders, keeping files small and the codebase highly maintainable and easy to extend.

---

## 🚀 Getting started

### Prerequisites

- **Python** 3.11+
- **Node.js** 20+ and npm
- **MongoDB** running locally (default `mongodb://localhost:27017`)

### 1. Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate   |   macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env          # adjust MONGODB_URI / secrets as needed
python -m app.main            # or: uvicorn app.main:app --reload
```

The API runs at **http://localhost:8000** (interactive docs at `/docs`).

Seed demo data (creates `demo@earnlens.app` / `Demo1234` with categories, sources, tags and ~35 income entries):

```bash
python scripts/seed.py
```

### 2. Frontend

```bash
cd frontend
npm install
npm start                     # dev server at http://localhost:4200
```

The frontend expects the API at `http://localhost:8000` (configurable in `src/environments/environment.ts`).

---

## 🔧 Useful commands

| Location | Command | Purpose |
| --- | --- | --- |
| `backend/` | `python -m app.main` | Run the API |
| `backend/` | `PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 python -m pytest -q` | Run tests |
| `backend/` | `python scripts/seed.py` | Seed demo data |
| `frontend/` | `npm start` | Run dev server |
| `frontend/` | `npm run build` | Production build |

---

## 🔐 Demo credentials

After seeding:

```
Email:    demo@earnlens.app
Password: Demo1234
```

