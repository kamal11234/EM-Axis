
import { useEffect, useMemo, useState } from "react";
import "./Notifications.css";

const API_URL = "http://localhost:5000";

function getReporterId() {
  try {
    const user = JSON.parse(sessionStorage.getItem("emAxisUser") || "{}");
    return user.id || user.userId || user.user_id || null;
  } catch {
    return null;
  }
}

function formatDate(dateValue) {
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
}

function normalizeNotification(item) {
  return {
    ...item,
    id: item.id,
    newsId: item.news_id ?? item.newsId ?? null,
    read: item.read === true || item.is_read === true,
    time: formatDate(item.created_at || item.time),
    type: item.type || "info",
    category: item.category || "System",
    details: item.details || item.message || "",
  };
}

function Notifications() {
  const reporterId = getReporterId();

  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // FETCH NOTIFICATIONS FROM BACKEND
  const fetchNotifications = async () => {
    if (!reporterId) {
      setNotice("Reporter login details not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/notifications/reporter/${reporterId}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load notifications.");
      }

      setNotifications(
        (data.notifications || []).map(normalizeNotification)
      );
    } catch (error) {
      setNotice(error.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Load notifications when this page mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalCount = notifications.length;

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const readCount = notifications.filter(
    (notification) => notification.read
  ).length;

  const filteredNotifications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return notifications.filter((notification) => {
      const matchesSearch = [
        notification.title || "",
        notification.message || "",
        notification.category || "",
        String(notification.newsId || ""),
      ].some((value) => value.toLowerCase().includes(query));

      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "Unread" && !notification.read) ||
        (activeFilter === "Read" && notification.read);

      return matchesSearch && matchesFilter;
    });
  }, [notifications, activeFilter, search]);

  // MARK ONE NOTIFICATION AS READ
  const markAsRead = async (notification) => {
    if (notification.read) return true;

    try {
      const response = await fetch(
        `${API_URL}/api/notifications/${notification.id}/read`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reporterId }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not mark as read.");
      }

      setNotifications((previous) =>
        previous.map((item) =>
          item.id === notification.id ? { ...item, read: true } : item
        )
      );

      return true;
    } catch (error) {
      setNotice(error.message || "Failed to update notification.");
      return false;
    }
  };

  const openDetails = async (notification) => {
    setNotice("");

    const success = await markAsRead(notification);

    if (success) {
      setSelectedNotification({ ...notification, read: true });
    }
  };

  const closeDetails = () => {
    setSelectedNotification(null);
  };

  // MARK ALL AS READ
  const markAllAsRead = async () => {
    if (!reporterId || unreadCount === 0 || actionLoading) return;

    try {
      setActionLoading(true);
      setNotice("");

      const response = await fetch(
        `${API_URL}/api/notifications/reporter/${reporterId}/read-all`,
        { method: "PATCH" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update notifications.");
      }

      setNotifications((previous) =>
        previous.map((item) => ({ ...item, read: true }))
      );

      setSelectedNotification((previous) =>
        previous ? { ...previous, read: true } : null
      );

      setNotice("All notifications marked as read.");
    } catch (error) {
      setNotice(error.message || "Failed to mark notifications as read.");
    } finally {
      setActionLoading(false);
    }
  };

  const askDeleteConfirmation = (notification) => {
    setPendingDelete(notification);
    setNotice("");
  };

  // DELETE ONE NOTIFICATION
  const confirmDelete = async () => {
    if (!pendingDelete || actionLoading) return;

    const notificationToDelete = pendingDelete;

    try {
      setActionLoading(true);
      setNotice("");

      const response = await fetch(
        `${API_URL}/api/notifications/${notificationToDelete.id}?reporterId=${reporterId}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete notification.");
      }

      setNotifications((previous) =>
        previous.filter((item) => item.id !== notificationToDelete.id)
      );

      if (selectedNotification?.id === notificationToDelete.id) {
        setSelectedNotification(null);
      }

      setPendingDelete(null);
      setNotice(`"${notificationToDelete.title}" deleted successfully.`);
    } catch (error) {
      setNotice(error.message || "Failed to delete notification.");
    } finally {
      setActionLoading(false);
    }
  };

  const cancelDelete = () => {
    setPendingDelete(null);
  };

  // DELETE ALL READ NOTIFICATIONS
  const clearReadNotifications = async () => {
    if (!reporterId || readCount === 0 || actionLoading) return;

    try {
      setActionLoading(true);
      setNotice("");

      const response = await fetch(
        `${API_URL}/api/notifications/reporter/${reporterId}/read`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to clear read notifications.");
      }

      setNotifications((previous) =>
        previous.filter((item) => !item.read)
      );

      setSelectedNotification(null);
      setNotice("Read notifications cleared.");
    } catch (error) {
      setNotice(error.message || "Failed to clear read notifications.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setNotice("");
  };

  return (
    <div className="notifications-page">
      <header className="notifications-page-header">
        <div className="notifications-heading-left">
          <div className="notifications-heading-icon" aria-hidden="true">
            ♧
          </div>

          <div>
            <h1>Notifications</h1>
            <p>Stay updated with your news submissions and activity.</p>
          </div>
        </div>

        <button
          type="button"
          className="notifications-primary-btn"
          onClick={markAllAsRead}
          disabled={unreadCount === 0 || actionLoading}
        >
          ✓ Mark All as Read
        </button>
      </header>

      <div className="notifications-summary">
        <div className="notifications-summary-card total-card">
          <div className="summary-icon total-icon" aria-hidden="true">
            ♧
          </div>
          <div>
            <p>Total Notifications</p>
            <h2>{totalCount}</h2>
          </div>
        </div>

        <div className="notifications-summary-card unread-card">
          <div className="summary-icon unread-icon" aria-hidden="true">
            ●
          </div>
          <div>
            <p>Unread Notifications</p>
            <h2>{unreadCount}</h2>
          </div>
        </div>

        <div className="notifications-summary-card read-card">
          <div className="summary-icon read-icon" aria-hidden="true">
            ✓
          </div>
          <div>
            <p>Read Notifications</p>
            <h2>{readCount}</h2>
          </div>
        </div>
      </div>

      <section className="notifications-panel">
        <div className="notifications-panel-header">
          <div>
            <h2>Recent Activity</h2>
            <p>
              You have{" "}
              <strong className="notifications-unread-number">
                {unreadCount}
              </strong>{" "}
              unread notifications.
            </p>
          </div>

          <button
            type="button"
            className="notifications-clear-btn"
            onClick={clearReadNotifications}
            disabled={readCount === 0 || actionLoading}
          >
            ▤ Clear Read
          </button>
        </div>

        <div className="notifications-toolbar">
          <div className="notifications-search">
            <span className="notifications-search-icon" aria-hidden="true">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search notifications..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search notifications"
            />

            {search && (
              <button
                type="button"
                className="notifications-search-clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="notifications-filters">
            {["All", "Unread", "Read"].map((filter) => (
              <button
                key={filter}
                type="button"
                className={`notifications-filter-btn ${
                  activeFilter === filter ? "active" : ""
                }`}
                onClick={() => handleFilterChange(filter)}
              >
                {filter}
                {filter === "Unread" && unreadCount > 0 && (
                  <span className="notifications-filter-count">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {notice && (
          <div className="notifications-notice" role="status">
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        <div className="notifications-list">
          {loading ? (
            <div className="notifications-empty">
              <h3>Loading notifications...</h3>
              <p>Please wait while we fetch your notifications.</p>
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <article
                key={notification.id}
                className={`notification-row ${
                  !notification.read
                    ? "notification-unread"
                    : "notification-read"
                }`}
              >
                <div className="notification-indicator">
                  {!notification.read && (
                    <span
                      className="notification-blue-dot"
                      aria-label="Unread notification"
                      title="Unread"
                    />
                  )}
                </div>

                <div
                  className={`notification-type-icon ${notification.type}`}
                  aria-hidden="true"
                >
                  {notification.type === "success" && "✓"}
                  {notification.type === "warning" && "◷"}
                  {notification.type === "danger" && "✎"}
                  {notification.type === "info" && "↑"}
                  {notification.type === "system" && "i"}
                </div>

                <div className="notification-content">
                  <h3>{notification.title}</h3>
                  <p className="notification-message">
                    {notification.message}
                  </p>

                  <div className="notification-meta">
                    <span className="notification-time">
                      <span aria-hidden="true">◷</span>
                      {notification.time}
                    </span>

                    {notification.newsId && (
                      <span className="notification-news-id">
                        News ID: {notification.newsId}
                      </span>
                    )}
                  </div>
                </div>

                <div className="notification-status">
                  <span
                    className={`notification-status-badge ${notification.type}`}
                  >
                    {notification.category}
                  </span>
                </div>

                <div className="notification-actions">
                  <button
                    type="button"
                    className="notification-mark-btn"
                    onClick={() => openDetails(notification)}
                  >
                    View Details
                  </button>

                  <button
                    type="button"
                    className="notification-delete-btn"
                    onClick={() => askDeleteConfirmation(notification)}
                    aria-label={`Delete ${notification.title}`}
                    title="Delete notification"
                  >
                    ×
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="notifications-empty">
              <div className="notifications-empty-icon" aria-hidden="true">
                ♧
              </div>

              <h3>No notifications yet</h3>
              <p>
                {search || activeFilter !== "All"
                  ? "No notifications match your search or selected filter."
                  : "Updates about your news submissions will appear here when notifications are created."}
              </p>

              {(search || activeFilter !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setActiveFilter("All");
                  }}
                >
                  Show All Notifications
                </button>
              )}
            </div>
          )}
        </div>

        <div className="notifications-panel-footer">
          <span>
            Showing {filteredNotifications.length} of {totalCount} notifications
          </span>

          <span className="notifications-live-status">
            <span className="notifications-live-dot" />
            Connected to notifications API
          </span>
        </div>
      </section>

      {selectedNotification && (
        <div
          className="notification-modal-overlay"
          onClick={closeDetails}
        >
          <section
            className="notification-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-details-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="notification-details-header">
              <div>
                <span className="notification-details-eyebrow">
                  EM-AXIS · NOTIFICATION DETAILS
                </span>
                <h2 id="notification-details-title">
                  {selectedNotification.title}
                </h2>
              </div>

              <button
                type="button"
                className="notification-details-close"
                onClick={closeDetails}
                aria-label="Close details"
              >
                ×
              </button>
            </div>

            <div className="notification-details-body">
              <span
                className={`notification-status-badge ${selectedNotification.type}`}
              >
                {selectedNotification.category}
              </span>

              <p className="notification-details-message">
                {selectedNotification.details || selectedNotification.message}
              </p>

              <div className="notification-details-info">
                {selectedNotification.newsId && (
                  <div>
                    <span>News ID</span>
                    <strong>{selectedNotification.newsId}</strong>
                  </div>
                )}

                <div>
                  <span>Date and time</span>
                  <strong>{selectedNotification.time}</strong>
                </div>

                <div>
                  <span>Read status</span>
                  <strong className="notification-details-read">
                    ✓ Read
                  </strong>
                </div>
              </div>
            </div>

            <div className="notification-details-footer">
              <span>✓ Notification marked as read.</span>
              <button
                type="button"
                className="notifications-primary-btn"
                onClick={closeDetails}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}

      {pendingDelete && (
        <div
          className="notification-modal-overlay notification-delete-overlay"
          onClick={cancelDelete}
        >
          <section
            className="notification-confirm-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="notification-confirm-title"
            aria-describedby="notification-confirm-message"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="notification-confirm-icon" aria-hidden="true">
              !
            </div>

            <h2 id="notification-confirm-title">Delete Notification?</h2>

            <p id="notification-confirm-message">
              Are you sure you want to delete{" "}
              <strong>"{pendingDelete.title}"</strong>? This action cannot be
              undone.
            </p>

            <div className="notification-confirm-actions">
              <button
                type="button"
                className="notification-cancel-delete-btn"
                onClick={cancelDelete}
                disabled={actionLoading}
              >
                Cancel
              </button>

              <button
                type="button"
                className="notification-confirm-delete-btn"
                onClick={confirmDelete}
                disabled={actionLoading}
              >
                {actionLoading ? "Processing..." : "Yes, Delete"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default Notifications;
