// File: frontend/src/pages/MonitoringPage.jsx

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import MonitoringResultsComponent from "../components/MonitoringResultsComponent";

const MonitoringPage = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [monitoringRuns, setMonitoringRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch site details
        const siteResponse = await api.get(`/sites/${siteId}`);
        setSite(siteResponse.data);

        // Fetch monitoring runs for this site
        const runsResponse = await api.get(`/monitoring/site/${siteId}`);
        setMonitoringRuns(runsResponse.data);

        setError(null);
      } catch (err) {
        setError("Failed to fetch data. Please try again.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [siteId]);

  const handleStartMonitoring = async () => {
    try {
      setLoading(true);
      const response = await api.post(`/monitoring/site/${siteId}`);

      // Add the new run to the list
      const newRunId = response.data.runId;

      // Fetch the new monitoring run
      const runResponse = await api.get(`/monitoring/${newRunId}`);
      setMonitoringRuns([runResponse.data, ...monitoringRuns]);

      // Show the results
      setSelectedRunId(newRunId);
      setShowResults(true);

      setLoading(false);
    } catch (err) {
      setError("Failed to start monitoring. Please try again.");
      console.error("Error starting monitoring:", err);
      setLoading(false);
    }
  };

  const handleViewResults = (runId) => {
    setSelectedRunId(runId);
    setShowResults(true);
  };

  const handleCloseResults = () => {
    setShowResults(false);
  };

  // Refresh the runs data
  const refreshRuns = async () => {
    try {
      setLoading(true);
      const runsResponse = await api.get(`/monitoring/site/${siteId}`);
      setMonitoringRuns(runsResponse.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to refresh data. Please try again.");
      console.error("Error refreshing data:", err);
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading && !site) {
    return (
      <div className="container mt-4">
        <h2>Monitoring History</h2>
        <div className="d-flex justify-content-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
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
          <li className="breadcrumb-item active" aria-current="page">
            Monitoring for {site?.name}
          </li>
        </ol>
      </nav>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Monitoring for {site?.name}</h2>
        <div>
          <button
            className="btn btn-primary"
            onClick={handleStartMonitoring}
            disabled={loading}
          >
            {loading ? "Starting..." : "Start New Monitoring Run"}
          </button>
          <button
            className="btn btn-outline-secondary ms-2"
            onClick={refreshRuns}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {showResults && selectedRunId && (
        <MonitoringResultsComponent
          monitoringRunId={selectedRunId}
          onClose={handleCloseResults}
        />
      )}

      {monitoringRuns.length === 0 && !loading ? (
        <div className="alert alert-info">
          No monitoring runs found for this site. Click "Start New Monitoring
          Run" to begin.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Run ID</th>
                <th>Started</th>
                <th>Ended</th>
                <th>Status</th>
                <th>Results</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {monitoringRuns.map((run) => (
                <tr key={run._id}>
                  <td>{run._id.substring(0, 8)}...</td>
                  <td>{formatDate(run.startTime)}</td>
                  <td>
                    {run.endTime ? formatDate(run.endTime) : "In Progress"}
                  </td>
                  <td>
                    <span
                      className={`badge bg-${getStatusBadgeColor(run.status)}`}
                    >
                      {run.status}
                    </span>
                  </td>
                  <td>
                    {run.summary ? (
                      <div>
                        {run.summary.changedElements > 0 && (
                          <span className="badge bg-warning me-1">
                            {run.summary.changedElements} Changed
                          </span>
                        )}
                        {run.summary.missingElements > 0 && (
                          <span className="badge bg-danger me-1">
                            {run.summary.missingElements} Missing
                          </span>
                        )}
                        {run.summary.errorElements > 0 && (
                          <span className="badge bg-secondary me-1">
                            {run.summary.errorElements} Errors
                          </span>
                        )}
                        {run.summary.changedElements === 0 &&
                          run.summary.missingElements === 0 &&
                          run.summary.errorElements === 0 && (
                            <span className="badge bg-success">All Good</span>
                          )}
                      </div>
                    ) : run.status === "running" ? (
                      <span className="badge bg-info">In Progress</span>
                    ) : (
                      <span className="badge bg-secondary">No Data</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleViewResults(run._id)}
                      className="btn btn-sm btn-outline-primary"
                    >
                      View Results
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Helper function to determine badge color based on status
const getStatusBadgeColor = (status) => {
  switch (status) {
    case "running":
      return "info";
    case "completed":
      return "success";
    case "failed":
      return "danger";
    default:
      return "secondary";
  }
};

export default MonitoringPage;
