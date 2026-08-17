export const BURN_TRAVEL_PX_PER_PERCENT = 1.6;
export const ASH_VISIBLE_THRESHOLD = 1;
export const ASH_MAX_HEIGHT_PX = 26;

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

export function getBurnOffsetPx(burnPercent: number) {
  return clamp(burnPercent, 0, 100) * BURN_TRAVEL_PX_PER_PERCENT;
}

export function getAttachedAshHeightPx(
  burnPercent: number,
  ashAnchorBurnPercent: number,
  ashPercent: number,
) {
  if (ashPercent < ASH_VISIBLE_THRESHOLD) return 0;

  // Keep the ash as a short, loose cluster attached to the moving burn front.
  // It grows more slowly than the consumed paper, so the whole cluster moves
  // down continuously with the ember instead of becoming a fixed grey column.
  const consumedSinceFlick = Math.max(0, burnPercent - ashAnchorBurnPercent);
  const consumedPx = consumedSinceFlick * BURN_TRAVEL_PX_PER_PERCENT;
  const formed = clamp(
    (ashPercent - ASH_VISIBLE_THRESHOLD) / (100 - ASH_VISIBLE_THRESHOLD),
    0,
    1,
  );
  const desiredHeight = 3.5 + formed * (ASH_MAX_HEIGHT_PX - 3.5);
  const availableHeight = 3 + consumedPx * 0.55;

  return Math.min(desiredHeight, availableHeight, ASH_MAX_HEIGHT_PX);
}
