// File: frontend/src/components/ElementForm.jsx

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";

const ElementForm = ({ element, onSuccess }) => {
  const navigate = useNavigate();
  const { siteId, pageId } = useParams();

  const [formData, setFormData] = useState({
    pageContextId: pageId,
    name: element?.name || "",
    description: element?.description || "",
    selectors: {
      css: element?.selectors?.css || "",
      xpath: element?.selectors?.xpath || "",
      id: element?.selectors?.id || "",
    },
    status: element?.status || "active",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle nested selector fields
    if (name.startsWith("selector.")) {
      const selectorType = name.split(".")[1];
      setFormData({
        ...formData,
        selectors: {
          ...formData.selectors,
          [selectorType]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation: at least one selector must be provided
    if (
      !formData.selectors.css &&
      !formData.selectors.xpath &&
      !formData.selectors.id
    ) {
      setError("At least one selector (CSS, XPath, or ID) must be provided");
      setLoading(false);
      return;
    }

    try {
      if (element?._id) {
        // Update existing element
        await api.put(`/elements/${element._id}`, formData);
      } else {
        // Create new element
        await api.post("/elements", formData);
      }

      setLoading(false);
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(`/sites/${siteId}/pages/${pageId}/elements`);
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
          {element?._id ? "Edit Element" : "Add New Element"}
        </h5>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Element Name
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Login Button, Header Logo, etc."
            />
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              className="form-control"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe this element and its importance..."
              rows="3"
            ></textarea>
          </div>

          <div className="mb-3">
            <label className="form-label">Selectors</label>
            <p className="form-text text-muted">
              Provide at least one selector to identify the element.
            </p>

            <div className="mb-2">
              <label htmlFor="selector.css" className="form-label">
                CSS Selector
              </label>
              <input
                type="text"
                className="form-control"
                id="selector.css"
                name="selector.css"
                value={formData.selectors.css}
                onChange={handleChange}
                placeholder="e.g., #login-button, .header-logo"
              />
            </div>

            <div className="mb-2">
              <label htmlFor="selector.xpath" className="form-label">
                XPath Selector
              </label>
              <input
                type="text"
                className="form-control"
                id="selector.xpath"
                name="selector.xpath"
                value={formData.selectors.xpath}
                onChange={handleChange}
                placeholder="e.g., //button[@id='login-button']"
              />
            </div>

            <div className="mb-2">
              <label htmlFor="selector.id" className="form-label">
                Element ID
              </label>
              <input
                type="text"
                className="form-control"
                id="selector.id"
                name="selector.id"
                value={formData.selectors.id}
                onChange={handleChange}
                placeholder="e.g., login-button"
              />
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
              <option value="changed">Changed</option>
              <option value="missing">Missing</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div className="d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                navigate(`/sites/${siteId}/pages/${pageId}/elements`)
              }
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Element"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ElementForm;
