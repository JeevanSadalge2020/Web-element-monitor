// File: backend/utils/browserService.js

const { chromium } = require("playwright");

class BrowserService {
  constructor() {
    this.browser = null;
    this.context = null;
  }

  async initialize() {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: false, // For demo purposes, we'll show the browser
      });
    }
    return this.browser;
  }

  async getContext() {
    if (!this.context) {
      const browser = await this.initialize();
      this.context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
      });
    }
    return this.context;
  }

  async getPage() {
    const context = await this.getContext();
    return await context.newPage();
  }

  async navigateToUrl(url) {
    const page = await this.getPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });
    return page;
  }

  async cleanup() {
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = new BrowserService();
