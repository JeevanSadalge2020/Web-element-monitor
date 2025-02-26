// File: backend/controllers/pageContextController.js

const PageContext = require("../models/PageContext");

// Get all page contexts for a site
exports.getAllPageContexts = async (req, res) => {
  try {
    const { siteId } = req.params;
    const pageContexts = await PageContext.find({ siteId }).sort({ order: 1 });
    res.status(200).json(pageContexts);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching page contexts",
      error: error.message,
    });
  }
};

// Get a single page context by ID
exports.getPageContextById = async (req, res) => {
  try {
    const pageContext = await PageContext.findById(req.params.id);
    if (!pageContext) {
      return res.status(404).json({ message: "Page context not found" });
    }
    res.status(200).json(pageContext);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching page context",
      error: error.message,
    });
  }
};

// Create a new page context
exports.createPageContext = async (req, res) => {
  try {
    const newPageContext = await PageContext.create(req.body);
    res.status(201).json(newPageContext);
  } catch (error) {
    res.status(400).json({
      message: "Error creating page context",
      error: error.message,
    });
  }
};

// Update a page context
exports.updatePageContext = async (req, res) => {
  try {
    const pageContext = await PageContext.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!pageContext) {
      return res.status(404).json({ message: "Page context not found" });
    }
    res.status(200).json(pageContext);
  } catch (error) {
    res.status(400).json({
      message: "Error updating page context",
      error: error.message,
    });
  }
};

// Delete a page context
exports.deletePageContext = async (req, res) => {
  try {
    const pageContext = await PageContext.findByIdAndDelete(req.params.id);
    if (!pageContext) {
      return res.status(404).json({ message: "Page context not found" });
    }
    res.status(200).json({ message: "Page context deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting page context",
      error: error.message,
    });
  }
};
