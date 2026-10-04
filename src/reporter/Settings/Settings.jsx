import { useState } from "react";
import "./settings.css";

function Settings() {
  const [accountActive, setAccountActive] = useState(true);
  const [language, setLanguage] = useState("English");

  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark-theme")
  );

  const [notifications, setNotifications] = useState(true);

  // DARK / LIGHT MODE
  const handleTheme = (dark) => {
    setDarkMode(dark);

    if (dark) {
      document.documentElement.classList.add("dark-theme");
    } else {
      document.documentElement.classList.remove("dark-theme");
    }
  };

  // HELP
  const handleHelp = () => {
    alert("News submission guidelines will be available here.");
  };

  return (
    <div className="settings-page">

      {/* HEADER */}
      <div className="settings-header">
        <span className="settings-header-icon">⚙</span>
        <h1>Setting</h1>
      </div>

      <div className="settings-container">

        {/* ACCOUNT STATUS */}
        <div className="setting-row">
          <div className="setting-left">
            <div className="setting-icon account-icon">
              👤
            </div>

            <div className="setting-info">
              <h3>Account Status</h3>
              <p>Manage your account status</p>
            </div>
          </div>

          <div className="status-control">
            <button
              className={accountActive ? "active-btn" : ""}
              onClick={() => setAccountActive(true)}
            >
              Active
            </button>

            <button
              className={!accountActive ? "inactive-btn" : ""}
              onClick={() => setAccountActive(false)}
            >
              Inactive
            </button>
          </div>
        </div>

        {/* LANGUAGE */}
        <div className="setting-row">
          <div className="setting-left">
            <div className="setting-icon language-icon">
              🌐
            </div>

            <div className="setting-info">
              <h3>Language</h3>
              <p>Select your preferred language</p>
            </div>
          </div>

          <select
            className="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option>English</option>
            <option>Marathi</option>
            <option>Hindi</option>
          </select>
        </div>

        {/* APPEARANCE */}
        <div className="setting-row">
          <div className="setting-left">
            <div className="setting-icon appearance-icon">
              ◐
            </div>

            <div className="setting-info">
              <h3>Appearance</h3>
              <p>Choose light or dark mode</p>
            </div>
          </div>

          <div className="theme-control">
            <button
              className={!darkMode ? "light-active" : ""}
              onClick={() => handleTheme(false)}
            >
              ☀ Light
            </button>

            <button
              className={darkMode ? "dark-active" : ""}
              onClick={() => handleTheme(true)}
            >
              🌙 Dark
            </button>
          </div>
        </div>

        {/* NOTIFICATION */}
        <div className="setting-row">
          <div className="setting-left">
            <div className="setting-icon notification-icon">
              🔔
            </div>

            <div className="setting-info">
              <h3>Notification</h3>
              <p>Receive news and system notifications</p>
            </div>
          </div>

          <div className="notification-control">
            <button
              className={notifications ? "on-active" : ""}
              onClick={() => setNotifications(true)}
            >
              ON
            </button>

            <button
              className={!notifications ? "off-active" : ""}
              onClick={() => setNotifications(false)}
            >
              OFF
            </button>
          </div>
        </div>

        {/* HELP */}
        <div
          className="setting-row help-row"
          onClick={handleHelp}
        >
          <div className="setting-left">
            <div className="setting-icon help-icon">
              ?
            </div>

            <div className="setting-info">
              <h3>Help & Guidelines</h3>
              <p>View news submission guidelines and help</p>
            </div>
          </div>

          <span className="help-arrow">›</span>
        </div>

      </div>
    </div>
  );
}

export default Settings;
