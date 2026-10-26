 
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import "./Notifications.css";

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_URL = `${API_BASE}/api`;

const formatDate = (dateValue) => {
  if (!dateValue) return "Date unavailable";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getTimeAgo = (dateValue) => {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getEditorUser = () => {
  try {
    const storedUser = sessionStorage.getItem("emAxisUser");
    if (!storedUser) return null;

    const user = JSON.parse(storedUser);
    if (!user?.id) return null;

    return user;
  } catch {
    return null;
  }
};

const readResponse = async (response) => {
  try {
    return await response.json();
  } catch {
    throw new Error("Invalid server response. Please try again.");
  }
};

const Notifications = () => {
  const [editor, setEditor] = useState(getEditorUser);
  const [notifications, setNotifications] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState(null);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    if (!editor?.id) {
      const message = "Editor session not found. Please log in again.";

      setError(message);
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/notifications/editor/${encodeURIComponent(editor.id)}`
      );

      const data = await readResponse(response);

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Unable to load notifications.");
      }

      setNotifications(
        Array.isArray(data.notifications) ? data.notifications : []
      );
    } catch (err) {
      const message =
        `${err.message || "Unable to load notifications."} ` +
        "Check that the backend is running.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [editor?.id]);

  useEffect(() => {
    setEditor(getEditorUser());
  }, []);

  useEffect(() => {
    if (editor?.id) {
      loadNotifications();
    } else {
      setLoading(false);
    }
  }, [editor?.id, loadNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  const readCount = notifications.length - unreadCount;

  const filteredNotifications = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return notifications.filter((item) => {
      const isRead = Boolean(item.read);

      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "Unread" && !isRead) ||
        (activeFilter === "Read" && isRead);

      const matchesSearch = !query ||
        [
          item.title,
          item.message,
          item.category,
          item.details,
          item.news_id ? `news ${item.news_id}` : "",
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      return matchesFilter && matchesSearch;
    });
  }, [notifications, activeFilter, searchText]);

  const loadNews = async () => {
    try {
      const response = await fetch(`${API_URL}/news`);
      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Unable to load related news.");
      }

      const records = Array.isArray(data)
        ? data
        : Array.isArray(data.news)
          ? data.news
          : Array.isArray(data.data)
            ? data.data
            : [];

      setNewsList(records);
      return records;
    } catch (err) {
      toast.error(err.message || "Unable to load related news.");
      return [];
    }
  };

  const markOneAsRead = async (notification) => {
    if (notification.read || !editor?.id) return;

    setMarkingId(notification.id);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/notifications/editor/${encodeURIComponent(
          editor.id
        )}/${encodeURIComponent(notification.id)}/read`,
        { method: "PATCH" }
      );

      const data = await readResponse(response);

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Could not mark notification as read."
        );
      }

      setNotifications((current) =>
        current.map((item) =>
          String(item.id) === String(notification.id)
            ? { ...item, read: true }
            : item
        )
      );

      setSelectedNotification((current) =>
        current && String(current.id) === String(notification.id)
          ? { ...current, read: true }
          : current
      );

      toast.success("Notification marked as read.");
    } catch (err) {
      const message =
        err.message || "Could not mark notification as read.";

      setError(message);
      toast.error(message);
    } finally {
      setMarkingId(null);
    }
  };

  const markAllAsRead = async () => {
    if (!editor?.id || unreadCount === 0) return;

    setMarkingAll(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/notifications/editor/${encodeURIComponent(
          editor.id
        )}/read-all`,
        { method: "PATCH" }
      );

      const data = await readResponse(response);

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Could not mark all notifications as read."
        );
      }

      setNotifications((current) =>
        current.map((item) => ({ ...item, read: true }))
      );

      setSelectedNotification((current) =>
        current ? { ...current, read: true } : current
      );

      toast.success("All notifications marked as read.");
    } catch (err) {
      const message =
        err.message || "Could not mark all notifications as read.";

      setError(message);
      toast.error(message);
    } finally {
      setMarkingAll(false);
    }
  };

  const openDetails = async (notification) => {
    setSelectedNotification(notification);

    if (!notification.read) {
      await markOneAsRead(notification);
    }

    if (newsList.length === 0 && notification.news_id) {
      await loadNews();
    }
  };

  const selectedNews = useMemo(() => {
    if (!selectedNotification?.news_id) return null;

    return (
      newsList.find(
        (news) =>
          String(news.id) === String(selectedNotification.news_id)
      ) || null
    );
  }, [selectedNotification, newsList]);

  const getNotificationIcon = (item) => {
    const text = `${item.category || ""} ${item.title || ""}`.toLowerCase();

    if (text.includes("submit") || text.includes("news")) return "📰";
    if (text.includes("approved") || text.includes("published")) return "✓";
    if (text.includes("correction") || text.includes("reject")) return "✎";
    if (text.includes("reporter")) return "👤";

    return "🔔";
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <p className="notifications-eyebrow">EDITOR WORKSPACE</p>
          <h1>Notifications</h1>
          <p className="notifications-subtitle">
            Stay updated with news submissions and editorial activity.
          </p>
        </div>

        <button
          type="button"
          className="mark-all-btn"
          onClick={markAllAsRead}
          disabled={markingAll || unreadCount === 0 || loading}
        >
          {markingAll ? "Marking..." : "✓ Mark All as Read"}
        </button>
      </div>

      <div className="notification-stats">
        <div className="notification-stat-card">
          <div className="stat-icon stat-icon-blue">🔔</div>
          <div>
            <p>Total Notifications</p>
            <h2>{notifications.length}</h2>
          </div>
        </div>

        <div className="notification-stat-card">
          <div className="stat-icon stat-icon-orange">●</div>
          <div>
            <p>Unread Notifications</p>
            <h2>{unreadCount}</h2>
          </div>
        </div>

        <div className="notification-stat-card">
          <div className="stat-icon stat-icon-green">✓</div>
          <div>
            <p>Read Notifications</p>
            <h2>{readCount}</h2>
          </div>
        </div>
      </div>

      <div className="notifications-toolbar">
        <div className="notification-tabs">
          {["All", "Unread", "Read"].map((filter) => (
            <button
              type="button"
              key={filter}
              className={`notification-tab ${
                activeFilter === filter ? "active" : ""
              }`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
              {filter === "Unread" && (
                <span className="tab-count">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        <div className="notification-search">
          <span aria-hidden="true">⌕</span>

          <input
            type="search"
            placeholder="Search notifications..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            aria-label="Search notifications"
          />

          {searchText && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchText("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="notification-error" role="alert">
          <span>{error}</span>

          <button type="button" onClick={loadNotifications}>
            Retry
          </button>
        </div>
      )}

      <div className="notifications-list">
        <div className="notifications-list-heading">
          <h2>Recent Activity</h2>
          <span>{filteredNotifications.length} notifications</span>
        </div>

        {loading ? (
          <div className="notifications-state">
            <div className="notification-spinner" />
            <p>Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="notifications-state">
            <div className="empty-notification-icon">🔔</div>
            <h3>No notifications found</h3>
            <p>
              {searchText
                ? "Try another search term."
                : activeFilter === "Unread"
                  ? "You're all caught up. There are no unread notifications."
                  : "New editorial notifications will appear here."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <article
              className={`notif-item ${
                item.read ? "is-read" : "is-unread"
              }`}
              key={item.id}
            >
              <div className="notif-icon">
                {getNotificationIcon(item)}
              </div>

              <div className="notif-content">
                <div className="notif-title-row">
                  <h3>{item.title || "Notification"}</h3>
                  {!item.read && (
                    <span className="unread-dot" title="Unread" />
                  )}
                </div>

                <p className="notif-message">
                  {item.message || "You have a new notification."}
                </p>

                <div className="notif-meta">
                  <span className="notif-category">
                    {item.category || "News Update"}
                  </span>

                  {item.news_id && (
                    <span className="notif-news-id">
                      News ID: {item.news_id}
                    </span>
                  )}

                  <span className="notif-time">
                    {getTimeAgo(item.created_at)}
                  </span>
                </div>
              </div>

              <div className="notif-actions">
                {!item.read && (
                  <button
                    type="button"
                    className="mark-single-btn"
                    onClick={() => markOneAsRead(item)}
                    disabled={markingId === item.id}
                  >
                    {markingId === item.id ? "Saving..." : "Mark as Read"}
                  </button>
                )}

                <button
                  type="button"
                  className="view-btn"
                  onClick={() => openDetails(item)}
                >
                  View Details
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {selectedNotification && (
        <div
          className="notification-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedNotification(null);
            }
          }}
        >
          <section
            className="notification-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-modal-title"
          >
            <div className="notification-modal-header">
              <div>
                <p className="notifications-eyebrow">
                  NOTIFICATION DETAILS
                </p>

                <h2 id="notification-modal-title">
                  {selectedNotification.title || "Notification"}
                </h2>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedNotification(null)}
                aria-label="Close details"
              >
                ×
              </button>
            </div>

            <div className="notification-detail-body">
              <div className="detail-field">
                <span>Message</span>
                <p>
                  {selectedNotification.message || "No message available."}
                </p>
              </div>

              {selectedNotification.details && (
                <div className="detail-field">
                  <span>Additional Details</span>
                  <p className="detail-preserve-whitespace">
                    {selectedNotification.details}
                  </p>
                </div>
              )}

              <div className="notification-detail-grid">
                <div className="detail-field">
                  <span>Category</span>
                  <p>{selectedNotification.category || "News Update"}</p>
                </div>

                <div className="detail-field">
                  <span>Read Status</span>
                  <p>
                    <span
                      className={`detail-status ${
                        selectedNotification.read ? "read" : "unread"
                      }`}
                    >
                      {selectedNotification.read ? "Read" : "Unread"}
                    </span>
                  </p>
                </div>

                <div className="detail-field">
                  <span>Received On</span>
                  <p>{formatDate(selectedNotification.created_at)}</p>
                </div>

                <div className="detail-field">
                  <span>Related News ID</span>
                  <p>{selectedNotification.news_id ?? "Not linked"}</p>
                </div>
              </div>

              {selectedNotification.news_id && (
                <div className="related-news-section">
                  <h3>Related News</h3>

                  {selectedNews ? (
                    <div className="related-news-card">
                      <h4>
                        {selectedNews.news_slug ||
                          selectedNews.title ||
                          `News #${selectedNews.id}`}
                      </h4>

                      <p>
                        <strong>Reporter:</strong>{" "}
                        {selectedNews.reporter_name || "Not available"}
                      </p>

                      <p>
                        <strong>Format:</strong>{" "}
                        {selectedNews.format || "Not available"}
                      </p>

                      <p>
                        <strong>Location:</strong>{" "}
                        {selectedNews.location || "Not available"}
                      </p>

                      <p>
                        <strong>Status:</strong>{" "}
                        {selectedNews.status || "Not available"}
                      </p>

                      {selectedNews.editor_feedback && (
                        <p>
                          <strong>Editor Feedback:</strong>{" "}
                          {selectedNews.editor_feedback}
                        </p>
                      )}

                      {selectedNews.script && (
                        <div className="related-news-script">
                          <strong>Script</strong>
                          <p>{selectedNews.script}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="related-news-unavailable">
                      Related news details are unavailable. The news record may
                      have been deleted or the news endpoint could not be reached.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="notification-modal-footer">
              {!selectedNotification.read && (
                <button
                  type="button"
                  className="mark-single-btn"
                  onClick={() => markOneAsRead(selectedNotification)}
                  disabled={markingId === selectedNotification.id}
                >
                  {markingId === selectedNotification.id
                    ? "Saving..."
                    : "Mark as Read"}
                </button>
              )}

              <button
                type="button"
                className="view-btn"
                onClick={() => setSelectedNotification(null)}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Notifications;
