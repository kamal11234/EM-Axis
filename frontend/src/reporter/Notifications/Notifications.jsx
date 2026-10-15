
import React, { useState } from "react";
import "./Notifications.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "submitted",
      title: "News Submitted Successfully",
      message:
        "Your news 'Heavy Rainfall Alert in Konkan' has been submitted successfully for editorial review.",
      date: "05 Oct 2026",
      time: "10:30 AM",
      read: false,
    },
    {
      id: 2,
      type: "review",
      title: "News Under Review",
      message:
        "Your news 'New Highway Project Update' is currently being reviewed by the editor.",
      date: "05 Oct 2026",
      time: "09:45 AM",
      read: false,
    },
    {
      id: 3,
      type: "approved",
      title: "News Approved",
      message:
        "Congratulations! Your news 'Students Win State Level Competition' has been approved.",
      date: "04 Oct 2026",
      time: "04:20 PM",
      read: false,
    },
    {
      id: 4,
      type: "correction",
      title: "Correction Required",
      message:
        "Please review the editor's feedback and make corrections to 'New Healthcare Facilities in Village'.",
      date: "04 Oct 2026",
      time: "02:15 PM",
      read: false,
    },
    {
      id: 5,
      type: "rejected",
      title: "News Rejected",
      message:
        "Your news 'Local Transport Update' was rejected. Please check the editor's remarks.",
      date: "03 Oct 2026",
      time: "05:10 PM",
      read: true,
    },
    {
      id: 6,
      type: "published active",
      title: "News Published",
      message:
        "Your news 'Konkan Tourism Festival Announcement' is now published and available to readers.",
      date: "03 Oct 2026",
      time: "12:30 PM",
      read: true,
    },
    {
      id: 7,
      type: "draft",
      title: "Draft Saved",
      message:
        "Your draft 'Upcoming Youth Sports Event' has been saved successfully.",
      date: "02 Oct 2026",
      time: "03:40 PM",
      read: true,
    },
    {
      id: 8,
      type: "resubmitted",
      title: "News Resubmitted",
      message:
        "Your corrected news 'Heavy Rainfall Alert in Konkan' has been resubmitted for review.",
      date: "02 Oct 2026",
      time: "11:05 AM",
      read: true,
    },
  ]);

  const markAllAsRead = () => {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <div className="notif-wrapper">
      <div className="notif-header">
        <h2>
          🔔 Notification
          {unreadCount > 0 && (
            <span className="notif-count"> {unreadCount}</span>
          )}
        </h2>

        <button
          type="button"
          className="mark-read"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          Mark all as read
        </button>
      </div>

      <div className="notif-list">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notif-card ${notification.type} ${
              notification.read ? "read" : "unread"
            }`}
          >
            <div className="notif-content">
              <div className="notif-title-row">
                <h3>{notification.title}</h3>

                {!notification.read && (
                  <span className="unread-dot" title="Unread" />
                )}
              </div>

              <p>{notification.message}</p>

              <div className="notif-meta">
                <span>{notification.date}</span>
                <span>{notification.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
