# TimeVerse

**Your Life, Measured in Moments.**

A complete, local-first Phase 1 app for looking forward to meaningful dates and keeping memories close. Built with Next.js App Router, React, strict TypeScript, Tailwind CSS, shadcn-style Radix UI primitives, Motion, Lucide, Zustand, React Hook Form, Zod, date-fns, and date-fns-tz.

## Run locally

Use Node **24 LTS** (`.nvmrc` pins the version used for verification). Node 22.12+ is also supported by the installed test tooling.

```sh
cd TimeVerse
nvm use               # if using nvm
npm ci
npm run dev
```

Open port **3000** in your local browser. No environment variables, API keys, accounts, databases, or external backend services are required. Next.js serves the interface; all event data lives in the browser. Geist fonts are bundled locally, with no runtime Google Fonts requests.

For a production demonstration:

```sh
npm run build
npm start
```

In a cloud workspace where the default npm cache is unwritable, use `npm ci --cache /tmp/timeverse-npm`. Use the existing checkout directly: each cloud task is already isolated, so no Git worktree is needed.

## What works

- A responsive landing page with an interactive countdown/count-up preview.
- A real dashboard with live statistics, a featured moment, and All / Upcoming / Memories tabs.
- Search, category filtering, and nearest / farthest / newest / oldest sorting.
- Create, view, edit, and delete moments, with validation, live preview, accent colors, and emoji selection.
- Confirmed destructive actions, toast feedback, missing-event states, and storage failure notices.
- Persistent light/dark themes, semantic controls, keyboard dialogs and menus, focus indicators, and reduced-motion support.
- Optional, clearly labeled demo moments. Clearing or deleting them never silently recreates them.
- Saved IANA timezones, browser timezone suggestion, and automatic bidirectional tracking.

## Routes

| Route               | Purpose                     |
| ------------------- | --------------------------- |
| `/`                 | Landing page                |
| `/dashboard`        | Your collection and summary |
| `/events/new`       | Create a moment             |
| `/events/[id]`      | Live moment detail          |
| `/events/[id]/edit` | Edit an existing moment     |

## Time semantics

Events store the user's `YYYY-MM-DD` calendar date, optional `HH:mm` wall time, date mode, and explicit IANA timezone. The default is `Asia/Colombo`. Their status is always derived, never persisted.

**Date-only:** counts down to the actual beginning of that calendar date in the saved timezone. Shows **Today** throughout that entire local day. After the day ends, elapsed time is measured from its beginning. DST days may contain 23 or 25 hours; the main duration uses actual elapsed 24-hour days, never approximate calendar months.

**Exact date-time:** resolves the local date and time into an instant in the saved timezone. The digital timer has one-second resolution, with an exact-moment state for the corresponding second, then counts up automatically. No page reload is required. Browser background throttling does not accumulate drift: each tick samples the current system clock, and returning to the tab refreshes it immediately.

**DST:** nonexistent local times are rejected with an inline error. A repeated local time resolves to its **earlier** occurrence, consistently across timezone offsets. If a date skips midnight, the engine finds the actual first instant of that day. Entirely skipped calendar days, such as the 2011 date-line change in Pacific/Apia, are rejected.

The shared clock uses a single interval for all active timer subscribers. Timezone resolutions are cached, and the event form's clock is isolated to its preview.

## Persistence and privacy

`src/lib/storage/event-repository.ts` provides `getAll`, `getById`, `create`, `update`, and `delete`, independently of UI components. Zustand exposes application actions to the interface. A future remote repository can replace this boundary without changing the presentation components.

- Events: `timeverse:events:v1`
- Theme: `timeverse:theme`
- New event IDs: `crypto.randomUUID()`
- Every deserialized record is validated with Zod. Valid records are recovered from partially malformed storage.
- If storage access or writes fail, the repository keeps working in memory and clearly warns that changes only last for the session.
- Other tabs are refreshed through browser storage events. Simultaneous writes use last-write-wins semantics; Phase 1 has no distributed conflict resolution.
- Storage is read after mount to prevent SSR hydration mismatches.

Data is specific to the **browser and origin**. Clearing site data removes saved events. This release has no cloud sync, backup/export, authentication, recurrence, or notifications. localStorage is not encrypted; use it for personal milestones rather than sensitive secrets. No analytics or third-party application requests are added.

## Structure

```text
src/
  app/                 App Router pages and root layout
  components/
    layout/            Header, theme provider, motion wrappers
    events/            Form, isolated live preview, cards, detail, actions
    timer/             Shared timer presentation
    ui/                shadcn-style Radix primitives and button variants
  features/events/     Strict event types, schemas, categories and accents
  hooks/               Shared clock subscription
  lib/time/            Pure time engine and DST-aware wall-time resolution
  lib/storage/         Repository interface, validated persistence, memory fallback
  stores/              Zustand application state and optional demo actions
  styles/              Semantic tokens, component styles and responsive layouts
 tests/                Vitest time engine and repository tests
 e2e/                  Playwright browser journeys and accessibility checks
```

## Verification

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

Browser tests use Chromium at desktop and mobile sizes:

```sh
npx playwright install chromium
npm run test:e2e
```

For an existing system Chromium (as in this cloud environment):

```sh
CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e
```

Playwright starts the development server automatically unless one is already running. Set `E2E_PRODUCTION=1` to test a previously built production app; the runner starts it on port 3000. `CI=1` prevents reusing an existing server. Failure screenshots and traces go into ignored `test-results/`; the HTML report is in `playwright-report/`.

The tests exercise real CRUD, persistence across refresh, form errors, theme persistence, search/filtering, sorting, demo cleanup, accessible deletion dialogs and menus, malformed storage recovery, automatic future → present → past transitions, full-day Today → past transitions, and 320px layouts. Unit tests cover leap dates, calendar/year boundaries, timezone conversion, 23/25-hour days, repeated and nonexistent local times, skipped midnight, half-hour DST, historical/far-future dates, schema validation, and storage quota/access failures.

Formatting: `npm run format` or `npm run format:check`.
