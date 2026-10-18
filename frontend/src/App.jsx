
import {
  Routes,
  Route,
  Navigate,
  BrowserRouter,
} from "react-router-dom";

// Login and Register
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

// Reporter layout
import DashboardLayout from "./layout/DashboardLayout/DashboardLayout";

// Editor layout
import EditorLayout from "./layout/EditorLayout/EditorLayout";

// Editor dashboard
import EditorDashboard from "./editor/dashboard/dashboard.jsx";

// Channel Head dashboard
import ChannelHeadDashboard from "./channel-head/dashboard/dashboard.jsx";
import "./theme.css";
import AllNews from "./editor/AllNews/AllNews.jsx";
import EditorProfile from "./editor/Profile/EditorProfile.jsx";
import EditorSettings from "./editor/Settings/Settings.jsx";
import { ThemeProvider } from "./context/ThemeContext";
// ============================================
// NORMALIZE USER ROLE
// ============================================

function normalizeRole(role) {
  const value = String(role || "")
    .toLowerCase()
    .replace(/[\s_-]/g, "");

  if (value === "reporter") {
    return "reporter";
  }

  if (value === "editor") {
    return "editor";
  }

  if (value === "channelhead") {
    return "channel_head";
  }

  return "";
}


// ============================================
// GET ROLE DASHBOARD
// ============================================

function getRoleHome(role) {
  switch (role) {
    case "reporter":
      return "/dashboard";

    case "editor":
      return "/editor-dashboard";

    case "channel_head":
      return "/channel-head-dashboard";

    default:
      return "/";
  }
}


// ============================================
// ROLE PROTECTION
// ============================================

function RoleGuard({ allowedRole, children }) {
  let user = null;

  try {
    const storedUser = sessionStorage.getItem("emAxisUser");

    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error("Unable to read logged-in user:", error);
  }

  const role = normalizeRole(
    user?.role ??
    user?.user?.role ??
    user?.data?.role
  );

  // Not logged in
  if (!user || !role) {
    return <Navigate to="/" replace />;
  }

  // Wrong role
  if (role !== allowedRole) {
    return (
      <Navigate
        to={getRoleHome(role)}
        replace
      />
    );
  }

  return children;
}


// ============================================
// REPORTER ROUTE HELPER
// ============================================

function ReporterRoute({ children }) {
  return (
    <RoleGuard allowedRole="reporter">
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </RoleGuard>
  );
}


// ============================================
// EDITOR ROUTE HELPER
// ============================================

function EditorRoute({ children }) {
  return (
    <RoleGuard allowedRole="editor">
      <EditorLayout>
        {children}
      </EditorLayout>
    </RoleGuard>
  );
}


// ============================================
// CHANNEL HEAD ROUTE HELPER
// ============================================

function ChannelHeadRoute({ children }) {
  return (
    <RoleGuard allowedRole="channel_head">
      {children}
    </RoleGuard>
  );
}


// ============================================
// MAIN APP
// ============================================

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>

        {/* ==================================
            PUBLIC ROUTES
        ================================== */}

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* ==================================
            REPORTER MODULE
        ================================== */}

        <Route
          path="/dashboard"
          element={
            <ReporterRoute>
              <Dashboard />
            </ReporterRoute>
          }
        />

        <Route
          path="/reporter/create-news"
          element={
            <ReporterRoute>
              <CreateNews />
            </ReporterRoute>
          }
        />

        <Route
          path="/reporter/check-news-status"
          element={
            <ReporterRoute>
              <CheckNewsStatus />
            </ReporterRoute>
          }
        />

        <Route
          path="/reporter/total-news"
          element={
            <ReporterRoute>
              <TotalNews />
            </ReporterRoute>
          }
        />

        <Route
          path="/reporter/my-news"
          element={
            <ReporterRoute>
              <MyNews />
            </ReporterRoute>
          }
        />

        <Route
          path="/reporter/draft"
          element={
            <ReporterRoute>
              <Draft />
            </ReporterRoute>
          }
        />

        <Route
          path="/reporter/notifications"
          element={
            <ReporterRoute>
              <Notification />
            </ReporterRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ReporterRoute>
              <Profile />
            </ReporterRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ReporterRoute>
              <Settings />
            </ReporterRoute>
          }
        />

        <Route
          path="/reporter/news-workspace"
          element={
            <ReporterRoute>
              <NewsWorkspace />
            </ReporterRoute>
          }
        />


        {/* ==================================
            EDITOR MODULE
        ================================== */}

        <Route
          path="/editor-dashboard"
          element={
            <EditorRoute>
              <EditorDashboard />
            </EditorRoute>
          }
        />

        
          <Route
            path="/editor/all-news"
            element={
              <EditorRoute>
                <AllNews />
              </EditorRoute>
            }
          />


        <Route
          path="/editor/reporters"
          element={
            <EditorRoute>
              <div>
                <h2>Reporters</h2>
                <p>
                  Reporter information will appear here.
                </p>
              </div>
            </EditorRoute>
          }
        />

        <Route
          path="/editor/notifications"
          element={
            <EditorRoute>
              <div>
                <h2>Notifications</h2>
                <p>
                  Editor notifications will appear here.
                </p>
              </div>
            </EditorRoute>
          }
        />

                    <Route
              path="/editor/profile"
              element={
                <EditorRoute>
                  <EditorProfile />
                </EditorRoute>
              }
            />

       
<Route
  path="/editor/settings"
  element={
    <EditorRoute>
      <EditorSettings />
    </EditorRoute>
  }
/>



        {/* ==================================
            CHANNEL HEAD MODULE
        ================================== */}

        <Route
          path="/channel-head-dashboard"
          element={
            <ChannelHeadRoute>
              <ChannelHeadDashboard />
            </ChannelHeadRoute>
          }
        />


        {/* ==================================
            UNKNOWN ROUTES
        ================================== */}

        <Route
          path="*"
          element={
            <Navigate to="/" replace />
          }
        />


          <Route
  path="/editor/all-news"
  element={
    <EditorRoute>
      <AllNews />
    </EditorRoute>
  }
/>

             </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;