// File: backend/routes/elementPickerRoutes.js

const express = require("express");
const router = express.Router();
const elementPickerController = require("../controllers/elementPickerController");

// Launch browser for element selection
router.post(
  "/launch/:pageContextId",
  elementPickerController.launchElementPicker
);

// Close browser
router.post("/close", elementPickerController.closeBrowser);

// Fix this route - the controller function might be undefined
router.post("/create-element", elementPickerController.createElementFromPicker);

module.exports = router;
