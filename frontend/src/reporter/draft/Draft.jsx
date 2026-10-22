
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./draft.css";

const initialDrafts = [
  {
    id: "N009",
    title: "New Highway project to boost connectivity",
    format: "Av",
    createdDate: "11-08-2026",
    createdTime: "04:15 PM",
    updatedDate: "12-08-2026",
    updatedTime: "10:30 AM",
    location: "",
    eventDate: "",
    status: "In Progress",
  },
  {
    id: "N010",
    title: "New education policy brings major changes",
    format: "Avb",
    createdDate: "08-08-2026",
    createdTime: "01:20 PM",
    updatedDate: "10-08-2026",
    updatedTime: "02:45 PM",
    location: "",
    eventDate: "",
    status: "In Progress",
  },
];

function Draft() {
  const navigate = useNavigate();

  const [drafts, setDrafts] = useState(initialDrafts);
  const [search, setSearch] = useState("");
  const [formatFilter, setFormatFilter] = useState("All Formats");
  const [currentPage, setCurrentPage] = useState(1);
  const [notice, setNotice] = useState("");

  const rowsPerPage = 5;

  const filteredDrafts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return drafts.filter((draft) => {
      const matchesSearch =
        draft.id.toLowerCase().includes(query) ||
        draft.title.toLowerCase().includes(query);

      const matchesFormat =
        formatFilter === "All Formats" ||
        draft.format === formatFilter;

      return matchesSearch && matchesFormat;
    });
  }, [drafts, search, formatFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDrafts.length / rowsPerPage)
  );

  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * rowsPerPage;

  const visibleDrafts = filteredDrafts.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // Open the existing News Workspace with the selected draft details.
  const handleContinueEdit = (draft) => {
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
      },
    });
  };

  // View draft details.
  const handleView = (draft) => {
    window.alert(
      `News ID: ${draft.id}\n` +
        `News Slug: ${draft.title}\n` +
        `Format: ${draft.format}\n` +
        `Created: ${draft.createdDate}, ${draft.createdTime}\n` +
        `Last Updated: ${draft.updatedDate}, ${draft.updatedTime}\n` +
        `Status: ${draft.status}`
    );
  };

  // Demo behavior: remove the draft from this page.
  const handleSendToEditor = (draft) => {
    const confirmed = window.confirm(
      `Are you sure you want to send "${draft.title}" to the editor?`
    );

    if (!confirmed) return;

    setDrafts((previous) =>
      previous.filter((item) => item.id !== draft.id)
    );

    setCurrentPage(1);
    setNotice(`${draft.id} has been removed from the Draft list.`);
  };

  // Delete a draft from the current list.
  const handleDelete = (draft) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${draft.title}"?`
    );

    if (!confirmed) return;

    setDrafts((previous) =>
      previous.filter((item) => item.id !== draft.id)
    );

    setCurrentPage(1);
    setNotice(`${draft.id} has been deleted.`);
  };

  const clearFilters = () => {
    setSearch("");
    setFormatFilter("All Formats");
    setCurrentPage(1);
    setNotice("");
  };

  return (
    <div className="main draft-page">
      {/* Page Header */}
      <div className="draft-page-header">
        <div className="draft-heading">
          <div className="draft-heading-icon">▤</div>

          <div>
            <h2>Draft</h2>
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
                onClick={() => setSearch("")}
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
              <option>All Formats</option>
              <option value="Av">Av</option>
              <option value="Avb">Avb</option>
            </select>
          </div>
        </div>
      </div>

      {/* Success Message */}
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

      {/* Summary Cards */}
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
            <h3>
              {drafts.filter((draft) => draft.status === "In Progress").length}
            </h3>
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

      {/* Draft Table */}
      <div className="draft-table-card">
        <div className="draft-table-heading">
          <div>
            <h3>Saved Drafts</h3>
            <p>Review, edit, or send your news to the editor.</p>
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
              {visibleDrafts.length > 0 ? (
                visibleDrafts.map((draft) => (
                  <tr key={draft.id}>
                    <td>
                      <span className="draft-id">{draft.id}</span>
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
                        <span>{draft.createdDate}</span>
                        <small>{draft.createdTime}</small>
                      </div>
                    </td>

                    <td>
                      <div className="draft-date">
                        <span>{draft.updatedDate}</span>
                        <small>{draft.updatedTime}</small>
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
                          aria-label={`View ${draft.id}`}
                        >
                          ◉
                        </button>

                        <button
                          type="button"
                          className="draft-action-button draft-edit-button"
                          onClick={() => handleContinueEdit(draft)}
                          title="Continue editing"
                          aria-label={`Continue editing ${draft.id}`}
                        >
                          ✎
                        </button>

                        <button
                          type="button"
                          className="draft-send-button"
                          onClick={() => handleSendToEditor(draft)}
                        >
                          Send to Editor
                        </button>

                        <button
                          type="button"
                          className="draft-action-button draft-delete-button"
                          onClick={() => handleDelete(draft)}
                          title="Delete draft"
                          aria-label={`Delete ${draft.id}`}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="draft-empty-state">
                    <div className="draft-empty-icon">⌕</div>
                    <strong>No drafts found</strong>
                    <p>Try a different search or format filter.</p>

                    <button type="button" onClick={clearFilters}>
                      Clear Filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="draft-table-footer">
          <span>
            {filteredDrafts.length === 0
              ? "Showing 0 drafts"
              : `Showing ${startIndex + 1}–${Math.min(
                  startIndex + rowsPerPage,
                  filteredDrafts.length
                )} of ${filteredDrafts.length} drafts`}
          </span>

          <div className="draft-pagination">
            <button
              type="button"
              disabled={safePage === 1}
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
}

export default Draft;
