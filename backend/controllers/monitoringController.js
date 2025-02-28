// File: backend/controllers/monitoringController.js

const MonitoringRun = require("../models/MonitoringRun");
const Site = require("../models/Site");
const PageContext = require("../models/PageContext");
const Element = require("../models/Element");
const browserService = require("../utils/browserService");

// Start a new monitoring run for a site
exports.startMonitoringRun = async (req, res) => {
  try {
    const { siteId } = req.params;

    // Check if site exists
    const site = await Site.findById(siteId);
    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }

    // Create a new monitoring run
    const monitoringRun = await MonitoringRun.create({
      siteId,
      status: "running",
      startTime: new Date(),
    });

    // Start the monitoring process asynchronously
    runMonitoring(monitoringRun._id).catch((error) =>
      console.error("Error in monitoring run:", error)
    );

    res.status(201).json({
      message: "Monitoring run started",
      runId: monitoringRun._id,
      status: monitoringRun.status,
    });
  } catch (error) {
    console.error("Error starting monitoring run:", error);
    res.status(500).json({
      message: "Error starting monitoring run",
      error: error.message,
    });
  }
};

// Get all monitoring runs for a site
exports.getMonitoringRuns = async (req, res) => {
  try {
    const { siteId } = req.params;
    const monitoringRuns = await MonitoringRun.find({ siteId }).sort({
      createdAt: -1,
    });
    res.status(200).json(monitoringRuns);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching monitoring runs",
      error: error.message,
    });
  }
};

// In getMonitoringRunById function:

exports.getMonitoringRunById = async (req, res) => {
  try {
    // Fetch the monitoring run with populated references
    const monitoringRun = await MonitoringRun.findById(req.params.id);

    if (!monitoringRun) {
      return res.status(404).json({ message: "Monitoring run not found" });
    }

    // Prepare response
    const response = {
      ...monitoringRun.toObject(),
      elementDetails: {},
      pageContextDetails: {},
    };

    // Collect all element and page context IDs
    const elementIds = [];
    const pageContextIds = [];

    monitoringRun.results.forEach((result) => {
      if (result.elementId) elementIds.push(result.elementId);
      if (result.pageContextId) pageContextIds.push(result.pageContextId);
    });

    // Fetch element details
    if (elementIds.length > 0) {
      const elements = await Element.find({
        _id: { $in: elementIds },
      });

      elements.forEach((element) => {
        response.elementDetails[element._id] = {
          name: element.name,
          description: element.description,
        };
      });
    }

    // Fetch page context details
    if (pageContextIds.length > 0) {
      const pageContexts = await PageContext.find({
        _id: { $in: pageContextIds },
      });

      pageContexts.forEach((pageContext) => {
        response.pageContextDetails[pageContext._id] = {
          name: pageContext.name,
          url: pageContext.url,
        };
      });
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching monitoring run",
      error: error.message,
    });
  }
};

// Get the latest monitoring run for a site
exports.getLatestMonitoringRun = async (req, res) => {
  try {
    const { siteId } = req.params;
    const latestRun = await MonitoringRun.findOne({ siteId }).sort({
      createdAt: -1,
    });

    if (!latestRun) {
      return res
        .status(404)
        .json({ message: "No monitoring runs found for this site" });
    }

    res.status(200).json(latestRun);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching latest monitoring run",
      error: error.message,
    });
  }
};

// The actual monitoring process
async function runMonitoring(monitoringRunId) {
  let browser = null;

  try {
    // Get the monitoring run
    const monitoringRun = await MonitoringRun.findById(monitoringRunId);
    if (!monitoringRun) {
      throw new Error("Monitoring run not found");
    }

    // Get the site
    const site = await Site.findById(monitoringRun.siteId);
    if (!site) {
      throw new Error("Site not found");
    }

    // Get all page contexts for the site
    const pageContexts = await PageContext.find({
      siteId: monitoringRun.siteId,
      status: "active",
    }).sort({ order: 1 });

    // Initialize browser
    browser = await browserService.initialize();

    // Initialize monitoring summary
    let summary = {
      totalElements: 0,
      changedElements: 0,
      missingElements: 0,
      errorElements: 0,
    };

    // Process each page context
    for (const pageContext of pageContexts) {
      // Get elements for this page context
      const elements = await Element.find({ pageContextId: pageContext._id });

      if (elements.length === 0) {
        continue; // Skip if no elements to check
      }

      // Determine the URL to navigate to
      let url;
      if (pageContext.fullUrl) {
        url = pageContext.fullUrl;
      } else {
        url = new URL(pageContext.url, site.url).toString();
      }

      // Navigate to the page
      const page = await browserService.navigateToUrl(url);

      // Check each element
      for (const element of elements) {
        summary.totalElements++;

        // Create a result entry
        const resultEntry = {
          elementId: element._id,
          pageContextId: pageContext._id,
          timestamp: new Date(),
        };

        try {
          // Try to find the element using available selectors
          let found = false;
          let elementHandle = null;

          // Try each selector
          if (element.selectors.id) {
            try {
              elementHandle = await page.$(`#${element.selectors.id}`);
              if (elementHandle) found = true;
            } catch (err) {}
          }

          if (!found && element.selectors.css) {
            try {
              elementHandle = await page.$(element.selectors.css);
              if (elementHandle) found = true;
            } catch (err) {}
          }

          if (!found && element.selectors.xpath) {
            try {
              elementHandle = await page.$(`xpath=${element.selectors.xpath}`);
              if (elementHandle) found = true;
            } catch (err) {}
          }

          // Set if element was found
          resultEntry.found = found;

          if (found) {
            // Extract current element properties
            const currentContent = await page.evaluate(
              (el) => el.textContent.trim(),
              elementHandle
            );

            const currentPosition = await page.evaluate((el) => {
              const rect = el.getBoundingClientRect();
              return {
                x: rect.left + window.scrollX,
                y: rect.top + window.scrollY,
                width: rect.width,
                height: rect.height,
              };
            }, elementHandle);

            const currentAttributes = await page.evaluate((el) => {
              const attrs = {};
              for (const attr of el.attributes) {
                attrs[attr.name] = attr.value;
              }
              return attrs;
            }, elementHandle);

            // Get changes compared to stored state
            const changes = detectChanges(
              element,
              currentContent,
              currentPosition,
              currentAttributes
            );

            // Store change information
            resultEntry.changed = changes.hasChanged;
            resultEntry.changeType = changes.changeType;
            resultEntry.changes = changes.details;

            // Update summary statistics
            if (changes.hasChanged) {
              summary.changedElements++;
            }

            // Save current state to element history
            await Element.findByIdAndUpdate(element._id, {
              $push: {
                previousStates: {
                  timestamp: new Date(),
                  content: currentContent,
                  position: currentPosition,
                  attributes: currentAttributes,
                  status: changes.hasChanged ? "changed" : "active",
                },
              },
              content: currentContent,
              position: currentPosition,
              attributes: currentAttributes,
              status: changes.hasChanged ? "changed" : "active",
              lastChecked: new Date(),
            });
          } else {
            // Element not found
            resultEntry.changeType = "disappeared";
            resultEntry.changed = true;
            summary.missingElements++;

            // Update element status
            await Element.findByIdAndUpdate(element._id, {
              status: "missing",
              lastChecked: new Date(),
            });
          }
        } catch (error) {
          // Error checking element
          resultEntry.error = error.message;
          summary.errorElements++;

          // Update element status
          await Element.findByIdAndUpdate(element._id, {
            status: "error",
            lastChecked: new Date(),
          });
        }

        // Add the result to the monitoring run
        await MonitoringRun.findByIdAndUpdate(monitoringRunId, {
          $push: { results: resultEntry },
        });
      }
    }

    // Update monitoring run status and summary
    await MonitoringRun.findByIdAndUpdate(monitoringRunId, {
      status: "completed",
      endTime: new Date(),
      summary: summary,
    });
  } catch (error) {
    console.error("Error during monitoring:", error);

    // Update monitoring run with error
    await MonitoringRun.findByIdAndUpdate(monitoringRunId, {
      status: "failed",
      endTime: new Date(),
      error: error.message,
    });
  } finally {
    // Clean up browser resources
    if (browser) {
      await browserService.cleanup();
    }
  }
}

// Helper function to detect changes in an element
function detectChanges(
  element,
  currentContent,
  currentPosition,
  currentAttributes
) {
  const changes = {
    hasChanged: false,
    changeType: "none",
    details: {},
  };

  // Check content changes
  if (element.content !== currentContent) {
    changes.hasChanged = true;
    if (changes.changeType === "none") changes.changeType = "content";
    else changes.changeType = "multiple";
    changes.details.content = {
      previous: element.content,
      current: currentContent,
    };
  }

  // Check position changes - we'll consider it a change if position moved more than 5px
  // or size changed more than 10%
  if (element.position) {
    const xChanged = Math.abs(element.position.x - currentPosition.x) > 5;
    const yChanged = Math.abs(element.position.y - currentPosition.y) > 5;
    const widthChanged =
      Math.abs(element.position.width - currentPosition.width) >
      element.position.width * 0.1;
    const heightChanged =
      Math.abs(element.position.height - currentPosition.height) >
      element.position.height * 0.1;

    if (xChanged || yChanged || widthChanged || heightChanged) {
      changes.hasChanged = true;
      if (changes.changeType === "none") changes.changeType = "position";
      else changes.changeType = "multiple";
      changes.details.position = {
        previous: element.position,
        current: currentPosition,
      };
    }
  }

  // Check attributes changes - we'll focus on class, style, and aria attributes
  // as these often indicate visual or accessibility changes
  if (element.attributes && element.attributes.size > 0) {
    const attributeChanges = {};
    let hasAttributeChanges = false;

    // Convert Map to object for easier comparison
    const previousAttributes = {};
    element.attributes.forEach((value, key) => {
      previousAttributes[key] = value;
    });

    // Check for changed or added attributes
    for (const [key, value] of Object.entries(currentAttributes)) {
      if (!previousAttributes[key] || previousAttributes[key] !== value) {
        attributeChanges[key] = {
          previous: previousAttributes[key] || null,
          current: value,
        };
        hasAttributeChanges = true;
      }
    }

    // Check for removed attributes
    for (const key of Object.keys(previousAttributes)) {
      if (!currentAttributes[key]) {
        attributeChanges[key] = {
          previous: previousAttributes[key],
          current: null,
        };
        hasAttributeChanges = true;
      }
    }

    if (hasAttributeChanges) {
      changes.hasChanged = true;
      if (changes.changeType === "none") changes.changeType = "attribute";
      else changes.changeType = "multiple";
      changes.details.attributes = attributeChanges;
    }
  }

  return changes;
}

module.exports = {
  startMonitoringRun: exports.startMonitoringRun,
  getMonitoringRuns: exports.getMonitoringRuns,
  getMonitoringRunById: exports.getMonitoringRunById,
  getLatestMonitoringRun: exports.getLatestMonitoringRun,
  runMonitoring,
};
