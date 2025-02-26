// File: frontend/src/pages/EditSitePage.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SiteForm from "../components/SiteForm";
import api from "../utils/api";

const EditSitePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSite = async () => {
      try {
        const response = await api.get(`/sites/${id}`);
        setSite(response.data);
      } catch (err) {
        setError("Failed to fetch site details");
        console.error("Error fetching site:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSite();
  }, [id]);

  if (loading) {
    return (
      <div className="container mt-4">
        <h2>Edit Site</h2>
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
        <h2>Edit Site</h2>
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-primary" onClick={() => navigate("/sites")}>
          Back to Sites
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Edit Site</h2>
      {site && <SiteForm site={site} />}
    </div>
  );
};

export default EditSitePage;
