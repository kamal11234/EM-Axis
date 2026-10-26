
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./draft.css";

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const ROWS_PER_PAGE = 5;

function getStoredUser() {
  try {
    return JSON.parse(sessionStorage.getItem("emAxisUser") || "null");
  } catch {
    return null;
  }
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function mapDraft(record) {
  return {
    id: record.id,
    displayId: `DRF${String(record.id).padStart(3, "0")}`,
    title: record.news_slug || "",
    format: record.news_format || "",
    createdAt: record.created_at,
    updatedAt: record.updated_at || record.created_at,
    location: record.location || "",
    eventDate: record.event_date || "",
    script: record.script || "",
    breakingNews: Boolean(record.breaking_news),
    mediaFiles: record.media_files || {},
    status: "In Progress",
  };
}

function Draft() {
  const navigate = useNavigate();

  const [drafts, setDrafts] = useState([]);
  const [search, setSearch] = useState("");
  const [formatFilter, setFormatFilter] = useState("All Formats");
  const [currentPage, setCurrentPage] = useState(1);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const user = useMemo(() => getStoredUser(), []);
  const currentUser = user?.user || user;
  const reporterId = currentUser?.id;
  const userRole = currentUser?.role;

  const fetchDrafts = useCallback(async () => {
    if (!reporterId || userRole !== "reporter") {
      setDrafts([]);
      setError("Please log in with your Reporter account to view drafts.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/api/news/drafts/${reporterId}`
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success !== true) {
        throw new Error(result.message || "Unable to load drafts.");
      }

      const loadedDrafts = Array.isArray(result.drafts)
        ? result.drafts.map(mapDraft)
        : [];

      setDrafts(loadedDrafts);
    } catch (err) {
      const message =
        err.message ||
        "Unable to connect to the server. Check whether the backend is running.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [reporterId, userRole]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  const filteredDrafts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return drafts.filter((draft) => {
      const matchesSearch =
        draft.displayId.toLowerCase().includes(query) ||
        draft.title.toLowerCase().includes(query);

      const matchesFormat =
        formatFilter === "All Formats" ||
        draft.format === formatFilter;

      return matchesSearch && matchesFormat;
    });
  }, [drafts, search, formatFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDrafts.length / ROWS_PER_PAGE)
  );

  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ROWS_PER_PAGE;

  const visibleDrafts = filteredDrafts.slice(
    startIndex,
    startIndex + ROWS_PER_PAGE
  );

  const handleContinueEdit = (draft) => {
    toast.info(`Opening ${draft.displayId} for editing.`);

    navigate("/reporter/news-workspace", {
      state: {
        isEditingDraft: true,
        draftId: draft.id,
        newsDetails: {
          newsFormat: draft.format,
          newsSlug: draft.title,
          location: draft.location,
          eventDate: draft.eventDate,
        },
        script: draft.script,
        breakingNews: draft.breakingNews,
        mediaFiles: draft.mediaFiles,
      },
    });
  };

  const handleView = (draft) => {
    const details =
      `Draft ID: ${draft.displayId}\n` +
      `News Title: ${draft.title || "Untitled"}\n` +
      `Format: ${draft.format || "Not specified"}\n` +
      `Location: ${draft.location || "Not added"}\n` +
      `Event Date: ${formatDate(draft.eventDate)}\n` +
      `Created: ${formatDate(draft.createdAt)}, ${formatTime(draft.createdAt)}\n` +
      `Last Updated: ${formatDate(draft.updatedAt)}, ${formatTime(draft.updatedAt)}\n` +
      `Status: ${draft.status}\n\n` +
      `Script:\n${draft.script || "No script saved yet."}`;

    toast.info(details, {
      autoClose: 8000,
      closeOnClick: false,
      style: {
        whiteSpace: "pre-line",
        width: "100%",
      },
    });
  };

  const handleDelete = async (draft) => {
    setConfirmDelete(null);
    setDeletingId(draft.id);
    setNotice("");
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/api/news/drafts/${draft.id}?reporterId=${encodeURIComponent(
          reporterId
        )}`,
        { method: "DELETE" }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success !== true) {
        throw new Error(result.message || "Unable to delete draft.");
      }

      setDrafts((previous) =>
        previous.filter((item) => item.id !== draft.id)
      );

      setCurrentPage(1);
      setNotice(`${draft.displayId} has been deleted.`);
      toast.success(`${draft.displayId} deleted successfully.`);
    } catch (err) {
      const message = err.message || "Unable to delete draft.";
      setError(message);
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const askDeleteConfirmation = (draft) => {
    setConfirmDelete(draft);
  };

  const clearFilters = () => {
    setSearch("");
    setFormatFilter("All Formats");
    setCurrentPage(1);
    setNotice("");
    toast.info("Search and filters cleared.");
  };

  const inProgressCount = drafts.filter(
    (draft) => draft.status === "In Progress"
  ).length;

  return (
    <div className="main draft-page">
      <div className="draft-page-header">
        <div className="draft-heading">
          <div className="draft-heading-icon">▤</div>
          <div>
            <h1>Draft</h1>
            <p>
              Manage your saved news and continue where you left off.
            </p>
          </div>
        </div>

        <div className="draft-top-controls">
          <div className="draft-search">
            <span className="draft-search-icon">⌕</span>
            <input
              type="text"
              placeholder="Search by News ID/Title"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
                setNotice("");
              }}
              aria-label="Search by News ID or title"
            />

            {search && (
              <button
                type="button"
                className="draft-clear-search"
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="draft-filter">
            <span>▽</span>
            <select
              value={formatFilter}
              onChange={(event) => {
                setFormatFilter(event.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by format"
            >
              <option value="All Formats">All Formats</option>
              {[...new Set(drafts.map((draft) => draft.format))]
                .filter(Boolean)
                .map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {notice && (
        <div className="draft-notice" role="status">
          <span>✓</span>
          <p>{notice}</p>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="draft-notice" role="alert">
          <p>{error}</p>
          <button
            type="button"
            onClick={fetchDrafts}
            disabled={loading}
          >
            Retry
          </button>
        </div>
      )}

      {confirmDelete && (
        <div
          className="draft-notice"
          role="alertdialog"
          aria-label="Confirm draft deletion"
        >
          <p>
            Delete {confirmDelete.displayId}
            {confirmDelete.title ? ` — "${confirmDelete.title}"` : ""}?
          </p>
          <button
            type="button"
            onClick={() => handleDelete(confirmDelete)}
            disabled={deletingId !== null}
          >
            {deletingId === confirmDelete.id ? "Deleting..." : "Confirm Delete"}
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(null)}
            disabled={deletingId !== null}
          >
            Cancel
          </button>
        </div>
      )}

      <div className="draft-summary-grid">
        <div className="draft-summary-card">
          <div className="draft-summary-icon icon-blue">▤</div>
          <div>
            <span>Total Drafts</span>
            <h3>{drafts.length}</h3>
            <p>All saved news drafts</p>
          </div>
        </div>

        <div className="draft-summary-card">
          <div className="draft-summary-icon icon-green">✎</div>
          <div>
            <span>In Progress</span>
            <h3>{inProgressCount}</h3>
            <p>Ready to continue editing</p>
          </div>
        </div>

        <div className="draft-summary-card">
          <div className="draft-summary-icon icon-purple">⌕</div>
          <div>
            <span>Filtered Results</span>
            <h3>{filteredDrafts.length}</h3>
            <p>Matching your search</p>
          </div>
        </div>

        <div className="draft-summary-card">
          <div className="draft-summary-icon icon-orange">◷</div>
          <div>
            <span>Not Submitted</span>
            <h3>{drafts.length}</h3>
            <p>Saved in your Draft list</p>
          </div>
        </div>
      </div>

      <div className="draft-table-card">
        <div className="draft-table-heading">
          <div>
            <h3>Saved Drafts</h3>
            <p>Review, edit, or delete your saved news.</p>
          </div>

          <span className="draft-count-badge">
            {filteredDrafts.length}{" "}
            {filteredDrafts.length === 1 ? "Draft" : "Drafts"}
          </span>
        </div>

        <div className="draft-table-scroll">
          <table className="draft-table">
            <thead>
              <tr>
                <th>News ID</th>
                <th>News Slug</th>
                <th>Format</th>
                <th>Created Date</th>
                <th>Last Updated Date</th>
                <th>News Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="draft-empty-state">
                    Loading drafts from database...
                  </td>
                </tr>
              ) : visibleDrafts.length > 0 ? (
                visibleDrafts.map((draft) => (
                  <tr key={draft.id}>
                    <td>
                      <span className="draft-id">{draft.displayId}</span>
                    </td>

                    <td>
                      <div className="draft-news-cell">
                        <div className="draft-news-thumbnail">▤</div>
                        <span className="draft-news-title">
                          {draft.title}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="draft-format-badge">
                        {draft.format}
                      </span>
                    </td>

                    <td>
                      <div className="draft-date">
                        <span>{formatDate(draft.createdAt)}</span>
                        <small>{formatTime(draft.createdAt)}</small>
                      </div>
                    </td>

                    <td>
                      <div className="draft-date">
                        <span>{formatDate(draft.updatedAt)}</span>
                        <small>{formatTime(draft.updatedAt)}</small>
                      </div>
                    </td>

                    <td>
                      <span className="draft-status-badge">
                        <span className="draft-status-dot" />
                        {draft.status}
                      </span>
                    </td>

                    <td>
                      <div className="draft-actions">
                        <button
                          type="button"
                          className="draft-action-button draft-view-button"
                          onClick={() => handleView(draft)}
                          title="View draft"
                          aria-label={`View ${draft.displayId}`}
                        >
                          👀
                        </button>

                        <button
                          type="button"
                          className="draft-action-button draft-edit-button"
                          onClick={() => handleContinueEdit(draft)}
                          title="Continue editing"
                          aria-label={`Continue editing ${draft.displayId}`}
                        >
                          ✎
                        </button>

                        <button
                          type="button"
                          className="draft-action-button draft-delete-button"
                          onClick={() => askDeleteConfirmation(draft)}
                          disabled={deletingId === draft.id}
                          title="Delete draft"
                          aria-label={`Delete ${draft.displayId}`}
                        >
                          {deletingId === draft.id ? "…" : "🗑"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="draft-empty-state">
                    <div className="draft-empty-icon">⌕</div>
                    <strong>
                      {error ? "Drafts could not be loaded" : "No drafts found"}
                    </strong>
                    <p>
                      {error
                        ? "Check your backend connection and try again."
                        : drafts.length === 0
                        ? "Your saved drafts will appear here."
                        : "Try a different search or format filter."}
                    </p>

                    {error ? (
                      <button type="button" onClick={fetchDrafts}>
                        Retry
                      </button>
                    ) : (
                      <button type="button" onClick={clearFilters}>
                        Clear Filters
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="draft-table-footer">
          <span>
            {filteredDrafts.length === 0
              ? "Showing 0 drafts"
              : `Showing ${startIndex + 1}–${Math.min(
                  startIndex + ROWS_PER_PAGE,
                  filteredDrafts.length
                )} of ${filteredDrafts.length} drafts`}
          </span>

          <div className="draft-pagination">
            <button
              type="button"
              disabled={safePage === 1 || loading}
              onClick={() =>
                setCurrentPage((page) => Math.max(1, page - 1))
              }
              aria-label="Previous page"
            >
              ‹
            </button>

            <span>{safePage}</span>

            <button
              type="button"
              disabled={safePage >= totalPages || loading}
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
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
}

export default Draft;
