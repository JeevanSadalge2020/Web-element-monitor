// File: frontend/src/pages/EditElementPage.jsx

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ElementForm from "../components/ElementForm";
import api from "../utils/api";

const EditElementPage = () => {
  const { siteId, pageId, elementId } = useParams();
  const navigate = useNavigate();
  const [element, setElement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchElement = async () => {
      try {
        const response = await api.get(`/elements/${elementId}`);
        setElement(response.data);
      } catch (err) {
        setError("Failed to fetch element details");
        console.error("Error fetching element:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchElement();
  }, [elementId]);

  if (loading) {
    return (
      <div className="container mt-4">
        <h2>Edit Element</h2>
        <div className="d-flex justify-content-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <h2>Edit Element</h2>
        <div className="alert alert-danger">{error}</div>
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/sites/${siteId}/pages/${pageId}/elements`)}
        >
          Back to Elements
        </button>
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
          <li className="breadcrumb-item">
            <Link to={`/sites/${siteId}/pages/${pageId}/elements`}>
              Elements
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Edit Element
          </li>
        </ol>
      </nav>

      <h2 className="mb-4">Edit Element</h2>
      {element && <ElementForm element={element} />}
    </div>
  );
};

export default EditElementPage;
