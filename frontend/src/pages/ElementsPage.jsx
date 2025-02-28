// File: frontend/src/pages/ElementsPage.jsx

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../utils/api";

const ElementsPage = () => {
  const { siteId, pageId } = useParams();
  const navigate = useNavigate();
  const [pageContext, setPageContext] = useState(null);
  const [elements, setElements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch page context details
        const pageContextResponse = await api.get(`/page-contexts/${pageId}`);
        setPageContext(pageContextResponse.data);

        // Fetch elements for this page context
        const elementsResponse = await api.get(`/elements/page/${pageId}`);
        setElements(elementsResponse.data);

        setError(null);
      } catch (err) {
        setError("Failed to fetch data. Please try again.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pageId]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this element?")) {
      try {
        await api.delete(`/elements/${id}`);
        // Remove the element from the state
        setElements(elements.filter((element) => element._id !== id));
      } catch (err) {
        setError("Failed to delete element. Please try again.");
        console.error("Error deleting element:", err);
      }
    }
  };

  const handleLaunchPicker = async () => {
    try {
      setLoading(true);
      await api.post(`/element-picker/launch/${pageId}`);
      setLoading(false);

      // For the demo, we'll just show a message explaining what would happen in a real scenario
      alert(
        "Browser has been launched with the element picker!\n\n" +
          "In a real implementation, this would open a browser window where you can:\n" +
          "1. Click 'Start Picking' to highlight elements\n" +
          "2. Click on any element to select it\n" +
          "3. Name the element and click 'Save Element'\n\n" +
          "The selected element details would then be saved to the database."
      );

      // Refresh the elements list after a delay to simulate element picking
      setTimeout(() => {
        fetchElements();
      }, 2000);
    } catch (err) {
      setError("Failed to launch element picker. Please try again.");
      console.error("Error launching element picker:", err);
      setLoading(false);
    }
  };

  // Also add this function to refresh the elements list:
  const fetchElements = async () => {
    try {
      const elementsResponse = await api.get(`/elements/page/${pageId}`);
      setElements(elementsResponse.data);
    } catch (err) {
      console.error("Error fetching elements:", err);
    }
  };

  if (loading && !pageContext) {
    return (
      <div className="container mt-4">
        <h2>Elements</h2>
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
          <li className="breadcrumb-item">
            <Link to={`/sites/${siteId}/pages`}>Pages</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Elements for {pageContext?.name}
          </li>
        </ol>
      </nav>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Elements for {pageContext?.name}</h2>
        <div>
          <button
            className="element-picker-btn animated pulse"
            onClick={handleLaunchPicker}
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="bi bi-hourglass-split"></i> Launching...
              </>
            ) : (
              <>
                <i className="bi bi-eyeglasses"></i> Launch Element Picker
              </>
            )}
          </button>

          <Link
            to={`/sites/${siteId}/pages/${pageId}/elements/new`}
            className="btn btn-outline-primary ms-2"
          >
            <i className="bi bi-plus-circle"></i> Add Element Manually
          </Link>

          <Link
            to={`/sites/${siteId}/monitoring`}
            className="btn btn-outline-info ms-2"
          >
            <i className="bi bi-bar-chart"></i> View Monitoring
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {elements.length === 0 && !loading ? (
        <div className="empty-state animated fadeIn">
          <div className="empty-state-icon">
            <i className="bi bi-layers"></i>
          </div>
          <h4 className="empty-state-title">No Elements Found</h4>
          <p className="empty-state-description">
            No elements found for this page. Click "Launch Element Picker" to
            visually select elements, or "Add Element Manually" to create one by
            hand.
          </p>
          <button
            className="btn btn-primary"
            onClick={handleLaunchPicker}
            disabled={loading}
          >
            <i className="bi bi-eyeglasses me-2"></i>
            Launch Element Picker
          </button>
        </div>
      ) : (
        <div className="element-cards">
          {elements.map((element, index) => (
            <div
              key={element._id}
              className={`element-card ${element.status} animated fadeInUp`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="element-header">
                <h5 className="element-title">
                  <div className={`element-icon ${element.status}`}>
                    <i className={getIconByStatus(element.status)}></i>
                  </div>
                  {element.name}
                </h5>
                <span className={`element-status-badge ${element.status}`}>
                  {element.status}
                </span>
              </div>

              <div className="element-body">
                {element.description && (
                  <div className="element-description">
                    {element.description}
                  </div>
                )}

                <div className="element-selectors">
                  {element.selectors.css && (
                    <div className="selector-item">
                      <div className="selector-type">CSS</div>
                      <div className="selector-value">
                        {element.selectors.css}
                      </div>
                    </div>
                  )}
                  {element.selectors.xpath && (
                    <div className="selector-item">
                      <div className="selector-type">XPath</div>
                      <div className="selector-value">
                        {element.selectors.xpath}
                      </div>
                    </div>
                  )}
                  {element.selectors.id && (
                    <div className="selector-item">
                      <div className="selector-type">ID</div>
                      <div className="selector-value">
                        {element.selectors.id}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="element-footer">
                <div className="last-checked">
                  {element.lastChecked
                    ? `Last checked: ${new Date(
                        element.lastChecked
                      ).toLocaleString()}`
                    : "Never checked"}
                </div>

                <div className="element-actions">
                  <Link
                    to={`/sites/${siteId}/pages/${pageId}/elements/${element._id}/edit`}
                    className="btn btn-sm btn-outline-primary"
                  >
                    <i className="bi bi-pencil"></i> Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(element._id)}
                    className="btn btn-sm btn-outline-danger"
                  >
                    <i className="bi bi-trash"></i> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const getIconByStatus = (status) => {
  switch (status) {
    case "active":
      return "bi bi-check-circle";
    case "changed":
      return "bi bi-exclamation-triangle";
    case "missing":
      return "bi bi-x-circle";
    case "error":
      return "bi bi-question-circle";
    default:
      return "bi bi-dot";
  }
};

// Helper function to determine badge color based on status
const getBadgeColor = (status) => {
  switch (status) {
    case "active":
      return "success";
    case "changed":
      return "warning";
    case "missing":
      return "danger";
    case "error":
      return "secondary";
    default:
      return "info";
  }
};

export default ElementsPage;
