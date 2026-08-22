/**
 * A-Ads display ad unit (ID 2452940, adaptive size).
 *
 * A-Ads (aads.com) is a privacy-friendly network: no cookies, no tracking,
 * no personal data collection — so no consent banner is required and the
 * privacy policy stays short. Earnings accrue to the anonymous account in
 * AADS-ACCESS-CODE.txt; set a BTC withdrawal address in the A-Ads dashboard.
 *
 * The unit is a plain cross-origin iframe (A-Ads' official embed), so it
 * cannot touch our DOM, storage, or microphone. We render it only on the
 * browsing surfaces (home / packs) and never during the ritual itself.
 */
export default function AdBanner({ label = "Sponsored" }: { label?: string }) {
  return (
    <aside className="adBanner" aria-label="Advertisement">
      <span className="adBannerLabel">{label}</span>
      <div className="adBannerFrame">
        {/* BEGIN AADS AD UNIT 2452940 */}
        <iframe
          data-aa="2452940"
          src="//acceptable.a-ads.com/2452940/?size=Adaptive"
          title="Advertisement"
          loading="lazy"
          style={{
            border: 0,
            padding: 0,
            width: "70%",
            minWidth: 260,
            height: "auto",
            minHeight: 90,
            overflow: "hidden",
            display: "block",
            margin: "auto",
            background: "transparent",
          }}
        />
        {/* END AADS AD UNIT 2452940 */}
      </div>
    </aside>
  );
}
