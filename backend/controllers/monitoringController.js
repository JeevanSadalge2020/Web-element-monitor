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
      // In backend/controllers/monitoringController.js
      // Inside the runMonitoring function:

      // Check each element
      for (const element of elements) {
        summary.totalElements++;

        // Create a result entry
        const resultEntry = {
          elementId: element._id,
          pageContextId: pageContext._id,
          timestamp: new Date(),
          selectorResults: {}, // Track results of each selector
          selectorDetails: {}, // Store details about each selector
        };

        try {
          // Try to find the element using available selectors in priority order: ID > CSS > XPath
          let found = false;
          let elementHandle = null;
          let foundBySelector = {};
          let selectorDetails = {};

          // Priority 1: Try ID (most reliable)
          if (element.selectors.id) {
            try {
              console.log(
                `Trying to find element by ID: #${element.selectors.id}`
              );
              elementHandle = await page.$(`#${element.selectors.id}`);
              if (elementHandle) {
                found = true;
                foundBySelector.id = true;
                selectorDetails.id = { status: "success", priority: 1 };
              } else {
                foundBySelector.id = false;
                selectorDetails.id = { status: "not_found", priority: 1 };
              }
            } catch (err) {
              console.log(`Error finding element by ID: ${err.message}`);
              foundBySelector.id = false;
              selectorDetails.id = {
                status: "error",
                message: err.message,
                priority: 1,
              };
            }
          }

          // Priority 2: Try CSS
          if (element.selectors.css && !elementHandle) {
            try {
              console.log(
                `Trying to find element by CSS: ${element.selectors.css}`
              );
              const cssHandle = await page.$(element.selectors.css);
              if (cssHandle) {
                found = true;
                foundBySelector.css = true;
                selectorDetails.css = { status: "success", priority: 2 };
                elementHandle = cssHandle;
              } else {
                foundBySelector.css = false;
                selectorDetails.css = { status: "not_found", priority: 2 };
              }
            } catch (err) {
              console.log(`Error finding element by CSS: ${err.message}`);
              foundBySelector.css = false;
              selectorDetails.css = {
                status: "error",
                message: err.message,
                priority: 2,
              };
            }
          } else if (element.selectors.css && elementHandle) {
            // Test CSS selector even if we already found the element
            try {
              const cssHandle = await page.$(element.selectors.css);
              foundBySelector.css = !!cssHandle;
              selectorDetails.css = {
                status: cssHandle ? "success" : "not_found",
                priority: 2,
                note: "Element already found by higher priority selector",
              };
            } catch (err) {
              foundBySelector.css = false;
              selectorDetails.css = {
                status: "error",
                message: err.message,
                priority: 2,
                note: "Element already found by higher priority selector",
              };
            }
          }

          // Priority 3: Try XPath (least reliable but most flexible)
          if (element.selectors.xpath && !elementHandle) {
            try {
              console.log(
                `Trying to find element by XPath: ${element.selectors.xpath}`
              );
              const xpathHandle = await page.$(
                `xpath=${element.selectors.xpath}`
              );
              if (xpathHandle) {
                found = true;
                foundBySelector.xpath = true;
                selectorDetails.xpath = { status: "success", priority: 3 };
                elementHandle = xpathHandle;
              } else {
                foundBySelector.xpath = false;
                selectorDetails.xpath = { status: "not_found", priority: 3 };
              }
            } catch (err) {
              console.log(`Error finding element by XPath: ${err.message}`);
              foundBySelector.xpath = false;
              selectorDetails.xpath = {
                status: "error",
                message: err.message,
                priority: 3,
              };
            }
          } else if (element.selectors.xpath && elementHandle) {
            // Test XPath selector even if we already found the element
            try {
              const xpathHandle = await page.$(
                `xpath=${element.selectors.xpath}`
              );
              foundBySelector.xpath = !!xpathHandle;
              selectorDetails.xpath = {
                status: xpathHandle ? "success" : "not_found",
                priority: 3,
                note: "Element already found by higher priority selector",
              };
            } catch (err) {
              foundBySelector.xpath = false;
              selectorDetails.xpath = {
                status: "error",
                message: err.message,
                priority: 3,
                note: "Element already found by higher priority selector",
              };
            }
          }

          // Store selector results
          resultEntry.selectorResults = foundBySelector;
          resultEntry.selectorDetails = selectorDetails;

          // Set if element was found by any selector
          resultEntry.found = found;

          // Replace this section in runMonitoring function:
          if (found) {
            // Extract ALL current element properties
            const currentTagName = await page.evaluate(
              (el) => el.tagName.toLowerCase(),
              elementHandle
            );

            const currentContent = await page.evaluate(
              (el) => el.textContent.trim(),
              elementHandle
            );

            const currentHTML = await page.evaluate((el) => {
              return {
                innerHTML: el.innerHTML,
                outerHTML: el.outerHTML,
              };
            }, elementHandle);

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

            const currentClasses = await page.evaluate(
              (el) => Array.from(el.classList),
              elementHandle
            );

            const currentParent = await page.evaluate((el) => {
              if (!el.parentElement) return null;
              return {
                tagName: el.parentElement.tagName.toLowerCase(),
                id: el.parentElement.id || "",
                classes: Array.from(el.parentElement.classList),
              };
            }, elementHandle);

            // Gather all current element data
            const currentElementData = {
              tagName: currentTagName,
              content: currentContent,
              innerHTML: currentHTML.innerHTML,
              outerHTML: currentHTML.outerHTML,
              position: currentPosition,
              attributes: currentAttributes,
              classes: currentClasses,
              parent: currentParent,
            };

            // Get changes compared to stored state using enhanced detection
            const changes = detectAllChanges(element, currentElementData);

            // Store change information
            resultEntry.changed = changes.hasChanged;
            resultEntry.changeType = changes.changeType;
            resultEntry.changes = changes.details;

            // Add selector status to changes
            resultEntry.changes.selectors = {
              details: selectorDetails,
              anyFailed: Object.values(foundBySelector).some(
                (result) => result === false
              ),
            };

            // Count element as changed only if content/position/attributes changed
            if (changes.hasChanged) {
              summary.changedElements++;
            }

            // Save current state to element history with all new properties
            await Element.findByIdAndUpdate(element._id, {
              $push: {
                previousStates: {
                  timestamp: new Date(),
                  content: currentContent,
                  innerHTML: currentHTML.innerHTML,
                  outerHTML: currentHTML.outerHTML,
                  position: currentPosition,
                  attributes: currentAttributes,
                  tagName: currentTagName,
                  classes: currentClasses,
                  parent: currentParent,
                  status: changes.hasChanged ? "changed" : "active",
                  selectorResults: foundBySelector,
                  selectorDetails: selectorDetails,
                },
              },
              content: currentContent,
              innerHTML: currentHTML.innerHTML,
              outerHTML: currentHTML.outerHTML,
              position: currentPosition,
              attributes: currentAttributes,
              tagName: currentTagName,
              classes: currentClasses,
              parent: currentParent,
              status: changes.hasChanged ? "changed" : "active",
              lastChecked: new Date(),
            });
          } else {
            // Element not found by any selector
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
// Replace the existing detectChanges function with this:
function detectAllChanges(storedElement, currentElement) {
  const changes = {
    hasChanged: false,
    changeType: "none",
    details: {},
  };

  // Check tag name changes
  if (
    storedElement.tagName &&
    storedElement.tagName !== currentElement.tagName
  ) {
    changes.hasChanged = true;
    if (changes.changeType === "none") changes.changeType = "tag";
    else changes.changeType = "multiple";
    changes.details.tag = {
      previous: storedElement.tagName,
      current: currentElement.tagName,
    };
  }

  // Check content changes
  if (storedElement.content !== currentElement.content) {
    changes.hasChanged = true;
    if (changes.changeType === "none") changes.changeType = "content";
    else changes.changeType = "multiple";
    changes.details.content = {
      previous: storedElement.content,
      current: currentElement.content,
    };
  }

  // Check HTML changes
  if (storedElement.innerHTML !== currentElement.innerHTML) {
    changes.hasChanged = true;
    if (changes.changeType === "none") changes.changeType = "html";
    else changes.changeType = "multiple";
    changes.details.html = {
      previous: storedElement.innerHTML,
      current: currentElement.innerHTML,
    };
  }

  // Check position changes - similar to your existing code
  if (storedElement.position) {
    const xChanged =
      Math.abs(storedElement.position.x - currentElement.position.x) > 5;
    const yChanged =
      Math.abs(storedElement.position.y - currentElement.position.y) > 5;
    const widthChanged =
      Math.abs(storedElement.position.width - currentElement.position.width) >
      storedElement.position.width * 0.1;
    const heightChanged =
      Math.abs(storedElement.position.height - currentElement.position.height) >
      storedElement.position.height * 0.1;

    if (xChanged || yChanged || widthChanged || heightChanged) {
      changes.hasChanged = true;
      if (changes.changeType === "none") changes.changeType = "position";
      else changes.changeType = "multiple";
      changes.details.position = {
        previous: storedElement.position,
        current: currentElement.position,
      };
    }
  }

  // Check class changes
  if (storedElement.classes && currentElement.classes) {
    const storedClassesSet = new Set(storedElement.classes);
    const currentClassesSet = new Set(currentElement.classes);

    const addedClasses = currentElement.classes.filter(
      (cls) => !storedClassesSet.has(cls)
    );
    const removedClasses = storedElement.classes.filter(
      (cls) => !currentClassesSet.has(cls)
    );

    if (addedClasses.length > 0 || removedClasses.length > 0) {
      changes.hasChanged = true;
      if (changes.changeType === "none") changes.changeType = "class";
      else changes.changeType = "multiple";
      changes.details.classes = {
        previous: storedElement.classes,
        current: currentElement.classes,
        added: addedClasses,
        removed: removedClasses,
      };
    }
  }

  // Check attributes changes - similar to your existing code but more detailed
  if (storedElement.attributes) {
    const attributeChanges = {};
    let hasAttributeChanges = false;

    // Convert Map to object for easier comparison if needed
    const previousAttributes = {};
    if (storedElement.attributes instanceof Map) {
      storedElement.attributes.forEach((value, key) => {
        previousAttributes[key] = value;
      });
    } else {
      // If it's already an object, use it directly
      Object.assign(previousAttributes, storedElement.attributes);
    }

    // Check for changed or added attributes
    for (const [key, value] of Object.entries(currentElement.attributes)) {
      if (!previousAttributes[key] || previousAttributes[key] !== value) {
        attributeChanges[key] = {
          previous: previousAttributes[key] || null,
          current: value,
          changeType: !previousAttributes[key] ? "added" : "modified",
        };
        hasAttributeChanges = true;
      }
    }

    // Check for removed attributes
    for (const key of Object.keys(previousAttributes)) {
      if (!currentElement.attributes[key]) {
        attributeChanges[key] = {
          previous: previousAttributes[key],
          current: null,
          changeType: "removed",
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

  // Check parent element changes
  if (storedElement.parent && currentElement.parent) {
    const parentChanges = {};
    let hasParentChanges = false;

    if (storedElement.parent.tagName !== currentElement.parent.tagName) {
      parentChanges.tagName = {
        previous: storedElement.parent.tagName,
        current: currentElement.parent.tagName,
      };
      hasParentChanges = true;
    }

    if (storedElement.parent.id !== currentElement.parent.id) {
      parentChanges.id = {
        previous: storedElement.parent.id,
        current: currentElement.parent.id,
      };
      hasParentChanges = true;
    }

    // Check parent classes if available
    if (storedElement.parent.classes && currentElement.parent.classes) {
      const storedParentClasses = new Set(storedElement.parent.classes);
      const currentParentClasses = new Set(currentElement.parent.classes);

      const addedClasses = currentElement.parent.classes.filter(
        (cls) => !storedParentClasses.has(cls)
      );
      const removedClasses = storedElement.parent.classes.filter(
        (cls) => !currentParentClasses.has(cls)
      );

      if (addedClasses.length > 0 || removedClasses.length > 0) {
        parentChanges.classes = {
          previous: storedElement.parent.classes,
          current: currentElement.parent.classes,
          added: addedClasses,
          removed: removedClasses,
        };
        hasParentChanges = true;
      }
    }

    if (hasParentChanges) {
      changes.hasChanged = true;
      if (changes.changeType === "none") changes.changeType = "parent";
      else changes.changeType = "multiple";
      changes.details.parent = parentChanges;
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
