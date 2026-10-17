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
  dummy/        in-memory fake data, one module per resource
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

## Data layer & dummy mode

All data flows through `src/api/*.js`. Every API function contains the **real
Axios call commented out** directly above the call to the matching dummy
function, which is what actually runs:

```js
export async function getAlerts(params) {
  // const { data } = await http.get('/alerts', { params });
  // return data;
  return dummy.listAlerts(params)
}
```

The dummy layer (`src/dummy/`) simulates 200–600 ms latency, supports the same
filter/sort/pagination params as the real API, and keeps in-memory state so
mutations (status, labels, suppressions) persist until reload. Components and
pages **never** import from `src/dummy` directly — only through hooks that call
`src/api`.

The real-time feed is simulated with `setInterval` in `src/dummy/stream.dummy.js`;
the real `EventSource` code is kept commented out in `src/api/stream.js`.

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

To use the real metrics backend, uncomment the Axios/`EventSource` calls in
`src/api/metrics.js` (and `src/api/stream.js`) and delete the dummy calls, as
described below.

## Switching to the real backend

For each function in `src/api/*.js`:

1. Uncomment the Axios lines.
2. Delete the `return dummy.<fn>(...)` line.
3. Set `VITE_API_URL` in `.env` (e.g. `http://localhost:4000/api/v1`).

For the live feed, uncomment the `EventSource` block in `src/api/stream.js` and
remove the dummy `subscribeAlerts` line. The `http` Axios instance already
attaches the bearer token from `localStorage` (`nids_token`).

See `../docs/API_CONTRACT.md` for the full endpoint list, params and response
shapes the dummy layer mirrors.

## Conventions

- Functional components + hooks, one component per file, small files.
- Dark theme by default with a light option (Tailwind `dark` class + CSS vars).
- Severity is never color-only (icon/dot + text); keyboard accessible.
- Filters are synced to the URL query string.
- Alert text is escaped (no `dangerouslySetInnerHTML`).
- Responsive down to tablet width.
