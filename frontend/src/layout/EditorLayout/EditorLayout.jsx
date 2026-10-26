
import { useNavigate, useLocation } from "react-router-dom";
import EditorNavbar from "../../components/editorcomponent/EditorNav/EditorNavbar";
import EditorSidebar from "../../components/editorcomponent/EditorSidebar/EditorSidebar";
import "./EditorLayout.css";

function EditorLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (window.history.length > 1 && location.key !== "default") {
      navigate(-1);
    } else {
      navigate("/editor-dashboard");
    }
  };

  return (
    <div className="editor-layout">
      <EditorNavbar />

      <EditorSidebar />

      <main
        className="editor-main-content"
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
            aria-label="Go back to previous page"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
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
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, #245fbe, #173e83)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, #397fe5, #2455ad)";
              e.currentTarget.style.transform = "translateY(0)";
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

export default EditorLayout;
