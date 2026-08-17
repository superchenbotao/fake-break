# Contributing to Fake Break

Thanks for helping build the world's most honest cigarette. Keep it playful, keep it fake.

## Setup

```bash
npm install
npm run dev        # local dev server
npm run lint       # must pass before pushing
npm test           # must pass before pushing
npm run build      # outputs the static site to docs/
```

## Branching

- `main` is always deployable. Do not push directly to `main`.
- Work on a feature branch: `feature/short-slug` or `codex/short-slug`.
- Open a pull request; keep it small enough to review in one sitting.

## Deployment (important)

- GitHub Pages serves **`docs/` from `main`** — that directory is a build artifact, not source.
- **Never hand-edit `docs/`.** Run `npm run build` and commit the result.
- **Only one person rebuilds `docs/` per merge** — ideally whoever merges the PR. If your PR touches built assets, expect conflicts; leave `docs/` out of your branch and let the merger rebuild.
- Source of truth lives in `src/`, `index.html`, `public/`. Everything else is generated.

## Code style

- TypeScript strict; ESLint must stay clean (`npm run lint`).
- UI copy is English-only, written for a global audience — dry humor welcome.
- All state is client-side (`localStorage`). No backend, no trackers.
- Keep the ritual honest: no real tobacco imagery, the site is a quit-smoking companion.

## Monetization touchpoints

- Pack unlock rules: `PACKS` in `src/App.tsx`.
- Ad + supporter config: `src/monetization.ts` — see the header comments before editing.
- New packs need: unique `id`, a `motif` (sunburst / stripes / dots / waves), cigarette styling (`stick`, `paperTint`, `filterColor`, `bandColor`), and an unlock rule.

## Tests

Add a test in `test/` when you change ritual mechanics (burn, ash, unlock logic). Run `npm test`.
