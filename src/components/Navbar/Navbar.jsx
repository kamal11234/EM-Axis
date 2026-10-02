import "./navbar.css";
import logo1 from "../../assets/logo1.png";

function Navbar({ userName = "", userRole = "" }) {
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
        >
          <span className="notification-icon">🔔</span>
        </button>


        {/* Divider */}
        <div className="navbar-divider"></div>


        {/* Profile */}
        <button
          type="button"
          className="navbar-profile"
          title="Profile"
        >
          <span className="profile-icon">👤</span>

          <span className="profile-info">

            {userName && (
              <span className="profile-name">
                {userName}
              </span>
            )}

            {userRole && (
              <span className="profile-role">
                {userRole}
              </span>
            )}

          </span>

          <span className="profile-arrow">
            ▼
          </span>
        </button>

      </div>

    </nav>
  );
}

export default Navbar;