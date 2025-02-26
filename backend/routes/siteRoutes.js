// File: backend/routes/siteRoutes.js

const express = require("express");
const router = express.Router();
const siteController = require("../controllers/siteController");

// Get all sites
router.get("/", siteController.getAllSites);

// Get a single site by ID
router.get("/:id", siteController.getSiteById);

// Create a new site
router.post("/", siteController.createSite);

// Update a site
router.put("/:id", siteController.updateSite);

// Delete a site
router.delete("/:id", siteController.deleteSite);

module.exports = router;
