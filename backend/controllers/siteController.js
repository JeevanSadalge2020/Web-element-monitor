// File: backend/controllers/siteController.js

const Site = require("../models/Site");

// Get all sites
exports.getAllSites = async (req, res) => {
  try {
    const sites = await Site.find().sort({ createdAt: -1 });
    res.status(200).json(sites);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching sites", error: error.message });
  }
};

// Get a single site by ID
exports.getSiteById = async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }
    res.status(200).json(site);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching site", error: error.message });
  }
};

// Create a new site
exports.createSite = async (req, res) => {
  try {
    const newSite = await Site.create(req.body);
    res.status(201).json(newSite);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating site", error: error.message });
  }
};

// Update a site
exports.updateSite = async (req, res) => {
  try {
    const site = await Site.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }
    res.status(200).json(site);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating site", error: error.message });
  }
};

// Delete a site
exports.deleteSite = async (req, res) => {
  try {
    const site = await Site.findByIdAndDelete(req.params.id);
    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }
    res.status(200).json({ message: "Site deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting site", error: error.message });
  }
};
