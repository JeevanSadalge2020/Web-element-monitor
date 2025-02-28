// File: frontend/src/App.jsx

import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import PageContextsPage from "./pages/PageContextsPage";
import AddPageContextPage from "./pages/AddPageContextPage";
import EditPageContextPage from "./pages/EditPageContextPage";

// Add these imports at the top of your App.jsx file
import ElementsPage from "./pages/ElementsPage";
import AddElementPage from "./pages/AddElementPage";
import EditElementPage from "./pages/EditElementPage";
import MonitoringPage from "./pages/MonitoringPage"; // Add this new import

// Import Pages
import SitesPage from "./pages/SitesPage";
import AddSitePage from "./pages/AddSitePage";
import EditSitePage from "./pages/EditSitePage";

// Navbar component
const Navbar = () => (
  <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
    <div className="container">
      <Link className="navbar-brand" to="/">
        <i className="bi bi-braces-asterisk me-2"></i>
        Web Element Monitor
      </Link>
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link className="nav-link" to="/">
              <i className="bi bi-speedometer2 me-1"></i> Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/sites">
              <i className="bi bi-globe me-1"></i> Manage Sites
            </Link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
);

// Dashboard component
const Dashboard = () => (
  <div className="container mt-4">
    <div className="dashboard-header animated fadeInDown">
      <h2 className="dashboard-title">
        <i className="bi bi-speedometer2 me-2"></i> Dashboard
      </h2>
    </div>

    <div className="stats-container animated fadeIn">
      <div className="stat-card primary">
        <div className="stat-value">5</div>
        <div className="stat-label">Monitored Sites</div>
        <i className="bi bi-globe stat-icon"></i>
      </div>

      <div className="stat-card success">
        <div className="stat-value">24</div>
        <div className="stat-label">Active Elements</div>
        <i className="bi bi-check-circle stat-icon"></i>
      </div>

      <div className="stat-card warning">
        <div className="stat-value">3</div>
        <div className="stat-label">Changed Elements</div>
        <i className="bi bi-exclamation-triangle stat-icon"></i>
      </div>

      <div className="stat-card danger">
        <div className="stat-value">1</div>
        <div className="stat-label">Missing Elements</div>
        <i className="bi bi-x-circle stat-icon"></i>
      </div>
    </div>

    <div className="row mt-4 animated fadeInUp">
      <div className="col-md-6">
        <div className="card shadow-hover">
          <div className="card-body">
            <h5 className="card-title">Get Started</h5>
            <p className="card-text">
              Begin by adding websites you want to monitor.
            </p>
            <Link to="/sites" className="btn btn-primary">
              <i className="bi bi-globe me-2"></i> Manage Sites
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Update your routes
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/sites" element={<SitesPage />} />
        <Route path="/sites/new" element={<AddSitePage />} />
        <Route path="/sites/:id/edit" element={<EditSitePage />} />
        <Route path="/sites/:siteId/pages" element={<PageContextsPage />} />
        <Route
          path="/sites/:siteId/pages/new"
          element={<AddPageContextPage />}
        />
        <Route
          path="/sites/:siteId/pages/:pageId/edit"
          element={<EditPageContextPage />}
        />
        <Route
          path="/sites/:siteId/pages/:pageId/elements"
          element={<ElementsPage />}
        />
        <Route
          path="/sites/:siteId/pages/:pageId/elements/new"
          element={<AddElementPage />}
        />
        <Route
          path="/sites/:siteId/pages/:pageId/elements/:elementId/edit"
          element={<EditElementPage />}
        />
        {/* Add the new monitoring route */}
        <Route path="/sites/:siteId/monitoring" element={<MonitoringPage />} />
      </Routes>
    </Router>
  );
}

export default App;
