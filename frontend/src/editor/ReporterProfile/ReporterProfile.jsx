
import React, { useState } from "react";
import "./ReporterProfile.css";

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

function ReporterProfile() {
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
    <main className="reporterprofile-page">

      {/* Premium Reporter Profile Banner */}
      <section className="reporterprofile-profile-card">
        <div className="reporterprofile-banner-glow" />

        <div className="reporterprofile-avatar">
          <span>TV</span>
          <i className="reporterprofile-avatar-online" />
        </div>

        <div className="reporterprofile-reporter-info">
          <span className="reporterprofile-eyebrow">
            REPORTER PROFILE
          </span>

          <h2>Tanavi Vanjare</h2>

          <div className="reporterprofile-identity">
            <span className="reporterprofile-id">
              ID: REP-001
            </span>
            <span className="reporterprofile-role">
              ✦ Reporter
            </span>
          </div>

          <p className="reporterprofile-email">
            <span>✉</span> tanavi@example.com
          </p>
        </div>

        <div className="reporterprofile-profile-details">
          <div className="reporterprofile-detail-box">
            <span className="reporterprofile-detail-label">
              ACCOUNT STATUS
            </span>
            <strong className="reporterprofile-active">
              <i /> Active
            </strong>
          </div>

          <div className="reporterprofile-detail-box">
            <span className="reporterprofile-detail-label">
              REGISTRATION DATE
            </span>
            <strong className="reporterprofile-registration">
              <span>▦</span> 10 Jan 2026
            </strong>
          </div>
        </div>

        <div className="reporterprofile-banner-decoration">
          EM
        </div>
      </section>

      {/* Statistics */}
            {/* Statistics */}
      <section className="reporterprofile-stats">
        {/* Total News - Blue */}
        <div className="reporterprofile-stat-card stat-total">
          <span className="reporterprofile-stat-icon blue">▤</span>
          <div className="reporterprofile-stat-info">
            <p>Total News</p>
            <h2>32</h2>
          </div>
        </div>

        {/* Pending Review - Yellow */}
        <div className="reporterprofile-stat-card stat-pending">
          <span className="reporterprofile-stat-icon yellow">◷</span>
          <div className="reporterprofile-stat-info">
            <p>Pending Review</p>
            <h2>4</h2>
          </div>
        </div>

        {/* Under Review - Purple */}
        <div className="reporterprofile-stat-card stat-under-review">
          <span className="reporterprofile-stat-icon purple">⌕</span>
          <div className="reporterprofile-stat-info">
            <p>Under Review</p>
            <h2>2</h2>
          </div>
        </div>

        {/* Approved - Green */}
        <div className="reporterprofile-stat-card stat-approved">
          <span className="reporterprofile-stat-icon green">✓</span>
          <div className="reporterprofile-stat-info">
            <p>Approved</p>
            <h2>10</h2>
          </div>
        </div>

        {/* Rejected - Red */}
        <div className="reporterprofile-stat-card stat-rejected">
          <span className="reporterprofile-stat-icon red">×</span>
          <div className="reporterprofile-stat-info">
            <p>Rejected</p>
            <h2>3</h2>
          </div>
        </div>

        {/* Correction Required - Orange */}
        <div className="reporterprofile-stat-card stat-correction">
          <span className="reporterprofile-stat-icon orange">↻</span>
          <div className="reporterprofile-stat-info">
            <p>Correction Required</p>
            <h2>3</h2>
          </div>
        </div>

        {/* Published - Sky Blue */}
        <div className="reporterprofile-stat-card stat-published">
          <span className="reporterprofile-stat-icon sky-blue">⚑</span>
          <div className="reporterprofile-stat-info">
            <p>Published</p>
            <h2>10</h2>
          </div>
        </div>
      </section>

      {/* News History and Activity Timeline */}
      <section className="reporterprofile-main-grid">
        <div className="reporterprofile-history-card">
          <div className="reporterprofile-section-heading">
            <div>
              <h2>News History</h2>
              <p>Track and review the reporter's news submissions.</p>
            </div>
            <span className="reporterprofile-record-count">
              {filteredNews.length} Records
            </span>
          </div>

          <input
            className="reporterprofile-search"
            type="search"
            placeholder="Search by News ID or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="reporterprofile-filters">
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

          <div className="reporterprofile-filter-actions">
            <button
              className="reporterprofile-apply-btn"
              onClick={() => setSearch(search.trim())}
            >
              Apply Filters
            </button>

            <button
              className="reporterprofile-reset-btn"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>

          <div className="reporterprofile-table-wrapper">
            <table className="reporterprofile-table">
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
                    <td className="reporterprofile-news-id">{item.id}</td>
                    <td>{item.slug}</td>
                    <td>
                      <span className="reporterprofile-format">
                        {item.format}
                      </span>
                    </td>
                    <td>{item.submitted}</td>
                    <td>{item.updated}</td>
                    <td>
                      <span
                        className={`reporterprofile-status ${item.status
                          .toLowerCase()
                          .replaceAll(" ", "-")}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="reporterprofile-view-btn"
                        onClick={() => setSelectedNews(item)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredNews.length === 0 && (
                  <tr>
                    <td colSpan="7" className="reporterprofile-empty">
                      No news records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="reporterprofile-table-footer">
            Showing {filteredNews.length} of {newsData.length} records
          </div>
        </div>

        <aside className="reporterprofile-timeline-card">
          <div className="reporterprofile-section-heading">
            <div>
              <h2>Activity Timeline</h2>
              <p>Recent reporter activities</p>
            </div>
            <span className="reporterprofile-timeline-badge">● Live</span>
          </div>

          <div className="reporterprofile-timeline">
            {activities.map((activity, index) => (
              <div
                className="reporterprofile-timeline-item"
                key={`${activity.title}-${index}`}
              >
                <div
                  className={`reporterprofile-timeline-icon icon-${index}`}
                >
                  {activity.icon}
                </div>

                <div className="reporterprofile-timeline-content">
                  <h3>{activity.title}</h3>
                  <p>{activity.slug}</p>
                  <span>{activity.date}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      {/* News Details Modal */}
      {selectedNews && (
        <div
          className="reporterprofile-modal-overlay"
          onClick={() => setSelectedNews(null)}
        >
          <section
            className="reporterprofile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reporterprofile-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="reporterprofile-modal-close"
              onClick={() => setSelectedNews(null)}
              aria-label="Close dialog"
            >
              ×
            </button>

            <span className="reporterprofile-modal-eyebrow">
              NEWS INFORMATION
            </span>
            <h2 id="reporterprofile-modal-title">News Details</h2>

            <p><strong>News ID:</strong> {selectedNews.id}</p>
            <p><strong>News Slug:</strong> {selectedNews.slug}</p>
            <p><strong>Format:</strong> {selectedNews.format}</p>
            <p><strong>Submitted:</strong> {selectedNews.submitted}</p>
            <p><strong>Last Updated:</strong> {selectedNews.updated}</p>
            <p><strong>Status:</strong> {selectedNews.status}</p>

            <button
              className="reporterprofile-apply-btn"
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

export default ReporterProfile;