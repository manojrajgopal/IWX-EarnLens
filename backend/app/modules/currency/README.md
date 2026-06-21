# Currency Conversion Module

> **Status:** Upcoming — available in v2.0

## Planned Features

- **Auto currency conversion**: When a user records income in a different currency than their default, the system will automatically fetch the current exchange rate and convert the amount.
- **Real-time exchange rates**: Integration with a live exchange rate API (e.g., Open Exchange Rates, Fixer.io).
- **Historical rate tracking**: Store historical rates to accurately represent past income in the user's preferred currency.
- **Multi-currency dashboard**: Display totals in the user's default currency with automatic conversion from all recorded currencies.
- **Rate caching**: Cache exchange rates to minimize API calls and improve performance.

## File Structure (Planned)

```
currency/
├── __init__.py
├── services/
│   ├── exchange_rate_service.py    # Fetches & caches live rates
│   └── conversion_service.py      # Converts amounts between currencies
├── schemas/
│   └── currency_schemas.py        # Request/response DTOs
├── routers/
│   └── currency_router.py         # API endpoints
├── models/
│   └── exchange_rate_model.py     # Stored rate records
└── utils/
    └── rate_providers.py          # Pluggable rate provider adapters
```
