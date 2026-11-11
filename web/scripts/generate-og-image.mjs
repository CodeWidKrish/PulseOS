import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const playwright = require("C:/Users/Niral Hingu/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright");
const { chromium } = playwright;

async function generateOGImage() {
  console.log("Generating 1200x630 OpenGraph social image...");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const ogHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 1200px;
            height: 630px;
            background: #07090D;
            color: #F2F4F7;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 80px;
            position: relative;
            overflow: hidden;
          }
          .glow {
            position: absolute;
            top: -150px;
            right: -100px;
            width: 600px;
            height: 600px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255, 77, 94, 0.22) 0%, rgba(94, 225, 210, 0.12) 50%, transparent 70%);
            filter: blur(40px);
          }
          .brand {
            display: flex;
            align-items: center;
            gap: 14px;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.03em;
            color: #F2F4F7;
          }
          .dot {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #FF4D5E;
            box-shadow: 0 0 20px #FF4D5E;
          }
          .title {
            font-size: 64px;
            font-weight: 700;
            line-height: 1.05;
            letter-spacing: -0.04em;
            max-width: 900px;
            color: #F2F4F7;
          }
          .subtitle {
            font-size: 24px;
            font-weight: 400;
            color: #8B93A1;
            line-height: 1.5;
            max-width: 800px;
          }
          .footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding-top: 30px;
            font-size: 16px;
            color: #8B93A1;
          }
          .badge {
            background: rgba(94, 225, 210, 0.1);
            color: #5EE1D2;
            border: 1px solid rgba(94, 225, 210, 0.3);
            padding: 6px 16px;
            border-radius: 9999px;
            font-size: 14px;
            font-family: monospace;
          }
        </style>
      </head>
      <body>
        <div class="glow"></div>
        <div class="brand">
          <div class="dot"></div>
          <div>Pulse<span style="color: #8B93A1">OS</span></div>
        </div>

        <div style="margin: auto 0; display: flex; flex-direction: column; gap: 20px;">
          <h1 class="title">Your health, in plain language.</h1>
          <p class="subtitle">Turning complex medical lab reports and daily vitals into calm, plain-language explanations with actionable next steps.</p>
        </div>

        <div class="footer">
          <div>pulseos.health · Strict Non-Diagnostic Clinical Safety</div>
          <div class="badge">APPLE-CALIBER HEALTH UI</div>
        </div>
      </body>
    </html>
  `;

  await page.setContent(ogHtml);
  const outPath = path.resolve("./public/media/og-pulseos.png");
  await page.screenshot({ path: outPath });
  console.log("Saved OpenGraph image to:", outPath);

  await browser.close();
}

generateOGImage().catch((err) => {
  console.error("OG Image generation failed:", err);
  process.exit(1);
});
