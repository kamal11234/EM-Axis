import "./Sidebar.css";
import { useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">

      <div className="sidebar-menu">

        {/* Dashboard */}
        <button
          className="sidebar-item active"
          onClick={() => navigate("/dashboard")}
        >
          <span className="sidebar-icon">🏠</span>
          <span>Dashboard</span>
        </button>


        {/* Check News Status */}
        <button
          className="sidebar-item"
          onClick={() => navigate("/news-status")}
        >
          <span className="sidebar-icon">📊</span>
          <span>Check News Status</span>
        </button>


        {/* Total News */}
        <button
          className="sidebar-item"
          onClick={() => navigate("/total-news")}
        >
          <span className="sidebar-icon">📰</span>
          <span>Total News</span>
        </button>


        {/* My News */}
        <button
          className="sidebar-item"
          onClick={() => navigate("/my-news")}
        >
          <span className="sidebar-icon">📄</span>
          <span>My News</span>
        </button>


        {/* Notifications */}
        <button
          className="sidebar-item"
          onClick={() => navigate("/notifications")}
        >
          <span className="sidebar-icon">🔔</span>
          <span>Notifications</span>
        </button>


        {/* Profile */}
        <button
          className="sidebar-item"
          onClick={() => navigate("/profile")}
        >
          <span className="sidebar-icon">👤</span>
          <span>Profile</span>
        </button>


        {/* Settings */}
        <button
          className="sidebar-item"
          onClick={() => navigate("/settings")}
        >
          <span className="sidebar-icon">⚙️</span>
          <span>Settings</span>
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;