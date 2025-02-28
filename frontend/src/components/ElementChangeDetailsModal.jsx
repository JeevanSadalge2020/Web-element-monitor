// File: frontend/src/components/ElementChangeDetailsModal.jsx

import React from "react";

const ElementChangeDetailsModal = ({ result, onClose }) => {
  if (!result) return null;

  // Helper function for selector status badges
  const getSelectorStatusBadge = (status) => {
    switch (status) {
      case "success":
        return <span className="badge bg-success">Success</span>;
      case "not_found":
        return <span className="badge bg-warning">Not Found</span>;
      case "error":
        return <span className="badge bg-danger">Error</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  // Helper to show what changed
  const renderChangeDetails = () => {
    if (!result.changes) return <div>No change details available</div>;

    return (
      <div>
        {result.changes.content && (
          <div className="mb-3">
            <h6>Content Changes</h6>
            <div className="row">
              <div className="col-md-6">
                <div className="card bg-light">
                  <div className="card-header">Previous Content</div>
                  <div className="card-body">
                    <pre className="mb-0 text-wrap">
                      {result.changes.content.previous || "None"}
                    </pre>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card bg-light">
                  <div className="card-header">Current Content</div>
                  <div className="card-body">
                    <pre className="mb-0 text-wrap">
                      {result.changes.content.current || "None"}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {result.changes.position && (
          <div className="mb-3">
            <h6>Position/Size Changes</h6>
            <table className="table table-sm table-bordered">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Previous</th>
                  <th>Current</th>
                  <th>Difference</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>X Position</td>
                  <td>
                    {result.changes.position.previous?.x?.toFixed(2) || "N/A"}
                  </td>
                  <td>
                    {result.changes.position.current?.x?.toFixed(2) || "N/A"}
                  </td>
                  <td>
                    {result.changes.position.previous?.x &&
                    result.changes.position.current?.x
                      ? (
                          result.changes.position.current.x -
                          result.changes.position.previous.x
                        ).toFixed(2)
                      : "N/A"}
                  </td>
                </tr>
                <tr>
                  <td>Y Position</td>
                  <td>
                    {result.changes.position.previous?.y?.toFixed(2) || "N/A"}
                  </td>
                  <td>
                    {result.changes.position.current?.y?.toFixed(2) || "N/A"}
                  </td>
                  <td>
                    {result.changes.position.previous?.y &&
                    result.changes.position.current?.y
                      ? (
                          result.changes.position.current.y -
                          result.changes.position.previous.y
                        ).toFixed(2)
                      : "N/A"}
                  </td>
                </tr>
                <tr>
                  <td>Width</td>
                  <td>
                    {result.changes.position.previous?.width?.toFixed(2) ||
                      "N/A"}
                  </td>
                  <td>
                    {result.changes.position.current?.width?.toFixed(2) ||
                      "N/A"}
                  </td>
                  <td>
                    {result.changes.position.previous?.width &&
                    result.changes.position.current?.width
                      ? (
                          result.changes.position.current.width -
                          result.changes.position.previous.width
                        ).toFixed(2)
                      : "N/A"}
                  </td>
                </tr>
                <tr>
                  <td>Height</td>
                  <td>
                    {result.changes.position.previous?.height?.toFixed(2) ||
                      "N/A"}
                  </td>
                  <td>
                    {result.changes.position.current?.height?.toFixed(2) ||
                      "N/A"}
                  </td>
                  <td>
                    {result.changes.position.previous?.height &&
                    result.changes.position.current?.height
                      ? (
                          result.changes.position.current.height -
                          result.changes.position.previous.height
                        ).toFixed(2)
                      : "N/A"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {result.changes.attributes &&
          Object.keys(result.changes.attributes).length > 0 && (
            <div className="mb-3">
              <h6>Attribute Changes</h6>
              <table className="table table-sm table-bordered">
                <thead>
                  <tr>
                    <th>Attribute</th>
                    <th>Previous</th>
                    <th>Current</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(result.changes.attributes).map(
                    ([attr, values]) => (
                      <tr key={attr}>
                        <td>{attr}</td>
                        <td className="text-break">
                          {values.previous || "None"}
                        </td>
                        <td className="text-break">
                          {values.current || "None"}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}

        {/* Selectors Section */}
        <div className="mb-3">
          <h6>Selectors Status</h6>
          <table className="table table-sm table-bordered">
            <thead>
              <tr>
                <th>Selector Type</th>
                <th>Value</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {result.selectorDetails &&
                Object.entries(result.selectorDetails).map(
                  ([type, details]) => (
                    <tr key={type}>
                      <td>{type.toUpperCase()}</td>
                      <td className="text-break">
                        {type === "id"
                          ? "#" + result.element?.selectors?.id
                          : type === "css"
                          ? result.element?.selectors?.css
                          : type === "xpath"
                          ? result.element?.selectors?.xpath
                          : "N/A"}
                      </td>
                      <td>{getSelectorStatusBadge(details.status)}</td>
                      <td>{details.priority}</td>
                      <td>{details.note || details.message || ""}</td>
                    </tr>
                  )
                )}
              {!result.selectorDetails &&
                result.selectorResults &&
                Object.entries(result.selectorResults).map(
                  ([type, success]) => (
                    <tr key={type}>
                      <td>{type.toUpperCase()}</td>
                      <td className="text-break">
                        {type === "id"
                          ? "#" + result.element?.selectors?.id
                          : type === "css"
                          ? result.element?.selectors?.css
                          : type === "xpath"
                          ? result.element?.selectors?.xpath
                          : "N/A"}
                      </td>
                      <td>
                        {success ? (
                          <span className="badge bg-success">Success</span>
                        ) : (
                          <span className="badge bg-warning">Failed</span>
                        )}
                      </td>
                      <td>{type === "id" ? 1 : type === "css" ? 2 : 3}</td>
                      <td></td>
                    </tr>
                  )
                )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Element Change Details</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <strong>Element:</strong>{" "}
              {result.elementName || "Unknown Element"}
              <br />
              <strong>Page:</strong> {result.pageName || "Unknown Page"}
              <br />
              <strong>Status:</strong>{" "}
              {result.found ? (
                <span className="badge bg-success">Found</span>
              ) : (
                <span className="badge bg-danger">Missing</span>
              )}{" "}
              {result.changed && (
                <span
                  className={`badge bg-${
                    result.changeType === "disappeared"
                      ? "danger"
                      : result.changeType === "content"
                      ? "info"
                      : result.changeType === "position"
                      ? "primary"
                      : result.changeType === "attribute"
                      ? "warning"
                      : result.changeType === "multiple"
                      ? "dark"
                      : "secondary"
                  }`}
                >
                  {result.changeType}
                </span>
              )}
            </div>

            {renderChangeDetails()}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElementChangeDetailsModal;
