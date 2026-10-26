
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import "./totalNews.css";

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const formats = [
  "All",
  "AV",
  "AVB",
  "PKG",
  "WKT",
  "WKT Tiktak",
  "TikTak",
  "One-to-One",
  "One to One",
];

const statuses = [
  "All",
  "Published",
  "Approved",
  "Pending",
  "Correction Required",
  "Rejected",
];

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

function normalizeFormat(value) {
  if (!value) return "—";

  const normalized = String(value).trim().toLowerCase();

  if (normalized === "one-to-one" || normalized === "one to one") {
    return "One to One";
  }

  if (normalized === "wkt tiktak") return "WKT Tiktak";

  return value;
}

function mapNewsRecord(item) {
  const createdAt = item.created_at || item.createdAt || null;
  const eventDate = item.event_date || item.eventDate || createdAt;

  return {
    id: String(item.id),
    databaseId: item.id,
    title: item.news_slug || item.title || "Untitled News",
    format: normalizeFormat(item.news_format || item.newsFormat || item.format),
    date: createdAt ? new Date(createdAt).toISOString().slice(0, 10) : "",
    displayDate: formatDate(createdAt),
    time: formatTime(createdAt),
    eventDate: eventDate,
    location: item.location || "—",
    status: item.status || "Pending",
    script: item.script || "",
    breakingNews: Boolean(item.breaking_news ?? item.breakingNews),
    editorFeedback: item.editor_feedback || item.editorFeedback || "",
  };
}

function TotalNews() {
  const location = useLocation();

  const [news, setNews] = useState([]);
  const [search, setSearch] = useState("");
  const [format, setFormat] = useState("All");
  const [status, setStatus] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedNews, setSelectedNews] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const storedUser = sessionStorage.getItem("emAxisUser");

      if (!storedUser) {
        throw new Error("Login session not found. Please log in again.");
      }

      let user;

      try {
        user = JSON.parse(storedUser);
      } catch {
        throw new Error("Invalid login session. Please log in again.");
      }

      const reporterId = Number(user?.id);
      const role = String(user?.role || "")
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, "_");

      if (!Number.isInteger(reporterId) || reporterId < 1) {
        throw new Error("Reporter ID is missing. Please log in again.");
      }

      if (role !== "reporter") {
        throw new Error("Please log in with a reporter account.");
      }

      const response = await fetch(
        `${API_BASE}/api/news/reporter/${reporterId}`
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to fetch your news records."
        );
      }

      const records = Array.isArray(result.news) ? result.news : [];

      setNews(records.map(mapNewsRecord));
    } catch (err) {
      console.error("TOTAL NEWS FETCH ERROR:", err);

      setError(
        err instanceof TypeError
          ? "Cannot connect to the backend. Check that the server is running."
          : err.message || "Unable to load news records."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews, location.key, location.state?.refresh]);

  const filteredNews = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return news.filter((item) => {
      const searchMatch =
        !searchText ||
        item.title.toLowerCase().includes(searchText) ||
        item.id.toLowerCase().includes(searchText) ||
        item.location.toLowerCase().includes(searchText);

      const formatMatch =
        format === "All" || item.format === format;

      const statusMatch =
        status === "All" || item.status === status;

      const dateMatch =
        !selectedDate || item.date === selectedDate;

      return searchMatch && formatMatch && statusMatch && dateMatch;
    });
  }, [news, search, format, status, selectedDate]);

  const counts = useMemo(
    () => ({
      total: news.length,
      published: news.filter((item) => item.status === "Published").length,
      approved: news.filter((item) => item.status === "Approved").length,
      pending: news.filter((item) => item.status === "Pending").length,
      rejected: news.filter((item) => item.status === "Rejected").length,
    }),
    [news]
  );

  const resetFilters = () => {
    setSearch("");
    setFormat("All");
    setStatus("All");
    setSelectedDate("");
  };

  return (
    <div className="total-news-page">
      <main className="total-news-main">
        <section className="total-news-heading">
          <div className="total-heading-left">
            <div className="total-heading-icon">📰</div>
            <div>
              <h1>Total News</h1>
              <p>Manage and track all your submitted news stories.</p>
            </div>
          </div>

          <div className="total-heading-count">
            <span>Total Records</span>
            <strong>{counts.total}</strong>
          </div>
        </section>

        <section className="total-summary-grid">
          <div className="total-summary-card summary-blue">
            <div className="summary-card-top">
              <span className="summary-icon">📰</span>
              <span className="summary-caption">All Records</span>
            </div>
            <strong className="summary-number">{counts.total}</strong>
            <span className="summary-description">Total news stories</span>
          </div>

          <div className="total-summary-card summary-green">
            <div className="summary-card-top">
              <span className="summary-icon">✓</span>
              <span className="summary-caption">Published</span>
            </div>
            <strong className="summary-number">{counts.published}</strong>
            <span className="summary-description">Published stories</span>
          </div>

          <div className="total-summary-card summary-purple">
            <div className="summary-card-top">
              <span className="summary-icon">✓</span>
              <span className="summary-caption">Approved</span>
            </div>
            <strong className="summary-number">{counts.approved}</strong>
            <span className="summary-description">Approved stories</span>
          </div>

          <div className="total-summary-card summary-orange">
            <div className="summary-card-top">
              <span className="summary-icon">◷</span>
              <span className="summary-caption">Pending</span>
            </div>
            <strong className="summary-number">{counts.pending}</strong>
            <span className="summary-description">Awaiting review</span>
          </div>

          <div className="total-summary-card summary-red">
            <div className="summary-card-top">
              <span className="summary-icon">!</span>
              <span className="summary-caption">Rejected</span>
            </div>
            <strong className="summary-number">{counts.rejected}</strong>
            <span className="summary-description">Rejected stories</span>
          </div>
        </section>

        <section className="total-filter-panel">
          <div className="total-filter-heading">
            <div>
              <h2>News Records</h2>
              <p>Search, filter and manage your news.</p>
            </div>

            <button
              type="button"
              className="total-reset-button"
              onClick={resetFilters}
            >
              ↺ Reset Filters
            </button>
          </div>

          <div className="total-filter-grid">
            <label className="total-filter-field total-search-field">
              <span>Search News</span>
              <div className="total-search-box">
                <span className="total-search-icon">⌕</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search headline, ID or location..."
                />
              </div>
            </label>

            <label className="total-filter-field">
              <span>News Format</span>
              <select
                value={format}
                onChange={(event) => setFormat(event.target.value)}
              >
                {formats.map((item) => (
                  <option key={item} value={item}>
                    {item === "All" ? "All Formats" : item}
                  </option>
                ))}
              </select>
            </label>

            <label className="total-filter-field">
              <span>News Status</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                {statuses.map((item) => (
                  <option key={item} value={item}>
                    {item === "All" ? "All Statuses" : item}
                  </option>
                ))}
              </select>
            </label>

            <label className="total-filter-field">
              <span>Created Date</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
            </label>
          </div>

          <div className="total-filter-footer">
            <span>
              Showing <strong>{filteredNews.length}</strong> of{" "}
              <strong>{news.length}</strong> news records
            </span>

            {(search || format !== "All" || status !== "All" || selectedDate) && (
              <span className="total-filter-active">Filters applied</span>
            )}
          </div>
        </section>

        {error && (
          <section className="total-filter-panel" role="alert">
            <p>{error}</p>
            <button
              type="button"
              className="total-reset-button"
              onClick={fetchNews}
            >
              Retry
            </button>
          </section>
        )}

        <section className="total-table-card">
          <div className="total-table-scroll">
            <table className="total-news-table">
              <thead>
                <tr>
                  <th>NEWS ID</th>
                  <th>NEWS HEADLINE</th>
                  <th>FORMAT</th>
                  <th>CREATED DATE</th>
                  <th>LOCATION</th>
                  <th>STATUS</th>
                  <th className="total-action-heading">ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="total-empty-state">
                      <strong>Loading news from database...</strong>
                    </td>
                  </tr>
                ) : filteredNews.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="total-empty-state">
                      <div className="total-empty-icon">📰</div>
                      <strong>
                        {error ? "News could not be loaded" : "No news records found"}
                      </strong>
                      <p>
                        {error
                          ? "Check your backend connection and try again."
                          : news.length === 0
                            ? "Your submitted news will appear here."
                            : "Try changing your search or filter options."}
                      </p>
                      {news.length > 0 && (
                        <button type="button" onClick={resetFilters}>
                          Clear Filters
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredNews.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className="total-news-id">
                          N{String(item.id).padStart(3, "0")}
                        </span>
                      </td>

                      <td>
                        <div className="total-headline-cell">
                          <div className="total-news-thumbnail">
                            {item.title.charAt(0).toUpperCase()}
                          </div>
                          <div className="total-headline-text">
                            <strong>{item.title}</strong>
                            <span>News Story</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="total-format-tag">{item.format}</span>
                      </td>

                      <td>
                        <div className="total-date-cell">
                          <strong>{item.displayDate}</strong>
                          <span>{item.time}</span>
                        </div>
                      </td>

                      <td>
                        <span className="total-location">
                          <span>📍</span> {item.location}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`total-status-badge status-${item.status
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          <span className="total-status-dot" />
                          {item.status}
                        </span>
                      </td>

                      <td>
                        <div className="total-action-buttons">
                          <button
                            type="button"
                            className="total-action-btn action-view"
                            title="View news"
                            aria-label={`View ${item.title}`}
                            onClick={() => setSelectedNews(item)}
                          >
                            👀
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="total-table-bottom">
            <span>
              {filteredNews.length} record
              {filteredNews.length === 1 ? "" : "s"} displayed
            </span>
          </div>
        </section>
      </main>

      {selectedNews && (
        <div
          className="total-modal-overlay"
          onClick={() => setSelectedNews(null)}
        >
          <div
            className="total-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="total-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="total-modal-header">
              <div>
                <span className="total-modal-eyebrow">
                  DATABASE ID · {selectedNews.databaseId}
                </span>
                <h2 id="total-modal-title">News Details</h2>
              </div>

              <button
                type="button"
                className="total-modal-close"
                onClick={() => setSelectedNews(null)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <div className="total-view-details">
              <div className="total-view-title">
                <span className="total-view-title-icon">📰</span>
                <div>
                  <span>NEWS HEADLINE</span>
                  <h3>{selectedNews.title}</h3>
                </div>
              </div>

              <div className="total-detail-grid">
                <div className="total-detail-item">
                  <span>News ID</span>
                  <strong>{selectedNews.id}</strong>
                </div>
                <div className="total-detail-item">
                  <span>Format</span>
                  <strong>{selectedNews.format}</strong>
                </div>
                <div className="total-detail-item">
                  <span>Created Date</span>
                  <strong>{selectedNews.displayDate}</strong>
                </div>
                <div className="total-detail-item">
                  <span>Time</span>
                  <strong>{selectedNews.time}</strong>
                </div>
                <div className="total-detail-item">
                  <span>Location</span>
                  <strong>{selectedNews.location}</strong>
                </div>
                <div className="total-detail-item">
                  <span>Status</span>
                  <strong>{selectedNews.status}</strong>
                </div>
              </div>

              <div className="total-preview-script">
                <strong>News Script</strong>
                <p>{selectedNews.script || "No script available."}</p>
              </div>

              {selectedNews.editorFeedback && (
                <div className="total-preview-script">
                  <strong>Editor Feedback</strong>
                  <p>{selectedNews.editorFeedback}</p>
                </div>
              )}

              <div className="total-modal-footer">
                <button
                  type="button"
                  className="total-modal-secondary"
                  onClick={() => setSelectedNews(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TotalNews;
