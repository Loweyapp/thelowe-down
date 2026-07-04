# The LoweDown

A personal finance PWA for Alex and Kelly, used mainly on Android phones.
React + Vite, plain JavaScript (no TypeScript). Deployed on Vercel, which
auto-builds from the `main` branch of this repo.

Current version: check `VERSION` in `src/constants.js` — bump with every push.

## Stack

- React 18 + Vite 5, plain `.js` files (JSX in `.js`, not `.jsx`)
- Firebase (Firestore + Auth) via the `firebase` npm SDK
- `recharts` for charts, `lucide-react` for icons, `papaparse` for CSV
- Inline styles throughout — no CSS framework. Font is Outfit
  (`fontFamily: "'Outfit', sans-serif"`), color constants come from `C` in
  `src/constants.js`.

## Hard-won deploy conventions — do not violate these

1. Vercel builds from `src/`. **Never commit build output.** The root
   `index.html` must keep referencing `/src/index.js`. (We once broke all
   deploys by committing a compiled `index.html` that referenced
   `/assets/index-*.js` instead.) Note: a stray `dist/` directory is
   already tracked in git from that old incident — leave it alone, don't
   add to it, and don't let a local `vite build` changes to `dist/` get
   staged.
2. Run `npx vite build` locally before every push to confirm zero errors.
3. Bump `VERSION` in `src/constants.js` with **every** push so it's
   possible to confirm on a phone that the deploy went live.
4. Push straight to `main` — that's what triggers the Vercel deploy.

## Firestore layout

- Transactions: `family/lowe/transactions`
- Test-mode transactions (parallel collection, used when the in-app "test
  mode" toggle is on): `family/lowe/transactions_test`
- Categories: `family/lowe/categories`
- Subscription overrides (not test-mode-scoped): `family/lowe/subscriptions`
- Monthly savings goal (single doc, not test-mode-scoped): `family/lowe/settings/savings`
- Anthropic API key (entered via the Ask view): `users/{uid}/settings/config`

`testMode` in `src/App.js` picks which collection (`txCollection`) every
read/write goes through — this needs to be respected by any new feature
that touches transactions (import, export, add, delete).

## Transaction schema

```js
{
  account: 'Alex' | 'Kelly',
  date: 'YYYY-MM-DD',
  description,       // cleaned/short description
  description_raw,   // original text (e.g. raw voice transcript)
  category,
  amount,             // SIGNED — negative for expenses, positive for income
  type: 'expense' | 'income' | 'saving' | 'investment',
  needsReview: boolean,
}
```

Dedup on import/matching is keyed on `date|description|amount`.

## Voice entry (src/views/AddView.js) — fragile, Android-specific

Do **not** refactor these patterns — each one fixes a real Android Chrome
bug that was hit in practice:

- `SpeechRecognition` is used with `continuous: false` plus a
  restart-on-`onend` pattern (manual session restart loop).
- A `tryRestart` guard ensures `onerror` + `onend` can't both fire a
  restart for the same session.
- `stopRecording` waits ~350ms before reading the transcript.

## Claude API usage

Both `src/views/AddView.js` (voice/text parsing) and `src/views/AskView.js`
call `https://api.anthropic.com/v1/messages` directly from the browser
using:
- model: `claude-haiku-4-5-20251001`
- header: `anthropic-dangerous-direct-browser-access: true`
- API key read from `users/{uid}/settings/config` (entered via Ask view)

## Import / Export

- `src/views/ImportView.js` handles CSV import (Papa Parse) plus one-off
  hardcoded historical month imports. CSV columns:
  `account,date,description,description_raw,category,amount,type,needsReview`
  (`description_raw` and `needsReview` are optional — `description_raw`
  falls back to `description`, `needsReview` defaults to `false`). Amount
  is signed. Respects `testMode`.
  Also contains a "Danger Zone" section (delete-by-bank, clear all test
  data) — marked temporary, meant to be removed once bank-sync (n8n) is
  stable.
- CSV export (`Papa.unparse`) exists both from the desktop `Sidebar`
  (all transactions) and from `TransactionsView` on mobile (exports the
  currently filtered view — respects account/month/review filters).

## Feature state (as of v1.3.44)

- `needsReview` flag: settable via voice-uncertainty detection, the
  Add-view form toggle, batch voice entry, and filterable in
  `TransactionsView`.
- Dashboard's Cash Flow chart buckets by day for short ranges (30D/3M) and
  by month for longer ones (6M/1Y/All), plus a "Month" mode to page through
  a specific calendar month — see `src/views/DashboardView.js`.
- Subscriptions view (`src/views/SubscriptionsView.js`, nav id
  `subscriptions`): detects recurring charges across all categories via
  `family/lowe/subscriptions` (not test-mode-scoped — it's a categorization
  preference, not transaction data).
- Savings & Investments section lives inside `SummaryView.js` (not a
  separate nav tab): all-time running totals, a monthly trend chart, an
  editable savings goal, and a streak counter for consecutive completed
  months meeting the goal.
- Import tab (`mobileHide: true`) is intentionally not in the mobile
  bottom nav — reachable via the shortcut button on Dashboard instead.
  Confirmed as the preferred setup; don't "fix" this back.
- See `BACKLOG.md` for planned/rejected features.

## Working conventions for this repo

- Match existing inline-style conventions: `C` color constants from
  `constants.js`, Outfit font, rounded "pill" buttons (`borderRadius: 20`),
  `Card`/`Btn`/`Field` components from `src/components/UI.js`.
- Every view component in `src/views/` receives the full `shared` prop
  object from `src/App.js` (`<View {...shared} />`), even if its function
  signature only destructures a subset — no prop-drilling needed, just add
  the destructured names you need.
- Keep this file updated when conventions, schema, or feature state change.
