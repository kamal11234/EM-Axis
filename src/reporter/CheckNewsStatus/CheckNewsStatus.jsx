
import React, { useState } from "react";
import "./CheckNewsStatus.css";

const CheckNewsStatus = () => {
  const [search, setSearch] = useState("");

  const dummyRows = [
    {
      id: "N001",
      title: "Heavy rainfall alert issued across coastal districts",
      date: "02-10-2026",
      editor: "Rahul Patil",
      updated: "02-10-2026",
      status: "status-0",
      statusText: "Published",
      correction: "No correction required",
      action: "View",
    },
    {
      id: "N002",
      title: "New highway project to improve regional connectivity",
      date: "01-10-2026",
      editor: "Sneha Joshi",
      updated: "02-10-2026",
      status: "status-1",
      statusText: "Approved",
      correction: "Ready for publishing",
      action: "View",
    },
    {
      id: "N003",
      title: "Local school announces new education initiative",
      date: "30-09-2026",
      editor: "Amit Sawant",
      updated: "01-10-2026",
      status: "status-2",
      statusText: "Pending",
      correction: "Waiting for editor review",
      action: "View",
    },
    {
      id: "N004",
      title: "Major changes announced in city transport services",
      date: "29-09-2026",
      editor: "Priya Naik",
      updated: "30-09-2026",
      status: "status-3",
      statusText: "Rejected",
      correction: "Verify facts and update the headline",
      action: "View",
    },
    {
      id: "N005",
      title: "New healthcare facilities planned for rural areas",
      date: "28-09-2026",
      editor: "Rahul Patil",
      updated: "29-09-2026",
      status: "status-4",
      statusText: "Draft",
      correction: "Not submitted for review",
      action: "Edit",
    },
    {
      id: "N006",
      title: "State government announces a new youth programme",
      date: "27-09-2026",
      editor: "Sneha Joshi",
      updated: "28-09-2026",
      status: "status-5",
      statusText: "Correction Required",
      correction: "Add a source and verify statistics",
      action: "View",
    },
    {
      id: "N007",
      title: "Local sports team wins the district championship",
      date: "26-09-2026",
      editor: "Amit Sawant",
      updated: "27-09-2026",
      status: "status-6",
      statusText: "Published",
      correction: "No correction required",
      action: "View",
    },
    {
      id: "N008",
      title: "Community development project enters its next phase",
      date: "25-09-2026",
      editor: "Priya Naik",
      updated: "26-09-2026",
      status: "status-7",
      statusText: "Pending",
      correction: "Waiting for editor review",
      action: "View",
    },
  ];

  const filteredRows = dummyRows.filter((row) => {
    const query = search.trim().toLowerCase();

    return (
      row.id.toLowerCase().includes(query) ||
      row.title.toLowerCase().includes(query)
    );
  });

  return (
    <div className="check-status-wrapper">
      <div className="check-header">
        <h2>📋 Check News Status</h2>

        <div className="search-wrapper">
          <span className="search-icon">🔍</span>

          <input
            type="text"
            placeholder="Search by News ID, Title"
            className="search-box"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button
              type="button"
              className="clear-search"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
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
            {filteredRows.length > 0 ? (
              filteredRows.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>

                  <td>{r.title}</td>

                  <td>{r.date}</td>

                  <td>{r.editor}</td>

                  <td>{r.updated}</td>

                  <td>
                    <span className={`pill big ${r.status}`}>
                      {r.statusText}
                    </span>
                  </td>

                  <td>{r.correction}</td>

                  <td>
                    {r.status === "status-4" ? (
                      <div className="action-double">
                        <button
                          type="button"
                          className="pill big action-blue"
                          title="View news"
                          onClick={() =>
                            window.alert(
                              `News ID: ${r.id}\nTitle: ${r.title}\nStatus: ${r.statusText}`
                            )
                          }
                        >
                          View
                        </button>

                        <button
                          type="button"
                          className="pill big action-green"
                          title="Edit draft"
                          onClick={() =>
                            window.alert(`Edit draft: ${r.title}`)
                          }
                        >
                          Edit
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="pill big action-blue"
                        onClick={() =>
                          window.alert(
                            `News ID: ${r.id}\nTitle: ${r.title}\nSubmission Date: ${r.date}\nEditor: ${r.editor}\nLast Updated: ${r.updated}\nStatus: ${r.statusText}\nCorrection: ${r.correction}`
                          )
                        }
                      >
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                  No news found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CheckNewsStatus;
