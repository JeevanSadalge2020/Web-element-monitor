// File: backend/test/testElementApi.js

const axios = require("axios");

const API_URL = "http://localhost:9000/api/elements";
let createdElementId;
let testPageContextId = ""; // Replace with an actual pageContext ID from your database

// Test creating an element
async function testCreateElement() {
  try {
    const response = await axios.post(API_URL, {
      pageContextId: testPageContextId,
      name: "Test Button",
      description: "A button used for testing",
      selectors: {
        css: "#test-button",
        xpath: "//button[@id='test-button']",
        id: "test-button",
      },
      status: "active",
    });
    console.log("Create element response:", response.data);
    createdElementId = response.data._id;
    return response.data;
  } catch (error) {
    console.error(
      "Error creating element:",
      error.response?.data || error.message
    );
  }
}

// Test getting all elements for a page context
async function testGetAllElements() {
  try {
    const response = await axios.get(`${API_URL}/page/${testPageContextId}`);
    console.log("All elements for page context:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error getting elements:",
      error.response?.data || error.message
    );
  }
}

// Test getting an element by ID
async function testGetElementById(id) {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    console.log("Element by ID:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error getting element by ID:",
      error.response?.data || error.message // File: backend/test/testElementApi.js (continued)
    );
  }
}

// Test updating an element
async function testUpdateElement(id) {
  try {
    const response = await axios.put(`${API_URL}/${id}`, {
      name: "Updated Test Button",
      description: "An updated button used for testing",
      selectors: {
        css: "#updated-test-button",
        xpath: "//button[@id='updated-test-button']",
        id: "updated-test-button",
      },
      status: "changed",
    });
    console.log("Updated element:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error updating element:",
      error.response?.data || error.message
    );
  }
}

// Test deleting an element
async function testDeleteElement(id) {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    console.log("Delete element response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting element:",
      error.response?.data || error.message
    );
  }
}

// First, we need to get a page context ID to use for testing
// First, we need to get a page context ID to use for testing
async function getPageContextId() {
  try {
    // First, get a site ID
    const sitesResponse = await axios.get("http://localhost:9000/api/sites");
    if (!sitesResponse.data || sitesResponse.data.length === 0) {
      console.log("No sites found for testing. Please create one first.");
      return null;
    }

    const siteId = sitesResponse.data[0]._id;

    // Now get page contexts for this site
    const response = await axios.get(
      `http://localhost:9000/api/page-contexts/site/${siteId}`
    );
    if (response.data && response.data.length > 0) {
      return response.data[0]._id;
    } else {
      console.log(
        "No page contexts found for testing. Please create one first."
      );
      return null;
    }
  } catch (error) {
    console.error("Error getting page contexts:", error);
    return null;
  }
}

// Run all tests
async function runTests() {
  // Get a page context ID to use for testing
  testPageContextId = await getPageContextId();
  if (!testPageContextId) {
    console.log(
      "Could not get a valid page context ID. Tests cannot continue."
    );
    return;
  }

  console.log("Using page context ID:", testPageContextId);

  // Create an element and get its ID
  const createdElement = await testCreateElement();
  if (!createdElement) {
    console.log("Failed to create element. Tests cannot continue.");
    return;
  }

  // Get all elements for the page context
  await testGetAllElements();

  // Get the element by ID
  await testGetElementById(createdElement._id);

  // Update the element
  await testUpdateElement(createdElement._id);

  // Delete the element
  await testDeleteElement(createdElement._id);

  // Confirm it's deleted by trying to get all elements again
  await testGetAllElements();
}

runTests();
