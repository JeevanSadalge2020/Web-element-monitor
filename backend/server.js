// File: backend/server.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const pageContextRoutes = require("./routes/pageContextRoutes");

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// CORS configuration - Update this part
app.use(
  cors({
    origin: "http://localhost:3000", // Your frontend URL
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

// Connect to MongoDB
// Update your MongoDB connection code in server.js
const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/wem",
      {
        serverSelectionTimeoutMS: 5000, // Lower timeout for faster feedback
        connectTimeoutMS: 10000,
      }
    );
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    console.error(
      "Connection details:",
      process.env.MONGO_URI || "mongodb://localhost:27017/wem"
    );
    console.error("Make sure MongoDB is running and accessible");
    process.exit(1);
  }
};

// Run the connection
connectDB();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
