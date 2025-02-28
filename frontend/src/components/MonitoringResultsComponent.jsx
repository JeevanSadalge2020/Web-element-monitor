// File: frontend/src/components/MonitoringResultsComponent.jsx

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api";
import ElementChangeDetailsModal from "./ElementChangeDetailsModal";

const MonitoringResultsComponent = ({ monitoringRunId, onClose }) => {
  const [monitoringRun, setMonitoringRun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [elements, setElements] = useState({});
  const [pageContexts, setPageContexts] = useState({});
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    const fetchMonitoringRun = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/monitoring/${monitoringRunId}`);
        setMonitoringRun(response.data);

        // Extract all element and page IDs
        if (response.data.results && response.data.results.length > 0) {
          // Create arrays of unique IDs
          const elementIds = [
            ...new Set(
              response.data.results
                .filter((result) => result.elementId) // Make sure elementId exists
                .map((result) => result.elementId)
            ),
          ];

          const pageContextIds = [
            ...new Set(
              response.data.results
                .filter((result) => result.pageContextId) // Make sure pageContextId exists
                .map((result) => result.pageContextId)
            ),
          ];

          // Fetch all elements in a single call if possible
          const elementsMap = {};
          if (elementIds.length > 0) {
            try {
              // Fetch each element individually
              for (const elementId of elementIds) {
                const elementResponse = await api.get(`/elements/${elementId}`);
                elementsMap[elementId] = elementResponse.data;
              }
            } catch (err) {
              console.error("Error fetching elements:", err);
            }
          }
          setElements(elementsMap);

          // Fetch all page contexts
          const pageContextsMap = {};
          if (pageContextIds.length > 0) {
            try {
              // Fetch each page context individually
              for (const pageId of pageContextIds) {
                const pageResponse = await api.get(`/page-contexts/${pageId}`);
                pageContextsMap[pageId] = pageResponse.data;
              }
            } catch (err) {
              console.error("Error fetching page contexts:", err);
            }
          }
          setPageContexts(pageContextsMap);
        }

        setError(null);
      } catch (err) {
        setError("Failed to fetch monitoring run details");
        console.error("Error fetching monitoring run:", err);
      } finally {
        setLoading(false);
      }
    };

    if (monitoringRunId) {
      fetchMonitoringRun();
    }
  }, [monitoringRunId]);

  // Function to poll for updates if the run is still in progress
  useEffect(() => {
    if (monitoringRun && monitoringRun.status === "running") {
      const interval = setInterval(async () => {
        try {
          const response = await api.get(`/monitoring/${monitoringRunId}`);
          setMonitoringRun(response.data);

          if (response.data.status !== "running") {
            clearInterval(interval);
          }
        } catch (err) {
          console.error("Error polling monitoring run:", err);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [monitoringRun, monitoringRunId]);

  // Handle viewing element details
  const handleViewElementDetails = (result) => {
    // Prepare the result object with additional info
    const elementDetails =
      elements[result.elementId] ||
      (monitoringRun.elementDetails &&
        monitoringRun.elementDetails[result.elementId]) ||
      {};

    const pageDetails =
      pageContexts[result.pageContextId] ||
      (monitoringRun.pageContextDetails &&
        monitoringRun.pageContextDetails[result.pageContextId]) ||
      {};

    const enrichedResult = {
      ...result,
      element: elementDetails,
      elementName: elementDetails.name || "Unknown Element",
      pageName: pageDetails.name || "Unknown Page",
    };

    setSelectedResult(enrichedResult);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setSelectedResult(null);
  };

  if (loading) {
    return (
      <div className="loading-container animated fadeIn">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="loading-text mt-3">Loading monitoring results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger animated fadeIn">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {error}
        <button
          className="btn btn-sm btn-outline-danger ms-3"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    );
  }

  if (!monitoringRun) {
    return (
      <div className="alert alert-info animated fadeIn">
        <i className="bi bi-info-circle-fill me-2"></i>
        No monitoring data available.
        <button
          className="btn btn-sm btn-outline-primary ms-3"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  // Helper to get badge color for status
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

  // Helper to get badge color for change type
  const getChangeBadgeColor = (changeType) => {
    switch (changeType) {
      case "none":
        return "success";
      case "content":
        return "info";
      case "attribute":
        return "warning";
      case "position":
        return "primary";
      case "disappeared":
        return "danger";
      case "multiple":
        return "dark";
      default:
        return "secondary";
    }
  };

  // Get progress percentage for running monitors
  const getProgressPercentage = () => {
    if (monitoringRun.status !== "running" || !monitoringRun.results)
      return 100;
    if (!monitoringRun.summary || !monitoringRun.summary.totalElements)
      return 0;

    return Math.min(
      Math.round(
        (monitoringRun.results.length / monitoringRun.summary.totalElements) *
          100
      ),
      100
    );
  };

  return (
    <div className="monitoring-panel animated fadeIn">
      <div className="monitoring-panel-header">
        <h5 className="monitoring-panel-title">
          <i className="bi bi-graph-up me-2"></i>
          Monitoring Run Results
        </h5>
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={onClose}
        ></button>
      </div>

      <div className="monitoring-panel-body">
        <div className="run-timestamps">
          <div className="timestamp-item">
            <div className="timestamp-label">Started</div>
            <div className="timestamp-value">
              {formatDate(monitoringRun.startTime)}
            </div>
          </div>
          <div className="timestamp-item">
            <div className="timestamp-label">Status</div>
            <div className="timestamp-value">
              <span
                className={`badge bg-${getStatusBadgeColor(
                  monitoringRun.status
                )}`}
              >
                {monitoringRun.status === "running" ? (
                  <>
                    <i className="bi bi-arrow-repeat me-1 animated spin infinite"></i>{" "}
                    {monitoringRun.status}
                  </>
                ) : (
                  monitoringRun.status
                )}
              </span>
            </div>
          </div>
          <div className="timestamp-item">
            <div className="timestamp-label">Completed</div>
            <div className="timestamp-value">
              {monitoringRun.endTime
                ? formatDate(monitoringRun.endTime)
                : "In Progress"}
            </div>
          </div>
        </div>

        {monitoringRun.status === "running" && (
          <div className="alert alert-info animated pulse">
            <div className="d-flex align-items-center mb-2">
              <div className="loading-dots me-2">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div>
                Monitoring in progress... Please wait while we check your
                elements.
              </div>
            </div>
            <div className="progress" style={{ height: "8px" }}>
              <div
                className="progress-bar progress-bar-striped progress-bar-animated"
                role="progressbar"
                style={{ width: `${getProgressPercentage()}%` }}
                aria-valuenow={getProgressPercentage()}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
          </div>
        )}

        {monitoringRun.status === "failed" && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <strong>Error:</strong>{" "}
            {monitoringRun.error || "Unknown error during monitoring"}
          </div>
        )}

        {monitoringRun.status === "completed" && monitoringRun.summary && (
          <div className="run-summary animated fadeInUp">
            <div className="summary-item">
              <div className="summary-value">
                {monitoringRun.summary.totalElements}
              </div>
              <div className="summary-label">Total Elements</div>
            </div>
            <div className="summary-item changed">
              <div className="summary-value">
                {monitoringRun.summary.changedElements}
              </div>
              <div className="summary-label">Changed</div>
            </div>
            <div className="summary-item missing">
              <div className="summary-value">
                {monitoringRun.summary.missingElements}
              </div>
              <div className="summary-label">Missing</div>
            </div>
            <div className="summary-item error">
              <div className="summary-value">
                {monitoringRun.summary.errorElements}
              </div>
              <div className="summary-label">Errors</div>
            </div>
          </div>
        )}

        {monitoringRun.results && monitoringRun.results.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-sm table-hover results-table">
              <thead className="table-light">
                <tr>
                  <th>Element</th>
                  <th>Page</th>
                  <th>Status</th>
                  <th>Changes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {monitoringRun.results.map((result, index) => {
                  // Try to get element and page details from both places
                  const elementDetails =
                    elements[result.elementId] ||
                    (monitoringRun.elementDetails &&
                      monitoringRun.elementDetails[result.elementId]) ||
                    {};

                  const pageDetails =
                    pageContexts[result.pageContextId] ||
                    (monitoringRun.pageContextDetails &&
                      monitoringRun.pageContextDetails[result.pageContextId]) ||
                    {};

                  return (
                    <tr
                      key={index}
                      className={`result-row ${
                        result.changed ? "elementChanged" : ""
                      }`}
                      onClick={() => handleViewElementDetails(result)}
                    >
                      <td>
                        <div className="d-flex align-items-center">
                          <div
                            className={`status-indicator ${
                              result.found
                                ? result.changed
                                  ? "warning"
                                  : "success"
                                : "danger"
                            } me-2`}
                          ></div>
                          {elementDetails.name || (
                            <span className="text-muted">
                              Unknown Element{" "}
                              {result.elementId
                                ? `(${result.elementId.substring(0, 6)}...)`
                                : ""}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        {pageDetails.name || (
                          <span className="text-muted">
                            Unknown Page{" "}
                            {result.pageContextId
                              ? `(${result.pageContextId.substring(0, 6)}...)`
                              : ""}
                          </span>
                        )}
                      </td>
                      <td>
                        {result.found ? (
                          <span className="badge bg-success">
                            <i className="bi bi-check-circle me-1"></i> Found
                          </span>
                        ) : (
                          <span className="badge bg-danger">
                            <i className="bi bi-x-circle me-1"></i> Missing
                          </span>
                        )}
                      </td>
                      <td>
                        {result.changed ? (
                          <span
                            className={`badge bg-${getChangeBadgeColor(
                              result.changeType
                            )}`}
                          >
                            {result.changeType === "content" && (
                              <i className="bi bi-pencil me-1"></i>
                            )}
                            {result.changeType === "attribute" && (
                              <i className="bi bi-braces me-1"></i>
                            )}
                            {result.changeType === "position" && (
                              <i className="bi bi-arrows-move me-1"></i>
                            )}
                            {result.changeType === "disappeared" && (
                              <i className="bi bi-eye-slash me-1"></i>
                            )}
                            {result.changeType === "multiple" && (
                              <i className="bi bi-layers me-1"></i>
                            )}
                            {result.changeType}
                          </span>
                        ) : (
                          <span className="badge bg-success">
                            <i className="bi bi-check-circle me-1"></i> No
                            Changes
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-info"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewElementDetails(result);
                          }}
                        >
                          <i className="bi bi-eye me-1"></i> View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="alert alert-warning">
            <i className="bi bi-exclamation-circle me-2"></i>
            No results available for this monitoring run.
          </div>
        )}
      </div>
      <div className="monitoring-panel-footer">
        <button className="btn btn-secondary" onClick={onClose}>
          <i className="bi bi-x-circle me-1"></i> Close
        </button>
      </div>

      {/* Add the modal */}
      {selectedResult && (
        <ElementChangeDetailsModal
          result={selectedResult}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

// Add some CSS for the spinning animation
const style = document.createElement("style");
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .spin {
    animation: spin 1s linear infinite;
  }
`;
document.head.appendChild(style);

export default MonitoringResultsComponent;
