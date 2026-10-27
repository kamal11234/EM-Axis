
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./dashboard.css";
import repoimg from "../../assets/repoimg.png";

const API_URL = "http://localhost:5000";

function getStoredUser() {
  try {
    return JSON.parse(sessionStorage.getItem("emAxisUser") || "null");
  } catch {
    return null;
  }
}

function normalizeStatus(value) {
  const status = String(value || "").trim().toLowerCase();

  if (status === "correction required" || status === "correction_required") {
    return "Correction Required";
  }

  if (status === "in review") return "Pending";

  return status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "Pending";
}

function formatDate(value) {
  if (!value) return "Date not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date not available";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function timeAgo(value) {
  if (!value) return "Recently";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  const seconds = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 1000)
  );

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;

  return formatDate(value);
}

function Dashboard() {
  const navigate = useNavigate();

  const [showFilters, setShowFilters] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [newsType, setNewsType] = useState("All");
  const [status, setStatus] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const storedUser = useMemo(() => getStoredUser(), []);
  const currentUser = storedUser?.user || storedUser;
  const reporterId = currentUser?.id;

  const userName =
    currentUser?.fullName ||
    currentUser?.full_name ||
    currentUser?.name ||
    currentUser?.username ||
    "Reporter";

  const [news, setNews] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [newsError, setNewsError] = useState("");
  const [notificationError, setNotificationError] = useState("");

  // FETCH REAL NEWS AND DRAFTS
  useEffect(() => {
    let cancelled = false;

    async function loadDashboardNews() {
      if (!reporterId) {
        setNews([]);
        setDrafts([]);
        setNewsError("Please log in again to load your news.");
        setLoadingNews(false);
        toast.error("Please log in again to load your news.");
        return;
      }

      setLoadingNews(true);
      setNewsError("");

      try {
        const [newsResponse, draftsResponse] = await Promise.all([
          fetch(`${API_URL}/api/news/reporter/${reporterId}`),
          fetch(`${API_URL}/api/news/drafts/${reporterId}`),
        ]);

        const newsData = await newsResponse.json();
        const draftsData = await draftsResponse.json();

        if (!newsResponse.ok || newsData.success === false) {
          throw new Error(newsData.message || "Unable to load news.");
        }

        if (!draftsResponse.ok || draftsData.success === false) {
          throw new Error(draftsData.message || "Unable to load drafts.");
        }

        if (cancelled) return;

        const submittedNews = (newsData.news || []).map((item) => ({
          id: item.id,
          title: item.title || item.news_slug || "Untitled News",
          type: item.format || item.news_format || "Text",
          area: item.location || "Location not specified",
          date: item.created_at || item.event_date || "",
          status: normalizeStatus(item.status),
          isDraft: false,
        }));

        const reporterDrafts = (draftsData.drafts || []).map((item) => ({
          id: item.id,
          title: item.news_slug || "Untitled Draft",
          type: item.news_format || "Text",
          area: item.location || "Location not specified",
          date: item.updated_at || item.created_at || "",
          status: "Draft",
          isDraft: true,
        }));

        setNews(submittedNews);
        setDrafts(reporterDrafts);
      } catch (error) {
        if (!cancelled) {
          const message =
            error.message ||
            "Could not connect to the backend. Please check the server.";

          setNewsError(message);
          setNews([]);
          setDrafts([]);
          toast.error(message);
        }
      } finally {
        if (!cancelled) setLoadingNews(false);
      }
    }

    loadDashboardNews();

    return () => {
      cancelled = true;
    };
  }, [reporterId]);

  // FETCH REAL NOTIFICATIONS
  useEffect(() => {
    let cancelled = false;

    async function loadNotifications() {
      if (!reporterId) {
        setNotifications([]);
        setNotificationError("Log in again to view notifications.");
        setLoadingNotifications(false);
        return;
      }

      setLoadingNotifications(true);
      setNotificationError("");

      try {
        const response = await fetch(
          `${API_URL}/api/notifications/reporter/${reporterId}`
        );

        const data = await response.json();

        if (!response.ok || data.success === false) {
          throw new Error(data.message || "Unable to load notifications.");
        }

        if (!cancelled) {
          setNotifications(data.notifications || []);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error.message ||
            "Notifications could not be loaded. Please check the backend.";

          setNotifications([]);
          setNotificationError(message);
          toast.error(message);
        }
      } finally {
        if (!cancelled) setLoadingNotifications(false);
      }
    }

    loadNotifications();

    return () => {
      cancelled = true;
    };
  }, [reporterId]);

  // COMBINE NEWS AND DRAFTS
  const allNews = useMemo(() => [...drafts, ...news], [drafts, news]);

  // SEARCH AND FILTERS
  const filteredNews = useMemo(() => {
    const search = searchText.toLowerCase().trim();

    return allNews.filter((item) => {
      const itemDate = item.date ? String(item.date).slice(0, 10) : "";

      const matchesSearch =
        item.title.toLowerCase().includes(search) ||
        item.type.toLowerCase().includes(search) ||
        item.area.toLowerCase().includes(search) ||
        item.status.toLowerCase().includes(search) ||
        String(item.id).includes(search);

      const matchesType =
        newsType === "All" ||
        item.type.toLowerCase() === newsType.toLowerCase();

      const matchesStatus =
        status === "All" ||
        item.status.toLowerCase() === status.toLowerCase();

      const matchesFromDate = !fromDate || itemDate >= fromDate;
      const matchesToDate = !toDate || itemDate <= toDate;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesFromDate &&
        matchesToDate
      );
    });
  }, [allNews, searchText, newsType, status, fromDate, toDate]);

  const clearFilters = () => {
    setSearchText("");
    setNewsType("All");
    setStatus("All");
    setFromDate("");
    setToDate("");
    toast.info("All filters have been cleared.");
  };

  // LIVE STATUS COUNTS
  const statusCounts = useMemo(() => {
    const count = (statusName) =>
      allNews.filter(
        (item) => item.status.toLowerCase() === statusName.toLowerCase()
      ).length;

    return {
      Draft: count("Draft"),
      Pending: count("Pending"),
      Approved: count("Approved"),
      Published: count("Published"),
      Rejected: count("Rejected"),
      "Correction Required": count("Correction Required"),
    };
  }, [allNews]);

  const statusCards = [
    { name: "Draft", icon: "📝", className: "draft" },
    { name: "Pending", icon: "⏳", className: "pending" },
    { name: "Approved", icon: "✓", className: "approved" },
    { name: "Published", icon: "◉", className: "published" },
    { name: "Rejected", icon: "!", className: "rejected" },
  ];

  // NOTIFICATION DISPLAY HELPERS
  const getNotificationTitle = (item) =>
    item.title || item.notification_title || item.type || "Notification";

  const getNotificationMessage = (item) =>
    item.message ||
    item.description ||
    item.notification_message ||
    "You have a new update.";

  const getNotificationDate = (item) =>
    item.created_at || item.createdAt || item.timestamp;

  return (
    <div className="dashboard-content">
      {/* WELCOME SECTION */}
      <div className="welcome-section">
        <div className="welcome-text">
          <h1>Welcome to EM-AXIS</h1>
          <h3>{userName}</h3>
          <p>
            Create and manage your news
            <br />
            stories—all in one place
          </p>
        </div>

        <div className="welcome-image">
          <img src={repoimg} alt="Reporter News" />
        </div>
      </div>

      {/* MAIN DASHBOARD */}
      <div className="dashboard-main-layout">
        {/* LEFT COLUMN */}
        <div className="dashboard-left">
          <div className="action-section">
            <button
              type="button"
              className="create-news-btn"
              onClick={() => navigate("/reporter/create-news")}
            >
              + Create News
            </button>

            <div className="search-box">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search by title, category, or ID"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
            </div>

            <button
              type="button"
              className={`filter-btn ${showFilters ? "active-filter" : ""}`}
              onClick={() => setShowFilters((current) => !current)}
            >
              <span>⚱</span>
              Filter
              <span className="filter-arrow">
                {showFilters ? "⌃" : "⌄"}
              </span>
            </button>
          </div>

          {/* FILTER SECTION */}
          {showFilters && (
            <div className="filter-section">
              <div className="filter-field">
                <label>News Type</label>
                <select
                  value={newsType}
                  onChange={(event) => setNewsType(event.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Text">Text</option>
                  <option value="Video">Video</option>
                  <option value="AV">AV</option>
                  <option value="AVB">AVB</option>
                  <option value="PKG">PKG</option>
                  <option value="TikTak">TikTak</option>
                  <option value="One-to-one">One-to-one</option>
                  <option value="WKT">WKT</option>
                </select>
              </div>

              <div className="filter-field">
                <label>Status</label>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Draft">Draft</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Published">Published</option>
                  <option value="Correction Required">
                    Correction Required
                  </option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="filter-field date-field">
                <label>Date range</label>
                <div className="date-range-box">
                  <div className="date-part">
                    <span>▣</span>
                    <input
                      type="date"
                      aria-label="From date"
                      value={fromDate}
                      onChange={(event) => setFromDate(event.target.value)}
                    />
                  </div>

                  <span className="date-separator">-</span>

                  <div className="date-part">
                    <input
                      type="date"
                      aria-label="To date"
                      value={toDate}
                      onChange={(event) => setToDate(event.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="clear-filter-btn"
                onClick={clearFilters}
              >
                Clear
              </button>
            </div>
          )}

          {/* REAL NEWS RESULTS */}
          <div className="news-results-section">
            <div className="news-results-header">
              <div>
                <h2>News Results</h2>
                <p>
                  {loadingNews
                    ? "Loading news..."
                    : `${filteredNews.length} news found`}
                </p>
              </div>
            </div>

            <div className="news-list">
              {loadingNews ? (
                <div className="no-news">
                  <h3>Loading your news...</h3>
                  <p>Fetching the latest data from the database.</p>
                </div>
              ) : newsError ? (
                <div className="no-news">
                  <h3>Unable to load news</h3>
                  <p>{newsError}</p>
                  <button
                    type="button"
                    className="view-news-btn"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </button>
                </div>
              ) : filteredNews.length > 0 ? (
                filteredNews.map((item) => (
                  <div
                    className="news-card"
                    key={`${item.isDraft ? "draft" : "news"}-${item.id}`}
                  >
                    <div className="news-card-left">
                      <div className="news-title-row">
                        <h3>{item.title}</h3>
                        <span
                          className={`status-badge ${item.status
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <div className="news-details">
                        <span>{item.type}</span>
                        <span>•</span>
                        <span>{item.area}</span>
                        <span>•</span>
                        <span>{formatDate(item.date)}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="view-news-btn"
                      onClick={() => {
                        toast.info(`Opening your news list: ${item.title}`);
                        navigate("/reporter/my-news", {
                          state: { newsId: item.id, isDraft: item.isDraft },
                        });
                      }}
                    >
                      View
                    </button>
                  </div>
                ))
              ) : (
                <div className="no-news">
                  <div className="no-news-icon">🔍</div>
                  <h3>No news found</h3>
                  <p>
                    {allNews.length === 0
                      ? "You have not submitted any news or saved any drafts yet."
                      : "Try changing your search or filter options."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="dashboard-right">
          {/* QUICK STATUS */}
          <div className="quick-status-section">
            <div className="quick-status-header">
              <h2>Quick Status</h2>
              <span>{loadingNews ? "Loading..." : "Live Overview"}</span>
            </div>

            {statusCards.map((card) => (
              <div className="status-card" key={card.name}>
                <div className={`status-icon ${card.className}`}>
                  {card.icon}
                </div>
                <div>
                  <h3>{card.name}</h3>
                  <p>
                    {loadingNews ? "..." : `${statusCounts[card.name]} News`}
                  </p>
                </div>
              </div>
            ))}

            {!loadingNews && statusCounts["Correction Required"] > 0 && (
              <div className="status-card">
                <div className="status-icon rejected">↻</div>
                <div>
                  <h3>Correction Required</h3>
                  <p>{statusCounts["Correction Required"]} News</p>
                </div>
              </div>
            )}
          </div>

          {/* RECENT NOTIFICATIONS */}
          <div className="notification-section">
            <div className="notification-header">
              <div>
                <h2>Recent Notifications</h2>
                <p>Latest updates</p>
              </div>

              <button
                type="button"
                className="view-all-btn"
                onClick={() => navigate("/reporter/notifications")}
              >
                View All
              </button>
            </div>

            <div className="notification-list">
              {loadingNotifications ? (
                <div className="no-news">
                  <p>Loading notifications...</p>
                </div>
              ) : notificationError ? (
                <div className="no-news">
                  <p>{notificationError}</p>
                </div>
              ) : notifications.length > 0 ? (
                notifications.slice(0, 4).map((item, index) => (
                  <div
                    className={`notification-card ${
                      !item.is_read && !item.read_at ? "unread" : ""
                    }`}
                    key={item.id || item.notification_id || index}
                  >
                    <div className="notification-icon">✓</div>
                    <div className="notification-content">
                      <h3>{getNotificationTitle(item)}</h3>
                      <p>{getNotificationMessage(item)}</p>
                      <span>{timeAgo(getNotificationDate(item))}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-news">
                  <div className="no-news-icon">🔔</div>
                  <h3>No notifications yet</h3>
                  <p>New updates will appear here when available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;