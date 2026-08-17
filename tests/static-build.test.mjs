import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

test("builds a self-contained static site", async () => {
  const html = await readFile(new URL("../docs/index.html", import.meta.url), "utf8");
  const assets = await readdir(new URL("../docs/assets/", import.meta.url));

  assert.match(html, /<title>Fake Break — Skip the Smoke, Keep the Ritual<\/title>/);
  assert.match(html, /property="og:image"/);
  assert.doesNotMatch(html, /__SITE_URL__/);
  assert.ok(assets.some((file) => file.endsWith(".js")));
  assert.ok(assets.some((file) => file.endsWith(".css")));
});

test("ships the complete interactive ritual and synthesized sound", async () => {
  const source = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");

  for (const control of [
    "Tap to light",
    "Hold to inhale",
    "Flick ash",
    "Smoke rings",
    "Pass it on",
    "Mic puff",
  ]) {
    assert.ok(source.includes(control), `missing control: ${control}`);
  }
  assert.match(source, /new AudioCtor\(\)/);
  assert.match(source, /createBufferSource\(\)/);
  assert.match(source, /getUserMedia\(/);
});
