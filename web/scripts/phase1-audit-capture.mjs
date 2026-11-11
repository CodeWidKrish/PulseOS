import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const playwright = require("C:/Users/Niral Hingu/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright");
const { chromium } = playwright;

const AUDIT_DIR = path.resolve("./public/media/audit");
if (!fs.existsSync(AUDIT_DIR)) {
  fs.mkdirSync(AUDIT_DIR, { recursive: true });
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

async function runAudit() {
  console.log("=== Phase 1: Frontend Comprehensive Audit Capture ===");

  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });

  const auditResults = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n--- Viewport: ${vp.width}x${vp.height} (${vp.name}) ---`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });

    const page = await context.newPage();
    const consoleLogs = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" || msg.type() === "warning") {
        consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
      }
    });

    for (const r of ROUTES) {
      consoleLogs.length = 0;
      const targetUrl = `http://localhost:3000${r.path}`;
      let status = 200;
      try {
        const res = await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 8000 });
        status = res ? res.status() : 200;
        await page.waitForTimeout(1000);
      } catch (err) {
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
          hasHorizontalScroll,
          title: document.title,
        };
      });

      const shotFileName = `${r.name}-${vp.name}.png`;
      const shotPath = path.join(AUDIT_DIR, shotFileName);
      await page.screenshot({ path: shotPath, fullPage: true });

      const routeResult = {
        route: r.path,
        name: r.name,
        width: vp.width,
        status,
        hasHorizontalScroll: overflow.hasHorizontalScroll,
        scrollDiff: overflow.docWidth - overflow.winWidth,
        consoleErrors: [...consoleLogs],
        screenshot: `public/media/audit/${shotFileName}`,
      };

      auditResults.push(routeResult);
      console.log(`  Captured ${r.name} (${vp.width}px) -> Status: ${status}, Overflow: ${overflow.hasHorizontalScroll ? `YES (+${overflow.docWidth - overflow.winWidth}px)` : "NO"}, Console errors: ${consoleLogs.length}`);
    }

    await context.close();
  }

  await browser.close();

  fs.writeFileSync(
    path.join(AUDIT_DIR, "audit-summary.json"),
    JSON.stringify(auditResults, null, 2)
  );

  console.log("\nAudit capture completed! Results written to public/media/audit/audit-summary.json");
}

runAudit().catch((err) => {
  console.error("Audit capture failed:", err);
  process.exit(1);
});
