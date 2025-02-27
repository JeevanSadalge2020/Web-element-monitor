// File: frontend/src/pages/AddElementPage.jsx

import { useParams, Link } from "react-router-dom";
import ElementForm from "../components/ElementForm";

const AddElementPage = () => {
  const { siteId, pageId } = useParams();

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
            Add New Element
          </li>
        </ol>
      </nav>

      <h2 className="mb-4">Add New Element</h2>
      <ElementForm />
    </div>
  );
};

export default AddElementPage;
