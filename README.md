# Trainmate

Mobile-first, self-hosted **workout-tracking PWA**. Log every set with minimal friction and review
your progress over time. Built to run on a Raspberry Pi (Docker + Postgres), exposed over HTTPS, and
installable to your phone's home screen.

> **Status:** rebuilding from scratch on the `rebuild` branch. The full, decision-locked spec lives
> in [`Context/build/`](Context/build/) — read [`CLAUDE.md`](CLAUDE.md) and
> [`Context/build/00-overview.md`](Context/build/00-overview.md) first.

## Stack

SvelteKit + Svelte 5 (runes) · TypeScript · PostgreSQL · Drizzle ORM · better-auth (email+password) ·
`adapter-node` · Vitest + `vitest-browser-svelte` · Playwright · Docker.

## Develop

```bash
npm install
npm run dev            # http://localhost:5173
```

## Scripts

| Command             | What it does                                                                    |
| ------------------- | ------------------------------------------------------------------------------- |
| `npm run dev`       | Dev server                                                                      |
| `npm run build`     | Production build (adapter-node → `build/`)                                       |
| `npm run preview`   | Preview the production build                                                    |
| `npm run check`     | `svelte-check` / type-check                                                     |
| `npm run lint`      | Prettier check + ESLint                                                         |
| `npm run format`    | Prettier write                                                                  |
| `npm run test:unit` | Vitest (unit + component, requires Chromium: `npx playwright install chromium`) |
| `npm run test:e2e`  | Playwright end-to-end                                                           |
| `npm run test`      | Unit + e2e                                                                      |

## Deployment

Runs as a Node server in Docker alongside Postgres on a Raspberry Pi, reached over HTTPS via a
Cloudflare Tunnel (recommended) or a Caddy reverse proxy. See
[`Context/build/02-architecture.md`](Context/build/02-architecture.md).
