// File: frontend/src/components/MonitoringResultsComponent.jsx

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api";

const MonitoringResultsComponent = ({ monitoringRunId, onClose }) => {
  const [monitoringRun, setMonitoringRun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [elements, setElements] = useState({});
  const [pageContexts, setPageContexts] = useState({});

  // In the useEffect that fetches monitoring run data:

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

  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading monitoring results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
        <button
          className="btn btn-sm btn-outline-danger ms-2"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    );
  }

  if (!monitoringRun) {
    return (
      <div className="alert alert-info">
        No monitoring data available.
        <button
          className="btn btn-sm btn-outline-primary ms-2"
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

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Monitoring Run Results</h5>
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={onClose}
        ></button>
      </div>
      <div className="card-body">
        <div className="mb-4">
          <div className="d-flex justify-content-between">
            <span>
              <strong>Status:</strong>{" "}
              <span
                className={`badge bg-${getStatusBadgeColor(
                  monitoringRun.status
                )}`}
              >
                {monitoringRun.status}
              </span>
            </span>
            <span>
              <strong>Run ID:</strong> {monitoringRun._id.substring(0, 8)}...
            </span>
          </div>
          <div className="d-flex justify-content-between mt-2">
            <span>
              <strong>Started:</strong> {formatDate(monitoringRun.startTime)}
            </span>
            <span>
              <strong>Completed:</strong> {formatDate(monitoringRun.endTime)}
            </span>
          </div>
        </div>

        {monitoringRun.status === "running" && (
          <div className="alert alert-info">
            <div className="d-flex align-items-center">
              <div
                className="spinner-border spinner-border-sm me-2"
                role="status"
              ></div>
              Monitoring in progress... Please wait while we check your
              elements.
            </div>
          </div>
        )}

        {monitoringRun.status === "failed" && (
          <div className="alert alert-danger">
            <strong>Error:</strong>{" "}
            {monitoringRun.error || "Unknown error during monitoring"}
          </div>
        )}

        {monitoringRun.status === "completed" && monitoringRun.summary && (
          <div className="mb-4">
            <h6>Summary</h6>
            <div className="d-flex flex-wrap gap-3">
              <div className="border rounded p-2 flex-grow-1 text-center">
                <div className="fw-bold">
                  {monitoringRun.summary.totalElements}
                </div>
                <small>Total Elements</small>
              </div>
              <div className="border rounded p-2 flex-grow-1 text-center text-warning">
                <div className="fw-bold">
                  {monitoringRun.summary.changedElements}
                </div>
                <small>Changed</small>
              </div>
              <div className="border rounded p-2 flex-grow-1 text-center text-danger">
                <div className="fw-bold">
                  {monitoringRun.summary.missingElements}
                </div>
                <small>Missing</small>
              </div>
              <div className="border rounded p-2 flex-grow-1 text-center text-secondary">
                <div className="fw-bold">
                  {monitoringRun.summary.errorElements}
                </div>
                <small>Errors</small>
              </div>
            </div>
          </div>
        )}

        {monitoringRun.results && monitoringRun.results.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-sm table-hover">
              <thead className="table-light">
                <tr>
                  <th>Element</th>
                  <th>Page</th>
                  <th>Status</th>
                  <th>Changes</th>
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
                    <tr key={index}>
                      <td>
                        {elementDetails.name || (
                          <span className="text-muted">
                            Unknown Element{" "}
                            {result.elementId
                              ? `(${result.elementId.substring(0, 6)}...)`
                              : ""}
                          </span>
                        )}
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
                          <span className="badge bg-success">Found</span>
                        ) : (
                          <span className="badge bg-danger">Missing</span>
                        )}
                      </td>
                      <td>
                        {result.changed ? (
                          <span
                            className={`badge bg-${getChangeBadgeColor(
                              result.changeType
                            )}`}
                          >
                            {result.changeType}
                          </span>
                        ) : (
                          <span className="badge bg-success">No Changes</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="alert alert-warning">
            No results available for this monitoring run.
          </div>
        )}
      </div>
      <div className="card-footer">
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default MonitoringResultsComponent;
