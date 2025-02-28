// File: backend/routes/monitoringRoutes.js

const express = require("express");
const router = express.Router();
const monitoringController = require("../controllers/monitoringController");

// Start a new monitoring run for a site
router.post("/site/:siteId", monitoringController.startMonitoringRun);

// Get all monitoring runs for a site
router.get("/site/:siteId", monitoringController.getMonitoringRuns);

// Get a specific monitoring run by ID
router.get("/:id", monitoringController.getMonitoringRunById);

// Get the latest monitoring run for a site
router.get("/site/:siteId/latest", monitoringController.getLatestMonitoringRun);

module.exports = router;
