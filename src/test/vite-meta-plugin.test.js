// P5 — brand-aware metadata. Verifies the meta plugin builds a full tag set from
// env-driven config and replaces the index.html placeholders end-to-end.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { metaPlugin } from "../../scripts/vite-meta-plugin.js";

const SAMPLE = `<!doctype html><html><head>
<title>NeonBet Casino</title>
<!--META_BLOCK-->
</head><body></body></html>`;

describe("P5 metadata plugin", () => {
  const prev = { ...process.env };

  afterEach(() => {
    process.env = { ...prev };
  });

  it("injects title, description, canonical, theme-color, og:*, twitter:* from env config", () => {
    process.env.VITE_BRAND_NAME = "TestBrand";
    process.env.VITE_META_TITLE = "TestBrand Casino";
    process.env.VITE_SITE_URL = "https://example.com/";
    process.env.VITE_META_DESCRIPTION = "A test description.";
    process.env.VITE_THEME_COLOR = "#020617";
    process.env.VITE_SOCIAL_PREVIEW = "https://example.com/preview.png";

    const out = metaPlugin().transformIndexHtml(SAMPLE);
    expect(out).toContain("<title>TestBrand Casino</title>");
    expect(out).toContain('name="description"');
    expect(out).toContain('rel="canonical" href="https://example.com/"');
    expect(out).toContain('name="theme-color" content="#020617"');
    expect(out).toContain('property="og:title" content="TestBrand Casino"');
    expect(out).toContain('property="og:image" content="https://example.com/preview.png"');
    expect(out).toContain('property="og:site_name" content="TestBrand"');
    expect(out).toContain('name="twitter:card" content="summary_large_image"');
    expect(out).toContain('name="twitter:image"');
  });

  it("removes the META_BLOCK placeholder after injection", () => {
    const out = metaPlugin().transformIndexHtml(SAMPLE);
    expect(out).not.toContain("<!--META_BLOCK-->");
  });

  it("uses safe defaults when env vars are unset", () => {
    delete process.env.VITE_BRAND_NAME;
    delete process.env.VITE_META_TITLE;
    const out = metaPlugin().transformIndexHtml(SAMPLE);
    expect(out).toContain("NeonBet");
  });
});
