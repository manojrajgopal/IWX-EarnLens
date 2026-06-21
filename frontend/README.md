# IWX-EarnLens — Frontend

Angular 21 single-page app for the EarnLens income analytics platform. Built with standalone
components, signals for state, functional route guards and HTTP interceptors, and Tailwind CSS 4.

## Stack

- **Angular 21** (standalone APIs, signals, new control flow `@if` / `@for`)
- **Tailwind CSS 4** via `@tailwindcss/postcss`
- **RxJS** for HTTP data flow
- Dependency-free **SVG chart** component (line / area / bar / stacked)

## Run

```bash
npm install
npm start          # http://localhost:4200
```

Configure the API endpoint in `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  apiPrefix: '/api',
};
```

## Build

```bash
npm run build      # outputs to dist/
```

## Architecture

```
src/app/
├── core/                 # singletons, not feature-specific
│   ├── constants/        # option lists, palette, currency maps
│   ├── guards/           # authGuard, guestGuard (functional)
│   ├── interceptors/     # auth (bearer + refresh), error (toasts)
│   ├── models/           # typed API contracts
│   └── services/         # data-access + auth/theme/toast/token state
├── shared/               # reusable, presentational
│   ├── pipes/            # money, humanize, timeAgo
│   └── ui/               # chart, stat-card, spinner, empty-state, toast
├── layout/               # app shell (sidebar + topbar)
└── features/             # one folder per feature, lazily loaded
    ├── auth/             # login, register, forgot/reset password
    ├── dashboard/
    ├── analytics/        # central switchable graph
    ├── income/           # list + add/edit form
    ├── taxonomy/         # categories, sources, tags
    ├── reports/
    ├── activity/
    ├── profile/
    ├── settings/
    ├── landing/
    └── not-found/
```

### Conventions

- **Standalone components** only — no NgModules.
- **Signals** for component state; `computed()` for derived values.
- **One feature per folder**, lazily loaded via `loadComponent`.
- Services unwrap the API `{ success, data }` envelope through `ApiService`.
- Design tokens and reusable utility classes live in `src/styles.css`.
