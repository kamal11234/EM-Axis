
import React, { useState } from "react";
import "./AllReporter.css";

const newsData = [
  { id: "N001", slug: "local-road-development-project", format: "AV", submitted: "15 Oct 2026", updated: "16 Oct 2026", status: "Pending Review" },
  { id: "N002", slug: "education-policy-update", format: "AVB", submitted: "14 Oct 2026", updated: "15 Oct 2026", status: "Published" },
  { id: "N003", slug: "city-sports-event", format: "PKG", submitted: "12 Oct 2026", updated: "14 Oct 2026", status: "Correction Required" },
  { id: "N004", slug: "new-highway-connectivity", format: "WKT", submitted: "10 Oct 2026", updated: "11 Oct 2026", status: "Rejected" },
];

const activities = [
  { title: "News Submitted", slug: "local-road-development-project", date: "15 Oct 2026, 10:24 AM", icon: "▤" },
  { title: "News Sent for Correction", slug: "city-sports-event", date: "14 Oct 2026, 04:32 PM", icon: "↻" },
  { title: "Corrected News Resubmitted", slug: "city-sports-event", date: "15 Oct 2026, 11:15 AM", icon: "✎" },
  { title: "News Approved", slug: "education-policy-update", date: "16 Oct 2026, 09:20 AM", icon: "✓" },
  { title: "News Sent to Output Team", slug: "education-policy-update", date: "16 Oct 2026, 11:45 AM", icon: "➤" },
];

function AllReporter() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [format, setFormat] = useState("All Formats");
  const [date, setDate] = useState("All Dates");
  const [sort, setSort] = useState("Newest First");
  const [selectedNews, setSelectedNews] = useState(null);

  const filteredNews = newsData
    .filter((item) =>
      `${item.id} ${item.slug}`
        .toLowerCase()
        .includes(search.trim().toLowerCase())
    )
    .filter((item) =>
      status === "All Status" || item.status === status
    )
    .filter((item) =>
      format === "All Formats" || item.format === format
    )
    .filter((item) => {
      if (date === "All Dates") return true;

      const daysOld =
        (new Date("16 Oct 2026") - new Date(item.submitted)) /
        (1000 * 60 * 60 * 24);

      if (date === "Last 7 Days") return daysOld <= 7;
      if (date === "Last 30 Days") return daysOld <= 30;

      return true;
    })
    .sort((a, b) => {
      const first = new Date(a.submitted);
      const second = new Date(b.submitted);

      return sort === "Newest First"
        ? second - first
        : first - second;
    });

  const resetFilters = () => {
    setSearch("");
    setStatus("All Status");
    setFormat("All Formats");
    setDate("All Dates");
    setSort("Newest First");
  };

  return (
    <main className="allreporter-page">
      <header className="allreporter-heading">
        <div>
          <h1>Reporter Profile &amp; News History</h1>
          <p>
            View reporter details and track submitted news activities.
          </p>
        </div>
      </header>

      <section className="allreporter-profile-card">
        <div className="allreporter-avatar">👤</div>

        <div className="allreporter-reporter-info">
          <h2>Tanavi Vanjare</h2>
          <p>REP-001</p>
          <p>✉ tanavi@example.com</p>
          <span className="allreporter-role">Reporter</span>
        </div>

        <div className="allreporter-profile-details">
          <div>
            <span>Account Status</span>
            <strong className="allreporter-active">● Active</strong>
          </div>

          <div>
            <span>Registration Date</span>
            <strong>▦ &nbsp; 10 Jan 2026</strong>
          </div>
        </div>
      </section>

      <section className="allreporter-stats">
        <div className="allreporter-stat-card">
          <span className="allreporter-stat-icon blue">▤</span>
          <p>Total News</p>
          <h2>32</h2>
        </div>

        <div className="allreporter-stat-card">
          <span className="allreporter-stat-icon orange">◷</span>
          <p>Pending Review</p>
          <h2>4</h2>
        </div>

        <div className="allreporter-stat-card">
          <span className="allreporter-stat-icon blue">⌕</span>
          <p>Under Review</p>
          <h2>2</h2>
        </div>

        <div className="allreporter-stat-card">
          <span className="allreporter-stat-icon green">✓</span>
          <p>Approved</p>
          <h2>10</h2>
        </div>

        <div className="allreporter-stat-card">
          <span className="allreporter-stat-icon red">×</span>
          <p>Rejected</p>
          <h2>3</h2>
        </div>

        <div className="allreporter-stat-card">
          <span className="allreporter-stat-icon purple">↻</span>
          <p>Correction Required</p>
          <h2>3</h2>
        </div>

        <div className="allreporter-stat-card">
          <span className="allreporter-stat-icon green">⚑</span>
          <p>Published</p>
          <h2>10</h2>
        </div>
      </section>

      <section className="allreporter-main-grid">
        <div className="allreporter-history-card">
          <h2>News History</h2>

          <input
            className="allreporter-search"
            type="search"
            placeholder="Search by News ID or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="allreporter-filters">
            <label>
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>All Status</option>
                <option>Pending Review</option>
                <option>Published</option>
                <option>Correction Required</option>
                <option>Rejected</option>
              </select>
            </label>

            <label>
              News Format
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              >
                <option>All Formats</option>
                <option>AV</option>
                <option>AVB</option>
                <option>PKG</option>
                <option>WKT</option>
              </select>
            </label>

            <label>
              Submission Date
              <select
                value={date}
                onChange={(e) => setDate(e.target.value)}
              >
                <option>All Dates</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </label>

            <label>
              Sort
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option>Newest First</option>
                <option>Oldest First</option>
              </select>
            </label>
          </div>

          <div className="allreporter-filter-actions">
            <button
              className="allreporter-apply-btn"
              onClick={() => setSearch(search.trim())}
            >
              Apply Filters
            </button>

            <button
              className="allreporter-reset-btn"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>

          <div className="allreporter-table-wrapper">
            <table className="allreporter-table">
              <thead>
                <tr>
                  <th>News ID</th>
                  <th>News Slug</th>
                  <th>Format</th>
                  <th>Submitted Date</th>
                  <th>Last Updated</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredNews.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.slug}</td>
                    <td>{item.format}</td>
                    <td>{item.submitted}</td>
                    <td>{item.updated}</td>
                    <td>
                      <span
                        className={`allreporter-status ${item.status
                          .toLowerCase()
                          .replaceAll(" ", "-")}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="allreporter-view-btn"
                        onClick={() => setSelectedNews(item)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredNews.length === 0 && (
                  <tr>
                    <td colSpan="7" className="allreporter-empty">
                      No news records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="allreporter-table-footer">
            Showing {filteredNews.length} of {newsData.length} records
          </div>
        </div>

        <aside className="allreporter-timeline-card">
          <h2>Reporter Activity Timeline</h2>

          <div className="allreporter-timeline">
            {activities.map((activity, index) => (
              <div
                className="allreporter-timeline-item"
                key={`${activity.title}-${index}`}
              >
                <div
                  className={`allreporter-timeline-icon icon-${index}`}
                >
                  {activity.icon}
                </div>

                <div className="allreporter-timeline-content">
                  <h3>{activity.title}</h3>
                  <p>{activity.slug}</p>
                  <span>{activity.date}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      {selectedNews && (
        <div
          className="allreporter-modal-overlay"
          onClick={() => setSelectedNews(null)}
        >
          <section
            className="allreporter-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="allreporter-modal-close"
              onClick={() => setSelectedNews(null)}
            >
              ×
            </button>

            <h2>News Details</h2>
            <p><strong>News ID:</strong> {selectedNews.id}</p>
            <p><strong>News Slug:</strong> {selectedNews.slug}</p>
            <p><strong>Format:</strong> {selectedNews.format}</p>
            <p><strong>Submitted:</strong> {selectedNews.submitted}</p>
            <p><strong>Last Updated:</strong> {selectedNews.updated}</p>
            <p><strong>Status:</strong> {selectedNews.status}</p>

            <button
              className="allreporter-apply-btn"
              onClick={() => setSelectedNews(null)}
            >
              Close
            </button>
          </section>
        </div>
      )}
    </main>
  );
}

export default AllReporter;
