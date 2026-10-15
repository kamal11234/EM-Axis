import "./Sidebar.css";
import { useNavigate, useLocation } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", icon: "🏠", path: "/dashboard" },
    { name: "Check News Status", icon: "📊", path: "/reporter/check-news-status" },
    { name: "Total News", icon: "📰", path: "/reporter/total-news" },
    { name: "My News", icon: "📄", path: "/reporter/my-news" },
    { name: "Draft", icon: "📝", path: "/reporter/draft" },
    { name: "Notifications", icon: "🔔", path: "/reporter/notifications" },
    { name: "Profile", icon: "👤", path: "/profile" },
    { name: "Settings", icon: "⚙️", path: "/settings" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-menu">
        {menuItems.map((item) => (
          <button
            key={item.path}
            type="button"
            className={`sidebar-item ${
              location.pathname === item.path ? "active" : ""
            }`}
            onClick={() => navigate(item.path)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.name}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;