# Go Business Referral Dashboard

A React + Vite single-page application for tracking referrals, earnings, and partner activity.

## Tech stack

- React 18 (functional components + hooks)
- Vite
- React Router DOM (client-side routing)
- js-cookie (JWT storage)
- Plain CSS (no UI framework)

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 3. Build for production

```bash
npm run build
```

### 4. Preview the production build

```bash
npm run preview
```

## Test credentials

```
Email:    admin@example.com
Password: admin123
```

## Project structure

```
src/
  api/
    referrals.js          # signIn + fetchReferrals API helpers
  components/
    Navbar/
    Footer/
    ProtectedRoute/
  pages/
    Login/
    Dashboard/
    ReferralDetails/
    NotFound/
  App.jsx                  # BrowserRouter + route definitions
  main.jsx                 # renders <App />
  index.css                # global styles
```

## Routing

| Path             | Access     | Notes                                      |
|------------------|------------|---------------------------------------------|
| `/login`         | Public     | Redirects to `/` if already authenticated  |
| `/`               | Protected  | Dashboard                                  |
| `/referral/:id`  | Protected  | Referral details                           |
| `*`              | Public     | 404 Not Found (never wrapped in a guard)   |

Authentication is handled via a `jwt_token` cookie set after a successful sign-in. `ProtectedRoute` checks for this cookie and redirects unauthenticated visitors to `/login`.

## API

Base URL: `https://v9fes04dwf.execute-api.eu-north-1.amazonaws.com/api`

- `POST /auth/signin` — authenticates and returns a JWT token.
- `GET /referrals` — returns metrics, service summary, referral (link/code), and the referrals list. Supports `search`, `sort` (`asc`/`desc`), and `id` query params. All requests other than sign-in require an `Authorization: Bearer <token>` header.

Pagination (10 rows per page) is implemented entirely on the client, since the API always returns the full array of referrals.

## Notes

- The sign-in button is never disabled due to empty fields — every click triggers an API call so users see the API's own validation message.
- Dates are normalized from ISO strings to `YYYY/MM/DD`.
- Currency values use `Intl.NumberFormat` with `style: "currency"`, `currency: "USD"`, and `maximumFractionDigits: 0`.

Demo Link:
https://go-business-referral-dashboard-umiy-8jlfbwkb6.vercel.app/
