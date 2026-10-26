
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./CheckNewsStatus.css";

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const rowsPerPage = 5;

const normalizeStatus = (status) => {
  const value = String(status || "Pending")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  const statusMap = {
    draft: "Draft",
    pending: "Pending",
    submitted: "Pending",
    "under review": "Pending",
    "in review": "Pending",
    approved: "Approved",
    published: "Published",
    rejected: "Rejected",
    "correction required": "Correction Required",
    "needs changes": "Correction Required",
    "changes required": "Correction Required",
  };

  return statusMap[value] || "Pending";
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

const getLoggedInUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem("emAxisUser")) || {};
  } catch {
    return {};
  }
};

const getNewsId = (news) =>
  news.id ?? news.news_id ?? news.newsId ?? "";

const getNewsTitle = (news) =>
  news.title ?? news.news_title ?? news.newsTitle ?? "Untitled News";

const mapNews = (news) => {
  const status = normalizeStatus(
    news.status ?? news.news_status ?? news.newsStatus
  );

  return {
    id: getNewsId(news),
    title: getNewsTitle(news),
    date: formatDate(
      news.created_at ??
        news.submitted_at ??
        news.submission_date ??
        news.createdAt
    ),
    editor:
      news.editor_name ??
      news.editorName ??
      news.editor?.full_name ??
      news.editor?.name ??
      "Not assigned",
    updated: formatDate(
      news.updated_at ??
        news.updatedAt ??
        news.status_updated_at ??
        news.published_at
    ),
    statusText: status,
    status: `status-${status.toLowerCase().replace(/\s+/g, "-")}`,
    correction:
      news.correction_message ??
      news.correction_reason ??
      news.feedback ??
      news.editor_feedback ??
      (status === "Correction Required"
        ? "Please check the editor's feedback."
        : status === "Rejected"
        ? "Please contact the editor for details."
        : status === "Published"
        ? "No correction required"
        : status === "Approved"
        ? "Ready for publishing"
        : status === "Draft"
        ? "Not submitted for review"
        : "Waiting for editor review"),
    raw: news,
  };
};

const CheckNewsStatus = () => {
  const navigate = useNavigate();

  const [user] = useState(getLoggedInUser);
  const [newsRows, setNewsRows] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reporterId = user.id ?? user.user_id ?? user.userId;

  useEffect(() => {
    const controller = new AbortController();

    const fetchNews = async () => {
      if (!reporterId) {
        const message =
          "Your reporter account could not be identified. Please log in again.";

        setNewsRows([]);
        setError(message);
        setLoading(false);
        toast.error(message);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE}/api/news/reporter/${encodeURIComponent(reporterId)}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              ...(sessionStorage.getItem("token")
                ? {
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                  }
                : {}),
            },
            signal: controller.signal,
          }
        );

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            result.message ||
              result.error ||
              `Unable to load news (HTTP ${response.status}).`
          );
        }

        const records = Array.isArray(result)
          ? result
          : result.news ?? result.data?.news ?? result.data ?? [];

        if (!Array.isArray(records)) {
          throw new Error(
            "The server returned an unexpected news data format."
          );
        }

        setNewsRows(records.map(mapNews));
      } catch (err) {
        if (err.name === "AbortError") return;

        const message =
          err.message || "Unable to load news. Please try again.";

        setNewsRows([]);
        setError(message);
        toast.error(message);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchNews();

    return () => controller.abort();
  }, [reporterId]);

  const summary = useMemo(
    () => ({
      total: newsRows.length,
      published: newsRows.filter(
        (row) => row.statusText === "Published"
      ).length,
      inReview: newsRows.filter(
        (row) => row.statusText === "Pending"
      ).length,
      needsChanges: newsRows.filter(
        (row) =>
          row.statusText === "Rejected" ||
          row.statusText === "Correction Required"
      ).length,
    }),
    [newsRows]
  );

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return newsRows.filter((row) => {
      const matchesSearch =
        String(row.id).toLowerCase().includes(query) ||
        row.title.toLowerCase().includes(query) ||
        row.editor.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || row.statusText === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [newsRows, search, statusFilter]);

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
    const details = [
      `News ID: ${row.id || "—"}`,
      `News Title: ${row.title}`,
      `Submission Date: ${row.date}`,
      `Editor Name: ${row.editor}`,
      `Last Updated: ${row.updated}`,
      `News Status: ${row.statusText}`,
      `Editor Feedback: ${row.correction}`,
    ].join(" | ");

    toast.info(details, {
      autoClose: 6000,
      closeOnClick: false,
    });
  };

  const handleEdit = (row) => {
    if (row.statusText !== "Draft") {
      toast.warning("Only draft news can be edited from this page.");
      return;
    }

    navigate("/reporter/create-news", {
      state: {
        news: row.raw,
        editMode: true,
      },
    });
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setCurrentPage(1);
    toast.info("Search and status filters cleared.");
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="check-status-wrapper">
      {/* PAGE HEADER */}
      <div className="check-header">
        <div className="check-heading">
          <div className="check-heading-icon">▤</div>

          <div>
            <h1>Check News Status</h1>
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
              onChange={(event) => handleSearch(event.target.value)}
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
            <h3>{loading ? "—" : summary.total}</h3>
            <p>All your submissions</p>
          </div>
          <span className="summary-arrow">›</span>
        </div>

        <div className="status-summary-card summary-published">
          <div className="summary-icon">✓</div>
          <div className="summary-details">
            <span className="summary-label">Published</span>
            <h3>{loading ? "—" : summary.published}</h3>
            <p>Successfully published</p>
          </div>
          <span className="summary-arrow">›</span>
        </div>

        <div className="status-summary-card summary-review">
          <div className="summary-icon">◷</div>
          <div className="summary-details">
            <span className="summary-label">In Review</span>
            <h3>{loading ? "—" : summary.inReview}</h3>
            <p>Waiting for editor review</p>
          </div>
          <span className="summary-arrow">›</span>
        </div>

        <div className="status-summary-card summary-changes">
          <div className="summary-icon">!</div>
          <div className="summary-details">
            <span className="summary-label">Needs Changes</span>
            <h3>{loading ? "—" : summary.needsChanges}</h3>
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
            {loading
              ? "Loading..."
              : `${filteredRows.length} ${
                  filteredRows.length === 1 ? "News Item" : "News Items"
                }`}
          </span>
        </div>

        {error && (
          <div className="news-load-error" role="alert">
            <strong>Could not load news</strong>
            <p>{error}</p>
            <button type="button" onClick={handleRetry}>
              Try Again
            </button>
          </div>
        )}

        <div className="status-table-scroll">
          <table className="status-table">
            <thead>
              <tr>
                <th>News ID</th>
                <th>News Title</th>
                <th>Submission Date</th>
                <th>Editor Name</th>
                <th>Last Updated</th>
                <th>News Status</th>
                <th>Correction Required (if any)</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="empty-table-message">
                    Loading your news submissions...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" className="empty-table-message">
                    News data is unavailable.
                  </td>
                </tr>
              ) : currentRows.length > 0 ? (
                currentRows.map((row, index) => (
                  <tr key={row.id || `${row.title}-${index}`}>
                    <td>
                      <span className="news-id-badge">
                        {row.id || "—"}
                      </span>
                    </td>

                    <td>
                      <div className="news-title-cell">
                        <span className="news-title">{row.title}</span>
                      </div>
                    </td>

                    <td>
                      <span className="date-text">{row.date}</span>
                    </td>

                    <td>
                      <span className="editor-name">{row.editor}</span>
                    </td>

                    <td>
                      <span className="date-text">{row.updated}</span>
                    </td>

                    <td>
                      <span className={`pill big ${row.status}`}>
                        <span className="status-dot" />
                        {row.statusText}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`correction-text ${
                          row.statusText === "Rejected" ||
                          row.statusText === "Correction Required"
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
                          <span className="action-eye">👀</span>
                          View
                        </button>

                        {row.statusText === "Draft" && (
                          <button
                            type="button"
                            className="pill big action-green"
                            onClick={() => handleEdit(row)}
                          >
                            ✎ Edit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="empty-table-message">
                    <div className="empty-state-icon">⌕</div>
                    <strong>
                      {newsRows.length === 0
                        ? "No news submissions yet"
                        : "No news found"}
                    </strong>
                    <p>
                      {newsRows.length === 0
                        ? "Your submitted news will appear here."
                        : "Try changing your search or status filter."}
                    </p>

                    {(search || statusFilter !== "All") && (
                      <button
                        type="button"
                        className="reset-filter-button"
                        onClick={clearFilters}
                      >
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* TABLE FOOTER / PAGINATION */}
        <div className="status-table-footer">
          <span className="table-results-text">
            {loading
              ? "Loading results..."
              : filteredRows.length === 0
              ? "Showing 0 news"
              : `Showing ${startIndex + 1} to ${Math.min(
                  startIndex + rowsPerPage,
                  filteredRows.length
                )} of ${filteredRows.length} news`}
          </span>

          <div className="pagination-controls">
            <button
              type="button"
              className="pagination-button"
              disabled={loading || safePage === 1}
              onClick={() =>
                setCurrentPage((page) => Math.max(1, page - 1))
              }
              aria-label="Previous page"
            >
              ‹
            </button>

            <span className="pagination-current">{safePage}</span>

            <button
              type="button"
              className="pagination-button"
              disabled={loading || safePage >= totalPages}
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
