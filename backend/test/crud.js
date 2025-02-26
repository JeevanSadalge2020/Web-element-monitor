// File: backend/test/testSiteApi.js

const axios = require("axios");

const API_URL = "http://localhost:9000/api/sites";
let createdSiteId;

// Test creating a site
async function testCreateSite() {
  try {
    const response = await axios.post(API_URL, {
      name: "Test Site",
      url: "https://www.example.com",
    });
    console.log("Create site response:", response.data);
    createdSiteId = response.data._id;
    return response.data;
  } catch (error) {
    console.error(
      "Error creating site:",
      error.response?.data || error.message
    );
  }
}

// Test getting all sites
async function testGetAllSites() {
  try {
    const response = await axios.get(API_URL);
    console.log("All sites:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error getting sites:",
      error.response?.data || error.message
    );
  }
}

// Test getting a site by ID
async function testGetSiteById(id) {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    console.log("Site by ID:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error getting site by ID:",
      error.response?.data || error.message
    );
  }
}

// Test updating a site
async function testUpdateSite(id) {
  try {
    const response = await axios.put(`${API_URL}/${id}`, {
      name: "Updated Test Site",
      status: "inactive",
    });
    console.log("Updated site:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error updating site:",
      error.response?.data || error.message
    );
  }
}

// Test deleting a site
async function testDeleteSite(id) {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    console.log("Delete site response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting site:",
      error.response?.data || error.message
    );
  }
}

// Run all tests
async function runTests() {
  // Create a site and get its ID
  const createdSite = await testCreateSite();
  if (!createdSite) return;

  // Get all sites
  await testGetAllSites();

  // Get the site by ID
  await testGetSiteById(createdSite._id);

  // Update the site
  await testUpdateSite(createdSite._id);

  // Delete the site
  await testDeleteSite(createdSite._id);

  // Confirm it's deleted by trying to get all sites again
  await testGetAllSites();
}

runTests();
