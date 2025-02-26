// File: frontend/src/pages/EditPageContextPage.jsx

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import PageContextForm from "../components/PageContextForm";
import api from "../utils/api";

const EditPageContextPage = () => {
  const { siteId, pageId } = useParams();
  const navigate = useNavigate();
  const [pageContext, setPageContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPageContext = async () => {
      try {
        const response = await api.get(`/page-contexts/${pageId}`);
        setPageContext(response.data);
      } catch (err) {
        setError("Failed to fetch page details");
        console.error("Error fetching page context:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPageContext();
  }, [pageId]);

  if (loading) {
    return (
      <div className="container mt-4">
        <h2>Edit Page</h2>
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
        <h2>Edit Page</h2>
        <div className="alert alert-danger">{error}</div>
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/sites/${siteId}/pages`)}
        >
          Back to Pages
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
          <li className="breadcrumb-item active" aria-current="page">
            Edit Page
          </li>
        </ol>
      </nav>

      <h2 className="mb-4">Edit Page</h2>
      {pageContext && <PageContextForm pageContext={pageContext} />}
    </div>
  );
};

export default EditPageContextPage;
