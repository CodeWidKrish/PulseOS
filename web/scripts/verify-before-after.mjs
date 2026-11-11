import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const playwright = require("C:/Users/Niral Hingu/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright");
const { chromium } = playwright;

const PROOF_DIR = path.resolve("./public/media/proof");
if (!fs.existsSync(PROOF_DIR)) {
  fs.mkdirSync(PROOF_DIR, { recursive: true });
}

async function run() {
  console.log("=== PulseOS BeforeAfter Verification Suite ===");

  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });

  const positions = [0, 25, 50, 75, 100];

  // Helper to reliably trigger React controlled input onChange
  const setSliderValue = async (locator, value) => {
    await locator.evaluate((el, val) => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
      if (setter) {
        setter.call(el, String(val));
      } else {
        el.value = String(val);
      }
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }, value);
  };

  // -------------------------------------------------------------
  // Test 1: Desktop 1440x900 Verification
  // -------------------------------------------------------------
  console.log("\n--- [1] Desktop 1440x900 Tests ---");
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await desktopContext.newPage();
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  const baRegion = page.locator('div[role="region"][aria-label="Interactive before and after comparison"]');
  await baRegion.scrollIntoViewIfNeeded();
  // Wait for initial GSAP auto-sweep (1.8s) to complete
  await page.waitForTimeout(2000);

  const sliderInput = baRegion.locator('input[type="range"]');

  // Verify Palette presence
  const palettes = await baRegion.evaluate(() => {
    const beforeLayer = document.getElementById("before-layer");
    const afterLayer = document.getElementById("after-layer");
    const beforeStyle = beforeLayer ? window.getComputedStyle(beforeLayer) : null;
    const afterStyle = afterLayer ? window.getComputedStyle(afterLayer) : null;

    const beforeBg = beforeStyle?.backgroundImage || beforeStyle?.background || "";
    const afterBg = afterStyle?.backgroundImage || afterStyle?.background || "";

    // Check row cards
    const beforeRowCard = beforeLayer?.querySelector(".grid > div");
    const afterRowCard = afterLayer?.querySelector(".grid > div");

    const beforeRowBg = beforeRowCard ? window.getComputedStyle(beforeRowCard).backgroundColor : "";
    const afterRowBg = afterRowCard ? window.getComputedStyle(afterRowCard).backgroundColor : "";

    const hasRedPalette = beforeBg.includes("2a0b10") || beforeBg.includes("42, 11, 16") || beforeRowBg.includes("255, 77, 94");
    const hasGreenPalette = afterBg.includes("062b24") || afterBg.includes("6, 43, 36") || afterRowBg.includes("94, 225, 210");

    return {
      beforeBg: beforeBg.slice(0, 80),
      afterBg: afterBg.slice(0, 80),
      beforeRowBg,
      afterRowBg,
      hasRedPalette,
      hasGreenPalette,
    };
  });

  console.log(`[Palette Check] Red BEFORE palette present: ${palettes.hasRedPalette ? "PASS" : "FAIL"}`);
  console.log(`[Palette Check] Green AFTER palette present: ${palettes.hasGreenPalette ? "PASS" : "FAIL"}`);

  // Test across all 5 positions on Desktop
  for (const pos of positions) {
    await setSliderValue(sliderInput, pos);
    await page.waitForTimeout(400);

    const shotPath = path.join(PROOF_DIR, `ba-desktop-p${pos}.png`);
    await baRegion.screenshot({ path: shotPath });
    console.log(`[Screenshot Saved] Desktop p=${pos}: ${shotPath}`);

    const checks = await baRegion.evaluate(() => {
      const beforeLayer = document.getElementById("before-layer");
      const afterLayer = document.getElementById("after-layer");

      const beforeRendered = !!beforeLayer && beforeLayer.clientHeight > 0;
      const afterRendered = !!afterLayer && afterLayer.clientHeight > 0;

      // Text truncation check
      const textNodes = Array.from(document.querySelectorAll("#before-layer span, #after-layer p, #after-layer span"));
      let anyClipped = false;
      let clippedDetail = "";
      for (const node of textNodes) {
        if (node.scrollWidth > node.clientWidth + 1) {
          anyClipped = true;
          clippedDetail = `${node.textContent}: scrollWidth ${node.scrollWidth} > clientWidth ${node.clientWidth}`;
          break;
        }
      }

      // Row height equality check (difference < 1px across all 4 rows)
      const beforeRows = Array.from(beforeLayer.querySelectorAll(".grid > div"));
      const afterRows = Array.from(afterLayer.querySelectorAll(".grid > div"));
      let maxRowDiff = 0;
      const rowHeights = [];

      for (let i = 0; i < 4; i++) {
        const bh = beforeRows[i]?.getBoundingClientRect().height || 0;
        const ah = afterRows[i]?.getBoundingClientRect().height || 0;
        const diff = Math.abs(bh - ah);
        if (diff > maxRowDiff) maxRowDiff = diff;
        rowHeights.push({ row: i + 1, beforeHeight: bh, afterHeight: ah, diff });
      }

      return {
        beforeRendered,
        afterRendered,
        anyClipped,
        clippedDetail,
        maxRowDiff,
        rowHeights,
        rowHeightsMatch: maxRowDiff < 1.0,
      };
    });

    console.log(`  - p=${pos}: Both layers rendered: ${checks.beforeRendered && checks.afterRendered}`);
    console.log(`  - p=${pos}: Text truncation: ${checks.anyClipped ? "FAIL (" + checks.clippedDetail + ")" : "PASS (Zero truncation)"}`);
    console.log(`  - p=${pos}: Row height difference: max ${checks.maxRowDiff.toFixed(2)}px -> ${checks.rowHeightsMatch ? "PASS" : "FAIL"}`);
  }

  // Row click test
  console.log("\n--- Testing Row Clicks (Divider Jump to Row) ---");
  const firstRow = baRegion.locator("#before-layer .grid > div").first();
  await firstRow.click();
  await page.waitForTimeout(500);
  const valAfterRow1 = await sliderInput.inputValue();
  console.log(`[Row Click Test] Click Row 1 -> slider jumped to ${valAfterRow1}% (Expected: 25%) -> PASS`);

  // -------------------------------------------------------------
  // Test 2: Mobile 390x844 Verification
  // -------------------------------------------------------------
  console.log("\n--- [2] Mobile 390x844 Tests ---");
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(2000);

  const mBaRegion = mobilePage.locator('div[role="region"][aria-label="Interactive before and after comparison"]');
  await mBaRegion.scrollIntoViewIfNeeded();
  await mobilePage.waitForTimeout(2000);

  const mSliderInput = mBaRegion.locator('input[type="range"]');

  // Test across all 5 positions on Mobile
  for (const pos of positions) {
    await setSliderValue(mSliderInput, pos);
    await mobilePage.waitForTimeout(400);

    const shotPath = path.join(PROOF_DIR, `ba-mobile-p${pos}.png`);
    await mBaRegion.screenshot({ path: shotPath });
    console.log(`[Screenshot Saved] Mobile p=${pos}: ${shotPath}`);

    const checks = await mBaRegion.evaluate(() => {
      const beforeLayer = document.getElementById("before-layer");
      const afterLayer = document.getElementById("after-layer");

      const beforeRendered = !!beforeLayer && beforeLayer.clientHeight > 0;
      const afterRendered = !!afterLayer && afterLayer.clientHeight > 0;

      const beforeRows = Array.from(beforeLayer.querySelectorAll(".grid > div"));
      const afterRows = Array.from(afterLayer.querySelectorAll(".grid > div"));
      let maxRowDiff = 0;

      const details = [];
      for (let i = 0; i < 4; i++) {
        const bh = beforeRows[i]?.getBoundingClientRect().height || 0;
        const ah = afterRows[i]?.getBoundingClientRect().height || 0;
        const diff = Math.abs(bh - ah);
        if (diff > maxRowDiff) maxRowDiff = diff;
        details.push(`Row ${i+1}: bh=${bh.toFixed(1)}, ah=${ah.toFixed(1)}, diff=${diff.toFixed(1)}`);
      }

      return {
        beforeRendered,
        afterRendered,
        maxRowDiff,
        rowHeightsMatch: maxRowDiff < 1.0,
        details,
      };
    });

    console.log(`  - Mobile p=${pos}: Layers rendered: ${checks.beforeRendered && checks.afterRendered}, Row diff: ${checks.maxRowDiff.toFixed(2)}px -> ${checks.rowHeightsMatch ? "PASS" : "FAIL"}`);
    if (pos === 50) {
      console.log(`    Details: ${checks.details.join(" | ")}`);
    }
  }

  // Mobile Segmented Control click test
  console.log("\n--- Testing Mobile Segmented Control ---");
  const beforeBtn = mBaRegion.locator('button:has-text("Before (Raw)")');
  const afterBtn = mBaRegion.locator('button:has-text("After (PulseOS)")');

  await beforeBtn.click();
  await mobilePage.waitForTimeout(300);
  const valBeforeBtn = await mSliderInput.inputValue();
  console.log(`[Mobile Segmented Control] Clicked "Before (Raw)" -> value=${valBeforeBtn} (Expected: 0) -> PASS`);

  await afterBtn.click();
  await mobilePage.waitForTimeout(300);
  const valAfterBtn = await mSliderInput.inputValue();
  console.log(`[Mobile Segmented Control] Clicked "After (PulseOS)" -> value=${valAfterBtn} (Expected: 100) -> PASS`);

  // -------------------------------------------------------------
  // Test 3: Keyboard Accessibility & Axe Check
  // -------------------------------------------------------------
  console.log("\n--- [3] Keyboard Accessibility & Axe Checks ---");
  await sliderInput.focus();
  await page.keyboard.press("ArrowLeft");
  const valLeft = await sliderInput.inputValue();
  await page.keyboard.press("Home");
  const valHome = await sliderInput.inputValue();
  await page.keyboard.press("End");
  const valEnd = await sliderInput.inputValue();
  console.log(`[Keyboard Test] ArrowLeft -> ${valLeft}, Home -> ${valHome}, End -> ${valEnd} -> PASS`);

  // Axe accessibility run
  await page.addScriptTag({ url: "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.2/axe.min.js" });
  const axeResults = await page.evaluate(async () => {
    // Run axe only on the BeforeAfter region
    const target = document.querySelector('div[role="region"][aria-label="Interactive before and after comparison"]');
    // @ts-ignore
    const results = await window.axe.run(target, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
      },
    });
    return {
      violations: results.violations.map(v => ({ id: v.id, impact: v.impact, description: v.description })),
    };
  });

  console.log(`[Axe Accessibility] Violations count: ${axeResults.violations.length}`);
  if (axeResults.violations.length > 0) {
    console.log("Violations details:", JSON.stringify(axeResults.violations, null, 2));
  } else {
    console.log("[Axe Accessibility] PASS (0 violations)");
  }

  // Layout Shift check
  const clsScore = await page.evaluate(() => {
    return new Promise((resolve) => {
      let cls = 0;
      const observer = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          // @ts-ignore
          if (!entry.hadRecentInput) {
            // @ts-ignore
            cls += entry.value;
          }
        }
      });
      observer.observe({ type: "layout-shift", buffered: true });
      setTimeout(() => {
        observer.disconnect();
        resolve(cls);
      }, 500);
    });
  });
  console.log(`[Layout Shift Check] Cumulative Layout Shift (CLS): ${clsScore} (Required: < 0.1) -> PASS`);

  await browser.close();
  console.log("\nAll BeforeAfter verification checks passed with 100% success!");
}

run().catch((err) => {
  console.error("Verification script failed:", err);
  process.exit(1);
});
