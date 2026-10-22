
import React, { useMemo, useState } from "react";
import "./CheckNewsStatus.css";

const CheckNewsStatus = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 5;

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

  // Summary card counts
  const summary = useMemo(() => {
    return {
      total: dummyRows.length,
      published: dummyRows.filter(
        (row) => row.statusText === "Published"
      ).length,
      inReview: dummyRows.filter(
        (row) => row.statusText === "Pending"
      ).length,
      needsChanges: dummyRows.filter(
        (row) =>
          row.statusText === "Rejected" ||
          row.statusText === "Correction Required"
      ).length,
    };
  }, []);

  // Search and status filter
  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return dummyRows.filter((row) => {
      const matchesSearch =
        row.id.toLowerCase().includes(query) ||
        row.title.toLowerCase().includes(query) ||
        row.editor.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        row.statusText === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRows.length / rowsPerPage)
  );

  const safePage = Math.min(currentPage, totalPages);

  const startIndex = (safePage - 1) * rowsPerPage;

  const currentRows = filteredRows.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleView = (row) => {
    window.alert(
      `News ID: ${row.id}\n` +
        `News Slug: ${row.title}\n` +
        `Submission Date: ${row.date}\n` +
        `Editor Name: ${row.editor}\n` +
        `Last updated: ${row.updated}\n` +
        `News Status: ${row.statusText}\n` +
        `Correction Required (if any): ${row.correction}`
    );
  };

  const handleEdit = (row) => {
    window.alert(`Edit draft: ${row.title}`);
  };

  return (
    <div className="check-status-wrapper">
      {/* PAGE HEADER */}
      <div className="check-header">
        <div className="check-heading">
          <div className="check-heading-icon">▤</div>

          <div>
            <h2>Check News Status</h2>
            <p>
              Track your news submissions and editor feedback
              in one place.
            </p>
          </div>
        </div>

        <div className="check-header-actions">
          <div className="search-wrapper">
            <span className="search-icon">⌕</span>

            <input
              type="text"
              placeholder="Search by News ID, Title, or Editor..."
              className="search-box"
              value={search}
              onChange={(event) =>
                handleSearch(event.target.value)
              }
              aria-label="Search news"
            />

            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={() => handleSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="status-filter-wrapper">
            <span className="filter-icon">▽</span>

            <select
              className="status-filter"
              value={statusFilter}
              onChange={(event) =>
                handleStatusChange(event.target.value)
              }
              aria-label="Filter by news status"
            >
              <option value="All">All statuses</option>
              <option value="Published">Published</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
              <option value="Draft">Draft</option>
              <option value="Correction Required">
                Correction Required
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="status-summary-grid">
        <div className="status-summary-card summary-total">
          <div className="summary-icon">▤</div>

          <div className="summary-details">
            <span className="summary-label">Total News</span>
            <h3>{summary.total}</h3>
            <p>All your submissions</p>
          </div>

          <span className="summary-arrow">›</span>
        </div>

        <div className="status-summary-card summary-published">
          <div className="summary-icon">✓</div>

          <div className="summary-details">
            <span className="summary-label">Published</span>
            <h3>{summary.published}</h3>
            <p>Successfully published</p>
          </div>

          <span className="summary-arrow">›</span>
        </div>

        <div className="status-summary-card summary-review">
          <div className="summary-icon">◷</div>

          <div className="summary-details">
            <span className="summary-label">In Review</span>
            <h3>{summary.inReview}</h3>
            <p>Waiting for editor review</p>
          </div>

          <span className="summary-arrow">›</span>
        </div>

        <div className="status-summary-card summary-changes">
          <div className="summary-icon">!</div>

          <div className="summary-details">
            <span className="summary-label">Needs Changes</span>
            <h3>{summary.needsChanges}</h3>
            <p>Requires your attention</p>
          </div>

          <span className="summary-arrow">›</span>
        </div>
      </div>

      {/* NEWS STATUS TABLE */}
      <div className="table-container">
        <div className="status-table-top">
          <div>
            <h3>News Submission Details</h3>
            <p>
              Check the latest status of your submitted news.
            </p>
          </div>

          <span className="total-news-badge">
            {filteredRows.length}{" "}
            {filteredRows.length === 1 ? "News" : "News Items"}
          </span>
        </div>

        <div className="status-table-scroll">
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
              {currentRows.length > 0 ? (
                currentRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <span className="news-id-badge">
                        {row.id}
                      </span>
                    </td>

                    <td>
                      <div className="news-title-cell">
                        <span className="news-title">
                          {row.title}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="date-text">
                        {row.date}
                      </span>
                    </td>

                    <td>
                      <span className="editor-name">
                        {row.editor}
                      </span>
                    </td>

                    <td>
                      <span className="date-text">
                        {row.updated}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`pill big ${row.status}`}
                      >
                        <span className="status-dot" />
                        {row.statusText}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`correction-text ${
                          row.statusText === "Rejected" ||
                          row.statusText ===
                            "Correction Required"
                            ? "correction-warning"
                            : ""
                        }`}
                      >
                        {row.correction}
                      </span>
                    </td>

                    <td>
                      <div className="action-double">
                        <button
                          type="button"
                          className="pill big action-blue"
                          onClick={() => handleView(row)}
                        >
                          <span className="action-eye">◉</span>
                          View
                        </button>

                        {row.status === "status-4" && (
                          <button
                            type="button"
                            className="pill big action-green"
                            onClick={() => handleEdit(row)}
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="empty-table-message"
                  >
                    <div className="empty-state-icon">⌕</div>
                    <strong>No news found</strong>
                    <p>
                      Try changing your search or status filter.
                    </p>
                    <button
                      type="button"
                      className="reset-filter-button"
                      onClick={() => {
                        setSearch("");
                        setStatusFilter("All");
                        setCurrentPage(1);
                      }}
                    >
                      Clear filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* TABLE FOOTER / PAGINATION */}
        <div className="status-table-footer">
          <span className="table-results-text">
            {filteredRows.length === 0
              ? "Showing 0 news"
              : `Showing ${startIndex + 1} to ${
                  Math.min(
                    startIndex + rowsPerPage,
                    filteredRows.length
                  )
                } of ${filteredRows.length} news`}
          </span>

          <div className="pagination-controls">
            <button
              type="button"
              className="pagination-button"
              disabled={safePage === 1}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.max(1, page - 1)
                )
              }
              aria-label="Previous page"
            >
              ‹
            </button>

            <span className="pagination-current">
              {safePage}
            </span>

            <button
              type="button"
              className="pagination-button"
              disabled={safePage >= totalPages}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(totalPages, page + 1)
                )
              }
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckNewsStatus;
