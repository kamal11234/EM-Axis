
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/logo1.png";
import "./EditorNavbar.css";

function getLoggedInUser() {
  try {
    return JSON.parse(sessionStorage.getItem("emAxisUser")) || {};
  } catch {
    return {};
  }
}

function getProfilePhoto() {
  try {
    return localStorage.getItem("editorProfileImage") || "";
  } catch {
    return "";
  }
}

function getDesignation(role) {
  const normalizedRole = String(role || "").toLowerCase();

  if (normalizedRole === "channel_head" || normalizedRole === "channelhead") {
    return "Channel Head";
  }

  if (normalizedRole === "reporter") {
    return "Reporter";
  }

  return "Editor";
}

function EditorNavbar() {
  const navigate = useNavigate();

  const [showMenu, setShowMenu] = useState(false);
  const [user] = useState(getLoggedInUser);
  const [photo, setPhoto] = useState(getProfilePhoto);

  const userName =
    user.full_name ||
    user.fullName ||
    user.name ||
    "Editor";

  const designation = getDesignation(user.role);

  const handleLogout = () => {
    sessionStorage.removeItem("emAxisUser");
    navigate("/", { replace: true });
  };

  const openProfile = () => {
    setShowMenu(false);
    navigate("/editor/profile");
  };

  return (
    <header className="editor-navbar">
      <div className="editor-navbar-brand">
        <img src={logo} alt="EM-AXIS Logo" />
        <span>EM-AXIS</span>
      </div>

      <div className="editor-navbar-actions">
        <button
          type="button"
          className="editor-notification-btn"
          title="Notifications"
          aria-label="Notifications"
          onClick={() => navigate("/editor/notifications")}
        >
          <span>🔔</span>
        </button>

        <div className="editor-navbar-divider" />

        <div className="editor-profile-container">
          <button
            type="button"
            className="editor-profile-btn"
            onClick={() => setShowMenu((prev) => !prev)}
            aria-expanded={showMenu}
            aria-label="Open profile menu"
          >
            <span className="editor-profile-avatar">
              {photo ? (
                <img
                  src={photo}
                  alt="Profile"
                  onError={() => setPhoto("")}
                />
              ) : (
                <span className="editor-default-avatar">👤</span>
              )}
            </span>

            <span className="editor-profile-details">
              <span className="editor-profile-name">
                {userName}
              </span>

              <span className="editor-profile-designation">
                {designation}
              </span>
            </span>

            <span className="editor-dropdown-arrow">▾</span>
          </button>

          {showMenu && (
            <div className="editor-profile-menu">
              <button type="button" onClick={openProfile}>
                My Profile
              </button>

              <button type="button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default EditorNavbar;
