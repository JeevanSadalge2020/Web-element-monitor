// File: backend/models/PageContext.js

const mongoose = require("mongoose");

const PageContextSchema = new mongoose.Schema(
  {
    siteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      required: [true, "Site reference is required"],
    },
    name: {
      type: String,
      required: [true, "Page name is required"],
      trim: true,
    },
    // Original url field (for relative paths)
    url: {
      type: String,
      required: [true, "Page URL is required"],
      trim: true,
    },
    // New field for full URLs
    fullUrl: {
      type: String,
      trim: true,
    },
    // For future action-based navigation implementation
    navigationActions: {
      type: [
        {
          type: {
            type: String,
            enum: ["click", "input", "hover", "wait"],
            default: "click",
          },
          selector: String,
          value: String,
          description: String,
        },
      ],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "error"],
      default: "active",
    },
  },
  { timestamps: true }
);

// Pre-save middleware to handle URL formatting
PageContextSchema.pre("save", function (next) {
  // If fullUrl is provided and url is empty, extract the path
  if (this.fullUrl && !this.url) {
    try {
      const urlObj = new URL(this.fullUrl);
      this.url = urlObj.pathname;
    } catch (e) {
      // If fullUrl is not a valid URL, just use it as is
      this.url = this.fullUrl;
    }
  }
  next();
});

module.exports = mongoose.model("PageContext", PageContextSchema);
