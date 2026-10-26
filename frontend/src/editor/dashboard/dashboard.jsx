
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./dashboard.css";
import editorimg from "../../assets/editorimg.png";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

function getLoggedInUser() {
  try {
    return JSON.parse(sessionStorage.getItem("emAxisUser") || "{}");
  } catch {
    return {};
  }
}

function getNewsArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.news)) return data.news;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.news)) return data.data.news;
  return [];
}

function normalizeStatus(status) {
  return String(status || "Pending")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function getStatusInfo(status) {
  const normalized = normalizeStatus(status);

  const statusMap = {
    pending: { label: "Pending Review", className: "pending" },
    "under review": {
      label: "Under Review",
      className: "under-review",
    },
    approved: { label: "Approved", className: "approved" },
    rejected: { label: "Rejected", className: "rejected" },
    "correction required": {
      label: "Correction Required",
      className: "correction",
    },
    published: { label: "Published", className: "published" },
  };

  return (
    statusMap[normalized] || {
      label: status || "Unknown",
      className: "pending",
    }
  );
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "Date not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date not available";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getNewsTitle(item) {
  return item.title || item.news_slug || "Untitled news";
}

function getActivityDetails(item) {
  const status = normalizeStatus(item.status);
  const title = getNewsTitle(item);
  const reporter = item.reporter_name || "Unknown reporter";

  if (status === "approved") {
    return {
      icon: "✓",
      color: "green",
      title: "News approved",
      description: `${title} — submitted by ${reporter}`,
    };
  }

  if (status === "published") {
    return {
      icon: "↑",
      color: "purple",
      title: "News published",
      description: `${title} — submitted by ${reporter}`,
    };
  }

  if (status === "rejected") {
    return {
      icon: "×",
      color: "orange",
      title: "News rejected",
      description: `${title} — submitted by ${reporter}`,
    };
  }

  if (status === "correction required") {
    return {
      icon: "↻",
      color: "orange",
      title: "Correction required",
      description: `${title} — submitted by ${reporter}`,
    };
  }

  if (status === "under review") {
    return {
      icon: "⌕",
      color: "blue",
      title: "Under review",
      description: `${title} — submitted by ${reporter}`,
    };
  }

  return {
    icon: "◷",
    color: "blue",
    title: "Pending review",
    description: `${title} — submitted by ${reporter}`,
  };
}

function getUserName(user) {
  const fullName =
    user?.full_name ||
    user?.fullName ||
    user?.name ||
    "";

  return String(fullName).trim();
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [loggedInUser] = useState(getLoggedInUser);

  const [editorName, setEditorName] = useState(() => {
    return getUserName(getLoggedInUser()) || "Editor";
  });

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // LOAD LATEST EDITOR PROFILE
  useEffect(() => {
    let cancelled = false;

    async function loadEditorProfile() {
      if (!loggedInUser.id || loggedInUser.role !== "editor") {
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/editor/profile/${loggedInUser.id}`
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        const profile =
          data?.user ||
          data?.profile ||
          data?.data?.user ||
          data?.data?.profile ||
          data?.data ||
          data;

        const latestName = getUserName(profile);

        if (!cancelled && latestName) {
          setEditorName(latestName);

          try {
            const currentUser = getLoggedInUser();

            if (
              String(currentUser.id) === String(loggedInUser.id)
            ) {
              sessionStorage.setItem(
                "emAxisUser",
                JSON.stringify({
                  ...currentUser,
                  full_name: latestName,
                })
              );
            }
          } catch (storageError) {
            console.error(
              "Unable to update editor session:",
              storageError
            );
          }
        }
      } catch (err) {
        console.error("Unable to load editor profile:", err);
      }
    }

    loadEditorProfile();

    return () => {
      cancelled = true;
    };
  }, [loggedInUser.id, loggedInUser.role]);

  // LOAD NEWS FROM DATABASE
  useEffect(() => {
    let cancelled = false;

    async function loadNews() {
      if (!loggedInUser.id || loggedInUser.role !== "editor") {
        const message =
          "Please log in with an Editor account to view the dashboard.";

        setError(message);
        setLoading(false);
        toast.error(message);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/news`);

        let data;

        try {
          data = await response.json();
        } catch {
          throw new Error(
            "Invalid response from server. Please check the backend."
          );
        }

        if (!response.ok) {
          throw new Error(data.message || "Failed to load news.");
        }

        if (!cancelled) {
          setNews(getNewsArray(data));
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err.message === "Failed to fetch"
              ? "Backend connection failed. Check whether the server is running."
              : err.message ||
                "Unable to load news. Please check the backend.";

          setError(message);
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadNews();

    return () => {
      cancelled = true;
    };
  }, [loggedInUser.id, loggedInUser.role]);

  // CALCULATE STATISTICS
  const stats = useMemo(() => {
    const counts = {
      total: news.length,
      pending: 0,
      underReview: 0,
      approved: 0,
      rejected: 0,
      correction: 0,
      published: 0,
    };

    news.forEach((item) => {
      const status = normalizeStatus(item.status);

      if (status === "pending") counts.pending += 1;
      else if (status === "under review") counts.underReview += 1;
      else if (status === "approved") counts.approved += 1;
      else if (status === "rejected") counts.rejected += 1;
      else if (status === "correction required") counts.correction += 1;
      else if (status === "published") counts.published += 1;
    });

    return [
      {
        title: "Total News",
        count: counts.total,
        icon: "▤",
        color: "blue",
      },
      {
        title: "Pending Review",
        count: counts.pending,
        icon: "◷",
        color: "yellow",
      },
      {
        title: "Under Review",
        count: counts.underReview,
        icon: "⌕",
        color: "purple",
      },
      {
        title: "Approved",
        count: counts.approved,
        icon: "✓",
        color: "green",
      },
      {
        title: "Rejected",
        count: counts.rejected,
        icon: "✕",
        color: "red",
      },
      {
        title: "Correction Required",
        count: counts.correction,
        icon: "↻",
        color: "orange",
      },
      {
        title: "Published",
        count: counts.published,
        icon: "↑",
        color: "cyan",
      },
    ];
  }, [news]);

  // LATEST NEWS RECORDS
  const recentNews = useMemo(() => {
    return [...news]
      .sort((a, b) => {
        const dateA = new Date(
          a.created_at || a.updated_at || 0
        ).getTime();

        const dateB = new Date(
          b.created_at || b.updated_at || 0
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [news]);

  // LATEST NEWS STATUS UPDATES
  const activities = useMemo(() => {
    return [...news]
      .sort((a, b) => {
        const dateA = new Date(
          a.updated_at || a.created_at || 0
        ).getTime();

        const dateB = new Date(
          b.updated_at || b.created_at || 0
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 5)
      .map((item) => ({
        id: item.id,
        ...getActivityDetails(item),
        time: formatDateTime(item.updated_at || item.created_at),
      }));
  }, [news]);

  // OPEN ALL NEWS
  const openAllNews = () => {
    navigate("/editor/all-news");
  };

  // RETRY LOADING NEWS
  const retryLoading = () => {
    window.location.reload();
  };

  return (
    <main className="editor-dashboard">
      {/* WELCOME BANNER */}
      <section className="editor-welcome premium-welcome">
        <div
          className="welcome-glow welcome-glow-one"
          aria-hidden="true"
        />

        <div
          className="welcome-glow welcome-glow-two"
          aria-hidden="true"
        />

        <div className="welcome-text premium-welcome-text">
          <h2>
            Welcome Back,{" "}
            <span className="welcome-title-highlight">
              {editorName}!
            </span>
          </h2>

          <p>
            Your newsroom at a glance. Review stories, manage submissions,
            and keep the news moving.
          </p>

          <div className="welcome-bottom-line">
            <span className="welcome-bottom-mark" />
            <span>YOUR NEWSROOM. YOUR CONTROL.</span>
          </div>
        </div>

        <div className="welcome-image premium-welcome-image">
          <img
            src={editorimg}
            alt="EM-AXIS editor working in the newsroom"
          />

          <div className="welcome-image-shade" />

          <div className="welcome-image-label">
            <span className="welcome-label-dot" />
            EDITORIAL DESK
          </div>
        </div>

        <div
          className="welcome-bottom-accent"
          aria-hidden="true"
        />
      </section>

      {/* DASHBOARD DATE */}
      <div className="editor-dashboard-date">
        <span>Today's Overview</span>
        <span>{today}</span>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="ep-message ep-error" role="alert">
          <span>{error}</span>

          <button type="button" onClick={retryLoading}>
            Retry
          </button>
        </div>
      )}

      {/* STATISTICS */}
      <section
        className="editor-stats"
        aria-label="News statistics"
      >
        {stats.map((stat) => (
          <article
            className={`editor-stat-card ${stat.color}`}
            key={stat.title}
          >
            <div className="stat-icon" aria-hidden="true">
              {stat.icon}
            </div>

            <div className="stat-info">
              <p>{stat.title}</p>
              <h3>{loading ? "..." : stat.count}</h3>
            </div>

            <span className="stat-arrow" aria-hidden="true">
              ›
            </span>
          </article>
        ))}
      </section>

      {/* RECENT NEWS AND STATUS UPDATES */}
      <section className="editor-dashboard-bottom">
        {/* RECENT NEWS */}
        <article className="recent-news-panel">
          <div className="panel-heading">
            <div className="panel-title">
              <span className="heading-icon" aria-hidden="true">
                ▤
              </span>

              <div>
                <h3>Recent News Submissions</h3>
                <p className="panel-subtitle">
                  Latest news submitted by reporters
                </p>
              </div>
            </div>

            <button
              type="button"
              className="view-all-button"
              onClick={openAllNews}
            >
              View All News <span>→</span>
            </button>
          </div>

          <div className="news-table-wrapper">
            <table className="editor-news-table">
              <thead>
                <tr>
                  <th>News ID</th>
                  <th>News Slug</th>
                  <th>Reporter</th>
                  <th>Format</th>
                  <th>Submitted On</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7}>Loading news from database...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7}>
                      News could not be loaded. Check your backend connection.
                    </td>
                  </tr>
                ) : recentNews.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      No news records found in the database.
                    </td>
                  </tr>
                ) : (
                  recentNews.map((item, index) => {
                    const statusInfo = getStatusInfo(item.status);

                    return (
                      <tr key={item.id ?? `news-${index}`}>
                        <td>{item.id ?? "—"}</td>

                        <td className="news-slug">
                          {getNewsTitle(item)}
                        </td>

                        <td>{item.reporter_name || "Not available"}</td>

                        <td>
                          <span className="news-format-badge">
                            {item.format || "Not specified"}
                          </span>
                        </td>

                        <td className="news-date">
                          {formatDate(item.created_at)}
                        </td>

                        <td>
                          <span
                            className={`news-status ${statusInfo.className}`}
                          >
                            {statusInfo.label}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="news-view-button"
                            onClick={openAllNews}
                            aria-label={`View ${getNewsTitle(item)}`}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="news-panel-footer">
            <span>
              {loading
                ? "Loading news..."
                : `Showing ${recentNews.length} of ${news.length} news records`}
            </span>

            <button
              type="button"
              onClick={openAllNews}
              className="text-link-button"
            >
              Open all news →
            </button>
          </div>
        </article>

        {/* RECENT NEWS STATUS UPDATES */}
        <article className="recent-activity-panel">
          <div className="panel-heading activity-heading">
            <span className="heading-icon" aria-hidden="true">
              ◷
            </span>

            <div>
              <h3>Recent News Updates</h3>
              <p className="panel-subtitle">
                Latest statuses from database records
              </p>
            </div>
          </div>

          <div className="activity-list">
            {loading ? (
              <p>Loading recent updates...</p>
            ) : error ? (
              <p>Updates could not be loaded.</p>
            ) : activities.length === 0 ? (
              <p>No news updates available yet.</p>
            ) : (
              activities.map((activity, index) => (
                <div
                  className="activity-item"
                  key={activity.id ?? `activity-${index}`}
                >
                  <span
                    className={`activity-icon ${activity.color}`}
                    aria-hidden="true"
                  >
                    {activity.icon}
                  </span>

                  <div className="activity-content">
                    <h4>{activity.title}</h4>

                    <p>{activity.description}</p>

                    <span className="activity-time">
                      ◷ &nbsp;{activity.time}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="activity-footer">
            <span className="activity-online-dot" />
            Database news status overview
          </div>
        </article>
      </section>
    </main>
  );
}
