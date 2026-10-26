
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./AllNews.css";

const API_URL = "http://localhost:5000/api/news";

const STATUS_CARDS = [
  { label: "All News", icon: "▤", color: "blue", status: "All" },
  { label: "Pending", icon: "◷", color: "orange", status: "Pending" },
  { label: "Approved", icon: "✓", color: "green", status: "Approved" },
  { label: "Rejected", icon: "×", color: "red", status: "Rejected" },
  {
    label: "Correction Required",
    icon: "↻",
    color: "violet",
    status: "Correction Required",
  },
  { label: "Published", icon: "↑", color: "teal", status: "Published" },
];

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const mapNews = (item) => ({
  ...item,
  id: item.id,
  slug: item.news_slug || item.title || "Untitled News",
  reporter: item.reporter_name || "Unknown Reporter",
  reporterId: item.reporter_id,
  format: item.format || "—",
  submitted: formatDate(item.created_at),
  updated: formatDate(item.updated_at),
  status: item.status || "Pending",
});

function AllNews() {
  const navigate = useNavigate();

  const [news, setNews] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [reporterFilter, setReporterFilter] = useState("All Reporters");
  const [formatFilter, setFormatFilter] = useState("All Formats");
  const [dateFilter, setDateFilter] = useState("All Dates");
  const [sortBy, setSortBy] = useState("Newest First");
  const [appliedFilters, setAppliedFilters] = useState({});
  const [selectedNews, setSelectedNews] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [menuNewsId, setMenuNewsId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch actual news records from the backend.
  const refreshNews = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to fetch news.");
      }

      const records = Array.isArray(result.news) ? result.news : [];

      setNews(records.map(mapNews));
      setSelectedNews([]);
      setPage(1);
    } catch (err) {
      const message =
        err.message === "Failed to fetch"
          ? "Backend se connection nahi ho raha. Check karo ki server localhost:5000 par running hai."
          : err.message || "News load nahi ho saki.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshNews();
  }, []);

  const filters = appliedFilters;

  const filteredNews = useMemo(() => {
    let result = [...news];

    if (filters.search) {
      const term = filters.search.toLowerCase();

      result = result.filter(
        (item) =>
          item.slug.toLowerCase().includes(term) ||
          item.reporter.toLowerCase().includes(term) ||
          item.format.toLowerCase().includes(term) ||
          String(item.location || "").toLowerCase().includes(term)
      );
    }

    if (filters.status && filters.status !== "All") {
      result = result.filter((item) => item.status === filters.status);
    }

    if (filters.reporter && filters.reporter !== "All Reporters") {
      result = result.filter((item) => item.reporter === filters.reporter);
    }

    if (filters.format && filters.format !== "All Formats") {
      result = result.filter((item) => item.format === filters.format);
    }

    if (filters.date === "Today" || filters.date === "Last 7 Days") {
      const now = new Date();
      const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

      const startDate = new Date(today);

      if (filters.date === "Last 7 Days") {
        startDate.setDate(startDate.getDate() - 6);
      }

      result = result.filter((item) => {
        const date = new Date(item.created_at);

        if (Number.isNaN(date.getTime())) return false;

        return date >= startDate && date <= now;
      });
    }

    if (filters.sort === "Oldest First") {
      result.sort(
        (a, b) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
      );
    } else if (filters.sort === "Reporter A-Z") {
      result.sort((a, b) => a.reporter.localeCompare(b.reporter));
    } else {
      result.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );
    }

    return result;
  }, [news, filters]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredNews.length / rowsPerPage)
  );

  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * rowsPerPage;

  const visibleNews = filteredNews.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const applyFilters = () => {
    setAppliedFilters({
      search: search.trim(),
      status: statusFilter,
      reporter: reporterFilter,
      format: formatFilter,
      date: dateFilter,
      sort: sortBy,
    });

    setPage(1);
    setSelectedNews([]);
    toast.success("Filters applied successfully.");
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setReporterFilter("All Reporters");
    setFormatFilter("All Formats");
    setDateFilter("All Dates");
    setSortBy("Newest First");

    setAppliedFilters({
      search: "",
      status: "All",
      reporter: "All Reporters",
      format: "All Formats",
      date: "All Dates",
      sort: "Newest First",
    });

    setPage(1);
    setSelectedNews([]);
    toast.info("Filters have been reset.");
  };

  const selectStatus = (status) => {
    setStatusFilter(status);

    setAppliedFilters((current) => ({
      ...current,
      search,
      status,
      reporter: reporterFilter,
      format: formatFilter,
      date: dateFilter,
      sort: sortBy,
    }));

    setPage(1);
    setSelectedNews([]);
  };

  const toggleSelection = (id) => {
    setSelectedNews((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id]
    );
  };

  const toggleAll = () => {
    const visibleIds = visibleNews.map((item) => item.id);

    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) => selectedNews.includes(id));

    setSelectedNews((current) =>
      allSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : [...new Set([...current, ...visibleIds])]
    );
  };

  const handleReview = (item) => {
    setMenuNewsId(null);

    navigate("/editor/news-review", {
      state: { news: item },
    });
  };

  const statusClass = (status) => {
    if (status === "Pending") return "pending-review";

    return String(status || "")
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  const getCardCount = (status) => {
    if (status === "All") return news.length;

    return news.filter((item) => item.status === status).length;
  };

  return (
    <main className="all-news-page">
      <section className="all-news-heading">
        <div className="all-news-heading-left">
          <div className="all-news-main-icon">▤</div>

          <div>
            <h1>All News</h1>
            <p>
              Manage, review, and track news submitted by all reporters.
            </p>
          </div>
        </div>

        <div className="all-news-heading-actions">
          <div className="all-news-total-box">
            <span>Total News</span>
            <strong>{news.length}</strong>
          </div>

          <button
            className="all-news-refresh"
            type="button"
            title="Refresh news"
            onClick={refreshNews}
            disabled={loading}
          >
            ↻
          </button>
        </div>
      </section>

      <section className="all-news-stat-grid">
        {STATUS_CARDS.map((card) => (
          <button
            type="button"
            key={card.label}
            className={`all-news-stat-card ${card.color} ${
              statusFilter === card.status ? "selected" : ""
            }`}
            onClick={() => selectStatus(card.status)}
          >
            <span className="all-news-stat-icon">{card.icon}</span>
            <span className="all-news-stat-label">{card.label}</span>
            <strong>{getCardCount(card.status)}</strong>
            <span className="all-news-stat-arrow">›</span>
          </button>
        ))}
      </section>

      <section className="all-news-filter-panel">
        <label className="all-news-search">
          <span>⌕</span>

          <input
            type="search"
            placeholder="Search by news slug, reporter, format or location..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") applyFilters();
            }}
          />
        </label>

        <div className="all-news-filter-grid">
          <label>
            <span>Status</span>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Correction Required">Correction Required</option>
              <option value="Rejected">Rejected</option>
              <option value="Published">Published</option>
            </select>
          </label>

          <label>
            <span>Reporter</span>

            <select
              value={reporterFilter}
              onChange={(event) => setReporterFilter(event.target.value)}
            >
              <option value="All Reporters">All Reporters</option>

              {[...new Set(news.map((item) => item.reporter))]
                .sort()
                .map((reporter) => (
                  <option key={reporter} value={reporter}>
                    {reporter}
                  </option>
                ))}
            </select>
          </label>

          <label>
            <span>News Format</span>

            <select
              value={formatFilter}
              onChange={(event) => setFormatFilter(event.target.value)}
            >
              <option value="All Formats">All Formats</option>

              {[...new Set(news.map((item) => item.format))]
                .sort()
                .map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
            </select>
          </label>

          <label>
            <span>Submission Date</span>

            <select
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
            >
              <option value="All Dates">All Dates</option>
              <option value="Today">Today</option>
              <option value="Last 7 Days">Last 7 Days</option>
            </select>
          </label>

          <label>
            <span>Sort By</span>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="Newest First">Newest First</option>
              <option value="Oldest First">Oldest First</option>
              <option value="Reporter A-Z">Reporter A-Z</option>
            </select>
          </label>

          <div className="all-news-filter-buttons">
            <button
              type="button"
              className="all-news-apply-btn"
              onClick={applyFilters}
            >
              ⚑ Apply Filters
            </button>

            <button
              type="button"
              className="all-news-reset-btn"
              onClick={resetFilters}
            >
              ↻ Reset Filters
            </button>
          </div>
        </div>
      </section>

      <section className="all-news-table-panel">
        <div className="all-news-table-heading">
          <div className="all-news-table-title">
            <span className="all-news-table-icon">▤</span>
            <h2>All News</h2>
          </div>

          <span className="all-news-record-count">
            Showing {visibleNews.length} of {filteredNews.length} records
          </span>
        </div>

        {selectedNews.length > 0 && (
          <div className="all-news-selection-bar">
            {selectedNews.length} news item(s) selected

            <button
              type="button"
              onClick={() => {
                setSelectedNews([]);
                toast.info("Selection cleared.");
              }}
            >
              Clear selection
            </button>
          </div>
        )}

        {error && (
          <div className="all-news-empty" role="alert">
            {error}
            <button type="button" onClick={refreshNews}>
              Try Again
            </button>
          </div>
        )}

        <div className="all-news-table-scroll">
          <table className="all-news-table">
            <thead>
              <tr>
                <th className="all-news-checkbox-cell">
                  <input
                    type="checkbox"
                    aria-label="Select all visible news"
                    checked={
                      visibleNews.length > 0 &&
                      visibleNews.every((item) =>
                        selectedNews.includes(item.id)
                      )
                    }
                    onChange={toggleAll}
                  />
                </th>
                <th>News Slug</th>
                <th>Reporter</th>
                <th>News Format</th>
                <th>Submitted Date</th>
                <th>Last Updated</th>
                <th>Status</th>
                <th>Action</th>
                <th aria-label="More options" />
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="all-news-empty">
                    Loading news from database...
                  </td>
                </tr>
              ) : !error && visibleNews.length === 0 ? (
                <tr>
                  <td colSpan="9" className="all-news-empty">
                    {news.length === 0
                      ? "No news has been submitted yet."
                      : "No news found. Try changing the filters."}
                  </td>
                </tr>
              ) : (
                visibleNews.map((item) => (
                  <tr key={item.id}>
                    <td className="all-news-checkbox-cell">
                      <input
                        type="checkbox"
                        aria-label={`Select ${item.slug}`}
                        checked={selectedNews.includes(item.id)}
                        onChange={() => toggleSelection(item.id)}
                      />
                    </td>

                    <td className="all-news-slug">{item.slug}</td>
                    <td>{item.reporter}</td>
                    <td>{item.format}</td>
                    <td>{item.submitted}</td>
                    <td>{item.updated}</td>

                    <td>
                      <span
                        className={`all-news-status ${statusClass(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className={
                          ["Pending", "Correction Required"].includes(
                            item.status
                          )
                            ? "all-news-review-btn"
                            : "all-news-details-btn"
                        }
                        onClick={() => handleReview(item)}
                      >
                        {["Pending", "Correction Required"].includes(
                          item.status
                        )
                          ? "Review News"
                          : "View Details"}
                      </button>
                    </td>

                    <td className="all-news-more-cell">
                      <button
                        type="button"
                        className="all-news-more-btn"
                        aria-label={`More options for ${item.slug}`}
                        onClick={() =>
                          setMenuNewsId((current) =>
                            current === item.id ? null : item.id
                          )
                        }
                      >
                        ⋮
                      </button>

                      {menuNewsId === item.id && (
                        <div className="all-news-row-menu">
                          <button
                            type="button"
                            onClick={() => handleReview(item)}
                          >
                            View details
                          </button>

                          <button
                            type="button"
                            onClick={() => handleReview(item)}
                          >
                            Review News
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="all-news-table-footer">
          <label className="all-news-rows-select">
            <span>Rows per page:</span>

            <select
              value={rowsPerPage}
              onChange={(event) => {
                setRowsPerPage(Number(event.target.value));
                setPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </label>

          <div className="all-news-pagination">
            <button
              type="button"
              disabled={safePage === 1 || loading}
              onClick={() => setPage((current) => current - 1)}
            >
              ‹ Previous
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            )
              .slice(0, 5)
              .map((pageNumber) => (
                <button
                  type="button"
                  key={pageNumber}
                  className={
                    safePage === pageNumber ? "current-page" : ""
                  }
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}

            <button
              type="button"
              disabled={safePage >= totalPages || loading}
              onClick={() => setPage((current) => current + 1)}
            >
              Next ›
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AllNews;
