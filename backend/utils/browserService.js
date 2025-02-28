// File: backend/utils/browserService.js

const { chromium } = require("playwright");

class BrowserService {
  constructor() {
    this.browser = null;
    this.context = null;
  }

  async initialize() {
    if (!this.browser) {
      try {
        console.log("Initializing browser...");
        this.browser = await chromium.launch({
          headless: false, // For demo purposes
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--disable-gpu",
            "--mute-audio",
            "--disable-web-security", // For demo only - remove in production
          ],
          ignoreDefaultArgs: ["--enable-automation"],
          timeout: 30000, // Increase timeout to 30 seconds
        });
        console.log("Browser initialized successfully");
      } catch (error) {
        console.error("Failed to initialize browser:", error);
        throw new Error(`Browser initialization failed: ${error.message}`);
      }
    }
    return this.browser;
  }

  async getContext() {
    if (!this.context) {
      try {
        const browser = await this.initialize();
        this.context = await browser.newContext({
          viewport: { width: 1280, height: 720 },
          acceptDownloads: true,
          bypassCSP: true, // For demo only - helps with script injection
          permissions: ["clipboard-read", "clipboard-write"],
        });
      } catch (error) {
        console.error("Failed to create browser context:", error);
        throw new Error(`Context creation failed: ${error.message}`);
      }
    }
    return this.context;
  }

  async getPage() {
    try {
      const context = await this.getContext();
      const page = await context.newPage();

      // Add event listeners for console messages and errors
      page.on("console", (message) => {
        console.log(`Browser console ${message.type()}: ${message.text()}`);
      });

      page.on("pageerror", (error) => {
        console.error(`Browser page error: ${error.message}`);
      });

      return page;
    } catch (error) {
      console.error("Failed to create page:", error);
      throw new Error(`Page creation failed: ${error.message}`);
    }
  }

  async navigateToUrl(url) {
    try {
      console.log(`Navigating to URL: ${url}`);
      const page = await this.getPage();
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 60000, // Increase timeout to 60 seconds
      });

      // Wait an extra second for any dynamic content
      await page.waitForTimeout(1000);

      console.log(`Successfully navigated to ${url}`);
      return page;
    } catch (error) {
      console.error(`Failed to navigate to ${url}:`, error);
      throw new Error(`Navigation failed: ${error.message}`);
    }
  }

  async cleanup() {
    try {
      if (this.context) {
        await this.context.close();
        this.context = null;
      }
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      console.log("Browser resources cleaned up");
    } catch (error) {
      console.error("Error during cleanup:", error);
    }
  }
}

module.exports = new BrowserService();
