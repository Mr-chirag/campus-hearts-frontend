# Campus Hearts — Web

The Next.js website. A **standalone project**, separate from the Expo app in
`../rungtaHeartz`. Both clients are alive, both talk to the same Express backend
in `../backend`, and they share **no code** — see the dual-client contract in
`../WEB_MIGRATION_PLAN.md` §1a.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Zustand ·
axios · socket.io-client · Framer Motion · Radix UI · sonner

## Dev data

`backend/seedDevUsers.js` adds 8 test students without touching real accounts:

```bash
cd ../backend
node seedDevUsers.js          # add   (idempotent; password: Password123)
node seedDevUsers.js --clean  # remove only the seeded cohort
```

**Do not use `npm run data:import`** — that seeder calls `User.deleteMany()` and
wipes every real account.

## Running it

```bash
npm install
cp .env.example .env.local     # then point NEXT_PUBLIC_SERVER_URL at the backend
npm run dev                    # http://localhost:3000
```

The backend must be running separately:

```bash
cd ../backend && npm run dev   # :5000
```

| Script | What it does |
|---|---|
| `npm run dev` | dev server on :3000 (Turbopack) |
| `npm run build` | production build |
| `npm start` | serve the production build |
| `npm run lint` | ESLint (React 19 rules — these catch real bugs, don't disable) |
| `npx tsc --noEmit` | typecheck |

## Environment

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SERVER_URL` | yes | Backend **origin**. No trailing slash, no `/api`. Socket.io connects here. |
| `NEXT_PUBLIC_API_URL` | no | Defaults to `<SERVER_URL>/api`. |
| `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS` | no | Mirrors the backend's allowlist for client-side validation. `*` disables. Default `rungta.org`. |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | no | Publishable key only, and only as a fallback — the server returns `key_id` on create-order. |

**No secret may ever go in a `NEXT_PUBLIC_*` variable** — they are inlined into
the browser bundle. `RAZORPAY_KEY_SECRET` and `JWT_SECRET` belong to the backend
and must never appear in this project.

## Architecture

```
app/            routes. (app)/ is the signed-in shell, (auth)/ the logged-out one
components/ui   design-system primitives
components/layout  Sidebar, BottomTabBar, AppHeader, AuthGuard, Providers
services/       axios instance, socket, and one *.api.ts per backend router
store/          one Zustand store per domain (ported from the app)
lib/            token, validation, time, cn, cloudinary loader
hooks/          useSocketEvent, useMediaQuery, useDebouncedCallback
types/          domain types mirroring the API
proxy.ts        edge redirect on auth-cookie presence (Next 16's middleware)
```

### Rules that are not style preferences

1. **One component tree.** Never fork a screen into `Mobile*`/`Desktop*`.
   Layout differs by Tailwind breakpoint. The only two exceptions are
   `<ResponsiveSheet>` (dialog ⇄ drawer) and the nav pair, which both render
   from the same `NAV_ITEMS` array.
2. **Never call `socket.on()` in a component.** Use `useSocketEvent` — it
   cleans up, and without it React StrictMode double-registers every handler
   and messages render twice.
3. **Chat send is POST-then-emit.** The server does not broadcast on message
   creation; it only rebroadcasts. Skipping the socket emit silently breaks
   realtime delivery.
4. **Errors go through `uiStore.setError()`**, rendered by the one global
   `<ErrorModal />`. Stores catch → `console.error` the payload → `setError` →
   re-throw. Screens stay presentational.
5. **`profileStore.fetchProfile` must keep hitting the network** even on a
   cache hit — the GET is what records a profile view and feeds Analytics.
6. **Never widen the profile update payload.** The server whitelists
   `full_name, bio, semester, branch, interests, photos` plus the boolean
   settings. `is_premium`, `is_email_verified` and `is_active` live on the same
   document.
7. **Anonymity masks at every egress.** The sentinel id is `'anonymous'`, never
   a real `_id`. Never construct a profile link from a masked user.
8. **Use `100dvh`, never `100vh`** (`h-dvh-safe`). Mobile Safari's collapsing
   URL bar clips the chat composer otherwise.
9. **The backend serves two clients.** Any backend change must be additive and
   app-compatible.
10. **Premium gates are enforced SERVER-SIDE**, never only in the UI. Seen
    receipts are stripped in `getMessages`, viewer identities are masked in
    `getWhoViewedMe`, `seen_off` is refused with a 403, and the swipe quota is
    checked before the upsert. A gate that only exists in React is one curl
    away from being bypassed.
11. **Swipe quotas come from env vars** (`FREE_LIKES_PER_DAY` etc.), not
    constants — a like cap does nothing until the pool is bigger than the cap,
    so the numbers need to change without a redeploy.

## Phase status

Tracked in `../WEB_MIGRATION_PLAN.md`.

- [x] **Phase 1** — foundation, design tokens, platform adapters, stores, UI kit, app shell
- [x] **Phase 2** — marketing landing, login, 4-step signup wizard, route protection
- [x] **Phase 3** — swipe deck (drag/buttons/keyboard), match modal, matches list + desktop split-view
- [x] **Phase 4** — realtime chat (POST-then-emit, typing, seen receipts, ghost read, reconnect)
- [x] **Phase 5** — confessions, polls, top profiles, random chat
- [x] **Phase 6** — profile, edit w/ photo reorder, settings, analytics, Razorpay web checkout
- [x] **Phase 7** — PWA (installable), error boundaries, route skeletons, a11y, bundle split
- [ ] Phase 8 — backend adaptation & deployment
- [ ] Phase 9 — hardening, QA, launch
Deployment sync
