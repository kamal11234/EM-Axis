import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "./ReporterProfile.css";

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_URL = API_BASE.endsWith("/api")
  ? API_BASE
  : `${API_BASE}/api`;

function formatDate(value) {
  if (!value) return "Not available";

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(value);
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "Date not available";

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(value);
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getReporterInitials(name) {
  if (!name) return "R";

  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getNewsId(id) {
  if (id === null || id === undefined) return "N/A";

  return `N${String(id).padStart(3, "0")}`;
}

function normalizeStatus(value) {
  const status = String(value || "").trim().toLowerCase();

  if (status === "pending" || status === "pending review") {
    return "Pending";
  }

  if (status === "under review" || status === "in review") {
    return "Pending";
  }

  if (status === "correction_required") {
    return "Correction Required";
  }

  if (status === "approved") return "Approved";
  if (status === "published") return "Published";
  if (status === "rejected") return "Rejected";

  if (status === "correction required") {
    return "Correction Required";
  }

  return value || "Unknown";
}

async function fetchJSON(url) {
  const response = await fetch(url);
  const data = await response.json().catch(() => null);

  if (!response.ok || !data || data.success === false) {
    throw new Error(
      data?.message || `Request failed (${response.status}).`
    );
  }

  return data;
}

function ReporterProfile() {
  const location = useLocation();
  const params = useParams();

  const selectedReporter = location.state?.reporter || null;

  const reporterId =
    params.id ||
    selectedReporter?.id ||
    selectedReporter?.reporterId;

  const [reporter, setReporter] = useState(selectedReporter);

  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  const [newsData, setNewsData] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState("");

  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [format, setFormat] = useState("All Formats");
  const [date, setDate] = useState("All Dates");
  const [sort, setSort] = useState("Newest First");
  const [selectedNews, setSelectedNews] = useState(null);

  // =====================================
  // LOAD ACTUAL REPORTER PROFILE
  // =====================================
  useEffect(() => {
    let cancelled = false;

    async function loadReporter() {
      if (!reporterId) {
        setReporter(null);

        const errorMessage =
          "Reporter ID nahi mila. All Reporters page se View Profile par click karo.";

        setProfileError(errorMessage);
        setProfileLoading(false);
        toast.error(errorMessage);
        return;
      }

      setProfileLoading(true);
      setProfileError("");

      try {
        const data = await fetchJSON(
          `${API_URL}/users/${encodeURIComponent(reporterId)}`
        );

        const user = data.user || data.reporter;

        if (!user) {
          throw new Error("Reporter details nahi mili.");
        }

        if (!cancelled) {
          setReporter({
            ...selectedReporter,
            ...user,
            id: user.id ?? reporterId,
          });
        }
      } catch (error) {
        if (!cancelled) {
          const errorMessage =
            error.message || "Reporter profile load nahi ho paayi.";

          setProfileError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    }

    loadReporter();

    return () => {
      cancelled = true;
    };
  }, [reporterId]);

  // =====================================
  // LOAD ACTUAL NEWS AND NOTIFICATIONS
  // =====================================
  useEffect(() => {
    let cancelled = false;

    async function loadNewsAndActivities() {
      if (!reporterId) {
        setNewsData([]);
        setActivities([]);
        setNewsLoading(false);
        setActivityLoading(false);
        return;
      }

      setNewsLoading(true);
      setNewsError("");
      setActivityLoading(true);
      setActivityError("");

      const newsRequest = fetchJSON(
        `${API_URL}/news/reporter/${encodeURIComponent(reporterId)}`
      );

      const activityRequest = fetchJSON(
        `${API_URL}/notifications/reporter/${encodeURIComponent(reporterId)}`
      );

      // Load news independently of notification results.
      try {
        const data = await newsRequest;

        const actualNews = (data.news || []).map((item) => ({
          ...item,
          displayId: getNewsId(item.id),
          slug: item.news_slug || item.title || "Untitled News",
          format: item.format || item.news_format || "Not specified",
          status: normalizeStatus(item.status),
          submitted: item.created_at,
          updated: item.updated_at || item.created_at,
        }));

        if (!cancelled) {
          setNewsData(actualNews);
        }
      } catch (error) {
        if (!cancelled) {
          const errorMessage =
            error.message || "News history load nahi ho paayi.";

          setNewsData([]);
          setNewsError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        if (!cancelled) {
          setNewsLoading(false);
        }
      }

      // Load reporter notifications.
      try {
        const data = await activityRequest;

        const actualActivities = (data.notifications || []).map(
          (item) => ({
            id: item.id,
            title: item.title || item.category || "News Activity",
            message: item.message || item.details || "",
            category: item.category || "Activity",
            date: item.created_at,
            newsId: item.news_id,
            type: item.type || "info",
          })
        );

        if (!cancelled) {
          setActivities(actualActivities);
        }
      } catch (error) {
        if (!cancelled) {
          const errorMessage =
            error.message || "Activity timeline load nahi ho paayi.";

          setActivities([]);
          setActivityError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        if (!cancelled) {
          setActivityLoading(false);
        }
      }
    }

    loadNewsAndActivities();

    return () => {
      cancelled = true;
    };
  }, [reporterId]);

  // =====================================
  // REPORTER DETAILS
  // =====================================
  const reporterName =
    reporter?.full_name || reporter?.name || "Reporter";

  const reporterEmail =
    reporter?.email || "Email not available";

  const reporterMobile =
    reporter?.mobile || reporter?.phone || "Not available";

  const reporterStatus =
    reporter?.account_status || reporter?.status || "Active";

  const reporterCode =
    reporter?.reporterCode ||
    `REP-${String(reporter?.id ?? reporterId ?? "").padStart(3, "0")}`;

  const reporterJoiningDate = formatDate(
    reporter?.joining_date || reporter?.created_at
  );

  const normalizedStatus = String(reporterStatus).toLowerCase();

  // =====================================
  // REAL STATISTICS FROM DATABASE NEWS
  // =====================================
  const statistics = useMemo(() => {
    const counts = {
      total: newsData.length,
      pending: 0,
      underReview: 0,
      approved: 0,
      rejected: 0,
      correction: 0,
      published: 0,
    };

    newsData.forEach((item) => {
      switch (normalizeStatus(item.status)) {
        case "Pending":
          counts.pending += 1;
          counts.underReview += 1;
          break;

        case "Approved":
          counts.approved += 1;
          break;

        case "Rejected":
          counts.rejected += 1;
          break;

        case "Correction Required":
          counts.correction += 1;
          break;

        case "Published":
          counts.published += 1;
          break;

        default:
          break;
      }
    });

    return counts;
  }, [newsData]);

  // =====================================
  // FILTER OPTIONS FROM ACTUAL NEWS
  // =====================================
  const availableFormats = useMemo(() => {
    return [
      ...new Set(
        newsData
          .map((item) => item.format)
          .filter((item) => item && item !== "Not specified")
      ),
    ].sort();
  }, [newsData]);

  // =====================================
  // SEARCH, FILTER AND SORT REAL NEWS
  // =====================================
  const filteredNews = useMemo(() => {
    const term = search.trim().toLowerCase();
    const now = new Date();

    return newsData
      .filter((item) => {
        const searchableText = [
          item.displayId,
          item.id,
          item.slug,
          item.location,
          item.script,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(term);
      })
      .filter(
        (item) =>
          status === "All Status" ||
          normalizeStatus(item.status) === status
      )
      .filter(
        (item) =>
          format === "All Formats" || item.format === format
      )
      .filter((item) => {
        if (date === "All Dates") return true;
        if (!item.submitted) return false;

        const submittedDate = new Date(item.submitted);

        if (Number.isNaN(submittedDate.getTime())) {
          return false;
        }

        const daysOld =
          (now.getTime() - submittedDate.getTime()) /
          (1000 * 60 * 60 * 24);

        if (date === "Last 7 Days") {
          return daysOld >= 0 && daysOld <= 7;
        }

        if (date === "Last 30 Days") {
          return daysOld >= 0 && daysOld <= 30;
        }

        return true;
      })
      .sort((a, b) => {
        const first = new Date(a.submitted || 0).getTime();
        const second = new Date(b.submitted || 0).getTime();

        return sort === "Newest First"
          ? second - first
          : first - second;
      });
  }, [newsData, search, status, format, date, sort]);

  // =====================================
  // RESET FILTERS
  // =====================================
  const resetFilters = () => {
    setSearch("");
    setStatus("All Status");
    setFormat("All Formats");
    setDate("All Dates");
    setSort("Newest First");

    toast.info("Filters have been reset.");
  };

  // =====================================
  // LOADING / ERROR STATES
  // =====================================
  if (profileLoading && !reporter) {
    return (
      <main className="reporterprofile-page">
        <section className="reporterprofile-history-card">
          <h2>Loading Reporter Profile...</h2>
          <p>Please wait while reporter details are loading.</p>
        </section>
      </main>
    );
  }

  if (profileError && !reporter) {
    return (
      <main className="reporterprofile-page">
        <section className="reporterprofile-history-card">
          <h2>Unable to Load Profile</h2>
          <p>{profileError}</p>

          <button
            className="reporterprofile-apply-btn"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="reporterprofile-page">
      {/* REPORTER PROFILE BANNER */}
      <section className="reporterprofile-profile-card">
        <div className="reporterprofile-banner-glow" />

        <div className="reporterprofile-avatar">
          <span>{getReporterInitials(reporterName)}</span>

          <i
            className="reporterprofile-avatar-online"
            title={reporterStatus}
          />
        </div>

        <div className="reporterprofile-reporter-info">
          <span className="reporterprofile-eyebrow">
            REPORTER PROFILE
          </span>

          <h2>{reporterName}</h2>

          <div className="reporterprofile-identity">
            <span className="reporterprofile-id">
              ID: {reporterCode}
            </span>

            <span className="reporterprofile-role">
              ✦ Reporter
            </span>
          </div>

          <p className="reporterprofile-email">
            <span>✉</span> {reporterEmail}
          </p>

          <p className="reporterprofile-email">
            <span>☎</span> {reporterMobile}
          </p>
        </div>

        <div className="reporterprofile-profile-details">
          <div className="reporterprofile-detail-box">
            <span className="reporterprofile-detail-label">
              ACCOUNT STATUS
            </span>

            <strong
              className={
                normalizedStatus === "active"
                  ? "reporterprofile-active"
                  : ""
              }
            >
              <i /> {reporterStatus}
            </strong>
          </div>

          <div className="reporterprofile-detail-box">
            <span className="reporterprofile-detail-label">
              REGISTRATION DATE
            </span>

            <strong className="reporterprofile-registration">
              <span>▦</span> {reporterJoiningDate}
            </strong>
          </div>
        </div>

        <div className="reporterprofile-banner-decoration">
          EM
        </div>
      </section>

      {profileError && (
        <section className="reporterprofile-history-card">
          <p>Profile refresh warning: {profileError}</p>
        </section>
      )}

      {/* REAL NEWS STATISTICS */}
      <section className="reporterprofile-stats">
        <div className="reporterprofile-stat-card stat-total">
          <span className="reporterprofile-stat-icon blue">▤</span>
          <div className="reporterprofile-stat-info">
            <p>Total News</p>
            <h2>{newsLoading ? "—" : statistics.total}</h2>
          </div>
        </div>

        <div className="reporterprofile-stat-card stat-pending">
          <span className="reporterprofile-stat-icon yellow">◷</span>
          <div className="reporterprofile-stat-info">
            <p>Pending Review</p>
            <h2>{newsLoading ? "—" : statistics.pending}</h2>
          </div>
        </div>

        <div className="reporterprofile-stat-card stat-under-review">
          <span className="reporterprofile-stat-icon purple">⌕</span>
          <div className="reporterprofile-stat-info">
            <p>Under Review</p>
            <h2>{newsLoading ? "—" : statistics.underReview}</h2>
          </div>
        </div>

        <div className="reporterprofile-stat-card stat-approved">
          <span className="reporterprofile-stat-icon green">✓</span>
          <div className="reporterprofile-stat-info">
            <p>Approved</p>
            <h2>{newsLoading ? "—" : statistics.approved}</h2>
          </div>
        </div>

        <div className="reporterprofile-stat-card stat-rejected">
          <span className="reporterprofile-stat-icon red">×</span>
          <div className="reporterprofile-stat-info">
            <p>Rejected</p>
            <h2>{newsLoading ? "—" : statistics.rejected}</h2>
          </div>
        </div>

        <div className="reporterprofile-stat-card stat-correction">
          <span className="reporterprofile-stat-icon orange">↻</span>
          <div className="reporterprofile-stat-info">
            <p>Correction Required</p>
            <h2>{newsLoading ? "—" : statistics.correction}</h2>
          </div>
        </div>

        <div className="reporterprofile-stat-card stat-published">
          <span className="reporterprofile-stat-icon sky-blue">⚑</span>
          <div className="reporterprofile-stat-info">
            <p>Published</p>
            <h2>{newsLoading ? "—" : statistics.published}</h2>
          </div>
        </div>
      </section>

      {/* NEWS HISTORY AND ACTIVITY TIMELINE */}
      <section className="reporterprofile-main-grid">
        <div className="reporterprofile-history-card">
          <div className="reporterprofile-section-heading">
            <div>
              <h2>News History</h2>
              <p>
                Track and review the reporter's actual news submissions.
              </p>
            </div>

            <span className="reporterprofile-record-count">
              {newsLoading
                ? "Loading..."
                : `${filteredNews.length} Records`}
            </span>
          </div>

          <input
            className="reporterprofile-search"
            type="search"
            placeholder="Search by News ID, slug or location..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <div className="reporterprofile-filters">
            <label>
              Status
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="All Status">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Published">Published</option>
                <option value="Correction Required">
                  Correction Required
                </option>
                <option value="Rejected">Rejected</option>
              </select>
            </label>

            <label>
              News Format
              <select
                value={format}
                onChange={(event) => setFormat(event.target.value)}
              >
                <option value="All Formats">All Formats</option>

                {availableFormats.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Submission Date
              <select
                value={date}
                onChange={(event) => setDate(event.target.value)}
              >
                <option value="All Dates">All Dates</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
              </select>
            </label>

            <label>
              Sort
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="Newest First">Newest First</option>
                <option value="Oldest First">Oldest First</option>
              </select>
            </label>
          </div>

          <div className="reporterprofile-filter-actions">
            <button
              className="reporterprofile-apply-btn"
              onClick={() => {
                setSearch((previous) => previous.trim());
                toast.success("Filters applied.");
              }}
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

          {newsError && (
            <div role="alert" className="reporterprofile-empty">
              <p>{newsError}</p>
              <button
                className="reporterprofile-apply-btn"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          )}

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
                {newsLoading ? (
                  <tr>
                    <td colSpan="7" className="reporterprofile-empty">
                      Loading actual news from database...
                    </td>
                  </tr>
                ) : !newsError && filteredNews.length > 0 ? (
                  filteredNews.map((item) => (
                    <tr key={item.id}>
                      <td className="reporterprofile-news-id">
                        {item.displayId}
                      </td>

                      <td>{item.slug}</td>

                      <td>
                        <span className="reporterprofile-format">
                          {item.format}
                        </span>
                      </td>

                      <td>{formatDate(item.submitted)}</td>
                      <td>{formatDate(item.updated)}</td>

                      <td>
                        <span
                          className={`reporterprofile-status ${String(
                            item.status
                          )
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
                  ))
                ) : !newsError ? (
                  <tr>
                    <td colSpan="7" className="reporterprofile-empty">
                      No news records found for this reporter.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="reporterprofile-table-footer">
            Showing {newsLoading ? "—" : filteredNews.length} of{" "}
            {newsLoading ? "—" : newsData.length} records
          </div>
        </div>

        {/* ACTUAL NOTIFICATIONS AS ACTIVITY TIMELINE */}
        <aside className="reporterprofile-timeline-card">
          <div className="reporterprofile-section-heading">
            <div>
              <h2>Activity Timeline</h2>
              <p>Recent recorded reporter notifications</p>
            </div>

            <span className="reporterprofile-timeline-badge">
              ● Live Data
            </span>
          </div>

          {activityError && (
            <p className="reporterprofile-empty">
              {activityError}
            </p>
          )}

          <div className="reporterprofile-timeline">
            {activityLoading ? (
              <p>Loading activities...</p>
            ) : activities.length > 0 ? (
              activities.map((activity, index) => (
                <div
                  className="reporterprofile-timeline-item"
                  key={activity.id}
                >
                  <div
                    className={`reporterprofile-timeline-icon icon-${index % 5}`}
                  >
                    {activity.category.toLowerCase().includes("approved")
                      ? "✓"
                      : activity.category.toLowerCase().includes("correction")
                      ? "↻"
                      : activity.category.toLowerCase().includes("rejected")
                      ? "×"
                      : activity.category.toLowerCase().includes("published")
                      ? "➤"
                      : "▤"}
                  </div>

                  <div className="reporterprofile-timeline-content">
                    <h3>{activity.title}</h3>
                    <p>{activity.message || activity.category}</p>
                    <span>{formatDateTime(activity.date)}</span>
                  </div>
                </div>
              ))
            ) : !activityError ? (
              <p>No recorded activities found for this reporter.</p>
            ) : null}
          </div>
        </aside>
      </section>

      {/* ACTUAL NEWS DETAILS MODAL */}
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
            onClick={(event) => event.stopPropagation()}
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

            <p>
              <strong>News ID:</strong> {selectedNews.displayId}
            </p>

            <p>
              <strong>News Slug:</strong> {selectedNews.slug}
            </p>

            <p>
              <strong>Format:</strong> {selectedNews.format}
            </p>

            <p>
              <strong>Location:</strong>{" "}
              {selectedNews.location || "Not available"}
            </p>

            <p>
              <strong>Event Date:</strong>{" "}
              {formatDate(selectedNews.event_date)}
            </p>

            <p>
              <strong>Submitted:</strong>{" "}
              {formatDateTime(selectedNews.submitted)}
            </p>

            <p>
              <strong>Last Updated:</strong>{" "}
              {formatDateTime(selectedNews.updated)}
            </p>

            <p>
              <strong>Status:</strong> {selectedNews.status}
            </p>

            {selectedNews.editor_feedback && (
              <p>
                <strong>Editor's Feedback:</strong>{" "}
                {selectedNews.editor_feedback}
              </p>
            )}

            {selectedNews.script && (
              <div>
                <strong>Script:</strong>
                <p>{selectedNews.script}</p>
              </div>
            )}

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