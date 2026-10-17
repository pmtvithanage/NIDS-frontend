# NIDS Console — Frontend

React 18 + Vite (JavaScript) web console for the hybrid NIDS
(Suricata + CICFlowMeter + MLP classifier + autoencoder fusion).

## Requirements

- Node.js 18+
- npm 9+

## Setup

```bash
cd frontend
npm install
cp .env.example .env
```

## Environment variables

| Variable       | Default   | Description                            |
| -------------- | --------- | -------------------------------------- |
| `VITE_API_URL` | `/api/v1` | Base URL for the backend API (Axios).  |

Timestamps are transported as ISO UTC strings and rendered in the user's
timezone (default `Asia/Colombo`).

## Scripts

```bash
npm run dev        # dev server at http://localhost:5173
npm run build      # production build into dist/
npm run preview    # preview the production build
npm run lint       # oxlint + ESLint
npm test           # Vitest (single run)
npm run test:watch # Vitest in watch mode
```

## Tech stack

React Router, TanStack Query, TanStack Table, TanStack Virtual, Axios,
Tailwind CSS, Recharts, dygraphs (streaming charts), lucide-react, date-fns.
Linting: oxlint + ESLint (flat config). Testing: Vitest + Testing Library
(jsdom); the `dygraphs` package is mocked in `src/test/`.

## Project structure

```
src/
  api/          one module per resource; the only place Axios is called
  hooks/        React Query hooks + UI hooks (auth, theme, url state, live feed)
  pages/        route-level screens (lazy-loaded)
  components/   feature folders + components/common atoms
  constants/    shared constants (no inline magic numbers)
  utils/        pure helpers (format, csv, evidence, parseReason, ...)
  styles/       Tailwind entry + theme tokens (dark default, light option)
  test/         Vitest setup + dygraphs mock + component/hook tests
  routes.jsx    route table (React.lazy + Suspense)
  main.jsx      providers: Query > Theme > Auth > Toast > Router
```

## Data layer

All data flows through `src/api/*.js`, which is the only place Axios is
called. Components and pages never call the API modules directly — they go
through the hooks in `src/hooks/`, which use TanStack Query for fetching,
caching and mutations.

The `http` Axios instance (`src/api/http.js`) reads `VITE_API_URL` and
attaches the bearer token from `localStorage` (`nids_token`).

See `../docs/API_CONTRACT.md` for the full endpoint list, params and response
shapes.

## Overview page & live monitoring

`pages/OverviewPage.jsx` composes the dashboard from
`components/overview/*`: KPI tiles, alerts-over-time, severity donut, engine
agreement, top lists, the latest-alert ticker, a pipeline-health strip, and the
live monitor (`components/overview/live/*`).

- **Data flow** — the page only talks to hooks (`useStats`, `useSensors`, the
  live-metrics hook), which call `src/api/*`. Static charts use Recharts;
  streaming charts use the shared `<DygraphChart>` (see `AGENTS.md` §9).
- **Live feed** — `hooks/useLiveMetrics.js` keeps points in a **ref-backed ring
  buffer** (never React state) and notifies subscribers. History is fetched via
  `api/metrics.js` `getMetricsHistory`; live points arrive from
  `subscribeMetrics`. Downstream widgets subscribe with `useSyncExternalStore`,
  so a burst of measurements causes at most one React render per second.
- **Charts** — components hold a ref to `<DygraphChart>` and push data with
  `ref.current.setData(rows)` (history) / `ref.current.append(rows)` (live).
  The Dygraph instance is created once per mount and destroyed on unmount;
  series colours come from CSS variables and are re-applied when the theme
  changes. Every live chart has pause/resume, a "Back to live" control, and a
  visually hidden latest-values summary.
- **Tab visibility** — while the browser tab is hidden, incoming points are
  dropped and updates pause automatically; on return the history is re-fetched
  to catch up (skipped if the user paused manually).
- **Tuning** — burst/redraw cadence and colours live in `src/constants/`
  (`OVERVIEW_TICKER_BATCH_MS`, `METRICS_FLUSH_MS`, `MONITOR_COLORS`,
  `MONITOR_MAX_POINTS`) — change them there, not in components.

## Conventions

- Functional components + hooks, one component per file, small files.
- Dark theme by default with a light option (Tailwind `dark` class + CSS vars).
- Severity is never color-only (icon/dot + text); keyboard accessible.
- Filters are synced to the URL query string.
- Alert text is escaped (no `dangerouslySetInnerHTML`).
- Responsive down to tablet width.
