
import { NavLink } from "react-router-dom";
import "./EditorSidebar.css";

const menuItems = [
  {
    label: "Dashboard",
    icon: "🏠",
    path: "/editor-dashboard",
  },
  {
    label: "All News",
    icon: "📰",
    path: "/editor/all-news",
  },
  {
    label: "Reporters",
    icon: "👥",
    path: "/editor/reporters",
  },
  {
    label: "Notification",
    icon: "🔔",
    path: "/editor/notifications",
  },
  {
    label: "Profile",
    icon: "👤",
    path: "/editor/profile",
  },
  {
    label: "Setting",
    icon: "⚙️",
    path: "/editor/settings",
  },
];

function EditorSidebar() {
  return (
    <aside className="editor-sidebar">
      <nav className="editor-sidebar-menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/editor-dashboard"}
            className={({ isActive }) =>
              `editor-sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="editor-sidebar-icon">
              {item.icon}
            </span>

            <span className="editor-sidebar-label">
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default EditorSidebar;
