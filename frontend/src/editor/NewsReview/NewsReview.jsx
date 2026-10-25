import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import "./NewsReview.css";

export default function NewsReview() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Pending Review");
  const [activeMedia, setActiveMedia] = useState("Image");
  const [selectedImage, setSelectedImage] = useState(0);
  const [showDialog, setShowDialog] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  const [news, setNews] = useState({
    title: "local-road-update",
    content:
      "A major road repair project has been initiated on the main highway connecting Kudal and Sawantwadi. The work is expected to improve traffic flow and reduce travel time for local commuters.",
    format: "AV",
  });

  const images = [
    {
      src: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=700&q=80",
      name: "road-image.jpg",
      size: "2.4 MB",
    },
    {
      src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=80",
      name: "road-report.mp4",
      size: "12.8 MB",
    },
    {
      src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=700&q=80",
      name: "site-photo.jpg",
      size: "3.1 MB",
    },
  ];

  useEffect(() => {
    if (!message) return;

    const timer = window.setTimeout(() => setMessage(""), 3000);
    return () => window.clearTimeout(timer);
  }, [message]);

  const notify = (text) => setMessage(text);

  const closeDialog = () => {
    setShowDialog("");
    setReason("");
  };

  const handleAction = () => {
    if (!reason.trim()) {
      notify(
        showDialog === "reject"
          ? "Please enter a rejection reason."
          : "Please enter correction remarks."
      );
      return;
    }

    if (showDialog === "reject") {
      setStatus("Rejected");
      notify("News rejected successfully.");
    } else {
      setStatus("Requires Correction");
      notify("News sent for correction.");
    }

    closeDialog();
  };

  const handleApprove = () => {
    setStatus("Approved");
    notify("News approved successfully.");
  };

  const handleOutput = () => {
    if (status !== "Approved") {
      notify("Approve the news before sending it to the output team.");
      return;
    }

    setStatus("Sent to Output Team");
    notify("News sent to the output team.");
  };

  const handleUpdate = () => {
    const title = window.prompt("Enter News Slug:", news.title);
    if (title === null) return;

    const content = window.prompt("Enter News Content:", news.content);
    if (content === null) return;

    setNews((previous) => ({ ...previous, title, content }));
    notify("News updated successfully.");
  };

  return (
    <div className="ndr-page">
      {/* Polished Banner */}
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
            ▤ News ID: <b>YBIT-NEWS-001</b>
          </span>

          <span
            className={`ndr-status ${status
              .toLowerCase()
              .replaceAll(" ", "-")}`}
          >
            ◷ {status}
          </span>

          <span className="ndr-meta-date">
            ▦ Submission Date: <b>15 Oct 2026</b>
          </span>
        </div>
      </header>

      {/* Main Layout */}
      <div className="ndr-layout">
        <main className="ndr-main">
          {/* Reporter Details */}
          <section className="ndr-card ndr-reporter">
            <div className="ndr-avatar">👤</div>

            <div className="ndr-reporter-info">
              <h3>
                Tanavi Vanjare
                <span className="ndr-badge">Reporter</span>
              </h3>
              <p>REP-001</p>
              <p>✉ tanavi@example.com</p>
            </div>

            <div className="ndr-date">
              <span>▦ Submitted On</span>
              <b>15 Oct 2026, 10:24 AM</b>
            </div>

            <div className="ndr-date">
              <span>▦ Last Updated</span>
              <b>15 Oct 2026, 10:24 AM</b>
            </div>
          </section>

          {/* News Information */}
          <section className="ndr-card ndr-information">
            <div className="ndr-section-heading">
              <div>
                <span className="ndr-section-kicker">SUBMISSION DETAILS</span>
                <h2>▤ News Information</h2>
              </div>
              <span className="ndr-id">YBIT-NEWS-001</span>
            </div>

            <div className="ndr-news-row">
              <div className="ndr-slug">
                <label>News Slug</label>
                <h3>{news.title}</h3>
              </div>

              <div className="ndr-formats">
                <label>News Format</label>
                <div className="ndr-format-list">
                  {["AV", "AVB", "TikTak", "WKT", "PKG", "One-to-One"].map(
                    (format) => (
                      <button
                        type="button"
                        key={format}
                        className={news.format === format ? "selected" : ""}
                        aria-pressed={news.format === format}
                        onClick={() =>
                          setNews((previous) => ({ ...previous, format }))
                        }
                      >
                        {format}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="ndr-content">
              <h3>Full News Content</h3>
              <p>{news.content}</p>
            </div>

            {/* Media Attachments */}
            <div className="ndr-media">
              <div className="ndr-media-heading">
                <div>
                  <span className="ndr-section-kicker">ATTACHED FILES</span>
                  <h3>📎 Media Attachments</h3>
                </div>
                <span className="ndr-attachment-count">
                  {images.length} Attachments
                </span>
              </div>

              <div className="ndr-media-layout">
                <div className="ndr-media-list">
                  {images.map((item, index) => (
                    <button
                      type="button"
                      className={`ndr-media-item ${
                        selectedImage === index ? "active" : ""
                      }`}
                      key={item.name}
                      onClick={() => {
                        setSelectedImage(index);
                        setActiveMedia("Image");
                      }}
                      aria-pressed={selectedImage === index}
                    >
                      <img src={item.src} alt={item.name} loading="lazy" />
                      <span>{item.name}</span>
                      <small>{item.size}</small>
                    </button>
                  ))}
                </div>

                <div className="ndr-preview">
                  <div className="ndr-preview-header">
                    <b>Attachment Preview</b>
                    <span>{activeMedia}</span>
                  </div>

                  <div className="ndr-preview-tabs">
                    <button
                      type="button"
                      className={activeMedia === "Image" ? "active" : ""}
                      onClick={() => setActiveMedia("Image")}
                    >
                      Image Preview
                    </button>

                    <button
                      type="button"
                      className={activeMedia === "Video" ? "active" : ""}
                      onClick={() => setActiveMedia("Video")}
                    >
                      Video Preview
                    </button>
                  </div>

                  {activeMedia === "Image" ? (
                    <img
                      className="ndr-preview-image"
                      src={images[selectedImage].src}
                      alt="Selected news attachment"
                    />
                  ) : (
                    <div className="ndr-video-message">
                      <span>▶</span>
                      <p>Video attachment preview</p>
                      <small>Connect a video file to play it.</small>
                    </div>
                  )}

                  <div className="ndr-dots">
                    {images.map((item, index) => (
                      <button
                        type="button"
                        key={item.name}
                        className={selectedImage === index ? "active" : ""}
                        onClick={() => {
                          setSelectedImage(index);
                          setActiveMedia("Image");
                        }}
                        aria-label={`Show image ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Right Sidebar Cards */}
        <aside className="ndr-right">
          <section className="ndr-card ndr-lock">
            <div className="ndr-lock-heading">
              <span className="ndr-lock-icon">🔒</span>
              <div>
                <span className="ndr-section-kicker">REVIEW ASSIGNMENT</span>
                <h3>Currently being reviewed by</h3>
              </div>
            </div>

            <h4>Editor Name</h4>
            <p>Review lock will expire in</p>
            <b className="ndr-lock-time">◷ 09:42</b>
          </section>

          {/* Timeline */}
          <section className="ndr-card ndr-timeline">
            <span className="ndr-section-kicker">ACTIVITY LOG</span>
            <h2>◷ Review Activity Timeline</h2>

            <div className="ndr-timeline-item">
              <span className="ndr-timeline-icon">▤</span>
              <div>
                <h4>News Submitted</h4>
                <p>Tanavi Vanjare submitted the news.</p>
                <small>15 Oct 2026, 10:24 AM</small>
              </div>
            </div>

            <div className="ndr-timeline-item">
              <span className="ndr-timeline-icon">♙</span>
              <div>
                <h4>Review Started</h4>
                <p>Editor Name started reviewing the news.</p>
                <small>15 Oct 2026, 11:02 AM</small>
              </div>
            </div>

            <div className="ndr-timeline-item">
              <span className="ndr-timeline-icon">↻</span>
              <div>
                <h4>Status Updated</h4>
                <p>Status: {status}</p>
                <small>Current review session</small>
              </div>
            </div>
          </section>

          {/* Review Actions */}
          <section className="ndr-card ndr-actions">
            <span className="ndr-section-kicker">EDITORIAL CONTROLS</span>
            <h2>🛡 Review Actions</h2>

            <button
              type="button"
              className="ndr-action approve"
              onClick={handleApprove}
            >
              <span>✓</span> Approve News
            </button>

            <button
              type="button"
              className="ndr-action reject"
              onClick={() => {
                setReason("");
                setShowDialog("reject");
              }}
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
            >
              <span>↻</span> Send for Correction
            </button>

            <button
              type="button"
              className="ndr-action output"
              onClick={handleOutput}
            >
              <span>↑</span> Send to Output Team
              <small>Available after approval</small>
            </button>

            <button
              type="button"
              className="ndr-action update"
              onClick={handleUpdate}
            >
              <span>✎</span> Update News
            </button>
          </section>

          
        </aside>
      </div>

      {/* Reject / Correction Modal */}
      {showDialog && (
        <div
          className="ndr-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialog();
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
            >
              ×
            </button>

            <div className="ndr-modal-icon">
              {showDialog === "reject" ? "✕" : "↻"}
            </div>

            <h2 id="ndr-dialog-title">
              {showDialog === "reject" ? "Reject News" : "Send for Correction"}
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
            />

            <div className="ndr-modal-actions">
              <button type="button" onClick={closeDialog}>
                Cancel
              </button>
              <button type="button" onClick={handleAction}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Message */}
      {message && (
        <div className="ndr-toast" role="status" aria-live="polite">
          {message}
        </div>
      )}
    </div>
  );
}