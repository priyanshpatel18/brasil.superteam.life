# E2E Tests + Gamification: Next Steps

## 1. Run migrations

Challenges and seasons live in the **backend** Postgres DB. Run the migration there.

```bash
cd backend
pnpm exec prisma migrate deploy
```

Or, for a fresh dev DB:

```bash
cd backend
pnpm exec prisma migrate dev
```

The migration `20260302000000_add_challenges_and_seasons` creates `seasons`, `challenges`, and `user_challenge_completions`. The **app** does not have its own copy of these tables; it reads/writes via the backend API.

---

## 2. How admins create challenges (no Sanity)

Challenges are **not** in Sanity. They are stored in the backend Postgres DB and managed from the **Admin UI**.

**Flow:**

1. Log in to the app as admin (authority or backend signer wallet).
2. Open **Admin** → **Challenges** (`/admin/challenges`).
3. **Create a season** (optional): slug, name, start/end dates. Use this for seasonal events.
4. **Create a challenge**: slug, title, type (`daily` or `seasonal`), XP reward, and **config** as JSON.

**Config** is flexible. Examples:

- `{}` — generic “complete” (user clicks Complete in the UI).
- `{ "action": "complete_lesson", "courseId": "solana-101", "lessonCount": 1 }` — for future server-side checks (e.g. “Complete 1 lesson in Solana 101”).

Right now the backend does **not** auto-validate config (e.g. it doesn’t check lesson completion). It only records `UserChallengeCompletion` when the user hits “Complete”. So admins can create any challenge; the `config` is for future automation or display.

**Sanity** is used for **course content** (courses, modules, lessons, including in-lesson “challenge” type). Daily/seasonal **challenges** are a separate feature and stay in the backend DB + admin UI. You can later add a Sanity document type for “challenge template” and sync to backend if you want content editors to draft challenges in Sanity.

---

## 3. Running Playwright E2E tests

**Prerequisites:** App and backend running (for tests that hit APIs). E2E tests that only hit landing/discussions/courses/dashboard “connect wallet” can run with just the app.

**Option A: Dev server already running**

```bash
cd app
pnpm dev
# In another terminal:
cd app
pnpm test:e2e
```

By default, Playwright uses `baseURL: http://localhost:3000`. It does **not** start the dev server unless `CI` is set.

**Option B: CI (server started by Playwright)**

```bash
cd app
CI=1 pnpm test:e2e
```

This starts `pnpm dev` and runs tests when the app is ready.

**Useful commands:**

```bash
cd app
pnpm test:e2e                    # Run all E2E tests (Chromium)
pnpm test:e2e --project=chromium # Same, explicit
pnpm test:e2e:ui                 # Interactive UI mode (pick tests, watch)
pnpm test:e2e -- landing          # Only specs matching "landing"
```

**Note:** Tests under `e2e/` assume the app is at `http://localhost:3000`. For a different URL, set `PLAYWRIGHT_BASE_URL`:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3001 pnpm test:e2e
```

---

## 4. Optional: Install Playwright browsers (first-time)

If you haven’t installed Playwright’s browser yet:

```bash
cd app
pnpm exec playwright install chromium
```

Then run `pnpm test:e2e` as above.
