import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./newsworkspace.css";

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const emptyMedia = () => ({
  audio: [],
  video: [],
  documents: [],
  images: [],
});

function NewsWorkspace() {
  const location = useLocation();
  const navigate = useNavigate();

  const incomingState = location.state || {};
  const incoming = incomingState.newsDetails || {};

  const toDateTimeLocal = (value) => {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset)
      .toISOString()
      .slice(0, 16);
  };

  const restoreMedia = (files = []) =>
    files.map((file) =>
      typeof file === "string" ? { name: file } : file
    );

  const initialMedia = incomingState.mediaFiles || {};

  const [details, setDetails] = useState({
    newsId: incoming.newsId || incoming.id || "Auto Generated",
    newsFormat: incoming.newsFormat || incoming.format || "",
    newsSlug: incoming.newsSlug || incoming.slug || "",
    location: incoming.location || "",
    eventDate: toDateTimeLocal(
      incoming.eventDate || incoming.dateTime || ""
    ),
  });

  const [script, setScript] = useState(incomingState.script || "");
  const [breakingNews, setBreakingNews] = useState(
    Boolean(incomingState.breakingNews)
  );

  const [mediaFiles, setMediaFiles] = useState(() => ({
    audio: restoreMedia(initialMedia.audio || []),
    video: restoreMedia(initialMedia.video || []),
    documents: restoreMedia(initialMedia.documents || []),
    images: restoreMedia(initialMedia.images || []),
  }));

  const [showMedia, setShowMedia] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingDetails, setEditingDetails] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [draftId, setDraftId] = useState(
    Number(incomingState.draftId) > 0
      ? Number(incomingState.draftId)
      : null
  );

  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const documentRef = useRef(null);
  const imageRef = useRef(null);

  // SHOW VALIDATION ERROR
  const showValidationError = (text) => {
    setMessage(text);
    toast.warning(text);
  };

  // UPDATE NEWS DETAILS
  const handleDetailChange = (event) => {
    const { name, value } = event.target;

    setDetails((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  };

  // SELECT MEDIA FILES
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

    toast.success(
      `${selectedFiles.length} ${type} file${
        selectedFiles.length > 1 ? "s" : ""
      } added to the workspace.`
    );
  };

  // REMOVE MEDIA FILE
  const removeMediaFile = (type, index) => {
    const file = mediaFiles[type][index];

    setMediaFiles((previous) => ({
      ...previous,
      [type]: previous[type].filter(
        (_, fileIndex) => fileIndex !== index
      ),
    }));

    toast.info(`${file?.name || "Media file"} removed from the workspace.`);
  };

  // ALL MEDIA FILES
  const allMedia = Object.entries(mediaFiles).flatMap(
    ([type, files]) =>
      files.map((file, index) => ({
        type,
        file,
        index,
      }))
  );

  // MEDIA ICON
  const mediaIcon = (type) => {
    if (type === "audio") return "🎵";
    if (type === "video") return "🎥";
    if (type === "images") return "🖼️";
    return "📄";
  };

  // VALIDATE NEWS
  const validateNews = () => {
    if (!details.newsFormat.trim()) {
      showValidationError("Please select a news format.");
      return false;
    }

    if (!details.newsSlug.trim()) {
      showValidationError("Please enter the news slug.");
      return false;
    }

    if (!details.location.trim()) {
      showValidationError("Please enter the reporting location.");
      return false;
    }

    if (!details.eventDate) {
      showValidationError("Please select the event date and time.");
      return false;
    }

    if (Number.isNaN(new Date(details.eventDate).getTime())) {
      showValidationError("Please enter a valid event date.");
      return false;
    }

    if (!script.trim()) {
      showValidationError("Please write the news script first.");
      return false;
    }

    return true;
  };

  // OPEN PREVIEW
  const openPreview = () => {
    if (!validateNews()) return;

    setMessage("");
    setEditingDetails(false);
    setShowPreview(true);

    toast.info("News preview is ready.");
  };

  // GET REPORTER ID
  const getReporter = () => {
    const storedUser = sessionStorage.getItem("emAxisUser");

    if (!storedUser) {
      throw new Error("Your session has expired. Please log in again.");
    }

    let parsedUser;

    try {
      parsedUser = JSON.parse(storedUser);
    } catch {
      throw new Error("Invalid login session. Please log in again.");
    }

    const user = parsedUser?.user || parsedUser;
    const reporterId = Number(user?.id);

    const userRole = String(user?.role || "")
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");

    if (!Number.isInteger(reporterId) || reporterId < 1) {
      throw new Error("Reporter ID is missing. Please log in again.");
    }

    if (userRole !== "reporter") {
      throw new Error("Only a reporter account can perform this action.");
    }

    return { reporterId };
  };

  // MEDIA FILE NAMES FOR DATABASE
  const getMediaMetadata = () =>
    Object.fromEntries(
      Object.entries(mediaFiles).map(([type, files]) => [
        type,
        files.map((file) => file?.name || String(file)),
      ])
    );

  // COMMON DATABASE PAYLOAD
  const getPayload = (reporterId) => ({
    reporterId,
    newsFormat: details.newsFormat.trim(),
    newsSlug: details.newsSlug.trim(),
    location: details.location.trim(),
    eventDate: details.eventDate
      ? new Date(details.eventDate).toISOString()
      : null,
    script: script.trim(),
    breakingNews,
    mediaFiles: getMediaMetadata(),
  });

  // SAVE OR UPDATE DRAFT
  const saveDraft = async () => {
    if (submitting) return;

    if (!script.trim()) {
      showValidationError("Please write the news script before saving.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const { reporterId } = getReporter();
      const payload = getPayload(reporterId);

      const isUpdating = Number.isInteger(draftId) && draftId > 0;

      const response = await fetch(
        isUpdating
          ? `${API_BASE}/api/news/drafts/${draftId}`
          : `${API_BASE}/api/news/drafts`,
        {
          method: isUpdating ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to save draft.");
      }

      const savedId = Number(
        result.draft?.id || result.id || draftId
      );

      if (Number.isInteger(savedId) && savedId > 0) {
        setDraftId(savedId);
      }

      toast.success(
        isUpdating
          ? "Draft updated successfully!"
          : "News draft saved successfully!"
      );

      navigate("/reporter/draft", {
        replace: true,
        state: {
          refresh: true,
          savedDraftId: savedId || null,
        },
      });
    } catch (error) {
      console.error("DRAFT SAVE ERROR:", error);

      const errorMessage =
        error instanceof TypeError
          ? "Cannot connect to the backend. Check that the server is running."
          : error.message || "Unable to save draft. Please try again.";

      setMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // SEND NEWS TO EDITOR
  const sendToEditor = async () => {
    if (submitting) return;
    if (!validateNews()) return;

    setSubmitting(true);
    setMessage("");

    try {
      const { reporterId } = getReporter();
      const payload = getPayload(reporterId);

      const response = await fetch(`${API_BASE}/api/news`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to submit news.");
      }

      // Delete the draft after news submission succeeds.
      if (Number.isInteger(draftId) && draftId > 0) {
        try {
          const deleteResponse = await fetch(
            `${API_BASE}/api/news/drafts/${draftId}?reporterId=${reporterId}`,
            { method: "DELETE" }
          );

          const deleteResult = await deleteResponse.json().catch(() => ({}));

          if (!deleteResponse.ok || deleteResult.success === false) {
            toast.warning(
              "News was submitted, but the saved draft could not be deleted."
            );
          }
        } catch (deleteError) {
          console.warn("Draft deletion failed:", deleteError);

          toast.warning(
            "News was submitted, but the saved draft could not be deleted."
          );
        }
      }

      toast.success("News submitted successfully!");

      navigate("/reporter/total-news", {
        state: {
          refresh: true,
          submittedNews: result.news,
        },
      });
    } catch (error) {
      console.error("NEWS SUBMISSION ERROR:", error);

      const errorMessage =
        error instanceof TypeError
          ? "Cannot connect to the backend. Check that the server is running."
          : error.message || "Unable to submit news.";

      setMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // FORMAT DATE
  const formatDate = (value) => {
    if (!value) return "—";

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) return value;

    return parsedDate.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // ======================== NEWS PREVIEW ========================

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
              <strong>{details.newsId || "Auto Generated"}</strong>
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
              onClick={() => setEditingDetails((previous) => !previous)}
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
                    setMessage("");
                    toast.success("News details updated in the preview.");
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
            className={`preview-breaking ${breakingNews ? "active" : ""}`}
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
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save as Draft"}
            </button>

            <button
              type="button"
              className="editor-button"
              onClick={sendToEditor}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Send to Editor →"}
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

  // ======================== NEWS WORKSPACE ========================

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
          onChange={(event) => handleMediaChange(event, "documents")}
        />

        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(event) => handleMediaChange(event, "images")}
        />

        <div className="workspace-tools-row">
          <div className="media-action-wrapper">
            <button
              type="button"
              className="media-action-button"
              aria-expanded={showMedia}
              onClick={() => setShowMedia((previous) => !previous)}
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
            className={`breaking-button ${breakingNews ? "active" : ""}`}
            aria-pressed={breakingNews}
            onClick={() => {
              const nextValue = !breakingNews;
              setBreakingNews(nextValue);
              toast.info(
                nextValue
                  ? "Breaking News enabled."
                  : "Breaking News disabled."
              );
            }}
          >
            <span className="breaking-dot" />
            {breakingNews ? "Breaking News: ON" : "Breaking News"}
          </button>
        </div>

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
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save as Draft"}
          </button>

          <button
            type="button"
            className="editor-button"
            onClick={sendToEditor}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Send to Editor →"}
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
