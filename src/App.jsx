import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./reporter/Dashboard/Dashboard";
import Profile from "./reporter/Profile/Profile";
import TotalNews from "./reporter/TotalNews/TotalNews";
import CreateNews from "./reporter/CreateNews/CreateNews";
import NewsWorkspace from "./reporter/NewsWorkspace/NewsWorkspace";

import DashboardLayout from "./layout/DashboardLayout/DashboardLayout";

function App() {
  return (
    <Routes>

      {/* Login */}
      <Route path="/" element={<Login />} />

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

      {/* Profile */}
      <Route
        path="/profile"
        element={
          <DashboardLayout>
            <Profile />
          </DashboardLayout>
        }
      />

      {/* Reporter - Total News */}
      <Route
        path="/reporter/total-news"
        element={
          <DashboardLayout>
            <TotalNews />
          </DashboardLayout>
        }
      />
      {/* Reporter - Create News */}
<Route
  path="/reporter/create-news"
  element={
    <DashboardLayout>
      <CreateNews />
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
      <Route
        path="*"
        element={<Navigate to="/" />}
      />

    </Routes>
  );
}

export default App;