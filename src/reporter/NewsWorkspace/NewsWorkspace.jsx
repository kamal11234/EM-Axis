
import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./newsworkspace.css";

const emptyMedia = () => ({
  audio: [],
  video: [],
  documents: [],
  images: [],
});

function NewsWorkspace() {
  const location = useLocation();
  const navigate = useNavigate();

  const incoming = location.state?.newsDetails || {};

  const [details, setDetails] = useState({
    newsId: incoming.newsId || incoming.id || "Auto Generated",
    newsFormat: incoming.newsFormat || incoming.format || "",
    newsSlug: incoming.newsSlug || incoming.slug || "",
    location: incoming.location || "",
    eventDate: incoming.eventDate || incoming.dateTime || "",
  });

  const [script, setScript] = useState("");
  const [breakingNews, setBreakingNews] = useState(false);
  const [mediaFiles, setMediaFiles] = useState(emptyMedia);
  const [showMedia, setShowMedia] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingDetails, setEditingDetails] = useState(false);
  const [message, setMessage] = useState("");

  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const documentRef = useRef(null);
  const imageRef = useRef(null);

  const handleDetailChange = (event) => {
    const { name, value } = event.target;

    setDetails((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleMediaChange = (event, type) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (!selectedFiles.length) return;

    setMediaFiles((previous) => ({
      ...previous,
      [type]: [...previous[type], ...selectedFiles],
    }));

    event.target.value = "";
    setMessage("");
    setShowMedia(false);
  };

  const removeMediaFile = (type, index) => {
    setMediaFiles((previous) => ({
      ...previous,
      [type]: previous[type].filter(
        (_, fileIndex) => fileIndex !== index
      ),
    }));
  };

  const allMedia = Object.entries(mediaFiles).flatMap(
    ([type, files]) =>
      files.map((file, index) => ({
        type,
        file,
        index,
      }))
  );

  const mediaIcon = (type) => {
    if (type === "audio") return "🎵";
    if (type === "video") return "🎥";
    if (type === "images") return "🖼️";
    return "📄";
  };

  const validateNews = () => {
    if (!script.trim()) {
      setMessage("Please write the news script first.");
      return false;
    }

    return true;
  };

  const getNewsData = () => ({
    ...details,
    script,
    breakingNews,
    mediaFiles,
  });

  const openPreview = () => {
    if (!validateNews()) return;

    setMessage("");
    setEditingDetails(false);
    setShowPreview(true);
  };

  const saveDraft = () => {
    if (!script.trim()) {
      setMessage("Please write the news script before saving.");
      return;
    }

    console.log("News draft:", getNewsData());

    setMessage(
      "Draft data is ready. Backend saving is not connected yet."
    );
  };

  // SEND NEWS TO TOTAL NEWS PAGE
  const sendToEditor = () => {
    if (!validateNews()) return;

    const newsData = getNewsData();

    // Create a valid date for the news row
    const parsedDate = newsData.eventDate
      ? new Date(newsData.eventDate)
      : new Date();

    const validDate = Number.isNaN(parsedDate.getTime())
      ? new Date()
      : parsedDate;

    const formatMap = {
      "One-to-One": "One to One",
      "One-to-One ": "One to One",
      TikTak: "WKT Tiktak",
    };

    const newNews = {
      id: `N${Date.now()}`,
      title: newsData.newsSlug?.trim() || "Untitled News",
      format:
        formatMap[newsData.newsFormat] || newsData.newsFormat || "—",
      date: validDate.toISOString().slice(0, 10),
      displayDate: validDate.toLocaleDateString("en-GB"),
      time: validDate.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      location: newsData.location?.trim() || "—",
      status: "Pending",
      script: newsData.script,
      breakingNews: newsData.breakingNews,

      // Save file names as metadata; File objects themselves
      // cannot be persisted in localStorage.
      mediaFiles: Object.fromEntries(
        Object.entries(newsData.mediaFiles).map(
          ([type, files]) => [
            type,
            files.map((file) => file.name),
          ]
        )
      ),
    };

    try {
      const existingNews = JSON.parse(
        localStorage.getItem("emAxisPendingNews") || "[]"
      );

      if (!Array.isArray(existingNews)) {
        throw new Error("Invalid saved news data");
      }

      existingNews.push(newNews);

      localStorage.setItem(
        "emAxisPendingNews",
        JSON.stringify(existingNews)
      );

      // Navigate to Total News after saving
      navigate("/reporter/total-news");
    } catch (error) {
      console.error("Unable to save news:", error);
      setMessage("Unable to save news in this browser. Please try again.");
    }
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
      return value;
    }

    return parsedDate.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  /* ======================== PREVIEW ======================== */

  if (showPreview) {
    return (
      <main className="news-workspace-page">
        <header className="workspace-page-header">
          <span className="workspace-badge">REPORTER PANEL</span>
          <h1>News Preview</h1>
          <p>Review your news before submission.</p>
        </header>

        <section className="preview-card">
          <div className="section-heading">
            <div className="section-icon">📰</div>

            <div>
              <h2>News Details</h2>
              <p>Review or edit the information below.</p>
            </div>
          </div>

          <div className="preview-details">
            <div>
              <span>NEWS ID</span>
              <strong>{details.newsId || "—"}</strong>
            </div>

            <div>
              <span>NEWS FORMAT</span>
              <strong>{details.newsFormat || "—"}</strong>
            </div>

            <div>
              <span>NEWS SLUG</span>
              <strong>{details.newsSlug || "—"}</strong>
            </div>

            <div>
              <span>REPORTING LOCATION</span>
              <strong>{details.location || "—"}</strong>
            </div>

            <div>
              <span>EVENT DATE &amp; TIME</span>
              <strong>{formatDate(details.eventDate)}</strong>
            </div>
          </div>

          <div className="details-edit-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                setEditingDetails((previous) => !previous)
              }
            >
              {editingDetails ? "Cancel Edit" : "Edit News Details"}
            </button>
          </div>

          {editingDetails && (
            <div className="details-edit-box">
              <div className="details-edit-grid">
                <div className="detail-edit-field">
                  <label htmlFor="preview-news-id">News ID</label>
                  <input
                    id="preview-news-id"
                    value={details.newsId}
                    readOnly
                  />
                </div>

                <div className="detail-edit-field">
                  <label htmlFor="preview-format">News Format</label>
                  <select
                    id="preview-format"
                    name="newsFormat"
                    value={details.newsFormat}
                    onChange={handleDetailChange}
                  >
                    <option value="">Select Format</option>
                    <option value="AV">AV</option>
                    <option value="AVB">AVB</option>
                    <option value="TikTak">TikTak</option>
                    <option value="WKT">WKT</option>
                    <option value="PKG">PKG</option>
                    <option value="One-to-One">One-to-One</option>
                  </select>
                </div>

                <div className="detail-edit-field">
                  <label htmlFor="preview-slug">News Slug</label>
                  <input
                    id="preview-slug"
                    name="newsSlug"
                    value={details.newsSlug}
                    onChange={handleDetailChange}
                    placeholder="Enter news slug"
                  />
                </div>

                <div className="detail-edit-field">
                  <label htmlFor="preview-location">
                    Reporting Location
                  </label>
                  <input
                    id="preview-location"
                    name="location"
                    value={details.location}
                    onChange={handleDetailChange}
                    placeholder="Enter location"
                  />
                </div>

                <div className="detail-edit-field">
                  <label htmlFor="preview-event-date">
                    Event Date &amp; Time
                  </label>
                  <input
                    id="preview-event-date"
                    type="datetime-local"
                    name="eventDate"
                    value={details.eventDate}
                    onChange={handleDetailChange}
                  />
                </div>
              </div>

              <div className="details-edit-actions">
                <button
                  type="button"
                  className="preview-button"
                  onClick={() => {
                    setEditingDetails(false);
                    setMessage("News details updated.");
                  }}
                >
                  Save Details
                </button>
              </div>
            </div>
          )}

          <div className="preview-block">
            <label>NEWS SCRIPT</label>
            <div className="preview-script">{script}</div>
          </div>

          <div className="preview-block">
            <label>MEDIA FILES</label>

            {allMedia.length === 0 ? (
              <div className="no-media">No media files added.</div>
            ) : (
              <div className="preview-media">
                {allMedia.map(({ type, file, index }) => (
                  <div
                    className="preview-media-item"
                    key={`${type}-${file.name}-${index}`}
                  >
                    <span>
                      {mediaIcon(type)} {file.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            className={`preview-breaking ${
              breakingNews ? "active" : ""
            }`}
          >
            <span className="breaking-dot" />
            Breaking News: {breakingNews ? "Yes" : "No"}
          </div>

          <div className="preview-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setShowPreview(false);
                setEditingDetails(false);
                setMessage("");
              }}
            >
              Back to News
            </button>

            <button
              type="button"
              className="draft-button"
              onClick={saveDraft}
            >
              Save as Draft
            </button>

            <button
              type="button"
              className="editor-button"
              onClick={sendToEditor}
            >
              Send to Editor →
            </button>
          </div>

          {message && (
            <div className="workspace-message" role="status">
              {message}
            </div>
          )}
        </section>
      </main>
    );
  }

  /* ======================== NEWS WORKSPACE ======================== */

  return (
    <main className="news-workspace-page">
      <header className="workspace-page-header">
        <span className="workspace-badge">REPORTER PANEL</span>
        <h1>News Workspace</h1>
        <p>Write and prepare your news.</p>
      </header>

      <section className="workspace-card">
        <div className="workspace-section">
          <div className="section-heading">
            <div className="section-icon">📝</div>

            <div>
              <h2>News Script</h2>
              <p>Write the complete news script.</p>
            </div>
          </div>

          <textarea
            className="script-editor"
            value={script}
            onChange={(event) => {
              setScript(event.target.value);
              setMessage("");
            }}
            placeholder="Write your complete news script here..."
          />

          <div className="character-count">
            {script.length} characters
          </div>
        </div>

        {/* HIDDEN FILE INPUTS */}

        <input
          ref={audioRef}
          type="file"
          accept="audio/*"
          multiple
          hidden
          onChange={(event) => handleMediaChange(event, "audio")}
        />

        <input
          ref={videoRef}
          type="file"
          accept="video/*"
          multiple
          hidden
          onChange={(event) => handleMediaChange(event, "video")}
        />

        <input
          ref={documentRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
          multiple
          hidden
          onChange={(event) =>
            handleMediaChange(event, "documents")
          }
        />

        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(event) => handleMediaChange(event, "images")}
        />

        {/* MEDIA FILE + BREAKING NEWS */}

        <div className="workspace-tools-row">
          <div className="media-action-wrapper">
            <button
              type="button"
              className="media-action-button"
              aria-expanded={showMedia}
              onClick={() =>
                setShowMedia((previous) => !previous)
              }
            >
              <span className="media-action-icon">📎</span>
              Media File
              <span className="media-arrow">
                {showMedia ? "▲" : "▼"}
              </span>
            </button>

            {showMedia && (
              <div className="media-popup">
                <button
                  type="button"
                  onClick={() => audioRef.current?.click()}
                >
                  🎵 Audio
                </button>

                <button
                  type="button"
                  onClick={() => videoRef.current?.click()}
                >
                  🎥 Video
                </button>

                <button
                  type="button"
                  onClick={() => documentRef.current?.click()}
                >
                  📄 Documents
                </button>

                <button
                  type="button"
                  onClick={() => imageRef.current?.click()}
                >
                  🖼️ Images
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className={`breaking-button ${
              breakingNews ? "active" : ""
            }`}
            aria-pressed={breakingNews}
            onClick={() =>
              setBreakingNews((previous) => !previous)
            }
          >
            <span className="breaking-dot" />
            {breakingNews ? "Breaking News: ON" : "Breaking News"}
          </button>
        </div>

        {/* ATTACHED FILES */}

        {allMedia.length > 0 && (
          <div className="uploaded-files">
            {allMedia.map(({ type, file, index }) => (
              <div
                className="uploaded-file"
                key={`${type}-${file.name}-${index}`}
              >
                <span>
                  {mediaIcon(type)} {file.name}
                </span>

                <button
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => removeMediaFile(type, index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* MAIN ACTIONS */}

        <div className="workspace-actions">
          <button
            type="button"
            className="preview-button"
            onClick={openPreview}
          >
            Preview →
          </button>

          <button
            type="button"
            className="draft-button"
            onClick={saveDraft}
          >
            Save as Draft
          </button>

          <button
            type="button"
            className="editor-button"
            onClick={sendToEditor}
          >
            Send to Editor →
          </button>
        </div>

        {message && (
          <div className="workspace-message" role="status">
            {message}
          </div>
        )}
      </section>
    </main>
  );
}

export default NewsWorkspace;

