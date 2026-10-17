
import EditorNavbar from "../../components/editorcomponent/EditorNav/EditorNavbar";
import EditorSidebar from "../../components/editorcomponent/EditorSidebar/EditorSidebar";
import "./EditorLayout.css";

function EditorLayout({ children }) {
  return (
    <div className="editor-layout">
      <EditorNavbar />

      <EditorSidebar />

      <main className="editor-main-content">
        {children}
      </main>
    </div>
  );
}

export default EditorLayout;
