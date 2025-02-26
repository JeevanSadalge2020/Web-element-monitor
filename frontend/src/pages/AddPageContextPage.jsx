// File: frontend/src/pages/AddPageContextPage.jsx

import { useParams, Link } from "react-router-dom";
import PageContextForm from "../components/PageContextForm";

const AddPageContextPage = () => {
  const { siteId } = useParams();

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
            Add New Page
          </li>
        </ol>
      </nav>

      <h2 className="mb-4">Add New Page</h2>
      <PageContextForm />
    </div>
  );
};

export default AddPageContextPage;
