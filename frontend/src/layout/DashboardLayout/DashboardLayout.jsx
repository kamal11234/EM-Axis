
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import "./dashboardLayout.css";

function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (window.history.length > 1 && location.key !== "default") {
      navigate(-1);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      <Sidebar />

      <main
        className="dashboard-main"
        style={{
          paddingTop: "76px",
          boxSizing: "border-box",
        }}
      >
        <div className="page-back-arrow-wrapper">
          <button
            type="button"
            className="page-back-arrow"
            onClick={handleBack}
            aria-label="Go back"
            title="Go back"
          >
            ←
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
