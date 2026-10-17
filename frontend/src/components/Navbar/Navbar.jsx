
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./navbar.css";
import logo1 from "../../assets/logo1.png";

function getLoggedInUser() {
  try {
    return JSON.parse(sessionStorage.getItem("emAxisUser")) || {};
  } catch {
    return {};
  }
}

function getReporterPhoto() {
  try {
    return localStorage.getItem("reporterProfileImage") || "";
  } catch {
    return "";
  }
}

function Navbar({ userName = "", userRole = "" }) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [user] = useState(getLoggedInUser);
  const [photo, setPhoto] = useState(getReporterPhoto);
  const [showDropdown, setShowDropdown] = useState(false);

  const name =
    userName ||
    user.full_name ||
    user.fullName ||
    user.name ||
    "Reporter";

  const role = String(userRole || user.role || "reporter")
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  const designation =
    role === "editor"
      ? "Editor"
      : role === "channel_head" || role === "channelhead"
      ? "Channel Head"
      : "Reporter";

  // Close dropdown on outside click or Escape
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
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // My Profile: navigate only; do not clear session
  const handleMyProfile = () => {
    setShowDropdown(false);
    navigate("/profile");
  };

  // Logout: clear session only when Logout is clicked
  const handleLogout = () => {
    setShowDropdown(false);

    sessionStorage.removeItem("emAxisUser");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");

    navigate("/", { replace: true });
  };

  // Notifications
  const handleNotifications = () => {
    setShowDropdown(false);

    if (role === "editor") {
      navigate("/editor/notifications");
    } else if (
      role === "channel_head" ||
      role === "channelhead"
    ) {
      navigate("/channel-head/notifications");
    } else {
      navigate("/reporter/notifications");
    }
  };

  return (
    <nav className="navbar">
      {/* LEFT SIDE */}
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

      {/* RIGHT SIDE */}
      <div className="navbar-right">
        {/* Notification */}
        <button
          type="button"
          className="navbar-notification"
          title="Notifications"
          aria-label="Notifications"
          onClick={handleNotifications}
        >
          <span className="notification-icon">🔔</span>
        </button>

        <div className="navbar-divider" />

        {/* Profile Menu */}
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
                <span className="profile-default-avatar">
                  👤
                </span>
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

          {/* Dropdown */}
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
  );
}

export default Navbar;
