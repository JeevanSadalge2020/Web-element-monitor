// File: backend/controllers/elementController.js

const Element = require("../models/Element");

// Get all elements for a page context
exports.getAllElements = async (req, res) => {
  try {
    const { pageContextId } = req.params;
    const elements = await Element.find({ pageContextId });
    res.status(200).json(elements);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching elements",
      error: error.message,
    });
  }
};

// Get a single element by ID
exports.getElementById = async (req, res) => {
  try {
    const element = await Element.findById(req.params.id);
    if (!element) {
      return res.status(404).json({ message: "Element not found" });
    }
    res.status(200).json(element);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching element",
      error: error.message,
    });
  }
};

// Create a new element
exports.createElement = async (req, res) => {
  try {
    const newElement = await Element.create(req.body);
    res.status(201).json(newElement);
  } catch (error) {
    res.status(400).json({
      message: "Error creating element",
      error: error.message,
    });
  }
};

// Update an element
exports.updateElement = async (req, res) => {
  try {
    const element = await Element.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!element) {
      return res.status(404).json({ message: "Element not found" });
    }
    res.status(200).json(element);
  } catch (error) {
    res.status(400).json({
      message: "Error updating element",
      error: error.message,
    });
  }
};

// Delete an element
exports.deleteElement = async (req, res) => {
  try {
    const element = await Element.findByIdAndDelete(req.params.id);
    if (!element) {
      return res.status(404).json({ message: "Element not found" });
    }
    res.status(200).json({ message: "Element deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting element",
      error: error.message,
    });
  }
};
