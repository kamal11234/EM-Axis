import { useMemo, useState } from "react";
import "./Notifications.css";

const initialNotifications = [
  {
    id: 1,
    title: "News Approved",
    message:
      "Your news report has been approved by the editor and is ready for the next stage.",
    time: "Today · 10:30 AM",
    newsId: "N001",
    category: "Approved",
    type: "success",
    read: false,
    details:
      "Your submitted news report has been approved by the editor. It is ready for the next stage of the news publishing process.",
  },
  {
    id: 2,
    title: "News Under Review",
    message:
      "Your submitted news is currently being reviewed by the editorial team.",
    time: "Today · 09:15 AM",
    newsId: "N002",
    category: "Under Review",
    type: "warning",
    read: false,
    details:
      "Your news report has been submitted successfully and is currently under review. Please wait for the editor's decision.",
  },
  {
    id: 3,
    title: "Revision Required",
    message:
      "The editor has requested some changes to your news. Please review and update it.",
    time: "Yesterday · 04:45 PM",
    newsId: "N003",
    category: "Revision",
    type: "danger",
    read: false,
    details:
      "The editor has requested revisions to your news report. Open your submitted news, review the editor's feedback, make the necessary changes, and resubmit it.",
  },
  {
    id: 4,
    title: "News Published",
    message: "Your news report has been published successfully.",
    time: "Yesterday · 02:20 PM",
    newsId: "N004",
    category: "Published",
    type: "info",
    read: true,
    details:
      "Your news report has been published successfully. You can check its status in your news workspace.",
  },
  {
    id: 5,
    title: "Welcome to EM-AXIS",
    message:
      "Welcome to the Reporter workspace. You can check your news updates and notifications here.",
    time: "18 Oct 2026 · 11:00 AM",
    newsId: "",
    category: "System",
    type: "system",
    read: true,
    details:
      "Welcome to EM-AXIS News Management System. Use your Reporter workspace to create news, submit reports, check their status, and receive updates.",
  },
];

function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedNotification, setSelectedNotification] = useState(null);

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
        notification.title,
        notification.message,
        notification.category,
        notification.newsId,
      ].some((value) => value.toLowerCase().includes(query));

      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "Unread" && !notification.read) ||
        (activeFilter === "Read" && notification.read);

      return matchesSearch && matchesFilter;
    });
  }, [notifications, activeFilter, search]);

  const openDetails = (notification) => {
    const updatedNotification = { ...notification, read: true };

    setNotifications((previous) =>
      previous.map((item) =>
        item.id === notification.id ? updatedNotification : item
      )
    );

    setSelectedNotification(updatedNotification);
    setNotice("");
  };

  const closeDetails = () => {
    setSelectedNotification(null);
  };

  const markAllAsRead = () => {
    setNotifications((previous) =>
      previous.map((notification) => ({ ...notification, read: true }))
    );

    setSelectedNotification((previous) =>
      previous ? { ...previous, read: true } : null
    );
    setNotice("All notifications marked as read.");
  };

  const deleteNotification = (id) => {
    setNotifications((previous) =>
      previous.filter((notification) => notification.id !== id)
    );

    if (selectedNotification?.id === id) {
      setSelectedNotification(null);
    }

    setNotice("Notification deleted.");
  };

  const clearReadNotifications = () => {
    setNotifications((previous) =>
      previous.filter((notification) => !notification.read)
    );
    setSelectedNotification(null);
    setNotice("Read notifications cleared.");
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
          disabled={unreadCount === 0}
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
            disabled={readCount === 0}
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
          {filteredNotifications.length > 0 ? (
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
                    onClick={() => deleteNotification(notification.id)}
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
              <h3>No notifications found</h3>
              <p>
                {search
                  ? "Try another search term."
                  : activeFilter === "Unread"
                  ? "You have no unread notifications."
                  : activeFilter === "Read"
                  ? "You have no read notifications."
                  : "Your notifications will appear here."}
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
            Updates appear here
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
                {selectedNotification.details}
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
    </div>
  );
}

export default Notifications;