import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import http from "http";
import handler from "serve-handler";
import puppeteer from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 3000;
const SCREENSHOTS_DIR = join(__dirname, "public", "screenshots");
const DIST_DIR = join(__dirname, "dist");

if (!existsSync(SCREENSHOTS_DIR)) {
  mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const ROUTES = [
  "/", // Default landing (Overview tab)
  "/?tab=overview", // Explicit overview
  "/?tab=radial", // Radial diagram
  "/?tab=levels", // Level details
  "/?tab=inventory", // Relationship inventory
  "/?tab=digital", // Digital parallels
  "/?tab=lifecycle", // Life stage comparison
];

const DEVICES = [
  {
    name: "desktop-large",
    viewport: { width: 1920, height: 1080, isMobile: false },
  },
  {
    name: "desktop-standard",
    viewport: { width: 1366, height: 768, isMobile: false },
  },
  {
    name: "tablet",
    viewport: { width: 768, height: 1024, isMobile: true },
  },
  {
    name: "phone-large",
    viewport: { width: 414, height: 896, isMobile: true },
  },
  {
    name: "phone-small",
    viewport: { width: 375, height: 667, isMobile: true },
  },
];

function startServer() {
  const server = http.createServer((request, response) => {
    return handler(request, response, {
      public: DIST_DIR,
      cleanUrls: true,
      trailingSlash: false,
      rewrites: [{ source: "/**", destination: "/index.html" }],
    });
  });

  return new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

async function takeScreenshots() {
  console.log("🌐 Launching browser...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  try {
    for (const device of DEVICES) {
      console.log(
        `\n📱 Starting screenshots for ${device.name} (${device.viewport.width}x${device.viewport.height})`,
      );

      const page = await browser.newPage();

      page.setDefaultNavigationTimeout(30000);
      page.setDefaultTimeout(10000);
      await page.setViewport(device.viewport);

      for (const route of ROUTES) {
        const url = `http://localhost:${PORT}${route}`;
        console.log(`\n🌐 Navigating to: ${url}`);

        try {
          await page.goto(url, {
            waitUntil: ["networkidle0", "domcontentloaded", "load"],
            timeout: 60000,
          });

          await new Promise((resolve) => setTimeout(resolve, 2000));

          try {
            await page.waitForSelector("main, .app, #root, #app", {
              timeout: 5000,
            });
          } catch (e) {
            console.log("No main content selector found, continuing...");
          }

          const sanitizeRoute = (route) => {
            if (route === "/") return "home";
            // Remove leading/trailing slashes, replace non-alphanumeric with dashes
            return route
              .replace(/^\/+/g, "")
              .replace(/\/+$/g, "")
              .replace(/[?=&/]+/g, "-")
              .replace(/^-+|-+$/g, "");
          };
          const safeRoute = sanitizeRoute(route);
          const fileName = `${device.name}-${safeRoute || "home"}.png`;
          const filePath = join(SCREENSHOTS_DIR, fileName);

          await page.screenshot({ path: filePath, fullPage: true });
          console.log(`✅ Screenshot saved: ${filePath}`);
        } catch (error) {
          console.error(`❌ Error capturing ${url}:`, error.message);
        }
      }

      await page.close();
    }
  } finally {
    await browser.close();
    console.log("👋 Browser closed");
  }
}

async function main() {
  console.log("🚀 Starting screenshot workflow");
  console.log("--------------------------------");

  try {
    // Step 1: Build the app
    console.log("🔨 Building the app...");
    execSync("npm run build", { stdio: "inherit" });

    // Step 2: Start the server
    console.log("\n🚀 Starting server...");
    const server = await startServer();

    try {
      // Step 3: Take screenshots
      console.log("\n📸 Starting screenshot capture...");
      await takeScreenshots();
      console.log("\n✅ All screenshots captured successfully!");
    } finally {
      // Always close the server
      server.close();
      console.log("👋 Server closed");
    }
  } catch (error) {
    console.error("❌ Error during screenshot workflow:", error);
    process.exit(1);
  }
}

// Run the workflow
main();
