// File: frontend/src/components/PageContextForm.jsx

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";

const PageContextForm = ({ pageContext, onSuccess }) => {
  const navigate = useNavigate();
  const { siteId } = useParams();
  const [site, setSite] = useState(null);

  const [formData, setFormData] = useState({
    siteId: siteId,
    name: pageContext?.name || "",
    url: pageContext?.url || "",
    fullUrl: pageContext?.fullUrl || "",
    order: pageContext?.order || 0,
    status: pageContext?.status || "active",
    navigationActions: pageContext?.navigationActions || [],
  });

  const [urlMode, setUrlMode] = useState(
    pageContext?.fullUrl ? "full" : "relative"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSite = async () => {
      try {
        const response = await api.get(`/sites/${siteId}`);
        setSite(response.data);
      } catch (err) {
        setError("Failed to fetch site details");
        console.error("Error fetching site:", err);
      }
    };

    fetchSite();
  }, [siteId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const toggleUrlMode = () => {
    setUrlMode(urlMode === "relative" ? "full" : "relative");
  };

  const validateUrl = () => {
    if (urlMode === "full") {
      if (!formData.fullUrl) return "Full URL is required";
      try {
        new URL(formData.fullUrl); // This will throw an error if invalid
      } catch (e) {
        return "Please enter a valid URL including http:// or https://";
      }
    } else {
      if (!formData.url) return "URL path is required";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate URL
    const urlError = validateUrl();
    if (urlError) {
      setError(urlError);
      return;
    }

    setLoading(true);
    setError(null);

    // Prepare data based on URL mode
    let dataToSubmit = { ...formData };
    if (urlMode === "full") {
      // We're using a full URL - extract the path for backwards compatibility
      try {
        const urlObj = new URL(formData.fullUrl);
        dataToSubmit.url = urlObj.pathname || "/";
      } catch (e) {
        // If parsing fails, keep the original URL
      }
    } else {
      // We're using a relative URL - clear the fullUrl
      dataToSubmit.fullUrl = "";
    }

    try {
      if (pageContext?._id) {
        // Update existing page context
        await api.put(`/page-contexts/${pageContext._id}`, dataToSubmit);
      } else {
        // Create new page context
        await api.post("/page-contexts", dataToSubmit);
      }

      setLoading(false);
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(`/sites/${siteId}/pages`);
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">
          {pageContext?._id ? "Edit Page" : "Add New Page"}
        </h5>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Page Name
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Homepage, Product Listing, etc."
            />
          </div>

          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="form-label mb-0">Page URL</label>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={toggleUrlMode}
              >
                Switch to{" "}
                {urlMode === "relative" ? "Full URL" : "Relative Path"}
              </button>
            </div>

            {urlMode === "relative" ? (
              <div className="input-group">
                <span className="input-group-text">
                  {site?.url || "https://example.com"}
                </span>
                <input
                  type="text"
                  className="form-control"
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  required
                  placeholder="/path/to/page"
                />
              </div>
            ) : (
              <input
                type="url"
                className="form-control"
                id="fullUrl"
                name="fullUrl"
                value={formData.fullUrl}
                onChange={handleChange}
                required
                placeholder="https://example.com/path"
              />
            )}
            <div className="form-text">
              {urlMode === "relative"
                ? "Enter the path part of the URL (e.g., /products, /about)"
                : "Enter the complete URL including http:// or https://"}
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="order" className="form-label">
              Navigation Order
            </label>
            <input
              type="number"
              className="form-control"
              id="order"
              name="order"
              value={formData.order}
              onChange={handleChange}
              min="0"
            />
            <div className="form-text">
              Order in which pages should be navigated (0 = first)
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="status" className="form-label">
              Status
            </label>
            <select
              className="form-select"
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div className="d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(`/sites/${siteId}/pages`)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Page"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PageContextForm;
