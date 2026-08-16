# Fake Break

A playful, anti-smoking craving interrupter built with open-source
[Vite](https://vite.dev/) and React. The site is entirely static and deploys to
GitHub Pages directly from the versioned `docs/` build.

Live site: <https://fakebreak.win> (mirror: <https://superchenbotao.github.io/fake-break/>)

## The ritual

- Pick from eight imaginary packs, each with its own color, flavor fiction, and unlock rule.
- Three unlock tracks: grind (fake-break count), viral (share the site), and
  rewarded ads (watch a short sponsored break).
- Tear the foil, open the lid, and pull one of ten fake cigarettes from the pack.
- Light the virtual cigarette with synthesized match and ember sounds.
- Hold to take an air-only pull and grow the ember and ash.
- Optionally use on-device microphone level detection to drive the pull.
- Flick the ash with animation, sound, and haptic feedback.
- Hold to blow single, double, or halo smoke rings.
- Pass the smoke-free break to a friend with the Web Share API.
- Track local streaks, savings, body-recovery milestones, badges, and a
  daily dose of tough love on the dashboard.

## Monetization

Two pack tiers turn usage into revenue, both owned by the site operator:

- **Share-gated packs** (Main Character, Paper Trail) unlock when the visitor
  shares the site — a viral loop that grows traffic, which is the asset every
  ad network pays for. Works today with zero setup.
- **Ad-gated packs** (Gaslight, Midnight Snack, Old Money) unlock after a
  rewarded ad break. The built-in player currently shows rotating house
  creatives so the flow works end-to-end. To collect real payouts:

  1. Buy a custom domain — ad networks rarely approve `*.github.io`
     subdomains, and the domain is what makes the property yours.
  2. Apply for Google AdSense with the Ad Placement API (rewarded format),
     or any H5 rewarded-ads network. Frame the site as a quit-smoking
     companion; tobacco-adjacent content is reviewed strictly.
  3. Open `src/monetization.ts`, set `provider: "network"`, paste your
     client/slot IDs, and load the network SDK where the ad break mounts.

  Revenue pays out to your own ad-network account; this codebase never
  touches money, keys, or user data.

Unlocks are verified client-side (honor system — devtools can bypass them).
That is the right trade-off for a playful ritual toy; real enforcement would
need a backend.

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
