// File: backend/routes/pageContextRoutes.js

const express = require("express");
const router = express.Router();
const pageContextController = require("../controllers/pageContextController");

// Get all page contexts for a site
router.get("/site/:siteId", pageContextController.getAllPageContexts);

// Get a single page context by ID
router.get("/:id", pageContextController.getPageContextById);

// Create a new page context
router.post("/", pageContextController.createPageContext);

// Update a page context
router.put("/:id", pageContextController.updatePageContext);

// Delete a page context
router.delete("/:id", pageContextController.deletePageContext);

module.exports = router;
