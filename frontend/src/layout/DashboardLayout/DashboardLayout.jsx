import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import "./DashboardLayout.css";

function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">

      <Navbar />

      <Sidebar />

      <main className="dashboard-main">
        {children}
      </main>

    </div>
  );
}

export default DashboardLayout;