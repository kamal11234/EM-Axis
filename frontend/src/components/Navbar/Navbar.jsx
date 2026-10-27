import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./navbar.css";
import logo1 from "../../assets/logo1.png";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

function getLoggedInUser() {
  try {
    return JSON.parse(sessionStorage.getItem("emAxisUser")) || {};
  } catch {
    return {};
  }
}

function getReporterId(user) {
  return (
    user.id ||
    user.userId ||
    user.user_id ||
    user.user?.id ||
    null
  );
}

function getReporterPhoto() {
  try {
    return localStorage.getItem("reporterProfileImage") || "";
  } catch {
    return "";
  }
}

function normalizeRole(value = "") {
  return String(value).toLowerCase().replace(/[\s-]+/g, "_");
}

function normalizeNotification(item) {
  return {
    ...item,
    id: item.id ?? item.notification_id,
    title: item.title || item.notification_title || "New notification",
    message:
      item.message ||
      item.description ||
      item.notification_message ||
      item.details ||
      "You have a new notification. Check it now.",
    read:
      item.read === true ||
      item.is_read === true ||
      Boolean(item.read_at),
  };
}

function Navbar({ userName = "", userRole = "" }) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const previousIdsRef = useRef(null);
  const toastTimerRef = useRef(null);

  const [user] = useState(getLoggedInUser);
  const [photo, setPhoto] = useState(getReporterPhoto);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);

  const name =
    userName ||
    user.full_name ||
    user.fullName ||
    user.name ||
    "Reporter";

  const role = normalizeRole(userRole || user.role || "reporter");
  const reporterId = getReporterId(user);

  const designation =
    role === "editor"
      ? "Editor"
      : role === "channel_head"
      ? "Channel Head"
      : "Reporter";

  const unreadCount = notifications.filter(
    (item) => !item.read
  ).length;

  // Fetch real notifications from the existing backend API.
  const fetchNotifications = useCallback(async () => {
    if (role !== "reporter" || !reporterId) return;

    try {
      const response = await fetch(
        `${API_URL}/api/notifications/reporter/${encodeURIComponent(
          reporterId
        )}`
      );

      if (!response.ok) return;

      const data = await response.json();

      if (data.success === false) return;

      const latest = Array.isArray(data.notifications)
        ? data.notifications.map(normalizeNotification)
        : [];

      const latestIds = new Set(
        latest
          .filter((item) => item.id != null)
          .map((item) => String(item.id))
      );

      // First fetch establishes the baseline; it won't show a false toast.
      if (previousIdsRef.current === null) {
        previousIdsRef.current = latestIds;
        setNotifications(latest);
        return;
      }

      const newNotification = latest.find(
        (item) =>
          item.id != null &&
          !previousIdsRef.current.has(String(item.id))
      );

      previousIdsRef.current = latestIds;
      setNotifications(latest);

      if (newNotification) {
        setToast({
          id: String(newNotification.id),
          title: newNotification.title,
          message: newNotification.message,
        });

        if (toastTimerRef.current) {
          clearTimeout(toastTimerRef.current);
        }

        toastTimerRef.current = setTimeout(() => {
          setToast(null);
        }, 6000);
      }
    } catch (error) {
      // Avoid repeatedly showing error popups during temporary network issues.
      console.error("Navbar notification fetch failed:", error);
    }
  }, [reporterId, role]);

  useEffect(() => {
    if (role !== "reporter" || !reporterId) return;

    let active = true;

    const load = async () => {
      if (active) await fetchNotifications();
    };

    load();

    const intervalId = window.setInterval(load, 5000);

    // Refresh when the browser tab becomes active again.
    const handleVisibility = () => {
      if (document.visibilityState === "visible") load();
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      active = false;
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibility);

      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, [fetchNotifications, role, reporterId]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowDropdown(false);
        setToast(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleNotifications = () => {
    setToast(null);
    setShowDropdown(false);

    if (role === "editor") {
      navigate("/editor/notifications");
    } else if (role === "channel_head") {
      navigate("/channel-head/notifications");
    } else {
      navigate("/reporter/notifications");
    }
  };

  const handleMyProfile = () => {
    setShowDropdown(false);
    navigate("/profile");
  };

  const handleLogout = () => {
    setShowDropdown(false);
    sessionStorage.removeItem("emAxisUser");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <img
            src={logo1}
            alt="EM-Axis Logo"
            className="navbar-logo"
          />

          <div className="navbar-brand">
            <h2>EM-AXIS</h2>
          </div>
        </div>

        <div className="navbar-right">
          <button
            type="button"
            className="navbar-notification"
            title={`${unreadCount} unread notifications`}
            aria-label={`Notifications, ${unreadCount} unread`}
            onClick={handleNotifications}
          >
            <span className="notification-icon">🔔</span>

            {unreadCount > 0 && (
              <span className="navbar-notification-badge">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          <div className="navbar-divider" />

          <div
            className="navbar-profile-wrapper"
            ref={dropdownRef}
          >
            <button
              type="button"
              className="navbar-profile"
              title="Profile menu"
              aria-label="Open profile menu"
              aria-expanded={showDropdown}
              aria-haspopup="menu"
              onClick={() =>
                setShowDropdown((previous) => !previous)
              }
            >
              <span className="profile-icon">
                {photo ? (
                  <img
                    src={photo}
                    alt="User profile"
                    onError={() => setPhoto("")}
                  />
                ) : (
                  <span className="profile-default-avatar">👤</span>
                )}
              </span>

              <span className="profile-info">
                <span className="profile-name">{name}</span>
                <span className="profile-role">{designation}</span>
              </span>

              <span className="profile-arrow">
                {showDropdown ? "▲" : "▼"}
              </span>
            </button>

            {showDropdown && (
              <div className="profile-dropdown" role="menu">
                <button
                  type="button"
                  className="profile-dropdown-item"
                  role="menuitem"
                  onClick={handleMyProfile}
                >
                  <span className="dropdown-item-icon">👤</span>
                  <span>My Profile</span>
                </button>

                <button
                  type="button"
                  className="profile-dropdown-item logout-item"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  <span className="dropdown-item-icon">↪</span>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {toast && (
        <div
          className="em-notification-toast"
          role="status"
          aria-live="polite"
        >
          <div className="em-toast-icon">🔔</div>

          <div className="em-toast-content">
            <strong>{toast.title || "New notification received!"}</strong>
            <p>{toast.message || "Check your notifications now."}</p>

            <button
              type="button"
              className="em-toast-action"
              onClick={handleNotifications}
            >
              Check notification
            </button>
          </div>

          <button
            type="button"
            className="em-toast-close"
            aria-label="Dismiss notification"
            onClick={() => setToast(null)}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}

export default Navbar;