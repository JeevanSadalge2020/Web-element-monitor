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
    <div className="site-form-container">
      <div className="site-form-card animated fadeIn">
        <div className="site-form-header">
          <h5 className="site-form-title">
            {site?._id ? "Edit Site" : "Add New Site"}
          </h5>
        </div>

        <div className="site-form-body">
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="floating-label required mb-3">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder=" "
              />
              <label htmlFor="name">Site Name</label>
            </div>

            {/* other enhanced form fields */}

            <div className="form-actions">
              <button
                type="button"
                className="btn-form btn-form-secondary"
                onClick={() => navigate("/sites")}
              >
                <i className="bi bi-x-circle"></i> Cancel
              </button>

              <button
                type="submit"
                className="btn-form btn-form-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle"></i> Save Site
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SiteForm;
