import assert from "node:assert/strict";
import test from "node:test";

import {
  ASH_MAX_HEIGHT_PX,
  getAttachedAshHeightPx,
  getBurnOffsetPx,
} from "../src/ashPhysics.ts";

test("the entire ash cluster follows the burn front during a pull", () => {
  const earlyBurn = 14;
  const lateBurn = 26;
  const earlyTop = getBurnOffsetPx(earlyBurn) - getAttachedAshHeightPx(earlyBurn, 0, 48);
  const lateTop = getBurnOffsetPx(lateBurn) - getAttachedAshHeightPx(lateBurn, 0, 88);

  assert.ok(lateTop > earlyTop, "ash should move down while the ember advances");
});

test("ash is hidden before it forms and never exceeds its visual cap", () => {
  assert.equal(getAttachedAshHeightPx(20, 0, 0.99), 0);
  assert.equal(getAttachedAshHeightPx(100, 0, 100), ASH_MAX_HEIGHT_PX);
});

test("a flick resets the next ash segment to the current burn front", () => {
  const burnAtFlick = 37;

  assert.equal(getAttachedAshHeightPx(burnAtFlick, burnAtFlick, 0), 0);
  assert.ok(getAttachedAshHeightPx(49, burnAtFlick, 42) > 0);
});
