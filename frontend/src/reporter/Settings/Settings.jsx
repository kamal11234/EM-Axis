
import { useEffect, useState } from "react";
import "./settings.css";

function Settings() {
  const [accountActive, setAccountActive] = useState(() => {
    return localStorage.getItem("reporterAccountStatus") !== "Inactive";
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("reporterLanguage") || "English";
  });

  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains("dark-theme");
  });

  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem("reporterNotifications") !== "false";
  });

  const [showHelp, setShowHelp] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    document.documentElement.classList.toggle("dark-theme", darkMode);
  }, [darkMode]);

  const updateAccountStatus = (active) => {
    setAccountActive(active);
    localStorage.setItem(
      "reporterAccountStatus",
      active ? "Active" : "Inactive"
    );
    setSavedMessage("Account status updated.");
  };

  const updateLanguage = (value) => {
    setLanguage(value);
    localStorage.setItem("reporterLanguage", value);
    setSavedMessage("Language preference saved.");
  };

  const handleTheme = (dark) => {
    setDarkMode(dark);
    setSavedMessage(`${dark ? "Dark" : "Light"} appearance selected.`);
  };

  const updateNotifications = (enabled) => {
    setNotifications(enabled);
    localStorage.setItem("reporterNotifications", String(enabled));
    setSavedMessage(
      `Notifications turned ${enabled ? "ON" : "OFF"}.`
    );
  };

  const handleHelp = () => {
    setShowHelp((current) => !current);
  };

  return (
    <div className={`settings-page ${darkMode ? "settings-dark" : ""}`}>
      <main className="settings-main">
        <section className="settings-page-heading">
          <div className="settings-heading-left">
            <div className="settings-heading-icon">⚙</div>
            <div>
              
              <h1>Settings</h1>
              <p>Customize your account and workspace preferences.</p>
            </div>
          </div>

          <div className="settings-heading-tag">
            <span className="settings-live-dot" />
            Preferences
          </div>
        </section>

        <section className="settings-overview">
          <div className="settings-overview-icon">🛡️</div>
          <div>
            <h2>Your workspace, your preferences</h2>
            <p>
              Manage your account status, display appearance and notification
              preferences from one place.
            </p>
          </div>
        </section>

        <section className="settings-section">
          <div className="settings-section-heading">
            <h2>General Preferences</h2>
            <p>Manage the way you use EM-AXIS.</p>
          </div>

          <div className="settings-container">
            {/* Account status */}
            <div className="setting-row">
              <div className="setting-left">
                <div className="setting-icon account-icon">👤</div>
                <div className="setting-info">
                  <h3>Account Status</h3>
                  <p>Choose whether your account is marked active or inactive.</p>
                </div>
              </div>

              <div className="setting-control">
                <div className="settings-segment-control">
                  <button
                    type="button"
                    aria-pressed={accountActive}
                    className={accountActive ? "active-btn" : ""}
                    onClick={() => updateAccountStatus(true)}
                  >
                    <span>●</span> Active
                  </button>
                  <button
                    type="button"
                    aria-pressed={!accountActive}
                    className={!accountActive ? "inactive-btn" : ""}
                    onClick={() => updateAccountStatus(false)}
                  >
                    Inactive
                  </button>
                </div>
                <span className="setting-current-value">
                  Currently {accountActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Language */}
            <div className="setting-row">
              <div className="setting-left">
                <div className="setting-icon language-icon">🌐</div>
                <div className="setting-info">
                  <h3>Language</h3>
                  <p>Select your preferred language.</p>
                </div>
              </div>

              <div className="setting-control">
                <label className="settings-select-wrap">
                  <span className="settings-sr-only">Preferred language</span>
                  <select
                    className="language-select"
                    value={language}
                    onChange={(event) => updateLanguage(event.target.value)}
                  >
                    <option value="English">English</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </label>
                <span className="setting-current-value">Display preference</span>
              </div>
            </div>

            {/* Appearance */}
            <div className="setting-row">
              <div className="setting-left">
                <div className="setting-icon appearance-icon">◐</div>
                <div className="setting-info">
                  <h3>Appearance</h3>
                  <p>Choose the theme that feels comfortable to you.</p>
                </div>
              </div>

              <div className="setting-control">
                <div className="settings-segment-control theme-control">
                  <button
                    type="button"
                    aria-pressed={!darkMode}
                    className={!darkMode ? "light-active" : ""}
                    onClick={() => handleTheme(false)}
                  >
                    ☀ Light
                  </button>
                  <button
                    type="button"
                    aria-pressed={darkMode}
                    className={darkMode ? "dark-active" : ""}
                    onClick={() => handleTheme(true)}
                  >
                    ☾ Dark
                  </button>
                </div>
                <span className="setting-current-value">
                  {darkMode ? "Dark theme enabled" : "Light theme enabled"}
                </span>
              </div>
            </div>

            {/* Notifications */}
            <div className="setting-row">
              <div className="setting-left">
                <div className="setting-icon notification-icon">🔔</div>
                <div className="setting-info">
                  <h3>Notifications</h3>
                  <p>Choose whether to receive news and system notifications.</p>
                </div>
              </div>

              <div className="setting-control">
                <div className="settings-segment-control">
                  <button
                    type="button"
                    aria-pressed={notifications}
                    className={notifications ? "on-active" : ""}
                    onClick={() => updateNotifications(true)}
                  >
                    ON
                  </button>
                  <button
                    type="button"
                    aria-pressed={!notifications}
                    className={!notifications ? "off-active" : ""}
                    onClick={() => updateNotifications(false)}
                  >
                    OFF
                  </button>
                </div>
                <span className="setting-current-value">
                  Notifications {notifications ? "enabled" : "disabled"}
                </span>
              </div>
            </div>

            {/* Help */}
            <button
              type="button"
              className={`setting-row help-row ${showHelp ? "help-expanded" : ""}`}
              onClick={handleHelp}
              aria-expanded={showHelp}
            >
              <div className="setting-left">
                <div className="setting-icon help-icon">?</div>
                <div className="setting-info">
                  <h3>Help &amp; Guidelines</h3>
                  <p>Learn about news submission and workspace usage.</p>
                </div>
              </div>
              <span className="help-arrow">{showHelp ? "⌄" : "›"}</span>
            </button>

            {showHelp && (
              <div className="settings-help-content">
                <h3>Reporter Guidelines</h3>
                <ul>
                  <li>Use a clear and accurate headline for every news story.</li>
                  <li>Check the news details and location before submitting.</li>
                  <li>Attach the required script, audio, video and related files.</li>
                  <li>Track your submission status and respond to editor corrections.</li>
                </ul>
                <p>
                  If you need assistance with your account, contact your
                  channel editor or administrator.
                </p>
              </div>
            )}
          </div>
        </section>

        <div className="settings-bottom-note">
          <span className="settings-note-icon">ℹ</span>
          <p>
            These preferences are stored in this browser. Account status and
            notification settings here do not change your server account or
            notification delivery by themselves.
          </p>
        </div>

        {savedMessage && (
          <div className="settings-toast" role="status">
            <span>✓</span> {savedMessage}
            <button
              type="button"
              onClick={() => setSavedMessage("")}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Settings;
