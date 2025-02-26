// File: backend/models/Site.js

const mongoose = require("mongoose");

const SiteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a site name"],
      trim: true,
    },
    url: {
      type: String,
      required: [true, "Please provide a site URL"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "error"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Site", SiteSchema);
