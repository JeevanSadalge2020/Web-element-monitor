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

// Close browser
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

// Create a new element from picker data
exports.createElementFromPicker = async (req, res) => {
  try {
    console.log("Received element data from picker:", req.body);

    // Validate required fields
    if (!req.body.pageContextId) {
      return res.status(400).json({
        message: "Page context ID is required",
      });
    }

    if (!req.body.name) {
      return res.status(400).json({
        message: "Element name is required",
      });
    }

    if (
      !req.body.selectors ||
      (!req.body.selectors.css &&
        !req.body.selectors.xpath &&
        !req.body.selectors.id)
    ) {
      return res.status(400).json({
        message: "At least one selector (CSS, XPath, or ID) is required",
      });
    }

    // Prepare the element data
    const elementData = {
      pageContextId: req.body.pageContextId,
      name: req.body.name,
      description: req.body.description || `Element picked from page`,
      selectors: {
        css: req.body.selectors.css || "",
        xpath: req.body.selectors.xpath || "",
        id: req.body.selectors.id || "",
      },
      content: req.body.content || "",
      position: req.body.position || {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
      status: "active",
    };

    // Add attributes if provided
    if (req.body.attributes && Object.keys(req.body.attributes).length > 0) {
      elementData.attributes = new Map(Object.entries(req.body.attributes));
    }

    // Create the element
    const newElement = await Element.create(elementData);
    console.log("Element created successfully:", newElement._id);

    res.status(201).json({
      message: "Element created successfully",
      element: newElement,
    });
  } catch (error) {
    console.error("Error creating element from picker:", error);
    res.status(500).json({
      message: "Error creating element",
      error: error.message,
    });
  }
};
