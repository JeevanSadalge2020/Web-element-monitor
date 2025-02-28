// File: backend/models/MonitoringRun.js

const mongoose = require("mongoose");

const MonitoringRunSchema = new mongoose.Schema(
  {
    siteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      required: [true, "Site reference is required"],
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["running", "completed", "failed"],
      default: "running",
    },
    results: [
      {
        elementId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Element",
        },
        pageContextId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "PageContext",
        },
        found: {
          type: Boolean,
          default: false,
        },
        changed: {
          type: Boolean,
          default: false,
        },
        changeType: {
          type: String,
          enum: [
            "none",
            "content",
            "attribute",
            "position",
            "disappeared",
            "multiple",
          ],
          default: "none",
        },
        changes: {
          type: Map,
          of: mongoose.Schema.Types.Mixed,
        },
        error: {
          type: String,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    summary: {
      totalElements: {
        type: Number,
        default: 0,
      },
      changedElements: {
        type: Number,
        default: 0,
      },
      missingElements: {
        type: Number,
        default: 0,
      },
      errorElements: {
        type: Number,
        default: 0,
      },
    },
    error: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MonitoringRun", MonitoringRunSchema);
