// File: frontend/src/App.jsx

import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

// Import Pages
import SitesPage from "./pages/sitesPage";
import AddSitePage from "./pages/AddSitePage";
import EditSitePage from "./pages/EditSitePage";

// Navbar component
const Navbar = () => (
  <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
    <div className="container">
      <Link className="navbar-brand" to="/">
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
              Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/sites">
              Manage Sites
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
    <h2>Dashboard</h2>
    <p>Welcome to Web Element Monitor</p>
    <div className="row mt-4">
      <div className="col-md-6">
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Get Started</h5>
            <p className="card-text">
              Begin by adding websites you want to monitor.
            </p>
            <Link to="/sites" className="btn btn-primary">
              Manage Sites
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/sites" element={<SitesPage />} />
        <Route path="/sites/new" element={<AddSitePage />} />
        <Route path="/sites/:id/edit" element={<EditSitePage />} />
      </Routes>
    </Router>
  );
}

export default App;
