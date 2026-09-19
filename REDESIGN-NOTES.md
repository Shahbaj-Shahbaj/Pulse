# Pulse — Frontend Redesign Notes

The backend is byte-for-byte unchanged. Everything below happened inside `frontend/`.

## Files changed

| File | Status | What changed |
|---|---|---|
| `frontend/index.html` | rewritten | Title → "Pulse — Share what moves you", SVG favicon, `theme-color`, added Plus Jakarta Sans, `viewport-fit=cover` |
| `frontend/package.json` | edited | `name` → `pulse-frontend` (dependencies untouched) |
| `frontend/src/index.css` | rewritten | Complete design system: tokens, light/dark themes, components, responsive layers |
| `frontend/src/App.jsx` | rewritten | Branded route loader, `/explore` + 404 routes, `replace` on redirects |
| `frontend/src/component/Layout.jsx` | rewritten | Top nav + side rail + mobile tab bar (replaces the old off-canvas sidebar) |
| `frontend/src/component/PostCard.jsx` | rewritten | New card design; API handlers unchanged |
| `frontend/src/component/ToastContainer.jsx` | rewritten | Icon-based toasts |
| `frontend/src/component/Brand.jsx` | **new** | Pulse logo mark + wordmark |
| `frontend/src/component/ui.jsx` | **new** | Avatar, EmptyState, Loader, PostSkeleton |
| `frontend/src/component/AuthAside.jsx` | **new** | Split-screen auth marketing panel |
| `frontend/src/pages/Login.jsx` | rewritten | Split-screen design, password reveal, inline errors |
| `frontend/src/pages/Register.jsx` | rewritten | Split-screen design, password strength meter |
| `frontend/src/pages/Home.jsx` | rewritten | Composer teaser, tag chips, trending rail, skeletons, error state |
| `frontend/src/pages/CreatePost.jsx` | rewritten | Gradient hero, mood picker, tag preview, location control |
| `frontend/src/pages/Profile.jsx` | rewritten | Cover/avatar hero, stat cards, post list |
| `frontend/src/pages/Bookmarks.jsx` | rewritten | New header, skeleton + empty + error states |
| `frontend/src/pages/Explore.jsx` | **new** | Dedicated search page using the existing `GET /posts` query params |
| `frontend/src/pages/NotFound.jsx` | **new** | 404 inside the app shell |
| `frontend/src/hooks/useTheme.jsx` | edited | Storage key `pulse_theme` (falls back to the old `ss_theme`), respects OS preference, syncs `theme-color` |
| `README.md` | edited | Branding only |

Untouched: `src/main.jsx`, `src/assets/api.js`, `src/hooks/useAuth.jsx`, `src/hooks/useToast.js`, `vite.config.js`, `vercel.json`, and the whole `backend/` folder.

## Design system

- Primary: deep indigo/violet (`#6d45f0`), accent: electric blue (`#0d8bff`), brand gradient across both.
- Type: Plus Jakarta Sans for display, Inter for body.
- Rounded cards (16–28px), layered shadows, 140–420ms transitions, reduced-motion support.
- Light and dark themes are both authored explicitly, not derived by inversion.

## Responsive behaviour

| Breakpoint | Layout |
|---|---|
| > 1180px | Top nav + labelled side rail + right trending rail |
| 1024–1180px | Top nav + side rail, right rail hidden |
| 760–1024px | Icon-only side rail, auth becomes single-column |
| < 760px | Bottom tab bar with centre "Create" action, stacked profile header, full-width controls |

## Endpoints used (unchanged)

`GET /auth/me`, `POST /auth/login`, `POST /auth/register`, `POST /auth/logout`,
`GET /posts`, `GET /posts/user/:id`, `POST /posts`, `DELETE /posts/:id`,
`PATCH /posts/:id/like`, `PATCH /posts/:id/bookmark`, `POST /posts/:id/comments`.
