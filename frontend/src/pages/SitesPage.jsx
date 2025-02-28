// File: frontend/src/pages/SitesPage.jsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";

const SitesPage = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const response = await api.get("/sites");
      setSites(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch sites. Please try again.");
      console.error("Error fetching sites:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this site?")) {
      try {
        await api.delete(`/sites/${id}`);
        // Remove the site from the state
        setSites(sites.filter((site) => site._id !== id));
      } catch (err) {
        setError("Failed to delete site. Please try again.");
        console.error("Error deleting site:", err);
      }
    }
  };

  if (loading && sites.length === 0) {
    return (
      <div className="container mt-4">
        <h2>Monitored Sites</h2>
        <div className="d-flex justify-content-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Monitored Sites</h2>
        <Link to="/sites/new" className="btn btn-primary">
          Add New Site
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {sites.length === 0 && !loading ? (
        <div className="alert alert-info">
          No sites found. Click "Add New Site" to get started.
        </div>
      ) : (
        <div className="sites-grid animated fadeIn">
          {sites.map((site) => (
            <div key={site._id} className="site-card">
              <div className="site-card-header">
                <h5 className="site-card-title">{site.name}</h5>
                <span className={`site-status ${site.status}`}>
                  {site.status}
                </span>
              </div>

              <div className="site-card-body">
                <a
                  href={site.url}
                  className="site-url"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="bi bi-link-45deg me-1"></i> {site.url}
                </a>
              </div>

              <div className="site-card-footer">
                <div className="site-card-actions">
                  <Link
                    to={`/sites/${site._id}/edit`}
                    className="btn btn-sm btn-outline-primary"
                  >
                    <i className="bi bi-pencil-square"></i> Edit
                  </Link>

                  <button
                    onClick={() => handleDelete(site._id)}
                    className="btn btn-sm btn-outline-danger"
                  >
                    <i className="bi bi-trash"></i> Delete
                  </button>

                  <Link
                    to={`/sites/${site._id}/pages`}
                    className="btn btn-sm btn-outline-secondary"
                  >
                    <i className="bi bi-files"></i> Pages
                  </Link>

                  <Link
                    to={`/sites/${site._id}/monitoring`}
                    className="btn btn-sm btn-outline-info"
                  >
                    <i className="bi bi-bar-chart"></i> Monitoring
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Site Card */}
          <Link to="/sites/new" className="add-site-card animated pulse">
            <div className="add-site-icon">
              <i className="bi bi-plus-lg"></i>
            </div>
            <div className="add-site-text">Add New Site</div>
          </Link>
        </div>
      )}
    </div>
  );
};

// Helper function to determine badge color based on status
const getBadgeColor = (status) => {
  switch (status) {
    case "active":
      return "success";
    case "inactive":
      return "warning";
    case "error":
      return "danger";
    default:
      return "secondary";
  }
};

export default SitesPage;
