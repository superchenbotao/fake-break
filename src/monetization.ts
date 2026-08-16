/**
 * Monetization config for Fake Break.
 *
 * How money actually reaches you (the site owner):
 *   1. The SHARE-gated packs work today with zero setup — every unlock share
 *      spreads the link and grows traffic. Traffic is the asset you sell.
 *   2. The AD-gated packs ship with a built-in simulated rewarded ad so the
 *      feature works end-to-end right now. To collect real revenue, swap the
 *      simulated creative for a real rewarded-ad network:
 *
 *      a. Buy a custom domain (GitHub Pages subdomains are rarely approved
 *         by ad networks — a $10 domain is the difference between "site"
 *         and "property").
 *      b. Apply for Google AdSense and enable the Ad Placement API
 *         (rewarded format), or any H5 rewarded-ads network that accepts
 *         your content category. Note: tobacco-adjacent content is reviewed
 *         strictly — frame the site as a quit-smoking companion (it is one).
 *      c. Paste your client/slot IDs below and flip provider to "network",
 *         then load the network SDK where AdBreak mounts (see App.tsx).
 *
 *   3. Revenue pays out to YOUR ad-network account. This codebase never
 *      touches money, keys, or user data.
 *
 * Honest limitation: unlocks are verified client-side, so a determined user
 * can bypass them with devtools. For a playful ritual toy that is the right
 * trade-off; server-side verification would need a backend.
 */

export type UnlockRule =
  | { kind: "sessions"; count: number } // earn it by using the app
  | { kind: "share"; count: number } // earn it by spreading the app
  | { kind: "ad"; count: number }; // earn it by watching rewarded ads

export const AD_CONFIG = {
  /** "simulated" = built-in house creative; "network" = real ad SDK slot. */
  provider: "simulated" as "simulated" | "network",
  /** Fill these when provider is "network" (see header comment). */
  networkClientId: "",
  networkSlotId: "",
  /** Rewarded ads must not be skippable — this is the watch duration. */
  adSeconds: 6,
};

export type HouseAd = {
  brand: string;
  tagline: string;
  cta: string;
  accent: string;
  glow: string;
};

/**
 * Built-in creatives shown while provider is "simulated". They rotate so the
 * ad break still feels alive before a real network is connected. Replace or
 * remove once network ads go live.
 */
export const HOUSE_ADS: HouseAd[] = [
  {
    brand: "AirLungs™",
    tagline: "Breathe in. Breathe out. That’s the whole product.",
    cta: "Available everywhere, free forever",
    accent: "#8ab8ff",
    glow: "rgba(138, 184, 255, 0.25)",
  },
  {
    brand: "Cloud None",
    tagline: "0% vapor. 100% vibe. The emptiest cloud money can’t buy.",
    cta: "Now in invisible",
    accent: "#ffd95e",
    glow: "rgba(255, 217, 94, 0.22)",
  },
  {
    brand: "Fake Break Premium",
    tagline: "Your friends unlock packs faster when you share. Just saying.",
    cta: "Share this site",
    accent: "#db81ee",
    glow: "rgba(219, 129, 238, 0.22)",
  },
];
