// File: backend/server.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const pageContextRoutes = require("./routes/pageContextRoutes");

// Add this with your other requires at the top
const monitoringRoutes = require("./routes/monitoringRoutes");

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// CORS configuration - Update this part
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"], // Allow both ports
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Define routes
const siteRoutes = require("./routes/siteRoutes");
app.use("/api/sites", siteRoutes);

app.get("/", (req, res) => {
  res.send("Web Element Monitor API is running");
});

app.use("/api/page-contexts", pageContextRoutes);

const elementRoutes = require("./routes/elementRoutes");
app.use("/api/elements", elementRoutes);

const elementPickerRoutes = require("./routes/elementPickerRoutes");
app.use("/api/element-picker", elementPickerRoutes);

// Add this with your other route definitions
app.use("/api/monitoring", monitoringRoutes);

// Connect to MongoDB
// Update your MongoDB connection code in server.js
// This is the MongoDB connection section from server.js
// Replace the existing connectDB function with this one

const connectDB = async () => {
  // Try 3 times to connect to MongoDB
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      console.log(
        `MongoDB connection attempt ${attempts + 1}/${maxAttempts}...`
      );
      await mongoose.connect(
        process.env.MONGO_URI || "mongodb://localhost:27017/wem",
        {
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 10000,
          socketTimeoutMS: 45000,
          family: 4, // Use IPv4, skip trying IPv6
        }
      );
      console.log("MongoDB connected successfully");
      return; // Connection successful, exit the function
    } catch (error) {
      attempts++;
      console.error(
        `MongoDB connection attempt ${attempts} failed:`,
        error.message
      );

      if (attempts >= maxAttempts) {
        console.error("All MongoDB connection attempts failed");
        console.error(
          "Connection details:",
          process.env.MONGO_URI || "mongodb://localhost:27017/wem"
        );
        console.error("Make sure MongoDB is running and accessible");

        // For demo purposes, we'll set up a mock database in memory
        console.log("Setting up in-memory mock database for demo...");
        global.MockDB = {
          sites: [],
          pageContexts: [],
          elements: [],
          monitoringRuns: [],
        };
        return;
      }

      // Wait before trying again
      console.log(`Waiting 3 seconds before next attempt...`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
};

// Run the connection
connectDB();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
