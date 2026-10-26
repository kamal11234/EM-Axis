
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
        <div className="editor-back-arrow-wrapper">
          <button
            type="button"
            className="editor-back-arrow"
            onClick={handleBack}
            aria-label="Go back to previous page"
            title="Go back"
          >
            <span aria-hidden="true">←</span>
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}

export default EditorLayout;
