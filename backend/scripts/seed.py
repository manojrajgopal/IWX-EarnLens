"""Seed the database with a demo user and realistic income data.

Usage (from the ``backend`` directory):

    python -m scripts.seed

Creates a demo account:
    email:    demo@earnlens.app
    password: Demo1234
"""
from __future__ import annotations

import asyncio
import random
from datetime import datetime, timedelta, timezone

from app.core.constants import (
    Collections,
    IncomeStatus,
    IncomeType,
    PaymentMode,
    RecurrenceType,
    UserRole,
)
from app.core.security import hash_password
from app.db.indexes import ensure_indexes
from app.db.mongodb import connect_to_mongo, get_database

DEMO_EMAIL = "demo@earnlens.app"
DEMO_PASSWORD = "Demo1234"


async def seed() -> None:
    await connect_to_mongo()
    db = get_database()
    await ensure_indexes(db)

    # Reset demo user's data for a clean slate.
    existing = await db[Collections.USERS].find_one({"email": DEMO_EMAIL})
    if existing:
        user_id = str(existing["_id"])
        for name in (
            Collections.INCOMES,
            Collections.CATEGORIES,
            Collections.SOURCES,
            Collections.TAGS,
        ):
            await db[name].delete_many({"user_id": user_id})
    else:
        now = datetime.now(timezone.utc)
        result = await db[Collections.USERS].insert_one(
            {
                "email": DEMO_EMAIL,
                "hashed_password": hash_password(DEMO_PASSWORD),
                "full_name": "Demo Analyst",
                "role": UserRole.USER.value,
                "is_active": True,
                "is_email_verified": True,
                "default_currency": "USD",
                "created_at": now,
                "updated_at": now,
            }
        )
        user_id = str(result.inserted_id)

    now = datetime.now(timezone.utc)

    categories = [
        {"name": "Employment", "color": "#6366f1", "icon": "briefcase"},
        {"name": "Freelance", "color": "#22c55e", "icon": "laptop"},
        {"name": "Investments", "color": "#f59e0b", "icon": "trending-up"},
        {"name": "Side Hustle", "color": "#ec4899", "icon": "rocket"},
    ]
    cat_ids = {}
    for cat in categories:
        res = await db[Collections.CATEGORIES].insert_one(
            {**cat, "user_id": user_id, "created_at": now, "updated_at": now}
        )
        cat_ids[cat["name"]] = str(res.inserted_id)

    sources = [
        {"name": "Acme Corp", "source_type": "employer", "color": "#6366f1"},
        {"name": "Upwork", "source_type": "platform", "color": "#22c55e"},
        {"name": "Fidelity", "source_type": "platform", "color": "#f59e0b"},
        {"name": "Etsy Store", "source_type": "platform", "color": "#ec4899"},
    ]
    src_ids = {}
    for src in sources:
        res = await db[Collections.SOURCES].insert_one(
            {**src, "user_id": user_id, "created_at": now, "updated_at": now}
        )
        src_ids[src["name"]] = str(res.inserted_id)

    tags = [
        {"name": "stable", "color": "#22c55e"},
        {"name": "variable", "color": "#f59e0b"},
        {"name": "passive", "color": "#6366f1"},
    ]
    tag_ids = []
    for tag in tags:
        res = await db[Collections.TAGS].insert_one(
            {**tag, "user_id": user_id, "created_at": now, "updated_at": now}
        )
        tag_ids.append(str(res.inserted_id))

    incomes = []
    # 12 months of salary.
    for month in range(12):
        pay_date = now - timedelta(days=30 * month)
        incomes.append(
            {
                "user_id": user_id,
                "title": "Monthly Salary",
                "amount": round(random.uniform(5200, 5600), 2),
                "currency": "USD",
                "income_type": IncomeType.SALARY.value,
                "recurrence": RecurrenceType.MONTHLY.value,
                "status": IncomeStatus.RECEIVED.value,
                "payment_date": pay_date,
                "category_id": cat_ids["Employment"],
                "source_id": src_ids["Acme Corp"],
                "source_name": "Acme Corp",
                "employer": "Acme Corp",
                "payment_mode": PaymentMode.BANK_TRANSFER.value,
                "tag_ids": [tag_ids[0]],
                "is_taxable": True,
                "attachments": [],
                "custom_fields": [],
                "metadata": {},
                "created_at": now,
                "updated_at": now,
            }
        )

    # Freelance gigs (variable, biweekly-ish).
    for i in range(18):
        pay_date = now - timedelta(days=14 * i + random.randint(0, 6))
        incomes.append(
            {
                "user_id": user_id,
                "title": random.choice(
                    ["Website Build", "API Integration", "UI Redesign", "Bug Fixes"]
                ),
                "amount": round(random.uniform(450, 2200), 2),
                "currency": "USD",
                "income_type": IncomeType.FREELANCE.value,
                "recurrence": RecurrenceType.ONE_TIME.value,
                "status": IncomeStatus.RECEIVED.value,
                "payment_date": pay_date,
                "category_id": cat_ids["Freelance"],
                "source_id": src_ids["Upwork"],
                "source_name": "Upwork",
                "client": random.choice(["Globex", "Initech", "Umbrella"]),
                "project_name": "Client Project",
                "payment_mode": PaymentMode.PAYPAL.value,
                "tag_ids": [tag_ids[1]],
                "is_taxable": True,
                "attachments": [],
                "custom_fields": [],
                "metadata": {},
                "created_at": now,
                "updated_at": now,
            }
        )

    # Quarterly dividends (passive).
    for q in range(4):
        pay_date = now - timedelta(days=90 * q)
        incomes.append(
            {
                "user_id": user_id,
                "title": "Dividend Payout",
                "amount": round(random.uniform(180, 540), 2),
                "currency": "USD",
                "income_type": IncomeType.DIVIDEND.value,
                "recurrence": RecurrenceType.QUARTERLY.value,
                "status": IncomeStatus.RECEIVED.value,
                "payment_date": pay_date,
                "category_id": cat_ids["Investments"],
                "source_id": src_ids["Fidelity"],
                "source_name": "Fidelity",
                "payment_mode": PaymentMode.BANK_TRANSFER.value,
                "tag_ids": [tag_ids[2]],
                "is_taxable": True,
                "attachments": [],
                "custom_fields": [],
                "metadata": {},
                "created_at": now,
                "updated_at": now,
            }
        )

    # Occasional side-hustle + bonus.
    incomes.append(
        {
            "user_id": user_id,
            "title": "Year-end Bonus",
            "amount": 4200.0,
            "currency": "USD",
            "income_type": IncomeType.BONUS.value,
            "recurrence": RecurrenceType.ONE_TIME.value,
            "status": IncomeStatus.RECEIVED.value,
            "payment_date": now - timedelta(days=20),
            "category_id": cat_ids["Employment"],
            "source_id": src_ids["Acme Corp"],
            "source_name": "Acme Corp",
            "payment_mode": PaymentMode.BANK_TRANSFER.value,
            "tag_ids": [],
            "is_taxable": True,
            "attachments": [],
            "custom_fields": [],
            "metadata": {},
            "created_at": now,
            "updated_at": now,
        }
    )

    await db[Collections.INCOMES].insert_many(incomes)
    print(f"Seeded {len(incomes)} income entries for {DEMO_EMAIL} (password: {DEMO_PASSWORD})")


if __name__ == "__main__":
    asyncio.run(seed())
