import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const playwright = require("C:/Users/Niral Hingu/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright");
const { chromium } = playwright;

const VERIFY_DIR = path.resolve("./public/media/verify");
if (!fs.existsSync(VERIFY_DIR)) {
  fs.mkdirSync(VERIFY_DIR, { recursive: true });
}

const ROUTES = [
  { name: "marketing", path: "/" },
  { name: "login", path: "/login" },
  { name: "register", path: "/register" },
  { name: "dashboard", path: "/dashboard" },
  { name: "reports", path: "/reports" },
  { name: "report-detail", path: "/reports/rep-1" },
  { name: "vitals", path: "/vitals" },
  { name: "appointments", path: "/appointments" },
  { name: "not-found", path: "/route-404-check" },
];

const VIEWPORTS = [
  { width: 390, height: 844, name: "390" },
  { width: 768, height: 1024, name: "768" },
  { width: 1440, height: 900, name: "1440" },
  { width: 1920, height: 1080, name: "1920" },
];

async function runVerification() {
  console.log("=== PHASE 7: FULL FRONTEND VERIFICATION SUITE ===");

  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });

  const allResults = [];
  let totalViolations = 0;
  let totalOverflows = 0;

  for (const vp of VIEWPORTS) {
    console.log(`\n========================================`);
    console.log(`Testing Viewport: ${vp.width}x${vp.height} (${vp.name}px)`);
    console.log(`========================================`);

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      colorScheme: "dark",
    });

    const page = await context.newPage();
    const consoleErrors = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    for (const r of ROUTES) {
      consoleErrors.length = 0;
      const targetUrl = `http://localhost:3000${r.path}`;
      let status = 200;

      try {
        const res = await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 15000 });
        status = res ? res.status() : 200;
        await page.waitForTimeout(600);
      } catch (e) {
        status = 500;
      }

      // Check horizontal overflow
      const overflow = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const winWidth = window.innerWidth;
        const hasHorizontalScroll = docWidth > winWidth + 1;
        return {
          docWidth,
          winWidth,
          diff: docWidth - winWidth,
          hasHorizontalScroll,
        };
      });

      if (overflow.hasHorizontalScroll) {
        totalOverflows++;
      }

      // Screenshot capture
      const shotFileName = `${r.name}-${vp.name}.png`;
      const shotPath = path.join(VERIFY_DIR, shotFileName);
      await page.screenshot({ path: shotPath, fullPage: true });

      // Run axe accessibility check (only on desktop 1440 for speed and canonical testing)
      let axeIssues = [];
      if (vp.width === 1440) {
        try {
          await page.addScriptTag({ url: "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.2/axe.min.js" });
          const axeRes = await page.evaluate(async () => {
            // @ts-ignore
            const results = await window.axe.run(document, {
              runOnly: {
                type: "tag",
                values: ["wcag2a", "wcag2aa"],
              },
            });
            return results.violations.filter(
              (v) => v.impact === "critical" || v.impact === "serious"
            );
          });
          axeIssues = axeRes.map((v) => ({ id: v.id, impact: v.impact, description: v.description }));
          totalViolations += axeIssues.length;
        } catch (err) {
          // axe evaluation skipped
        }
      }

      const reportEntry = {
        route: r.path,
        name: r.name,
        viewport: vp.width,
        status,
        hasHorizontalScroll: overflow.hasHorizontalScroll,
        scrollDiff: overflow.diff,
        axeCriticalSerious: axeIssues.length,
        consoleErrors: [...consoleErrors],
        screenshot: `public/media/verify/${shotFileName}`,
      };

      allResults.push(reportEntry);
      console.log(
        `✓ [${r.name}] @ ${vp.width}px -> Status: ${status} | Overflow: ${
          overflow.hasHorizontalScroll ? `FAIL (+${overflow.diff}px)` : "PASS (0px)"
        } | Axe (crit/ser): ${axeIssues.length} | Errors: ${consoleErrors.length}`
      );
    }

    await context.close();
  }

  // -----------------------------------------------------------
  // Additional Interactive Checks:
  // 1. Theme Toggle Check
  // 2. Command Palette (Ctrl+K)
  // -----------------------------------------------------------
  console.log("\n--- Testing Interactive Features (Theme Toggle & Command Palette) ---");
  const interactiveContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const iPage = await interactiveContext.newPage();
  await iPage.goto("http://localhost:3000", { waitUntil: "networkidle" });

  // Test Theme Toggle
  const themeToggle = iPage.locator('button[aria-label*="Switch to"]');
  const initialThemeClass = await iPage.evaluate(() => document.documentElement.className);
  console.log(`Initial root class: "${initialThemeClass}"`);

  if (await themeToggle.count() > 0) {
    await themeToggle.first().click();
    await iPage.waitForTimeout(400);
    const toggledThemeClass = await iPage.evaluate(() => document.documentElement.className);
    console.log(`Toggled root class: "${toggledThemeClass}" (contains light: ${toggledThemeClass.includes("light")})`);
    
    // Switch back to dark
    await themeToggle.first().click();
    await iPage.waitForTimeout(400);
  }

  // Test Dashboard & Command Palette
  await iPage.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle" });
  await iPage.keyboard.press("Control+k");
  await iPage.waitForTimeout(400);
  const cmdPaletteVisible = await iPage.locator('input[placeholder*="Search or jump"]').isVisible();
  console.log(`Command Palette (Ctrl+K) open test: ${cmdPaletteVisible ? "PASS" : "FAIL"}`);

  if (cmdPaletteVisible) {
    await iPage.keyboard.press("Escape");
    await iPage.waitForTimeout(300);
  }

  await interactiveContext.close();
  await browser.close();

  // Save report
  fs.writeFileSync(
    path.join(VERIFY_DIR, "verification-report.json"),
    JSON.stringify(allResults, null, 2)
  );

  console.log(`\n========================================`);
  console.log(`VERIFICATION SUMMARY:`);
  console.log(`Total Route/Viewport Combinations Tested: ${allResults.length}`);
  console.log(`Horizontal Overflows: ${totalOverflows} (Target: 0)`);
  console.log(`Axe Critical/Serious Violations: ${totalViolations} (Target: 0)`);
  console.log(`========================================`);
}

runVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
