import React from "react";
import "./CheckNewsStatus.css";

const CheckNewsStatus = () => {
  const dummyRows = [
    { status: "status-0" },
    { status: "status-1" },
    { status: "status-2" },
    { status: "status-3" },
    { status: "status-4" }, // Draft wala - double action
    { status: "status-5" },
    { status: "status-6" },
    { status: "status-7" },
  ];

  return (
    <div className="check-status-wrapper">
      <div className="check-header">
        <h2>📋 Check News Status</h2>
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search by News ID, Title" className="search-box" />
        </div>
      </div>

      <div className="table-container">
        <table className="status-table">
          <thead>
            <tr>
              <th>News ID</th>
              <th>News Slug</th>
              <th>Submission Date</th>
              <th>Editor Name</th>
              <th>Last updated</th>
              <th>News Status</th>
              <th>Correction Required(if any)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {dummyRows.map((r, i) => (
              <tr key={i}>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td><span className={`pill big ${r.status}`}></span></td>
                <td></td>
                <td>
                  {i === 4 ? (
                    <div className="action-double">
                      <span className="pill big action-blue"></span>
                      <span className="pill big action-green"></span>
                    </div>
                  ) : (
                    <span className="pill big action-blue"></span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CheckNewsStatus;