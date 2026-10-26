
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "14px 26px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <button
            type="button"
            onClick={handleBack}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "9px",
              padding: "10px 18px",
              background: "linear-gradient(135deg, #397fe5, #2455ad)",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(36, 85, 173, 0.22)",
            }}
          >
            <span style={{ fontSize: "20px", lineHeight: 1 }}>←</span>
            <span>Back</span>
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
