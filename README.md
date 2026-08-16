# Fake Break

A playful, anti-smoking craving interrupter built with open-source
[Vite](https://vite.dev/) and React. The site is entirely static and deploys to
GitHub Pages directly from the versioned `docs/` build.

Live site: <https://gobang5.github.io/fake-break/>

## The ritual

- Pick from eight imaginary packs, each with its own color, flavor fiction, and unlock bar.
- Tear the foil, open the lid, and pull one of ten fake cigarettes from the pack.
- Light the virtual cigarette with synthesized match and ember sounds.
- Hold to take an air-only pull and grow the ember and ash.
- Optionally use on-device microphone level detection to drive the pull.
- Flick the ash with animation, sound, and haptic feedback.
- Hold to blow single, double, or halo smoke rings.
- Pass the smoke-free break to a friend with the Web Share API.
- Track local streaks, savings, body-recovery milestones, badges, and a
  daily dose of tough love on the dashboard.

## Local development

```bash
npm install
npm run dev
```

## Build and verify

```bash
npm test
```

The production site is written to `docs/`. Commit that folder after rebuilding
to publish it from the `main` branch with GitHub Pages.
