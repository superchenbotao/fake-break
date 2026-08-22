/**
 * A-Ads display ad units (aads.com, adaptive size).
 *
 * A-Ads is a privacy-friendly network: no cookies, no tracking, no personal
 * data collection — so no consent banner is required and the privacy policy
 * stays short. Earnings accrue to the owner's A-Ads account (user #514478)
 * and pay out in BTC once a withdrawal address is set in the dashboard.
 *
 * Each placement gets its own unit ID so the dashboard shows per-slot stats:
 *   2452943 — home view footer
 *   2452944 — packs view footer
 *
 * The unit is a plain cross-origin iframe (A-Ads' official embed), so it
 * cannot touch our DOM, storage, or microphone. We render it only on the
 * browsing surfaces (home / packs) and never during the ritual itself.
 */
export default function AdBanner({
  unitId,
  label = "Sponsored",
}: {
  unitId: string;
  label?: string;
}) {
  return (
    <aside className="adBanner" aria-label="Advertisement">
      <span className="adBannerLabel">{label}</span>
      <div className="adBannerFrame">
        {/* BEGIN AADS AD UNIT {unitId} */}
        <iframe
          data-aa={unitId}
          src={`//acceptable.a-ads.com/${unitId}/?size=Adaptive`}
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
        {/* END AADS AD UNIT {unitId} */}
      </div>
    </aside>
  );
}
