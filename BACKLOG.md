# Feature backlog

Ideas raised in conversation, not yet built. Not in priority order except
where noted.

## Shipped

- ~~Subscription tracking across categories~~ — done in v1.3.41/42
  (`SubscriptionsView.js`). Detects recurring charges regardless of
  category, with manual overrides (dismiss/edit/add) and known-brand
  keyword recognition.

## Up next

- **Auto-generated monthly insights** — a short Claude-written summary of
  trends/wins/losses, generated proactively (not user-prompted like Ask
  currently is). Likely surfaces on Dashboard or Summary.
- **Savings & investments feature** — scope still TBD, deliberately not
  copying the tithe/tax/savings-% checklist from the YouTube video
  wholesale. Needs a follow-up conversation on what's actually wanted.

## Later

- **Search in Transactions view** — free-text search across description,
  not just account/month/review filters.
- **Multi-month trend chart** — bar chart comparing one category's spend
  across the last 6–12 months (Summary view currently only shows one month
  against its budget).
- **Annotate a spending spike** — attach a note to a month/category
  explaining an anomaly, pairs well with the multi-month trend chart above.
- **Alex vs Kelly split/settle-up view** — a "who owes whom" summary given
  shared finances tracked per-account.
- **Bill reminders / push notifications** — local notifications for known
  recurring bills (rent, phone). More fiddly than the others due to Android
  PWA notification permissions.
- **Receipt photo attachment** — attach a photo to a transaction, stored in
  Firebase Storage.

## Low priority / maybe

- **Amber "getting close" budget warning** — Summary currently only shows
  binary Over budget / On track; a middle state (e.g. 85%+ spent) would be
  a small addition to the existing progress bars.
- **"What if" savings projection tab** — hypothetical "cut everything
  non-essential" annual savings projection. Fun, not something you'd act
  on daily.

## Rejected

- Subscription "could cancel / cancelled" status + running savings total
  (from the YouTube video) — explicitly not wanted.
- Bible verses / faith content (from the YouTube video) — not applicable.
