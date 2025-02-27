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
      fullUrl = new URL(pageContext.url, site.url).toString();
    }

    // Launch browser and navigate to URL
    await browserService.initialize();
    const page = await browserService.navigateToUrl(fullUrl);

    // Inject element picker script
    await page.evaluate(elementPickerScript);

    res.status(200).json({
      message: "Browser launched successfully",
      url: fullUrl,
    });
  } catch (error) {
    console.error("Error launching browser:", error);
    res.status(500).json({
      message: "Error launching browser",
      error: error.message,
    });
  }
};

// Create a new element from picker data
exports.createElementFromPicker = async (req, res) => {
  try {
    const newElement = await Element.create(req.body);
    res.status(201).json(newElement);
  } catch (error) {
    res.status(400).json({
      message: "Error creating element",
      error: error.message,
    });
  }
};

// Close the browser
exports.closeBrowser = async (req, res) => {
  try {
    await browserService.cleanup();
    res.status(200).json({ message: "Browser closed successfully" });
  } catch (error) {
    console.error("Error closing browser:", error);
    res.status(500).json({
      message: "Error closing browser",
      error: error.message,
    });
  }
};
