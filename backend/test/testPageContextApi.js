// File: backend/test/testPageContextApi.js

const axios = require("axios");

const API_URL = "http://localhost:9000/api/page-contexts";
let createdPageContextId;
let testSiteId = ""; // Using let instead of const to allow reassignment

// Test creating a page context
async function testCreatePageContext() {
  try {
    const response = await axios.post(API_URL, {
      siteId: testSiteId,
      name: "Test Homepage",
      url: "/",
      order: 0,
    });
    console.log("Create page context response:", response.data);
    createdPageContextId = response.data._id;
    return response.data;
  } catch (error) {
    console.error(
      "Error creating page context:",
      error.response?.data || error.message
    );
  }
}

// Test getting all page contexts for a site
async function testGetAllPageContexts() {
  try {
    const response = await axios.get(`${API_URL}/site/${testSiteId}`);
    console.log("All page contexts for site:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error getting page contexts:",
      error.response?.data || error.message
    );
  }
}

// Test getting a page context by ID
async function testGetPageContextById(id) {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    console.log("Page context by ID:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error getting page context by ID:",
      error.response?.data || error.message
    );
  }
}

// Test updating a page context
async function testUpdatePageContext(id) {
  try {
    const response = await axios.put(`${API_URL}/${id}`, {
      name: "Updated Test Homepage",
      url: "/home",
      status: "inactive",
    });
    console.log("Updated page context:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error updating page context:",
      error.response?.data || error.message
    );
  }
}

// Test deleting a page context
async function testDeletePageContext(id) {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    console.log("Delete page context response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting page context:",
      error.response?.data || error.message
    );
  }
}

// First, create or get a site ID to use for testing
async function getSiteId() {
  try {
    const response = await axios.get("http://localhost:9000/api/sites");
    if (response.data && response.data.length > 0) {
      return response.data[0]._id;
    } else {
      // Create a test site if none exists
      const siteResponse = await axios.post("http://localhost:9000/api/sites", {
        name: "Test Site for Page Context",
        url: "https://example.com",
      });
      return siteResponse.data._id;
    }
  } catch (error) {
    console.error("Error getting/creating site:", error);
    // Return a fallback ID if you have one, or null
    return null;
  }
}

// Run all tests
async function runTests() {
  // Get a site ID to use for testing
  const siteId = await getSiteId();
  if (!siteId) {
    console.log("Could not get a valid site ID. Tests cannot continue.");
    return;
  }

  testSiteId = siteId;
  console.log("Using site ID:", testSiteId);

  // Create a page context and get its ID
  const createdPageContext = await testCreatePageContext();
  if (!createdPageContext) {
    console.log("Failed to create page context. Tests cannot continue.");
    return;
  }

  // Get all page contexts for the site
  await testGetAllPageContexts();

  // Get the page context by ID
  await testGetPageContextById(createdPageContext._id);

  // Update the page context
  await testUpdatePageContext(createdPageContext._id);

  // Delete the page context
  await testDeletePageContext(createdPageContext._id);

  // Confirm it's deleted by trying to get all page contexts again
  await testGetAllPageContexts();
}

runTests();
