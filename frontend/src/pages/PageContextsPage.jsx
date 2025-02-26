// File: frontend/src/pages/PageContextsPage.jsx

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../utils/api";

const PageContextsPage = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [pageContexts, setPageContexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch site details
        const siteResponse = await api.get(`/sites/${siteId}`);
        setSite(siteResponse.data);

        // Fetch page contexts for this site
        const pageContextsResponse = await api.get(
          `/page-contexts/site/${siteId}`
        );
        setPageContexts(pageContextsResponse.data);

        setError(null);
      } catch (err) {
        setError("Failed to fetch data. Please try again.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [siteId]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this page context?")) {
      try {
        await api.delete(`/page-contexts/${id}`);
        // Remove the page context from the state
        setPageContexts(pageContexts.filter((page) => page._id !== id));
      } catch (err) {
        setError("Failed to delete page context. Please try again.");
        console.error("Error deleting page context:", err);
      }
    }
  };

  // Function to get the full URL for a page
  const getPageUrl = (page) => {
    if (page.fullUrl) {
      return page.fullUrl;
    }
    return `${site?.url || ""}${page.url}`;
  };

  // Function to display URL in a user-friendly format
  const displayUrl = (page) => {
    if (page.fullUrl) {
      return (
        <>
          {page.fullUrl}
          <span className="badge bg-info ms-2">External</span>
        </>
      );
    }
    return `${site?.url || ""}${page.url}`;
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <h2>Page Contexts</h2>
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
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/sites">Sites</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Pages for {site?.name}
          </li>
        </ol>
      </nav>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Pages for {site?.name}</h2>
        <Link to={`/sites/${siteId}/pages/new`} className="btn btn-primary">
          Add New Page
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {pageContexts.length === 0 && !loading ? (
        <div className="alert alert-info">
          No pages found for this site. Click "Add New Page" to get started.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Order</th>
                <th>Name</th>
                <th>URL</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageContexts.map((page) => (
                <tr key={page._id}>
                  <td>{page.order}</td>
                  <td>{page.name}</td>
                  <td>
                    <a
                      href={getPageUrl(page)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-truncate d-inline-block"
                      style={{ maxWidth: "300px" }}
                    >
                      {displayUrl(page)}
                    </a>
                  </td>
                  <td>
                    <span className={`badge bg-${getBadgeColor(page.status)}`}>
                      {page.status}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group" role="group">
                      <Link
                        to={`/sites/${siteId}/pages/${page._id}/edit`}
                        className="btn btn-sm btn-outline-primary"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(page._id)}
                        className="btn btn-sm btn-outline-danger"
                      >
                        Delete
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        disabled
                        title="Coming soon in the next phase"
                      >
                        Elements
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

export default PageContextsPage;
