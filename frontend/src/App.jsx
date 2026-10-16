
import {
  Routes,
  Route,
  Navigate,
  BrowserRouter,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

// Reporter pages
import Dashboard from "./reporter/Dashboard/Dashboard";
import CheckNewsStatus from "./reporter/CheckNewsStatus/CheckNewsStatus";
import TotalNews from "./reporter/TotalNews/TotalNews";
import Draft from "./reporter/draft/Draft";
import MyNews from "./reporter/MyNews/MyNews";
import Notification from "./reporter/Notifications/Notifications";
import Profile from "./reporter/Profile/Profile";
import Settings from "./reporter/Settings/Settings";
import CreateNews from "./reporter/CreateNews/CreateNews";
import NewsWorkspace from "./reporter/NewsWorkspace/NewsWorkspace";

// Shared layout
import DashboardLayout from "./layout/DashboardLayout/DashboardLayout";

// Editor dashboard
import EditorDashboard from "./editor/dashboard/dashboard.jsx";

// Channel Head dashboard
import ChannelHeadDashboard from "./channel-head/dashboard/dashboard.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/" element={<Login />} />

        {/* Register */}
        <Route path="/register" element={<Register />} />

        {/* Reporter Dashboard */}
        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          }
        />

        {/* Reporter: Create News */}
        <Route
          path="/reporter/create-news"
          element={
            <DashboardLayout>
              <CreateNews />
            </DashboardLayout>
          }
        />

        {/* Reporter: Check News Status */}
        <Route
          path="/reporter/check-news-status"
          element={
            <DashboardLayout>
              <CheckNewsStatus />
            </DashboardLayout>
          }
        />

        {/* Reporter: Total News */}
        <Route
          path="/reporter/total-news"
          element={
            <DashboardLayout>
              <TotalNews />
            </DashboardLayout>
          }
        />

        {/* Reporter: My News */}
        <Route
          path="/reporter/my-news"
          element={
            <DashboardLayout>
              <MyNews />
            </DashboardLayout>
          }
        />

        {/* Reporter: Draft */}
        <Route
          path="/reporter/draft"
          element={
            <DashboardLayout>
              <Draft />
            </DashboardLayout>
          }
        />

        {/* Reporter: Notifications */}
        <Route
          path="/reporter/notifications"
          element={
            <DashboardLayout>
              <Notification />
            </DashboardLayout>
          }
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <DashboardLayout>
              <Profile />
            </DashboardLayout>
          }
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          }
        />

        {/* Reporter: News Workspace */}
        <Route
          path="/reporter/news-workspace"
          element={
            <DashboardLayout>
              <NewsWorkspace />
            </DashboardLayout>
          }
        />

        {/* Editor Dashboard */}
        <Route
          path="/editor-dashboard"
          element={<EditorDashboard />}
        />

        {/* Channel Head Dashboard */}
        <Route
          path="/channel-head-dashboard"
          element={<ChannelHeadDashboard />}
        />

        {/* Unknown URL */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
