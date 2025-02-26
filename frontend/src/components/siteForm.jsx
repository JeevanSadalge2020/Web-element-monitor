// File: frontend/src/components/SiteForm.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const SiteForm = ({ site, onSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: site?.name || "",
    url: site?.url || "",
    status: site?.status || "active",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (site?._id) {
        // Update existing site
        await api.put(`/sites/${site._id}`, formData);
      } else {
        // Create new site
        await api.post("/sites", formData);
      }

      setLoading(false);
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/sites");
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
          {site?._id ? "Edit Site" : "Add New Site"}
        </h5>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Site Name
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="url" className="form-label">
              Site URL
            </label>
            <input
              type="url"
              className="form-control"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://example.com"
              required
            />
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
              onClick={() => navigate("/sites")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Site"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SiteForm;
