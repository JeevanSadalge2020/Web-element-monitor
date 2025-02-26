import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

// Placeholder components - we'll create these later
const Navbar = () => (
  <nav className="navbar navbar-dark bg-primary mb-4">
    <div className="container">
      <span className="navbar-brand">Web Element Monitor</span>
    </div>
  </nav>
);
const Dashboard = () => (
  <div className="container">
    <h1>Dashboard</h1>
    <p>Welcome to Web Element Monitor</p>
  </div>
);

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
