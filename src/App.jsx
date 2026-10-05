import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./reporter/Dashboard/Dashboard";
import CheckNewsStatus from "./reporter/CheckNewsStatus/CheckNewsStatus";
import TotalNews from "./reporter/TotalNews/TotalNews";
import Draft from "./reporter/draft/Draft";
import MyNews from "./reporter/MyNews/MyNews";
import Notification from "./reporter/Notifications/Notifications";
import Profile from "./reporter/Profile/Profile";
import Settings from "./reporter/Settings/Settings";
import CreateNews from "./reporter/CreateNews/CreateNews";

import DashboardLayout from "./layout/DashboardLayout/DashboardLayout";
import NewsWorkspace from "./reporter/NewsWorkspace/NewsWorkspace";

function App() {
return ( <BrowserRouter> <Routes>
{/* Login */}
<Route path="/" element={<Login />} />

```
    {/* Register */}
    <Route path="/register" element={<Register />} />

    {/* Dashboard */}
    <Route
      path="/dashboard"
      element={
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      }
    />

    {/* Create News */}
    <Route
      path="/reporter/create-news"
      element={
        <DashboardLayout>
          <CreateNews />
        </DashboardLayout>
      }
    />

    {/* Check News Status */}
    <Route
      path="/reporter/check-news-status"
      element={
        <DashboardLayout>
          <CheckNewsStatus />
        </DashboardLayout>
      }
    />

    {/* Total News */}
    <Route
      path="/reporter/total-news"
      element={
        <DashboardLayout>
          <TotalNews />
        </DashboardLayout>
      }
    />

    {/* My News */}
    <Route
      path="/reporter/my-news"
      element={
        <DashboardLayout>
          <MyNews />
        </DashboardLayout>
      }
    />

    {/* Draft */}
    <Route
      path="/reporter/draft"
      element={
        <DashboardLayout>
          <Draft />
        </DashboardLayout>
      }
    />

    {/* Notifications */}
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

      <Route
  path="/reporter/news-workspace"
  element={
    <DashboardLayout>
      <NewsWorkspace />
    </DashboardLayout>
  }
/>

    {/* Unknown URL */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
</BrowserRouter>

);
}

export default App;
