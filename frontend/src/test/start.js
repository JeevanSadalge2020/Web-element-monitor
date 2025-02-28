// File: start.js
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

// Define paths
const backendPath = path.join(__dirname, "backend");
const frontendPath = path.join(__dirname, "frontend");

// Check if backend directory exists
if (!fs.existsSync(backendPath)) {
  console.error("Backend directory not found!");
  process.exit(1);
}

// Check if frontend directory exists
if (!fs.existsSync(frontendPath)) {
  console.error("Frontend directory not found!");
  process.exit(1);
}

console.log("Starting backend server...");
const backendProcess = exec("npm start", { cwd: backendPath });

backendProcess.stdout.on("data", (data) => {
  console.log(`Backend: ${data}`);
});

backendProcess.stderr.on("data", (data) => {
  console.error(`Backend Error: ${data}`);
});

console.log("Starting frontend server...");
const frontendProcess = exec("npm run dev", { cwd: frontendPath });

frontendProcess.stdout.on("data", (data) => {
  console.log(`Frontend: ${data}`);
});

frontendProcess.stderr.on("data", (data) => {
  console.error(`Frontend Error: ${data}`);
});

process.on("SIGINT", () => {
  console.log("Shutting down servers...");
  backendProcess.kill();
  frontendProcess.kill();
  process.exit(0);
});
