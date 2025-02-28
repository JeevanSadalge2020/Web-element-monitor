// File: backend/controllers/elementPickerController.js

const browserService = require("../utils/browserService");
const PageContext = require("../models/PageContext");
const Site = require("../models/Site");
const Element = require("../models/Element");
const elementPickerScript = require("../utils/elementPickerScript");

// Launch browser and navigate to the page for element selection
exports.launchElementPicker = async (req, res) => {
  const { pageContextId } = req.params;

  try {
    console.log(`Launching element picker for page context: ${pageContextId}`);

    // Get page context info
    const pageContext = await PageContext.findById(pageContextId);
    if (!pageContext) {
      return res.status(404).json({ message: "Page context not found" });
    }

    // Get site info
    const site = await Site.findById(pageContext.siteId);
    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }

    // Determine the full URL to navigate to
    let fullUrl;
    if (pageContext.fullUrl) {
      fullUrl = pageContext.fullUrl;
    } else {
      // Combine site URL with page context path
      try {
        fullUrl = new URL(pageContext.url, site.url).toString();
      } catch (error) {
        console.error("Error constructing URL:", error);
        return res.status(400).json({
          message: "Invalid URL construction",
          error: error.message,
          siteUrl: site.url,
          pageUrl: pageContext.url,
        });
      }
    }

    console.log(`Constructed URL for navigation: ${fullUrl}`);

    // Launch browser and navigate to URL
    try {
      await browserService.initialize();
      const page = await browserService.navigateToUrl(fullUrl);

      // Inject element picker script
      try {
        console.log("Injecting element picker script...");
        await page.evaluate(elementPickerScript);
        console.log("Element picker script injected successfully");
      } catch (scriptError) {
        console.error("Error injecting script:", scriptError);
        await browserService.cleanup();
        return res.status(500).json({
          message: "Error injecting element picker script",
          error: scriptError.message,
        });
      }

      res.status(200).json({
        message: "Browser launched successfully",
        url: fullUrl,
      });
    } catch (browserError) {
      console.error("Error with browser operations:", browserError);
      await browserService.cleanup();
      return res.status(500).json({
        message: "Error with browser operations",
        error: browserError.message,
      });
    }
  } catch (error) {
    console.error("Error launching browser:", error);
    await browserService.cleanup();
    res.status(500).json({
      message: "Error launching element picker",
      error: error.message,
    });
  }
};

// Other controller methods remain the same...
