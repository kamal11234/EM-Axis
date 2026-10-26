 
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./NewsReview.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "") + "/api/news";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getFileUrl = (file) =>
  typeof file === "string" ? file : file?.url || file?.path || "";

const getFileName = (file, fallback) => {
  if (typeof file === "object" && file?.name) return file.name;

  const url = getFileUrl(file);

  if (url) {
    try {
      return decodeURIComponent(url.split("/").pop().split("?")[0]);
    } catch {
      return fallback;
    }
  }

  return fallback;
};

const getResponseData = async (response) => {
  try {
    return await response.json();
  } catch {
    throw new Error("Invalid server response. Please try again.");
  }
};

export default function NewsReview() {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedNews = location.state?.news || null;

  const [news, setNews] = useState(selectedNews);
  const [status, setStatus] = useState(selectedNews?.status || "Pending");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeMedia, setActiveMedia] = useState("images");
  const [selectedFile, setSelectedFile] = useState(0);
  const [showDialog, setShowDialog] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadNews = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL);
        const result = await getResponseData(response);

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load news.");
        }

        const allNews = Array.isArray(result.news) ? result.news : [];

        const currentNews =
          selectedNews?.id != null
            ? allNews.find(
                (item) => String(item.id) === String(selectedNews.id)
              )
            : null;

        if (!currentNews) {
          throw new Error(
            "News record not found. Please return to All News and select a news item."
          );
        }

        if (!cancelled) {
          setNews(currentNews);
          setStatus(currentNews.status || "Pending");
        }
      } catch (err) {
        if (!cancelled) {
          const errorMessage =
            err.message || "Unable to load news from the server.";

          setError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadNews();

    return () => {
      cancelled = true;
    };
  }, [selectedNews?.id]);

  const mediaFiles = useMemo(() => {
    const files = news?.media_files || {};

    const normalize = (items, type) =>
      (Array.isArray(items) ? items : []).map((file, index) => ({
        original: file,
        url: getFileUrl(file),
        name: getFileName(file, `${type} ${index + 1}`),
        type,
      }));

    return {
      images: normalize(files.images, "Image"),
      video: normalize(files.video, "Video"),
      audio: normalize(files.audio, "Audio"),
      documents: normalize(files.documents, "Document"),
    };
  }, [news]);

  const currentFiles = mediaFiles[activeMedia] || [];
  const currentFile = currentFiles[selectedFile] || null;

  const closeDialog = () => {
    setShowDialog("");
    setReason("");
  };

  const updateStatus = async (nextStatus, feedback = "") => {
    if (!news?.id) {
      toast.error("News ID is missing. Please reopen the news from All News.");
      return false;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(`${API_URL}/${news.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
          editor_feedback: feedback,
        }),
      });

      const result = await getResponseData(response);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update news status.");
      }

      setStatus(nextStatus);

      setNews((previous) => ({
        ...previous,
        ...(result.news || {}),
        status: nextStatus,
        editor_feedback: feedback || null,
        updated_at: new Date().toISOString(),
      }));

      return true;
    } catch (err) {
      const errorMessage =
        err.message || "Server error. Please try again.";

      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    const success = await updateStatus("Approved");

    if (success) {
      toast.success("News approved successfully.");
    }
  };

  const handlePublish = async () => {
    if (status !== "Approved") {
      toast.warning("Approve the news before publishing it.");
      return;
    }

    const success = await updateStatus("Published");

    if (success) {
      toast.success("News published successfully.");
    }
  };

  const handleAction = async () => {
    if (!reason.trim()) {
      toast.warning(
        showDialog === "reject"
          ? "Please enter a rejection reason."
          : "Please enter correction remarks."
      );
      return;
    }

    const nextStatus =
      showDialog === "reject" ? "Rejected" : "Correction Required";

    const success = await updateStatus(nextStatus, reason.trim());

    if (success) {
      toast.success(
        nextStatus === "Rejected"
          ? "News rejected successfully."
          : "Correction request saved successfully."
      );

      closeDialog();
    }
  };

  const changeMediaType = (type) => {
    setActiveMedia(type);
    setSelectedFile(0);
  };

  if (loading) {
    return (
      <div className="ndr-page">
        <div className="ndr-card">
          <p>Loading news details from the database...</p>
        </div>
      </div>
    );
  }

  if (error && !news) {
    return (
      <div className="ndr-page">
        <div className="ndr-card">
          <h2>Unable to Open News</h2>
          <p>{error}</p>

          <button
            type="button"
            className="ndr-back"
            onClick={() => navigate("/editor/all-news")}
          >
            ← Back to All News
          </button>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="ndr-page">
        <div className="ndr-card">
          <h2>No News Selected</h2>
          <p>Please select a news item from All News to review it.</p>

          <button
            type="button"
            className="ndr-back"
            onClick={() => navigate("/editor/all-news")}
          >
            ← Back to All News
          </button>
        </div>
      </div>
    );
  }

  const reporterName = news.reporter_name || "Unknown Reporter";

  const reporterId =
    news.reporter_id != null
      ? `REP-${String(news.reporter_id).padStart(3, "0")}`
      : "—";

  const title = news.news_slug || news.title || "Untitled News";
  const submissionDate = formatDate(news.created_at);
  const updatedDate = formatDate(news.updated_at);
  const isFinal = ["Rejected", "Published"].includes(status);

  return (
    <div className="ndr-page">
      <header className="ndr-header">
        <div className="ndr-banner">
          <div className="ndr-banner-icon" aria-hidden="true">
            ▤
          </div>

          <div className="ndr-banner-copy">
            <span className="ndr-eyebrow">
              EDITOR WORKSPACE / NEWS MANAGEMENT
            </span>

            <h1>News Details &amp; Review</h1>

            <p>
              Review submitted news, verify attachments and manage editorial
              decisions.
            </p>
          </div>

          <button
            type="button"
            className="ndr-back"
            onClick={() => navigate("/editor/all-news")}
          >
            ← Back to All News
          </button>
        </div>

        <div className="ndr-meta">
          <span className="ndr-meta-id">
            ▤ News ID: <b>{news.id}</b>
          </span>

          <span
            className={`ndr-status ${status
              .toLowerCase()
              .replaceAll(" ", "-")}`}
          >
            ◷ {status}
          </span>

          <span className="ndr-meta-date">
            ▦ Submission Date: <b>{submissionDate}</b>
          </span>
        </div>
      </header>

      <div className="ndr-layout">
        <main className="ndr-main">
          <section className="ndr-card ndr-reporter">
            <div className="ndr-avatar">👤</div>

            <div className="ndr-reporter-info">
              <h3>
                {reporterName}
                <span className="ndr-badge">Reporter</span>
              </h3>

              <p>{reporterId}</p>
              <p>News ID: {news.id}</p>
            </div>

            <div className="ndr-date">
              <span>▦ Submitted On</span>
              <b>{submissionDate}</b>
            </div>

            <div className="ndr-date">
              <span>▦ Last Updated</span>
              <b>{updatedDate}</b>
            </div>
          </section>

          <section className="ndr-card ndr-information">
            <div className="ndr-section-heading">
              <div>
                <span className="ndr-section-kicker">SUBMISSION DETAILS</span>
                <h2>▤ News Information</h2>
              </div>

              <span className="ndr-id">ID: {news.id}</span>
            </div>

            <div className="ndr-news-row">
              <div className="ndr-slug">
                <label>News Slug / Title</label>
                <h3>{title}</h3>
              </div>

              <div className="ndr-formats">
                <label>News Format</label>

                <div className="ndr-format-list">
                  <button type="button" className="selected">
                    {news.format || "—"}
                  </button>
                </div>
              </div>
            </div>

            <div className="ndr-content">
              <h3>Full News Script</h3>

              <p style={{ whiteSpace: "pre-wrap" }}>
                {news.script || "No news script was provided."}
              </p>

              {news.location && (
                <p>
                  <strong>Location:</strong> {news.location}
                </p>
              )}

              {news.event_date && (
                <p>
                  <strong>Event Date:</strong> {formatDate(news.event_date)}
                </p>
              )}

              <p>
                <strong>Breaking News:</strong>{" "}
                {news.breaking_news ? "Yes" : "No"}
              </p>

              {news.editor_feedback && (
                <p>
                  <strong>Previous Editor Feedback:</strong>{" "}
                  {news.editor_feedback}
                </p>
              )}
            </div>

            <div className="ndr-media">
              <div className="ndr-media-heading">
                <div>
                  <span className="ndr-section-kicker">ATTACHED FILES</span>
                  <h3>📎 Media Attachments</h3>
                </div>

                <span className="ndr-attachment-count">
                  {Object.values(mediaFiles).reduce(
                    (total, files) => total + files.length,
                    0
                  )}{" "}
                  Attachments
                </span>
              </div>

              <div className="ndr-preview-tabs">
                {[
                  ["images", "Images"],
                  ["video", "Video"],
                  ["audio", "Audio"],
                  ["documents", "Documents"],
                ].map(([type, label]) => (
                  <button
                    type="button"
                    key={type}
                    className={activeMedia === type ? "active" : ""}
                    onClick={() => changeMediaType(type)}
                  >
                    {label} ({mediaFiles[type].length})
                  </button>
                ))}
              </div>

              {currentFiles.length > 0 ? (
                <div className="ndr-media-layout">
                  <div className="ndr-media-list">
                    {currentFiles.map((file, index) => (
                      <button
                        type="button"
                        className={`ndr-media-item ${
                          selectedFile === index ? "active" : ""
                        }`}
                        key={`${file.name}-${index}`}
                        onClick={() => setSelectedFile(index)}
                        aria-pressed={selectedFile === index}
                      >
                        <span aria-hidden="true">
                          {activeMedia === "images"
                            ? "🖼"
                            : activeMedia === "video"
                              ? "🎬"
                              : activeMedia === "audio"
                                ? "🎧"
                                : "📄"}
                        </span>

                        <span>{file.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="ndr-preview">
                    <div className="ndr-preview-header">
                      <b>{currentFile?.name || "Attachment Preview"}</b>
                      <span>{activeMedia}</span>
                    </div>

                    {currentFile?.url ? (
                      <>
                        {activeMedia === "images" && (
                          <img
                            className="ndr-preview-image"
                            src={currentFile.url}
                            alt={currentFile.name}
                          />
                        )}

                        {activeMedia === "video" && (
                          <video
                            className="ndr-preview-image"
                            src={currentFile.url}
                            controls
                            preload="metadata"
                          >
                            Your browser does not support video playback.
                          </video>
                        )}

                        {activeMedia === "audio" && (
                          <div className="ndr-video-message">
                            <p>{currentFile.name}</p>
                            <audio src={currentFile.url} controls>
                              Your browser does not support audio playback.
                            </audio>
                          </div>
                        )}

                        {activeMedia === "documents" && (
                          <div className="ndr-video-message">
                            <p>{currentFile.name}</p>

                            <a
                              href={currentFile.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open Document
                            </a>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="ndr-video-message">
                        <p>File URL is not available.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="ndr-video-message">
                  <p>No {activeMedia} attachments submitted.</p>
                </div>
              )}
            </div>
          </section>
        </main>

        <aside className="ndr-right">
          <section className="ndr-card ndr-lock">
            <div className="ndr-lock-heading">
              <span className="ndr-lock-icon">🔎</span>

              <div>
                <span className="ndr-section-kicker">REVIEW DETAILS</span>
                <h3>News Review</h3>
              </div>
            </div>

            <h4>{reporterName}</h4>
            <p>Submitted by reporter</p>
            <b className="ndr-lock-time">{status}</b>
          </section>

          <section className="ndr-card ndr-timeline">
            <span className="ndr-section-kicker">ACTIVITY LOG</span>
            <h2>◷ Review Activity Timeline</h2>

            <div className="ndr-timeline-item">
              <span className="ndr-timeline-icon">▤</span>

              <div>
                <h4>News Submitted</h4>
                <p>{reporterName} submitted the news.</p>
                <small>{submissionDate}</small>
              </div>
            </div>

            <div className="ndr-timeline-item">
              <span className="ndr-timeline-icon">↻</span>

              <div>
                <h4>Current Status</h4>
                <p>Status: {status}</p>
                <small>Last updated: {updatedDate}</small>
              </div>
            </div>
          </section>

          <section className="ndr-card ndr-actions">
            <span className="ndr-section-kicker">EDITORIAL CONTROLS</span>
            <h2>🛡 Review Actions</h2>

            <button
              type="button"
              className="ndr-action approve"
              onClick={handleApprove}
              disabled={saving || isFinal || status === "Approved"}
            >
              <span>✓</span>
              {status === "Approved" ? "News Approved" : "Approve News"}
            </button>

            <button
              type="button"
              className="ndr-action reject"
              onClick={() => {
                setReason("");
                setShowDialog("reject");
              }}
              disabled={saving || isFinal}
            >
              <span>✕</span> Reject News
            </button>

            <button
              type="button"
              className="ndr-action correction"
              onClick={() => {
                setReason("");
                setShowDialog("correction");
              }}
              disabled={saving || isFinal}
            >
              <span>↻</span> Send for Correction
            </button>

            <button
              type="button"
              className="ndr-action output"
              onClick={handlePublish}
              disabled={saving || status !== "Approved"}
            >
              <span>↑</span> Publish News
              <small>Available after approval</small>
            </button>

            {saving && <p>Saving changes to database...</p>}

            {error && news && (
              <p role="alert" className="ndr-error">
                {error}
              </p>
            )}
          </section>
        </aside>
      </div>

      {showDialog && (
        <div
          className="ndr-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              closeDialog();
            }
          }}
        >
          <div
            className="ndr-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ndr-dialog-title"
          >
            <button
              type="button"
              className="ndr-modal-close"
              onClick={closeDialog}
              aria-label="Close dialog"
              disabled={saving}
            >
              ×
            </button>

            <div className="ndr-modal-icon">
              {showDialog === "reject" ? "✕" : "↻"}
            </div>

            <h2 id="ndr-dialog-title">
              {showDialog === "reject"
                ? "Reject News"
                : "Send for Correction"}
            </h2>

            <p>
              {showDialog === "reject"
                ? "Enter the reason for rejecting this news."
                : "Enter the corrections required in this news."}
            </p>

            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={
                showDialog === "reject"
                  ? "Enter rejection reason..."
                  : "Enter correction remarks..."
              }
              autoFocus
              disabled={saving}
            />

            <div className="ndr-modal-actions">
              <button
                type="button"
                onClick={closeDialog}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleAction}
                disabled={saving}
              >
                {saving ? "Saving..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
