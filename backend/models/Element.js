// File: backend/models/Element.js

const mongoose = require("mongoose");

const ElementSchema = new mongoose.Schema(
  {
    pageContextId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PageContext",
      required: [true, "Page context reference is required"],
    },
    name: {
      type: String,
      required: [true, "Element name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // Multiple selectors for resilient element finding
    selectors: {
      xpath: { type: String, trim: true },
      css: { type: String, trim: true },
      id: { type: String, trim: true },
    },
    // Element content and attributes
    content: { type: String },
    attributes: { type: Map, of: String, default: {} },
    // Position and dimensions
    position: {
      x: Number,
      y: Number,
      width: Number,
      height: Number,
    },
    // Status information
    status: {
      type: String,
      enum: ["active", "changed", "missing", "error"],
      default: "active",
    },
    lastChecked: {
      type: Date,
    },
    // Store previous states for comparison
    previousStates: [
      {
        timestamp: Date,
        content: String,
        attributes: { type: Map, of: String },
        position: {
          x: Number,
          y: Number,
          width: Number,
          height: Number,
        },
        status: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Element", ElementSchema);
