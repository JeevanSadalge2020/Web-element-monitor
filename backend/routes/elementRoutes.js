// File: backend/routes/elementRoutes.js

const express = require("express");
const router = express.Router();
const elementController = require("../controllers/elementController");

// Get all elements for a page context
router.get("/page/:pageContextId", elementController.getAllElements);

// Get a single element by ID
router.get("/:id", elementController.getElementById);

// Create a new element
router.post("/", elementController.createElement);

// Update an element
router.put("/:id", elementController.updateElement);

// Delete an element
router.delete("/:id", elementController.deleteElement);

module.exports = router;
