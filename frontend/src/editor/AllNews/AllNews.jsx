
import { useMemo, useState } from "react";
import "./AllNews.css";

const initialNews = [
  {
    id: 1,
    slug: "local-road-update",
    reporter: "Tanavi",
    format: "AV",
    submitted: "15 Oct 2026",
    updated: "15 Oct 2026",
    status: "Pending Review",
  },
  {
    id: 2,
    slug: "sports-final-report",
    reporter: "Kamal",
    format: "PKG",
    submitted: "15 Oct 2026",
    updated: "15 Oct 2026",
    status: "Approved",
  },
  {
    id: 3,
    slug: "education-news-update",
    reporter: "Vaishnavi",
    format: "AVB",
    submitted: "14 Oct 2026",
    updated: "15 Oct 2026",
    status: "Correction Required",
  },
  {
    id: 4,
    slug: "city-development-report",
    reporter: "Tanashri",
    format: "One-to-One",
    submitted: "14 Oct 2026",
    updated: "14 Oct 2026",
    status: "Published",
  },
  {
    id: 5,
    slug: "local-event-coverage",
    reporter: "Tanavi",
    format: "WKT",
    submitted: "13 Oct 2026",
    updated: "14 Oct 2026",
    status: "Rejected",
  },
];

const statusCards = [
  { label: "All News", value: 102, icon: "▤", color: "blue" },
  { label: "Pending Review", value: 18, icon: "◷", color: "orange" },
  { label: "Under Review", value: 12, icon: "⌕", color: "purple" },
  { label: "Approved", value: 45, icon: "✓", color: "green" },
  { label: "Rejected", value: 5, icon: "×", color: "red" },
  { label: "Correction Required", value: 7, icon: "↻", color: "violet" },
  { label: "Published", value: 15, icon: "↑", color: "teal" },
];

function AllNews() {
  const [news, setNews] = useState(initialNews);
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
  const [detailsNews, setDetailsNews] = useState(null);
  const [menuNewsId, setMenuNewsId] = useState(null);

  const filters = appliedFilters;

  const filteredNews = useMemo(() => {
    let result = [...news];

    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (item) =>
          item.slug.toLowerCase().includes(term) ||
          item.reporter.toLowerCase().includes(term)
      );
    }

    if (filters.status && filters.status !== "All") {
      result = result.filter((item) => item.status === filters.status);
    }

    if (
      filters.reporter &&
      filters.reporter !== "All Reporters"
    ) {
      result = result.filter(
        (item) => item.reporter === filters.reporter
      );
    }

    if (filters.format && filters.format !== "All Formats") {
      result = result.filter(
        (item) => item.format === filters.format
      );
    }

    if (filters.date === "Today") {
      result = result.filter(
        (item) =>
          item.submitted === "16 Oct 2026"
      );
    } else if (filters.date === "Last 7 Days") {
      result = result.filter((item) =>
        [
          "10 Oct 2026",
          "11 Oct 2026",
          "12 Oct 2026",
          "13 Oct 2026",
          "14 Oct 2026",
          "15 Oct 2026",
          "16 Oct 2026",
        ].includes(item.submitted)
      );
    }

    if (filters.sort === "Oldest First") {
      result.reverse();
    } else if (filters.sort === "Reporter A-Z") {
      result.sort((a, b) =>
        a.reporter.localeCompare(b.reporter)
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
      search,
      status: statusFilter,
      reporter: reporterFilter,
      format: formatFilter,
      date: dateFilter,
      sort: sortBy,
    });
    setPage(1);
    setSelectedNews([]);
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setReporterFilter("All Reporters");
    setFormatFilter("All Formats");
    setDateFilter("All Dates");
    setSortBy("Newest First");
    setAppliedFilters({});
    setPage(1);
    setSelectedNews([]);
  };

  const refreshNews = () => {
    setNews((current) => [...current]);
    setPage(1);
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
    const allSelected = visibleIds.every((id) =>
      selectedNews.includes(id)
    );

    setSelectedNews((current) =>
      allSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : [...new Set([...current, ...visibleIds])]
    );
  };

  const handleReview = (item) => {
    setDetailsNews(item);
    setMenuNewsId(null);
  };

  const statusClass = (status) =>
    status.toLowerCase().replace(/\s+/g, "-");

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
            <strong>102</strong>
          </div>

          <button
            className="all-news-refresh"
            type="button"
            title="Refresh news"
            onClick={refreshNews}
          >
            ↻
          </button>
        </div>
      </section>

      <section className="all-news-stat-grid">
        {statusCards.map((card) => (
          <button
            type="button"
            key={card.label}
            className={`all-news-stat-card ${card.color} ${
              statusFilter === card.label ? "selected" : ""
            }`}
            onClick={() => {
              const nextStatus =
                card.label === "All News" ? "All" : card.label;

              setStatusFilter(nextStatus);
              setAppliedFilters((current) => ({
                ...current,
                status: nextStatus,
                search,
                reporter: reporterFilter,
                format: formatFilter,
                date: dateFilter,
                sort: sortBy,
              }));
              setPage(1);
            }}
          >
            <span className="all-news-stat-icon">{card.icon}</span>
            <span className="all-news-stat-label">{card.label}</span>
            <strong>{card.value}</strong>
            <span className="all-news-stat-arrow">›</span>
          </button>
        ))}
      </section>

      <section className="all-news-filter-panel">
        <label className="all-news-search">
          <span>⌕</span>
          <input
            type="search"
            placeholder="Search by news slug or reporter name..."
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
              <option>All</option>
              <option>Pending Review</option>
              <option>Under Review</option>
              <option>Approved</option>
              <option>Correction Required</option>
              <option>Rejected</option>
              <option>Published</option>
            </select>
          </label>

          <label>
            <span>Reporter</span>
            <select
              value={reporterFilter}
              onChange={(event) =>
                setReporterFilter(event.target.value)
              }
            >
              <option>All Reporters</option>
              {[...new Set(news.map((item) => item.reporter))]
                .sort()
                .map((reporter) => (
                  <option key={reporter}>{reporter}</option>
                ))}
            </select>
          </label>

          <label>
            <span>News Format</span>
            <select
              value={formatFilter}
              onChange={(event) => setFormatFilter(event.target.value)}
            >
              <option>All Formats</option>
              {[...new Set(news.map((item) => item.format))]
                .sort()
                .map((format) => (
                  <option key={format}>{format}</option>
                ))}
            </select>
          </label>

          <label>
            <span>Submission Date</span>
            <select
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
            >
              <option>All Dates</option>
              <option>Today</option>
              <option>Last 7 Days</option>
            </select>
          </label>

          <label>
            <span>Sort By</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option>Newest First</option>
              <option>Oldest First</option>
              <option>Reporter A-Z</option>
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
              onClick={() => setSelectedNews([])}
            >
              Clear selection
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
              {visibleNews.map((item) => (
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
                        item.status === "Pending Review" ||
                        item.status === "Correction Required" ||
                        item.status === "Under Review"
                          ? "all-news-review-btn"
                          : "all-news-details-btn"
                      }
                      onClick={() => handleReview(item)}
                    >
                      {item.status === "Pending Review" ||
                      item.status === "Correction Required" ||
                      item.status === "Under Review"
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
                          onClick={() => {
                            setDetailsNews(item);
                            setMenuNewsId(null);
                          }}
                        >
                          Review news
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {visibleNews.length === 0 && (
                <tr>
                  <td colSpan="9" className="all-news-empty">
                    No news found. Try changing the filters.
                  </td>
                </tr>
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
              disabled={safePage === 1}
              onClick={() => setPage((current) => current - 1)}
            >
              ‹ Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1)
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
              disabled={safePage >= totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next ›
            </button>
          </div>
        </div>
      </section>

      {detailsNews && (
        <div
          className="all-news-modal-overlay"
          onClick={() => setDetailsNews(null)}
        >
          <section
            className="all-news-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="all-news-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="all-news-modal-heading">
              <div>
                <h2 id="all-news-modal-title">News Details</h2>
                <p>Review the selected news submission.</p>
              </div>

              <button
                type="button"
                aria-label="Close details"
                onClick={() => setDetailsNews(null)}
              >
                ×
              </button>
            </div>

            <div className="all-news-modal-body">
              <p>
                <strong>News Slug:</strong> {detailsNews.slug}
              </p>
              <p>
                <strong>Reporter:</strong> {detailsNews.reporter}
              </p>
              <p>
                <strong>News Format:</strong> {detailsNews.format}
              </p>
              <p>
                <strong>Submitted Date:</strong> {detailsNews.submitted}
              </p>
              <p>
                <strong>Last Updated:</strong> {detailsNews.updated}
              </p>
              <p>
                <strong>Status:</strong> {detailsNews.status}
              </p>
            </div>

            <div className="all-news-modal-actions">
              <button
                type="button"
                className="all-news-reset-btn"
                onClick={() => setDetailsNews(null)}
              >
                Close
              </button>

              {[
                "Pending Review",
                "Under Review",
                "Correction Required",
              ].includes(detailsNews.status) && (
                <button
                  type="button"
                  className="all-news-apply-btn"
                  onClick={() => {
                    setNews((current) =>
                      current.map((item) =>
                        item.id === detailsNews.id
                          ? {
                              ...item,
                              status: "Under Review",
                              updated: "16 Oct 2026",
                            }
                          : item
                      )
                    );
                    setDetailsNews({
                      ...detailsNews,
                      status: "Under Review",
                      updated: "16 Oct 2026",
                    });
                  }}
                >
                  Mark Under Review
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default AllNews;
