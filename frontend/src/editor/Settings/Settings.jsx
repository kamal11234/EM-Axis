
import React, { useState } from "react";
import "./Settings.css";
import { useTheme } from "../../context/ThemeContext";

const initialSettings = {
  accountStatus: "Active",
  language: "English",
  appearance: "Light",
  newsNotifications: true,
  systemNotifications: true,
  emailAlerts: false,
};

function Settings() {
  const { darkMode, setDarkMode } = useTheme();

  const [settings, setSettings] = useState(() => ({
    ...initialSettings,
    appearance: darkMode ? "Dark" : "Light",
  }));

  const [showHelp, setShowHelp] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const updateSetting = (key, value) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));
    setMessage("");
  };

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
  };

  const handleThemeChange = (theme) => {
    const isDark = theme === "Dark";

    setDarkMode(isDark);
    updateSetting("appearance", theme);
  };

  const handleSave = () => {
    if (password || confirmPassword) {
      if (password.length < 8) {
        showMessage(
          "Password must contain at least 8 characters.",
          "error"
        );
        return;
      }

      if (password !== confirmPassword) {
        showMessage("Passwords do not match.", "error");
        return;
      }
    }

    showMessage("Settings saved for this session.");
    setPassword("");
    setConfirmPassword("");
  };

  const handleReset = () => {
    setSettings({ ...initialSettings });
    setDarkMode(false);
    setPassword("");
    setConfirmPassword("");
    setShowHelp(false);
    setShowSecurity(false);
    setShowPassword(false);
    showMessage("Settings restored to their default values.");
  };

  return (
    <main
      className={`editor-settings-page ${
        darkMode ? "settings-dark" : ""
      }`}
    >
      <header className="settings-page-header">
        <div className="settings-heading-icon">⚙</div>
        <div>
          <h1>Settings</h1>
          <p>Manage your account, preferences and security.</p>
        </div>
      </header>

      {message && (
        <div
          className={`settings-message ${messageType}`}
          role="status"
          aria-live="polite"
        >
          <span>{messageType === "success" ? "✓" : "!"}</span>
          {message}
          <button
            type="button"
            onClick={() => setMessage("")}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      <section className="settings-section">
        <div className="settings-section-heading">
          <span className="section-heading-icon account-icon">♙</span>
          <div>
            <h2>Account Preferences</h2>
            <p>Manage your account status and language.</p>
          </div>
        </div>

        <div className="setting-row">
          <div className="setting-description">
            <h3>Account Status</h3>
            <p>Control the current status of your account.</p>
          </div>

          <div className="setting-control">
            <div className="settings-segmented" aria-label="Account status">
              {["Active", "Inactive"].map((status) => (
                <button
                  key={status}
                  type="button"
                  className={
                    settings.accountStatus === status ? "selected" : ""
                  }
                  onClick={() => {
                    if (
                      status === "Inactive" &&
                      settings.accountStatus !== status
                    ) {
                      const confirmed = window.confirm(
                        "Switch your account status to Inactive?"
                      );

                      if (!confirmed) return;
                    }

                    updateSetting("accountStatus", status);
                  }}
                >
                  {status === "Active" ? "● " : ""}
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="setting-row">
          <div className="setting-description">
            <h3>Language</h3>
            <p>Choose your preferred display language.</p>
          </div>

          <div className="setting-control">
            <select
              className="settings-select"
              value={settings.language}
              onChange={(event) =>
                updateSetting("language", event.target.value)
              }
              aria-label="Preferred language"
            >
              <option>English</option>
              <option>Marathi</option>
              <option>Hindi</option>
            </select>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-heading">
          <span className="section-heading-icon appearance-icon">☼</span>
          <div>
            <h2>Appearance</h2>
            <p>Personalize how your dashboard looks.</p>
          </div>
        </div>

        <div className="setting-row">
          <div className="setting-description">
            <h3>Display Theme</h3>
            <p>Choose light or dark appearance for your dashboard.</p>
          </div>

          <div className="setting-control">
            <div className="settings-segmented" aria-label="Display theme">
              <button
                type="button"
                className={!darkMode ? "selected" : ""}
                aria-pressed={!darkMode}
                onClick={() => handleThemeChange("Light")}
              >
                ☀ Light
              </button>

              <button
                type="button"
                className={darkMode ? "selected" : ""}
                aria-pressed={darkMode}
                onClick={() => handleThemeChange("Dark")}
              >
                ☾ Dark
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-heading">
          <span className="section-heading-icon notification-icon">♟</span>
          <div>
            <h2>Notifications</h2>
            <p>Choose which updates you want to receive.</p>
          </div>
        </div>

        <div className="setting-row">
          <div className="setting-description">
            <h3>News Updates</h3>
            <p>Receive updates about submitted and reviewed news.</p>
          </div>

          <label className="settings-switch">
            <input
              type="checkbox"
              checked={settings.newsNotifications}
              onChange={(event) =>
                updateSetting("newsNotifications", event.target.checked)
              }
            />
            <span className="switch-track" />
            <span className="switch-label">
              {settings.newsNotifications ? "On" : "Off"}
            </span>
          </label>
        </div>

        <div className="setting-row">
          <div className="setting-description">
            <h3>System Notifications</h3>
            <p>Receive important system and account announcements.</p>
          </div>

          <label className="settings-switch">
            <input
              type="checkbox"
              checked={settings.systemNotifications}
              onChange={(event) =>
                updateSetting("systemNotifications", event.target.checked)
              }
            />
            <span className="switch-track" />
            <span className="switch-label">
              {settings.systemNotifications ? "On" : "Off"}
            </span>
          </label>
        </div>

        <div className="setting-row">
          <div className="setting-description">
            <h3>Email Alerts</h3>
            <p>Receive selected updates through email.</p>
          </div>

          <label className="settings-switch">
            <input
              type="checkbox"
              checked={settings.emailAlerts}
              onChange={(event) =>
                updateSetting("emailAlerts", event.target.checked)
              }
            />
            <span className="switch-track" />
            <span className="switch-label">
              {settings.emailAlerts ? "On" : "Off"}
            </span>
          </label>
        </div>
      </section>

      <section className="settings-section">
        <button
          type="button"
          className="settings-expand-button"
          onClick={() => setShowSecurity((previous) => !previous)}
          aria-expanded={showSecurity}
        >
          <span className="section-heading-icon security-icon">♙</span>
          <span className="expand-button-text">
            <strong>Privacy &amp; Security</strong>
            <small>Manage your password and account security.</small>
          </span>
          <span className="expand-arrow">
            {showSecurity ? "⌃" : "›"}
          </span>
        </button>

        {showSecurity && (
          <div className="settings-expanded-content">
            <div className="security-note">
              <strong>Change Password</strong>
              <p>
                Enter a new password below. This demo form does not change
                your actual account password until connected to a backend.
              </p>
            </div>

            <label className="settings-field-label">
              New Password
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
            </label>

            <label className="settings-field-label">
              Confirm New Password
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter your password"
                autoComplete="new-password"
              />
            </label>

            <label className="show-password-option">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(event) => setShowPassword(event.target.checked)}
              />
              Show password
            </label>
          </div>
        )}
      </section>

      <section className="settings-section">
        <button
          type="button"
          className="settings-expand-button"
          onClick={() => setShowHelp((previous) => !previous)}
          aria-expanded={showHelp}
        >
          <span className="section-heading-icon help-icon">?</span>
          <span className="expand-button-text">
            <strong>Help &amp; Guidelines</strong>
            <small>Quick guidance for your editorial workflow.</small>
          </span>
          <span className="expand-arrow">
            {showHelp ? "⌃" : "›"}
          </span>
        </button>

        {showHelp && (
          <div className="settings-expanded-content help-content">
            <h3>News Review Guidelines</h3>
            <ul>
              <li>
                Check the headline, facts and source before approving news.
              </li>
              <li>
                Send clear correction notes when changes are required.
              </li>
              <li>Review media and formatting before publication.</li>
              <li>
                Verify news status before sending it to the output team.
              </li>
            </ul>
            <p>
              For account-related assistance, contact your project
              administrator.
            </p>
          </div>
        )}
      </section>

      <footer className="settings-actions">
        <button
          type="button"
          className="settings-reset-button"
          onClick={handleReset}
        >
          ↺ Reset Defaults
        </button>

        <button
          type="button"
          className="settings-save-button"
          onClick={handleSave}
        >
          ✓ Save Changes
        </button>
      </footer>
    </main>
  );
}

export default Settings;
