
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateNews.css";

function CreateNews() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    newsFormat: "",
    newsSlug: "",
    location: "",
    eventDate: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSubmitted(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { newsFormat, newsSlug, location, eventDate } = formData;

    if (
      !newsFormat ||
      !newsSlug.trim() ||
      !location.trim() ||
      !eventDate
    ) {
      setSubmitted(false);
      return;
    }

    const newsDetails = {
      newsId: "Auto Generated",
      newsFormat,
      newsSlug: newsSlug.trim(),
      location: location.trim(),
      eventDate,
    };

    // Open News Workspace and pass the entered details
    navigate("/reporter/news-workspace", {
      state: {
        newsDetails: newsDetails,
      },
    });
  };

  return (
    <div className="create-news-page">
      {/* HEADER */}
      <div className="create-news-header">
        <div>
          <p className="page-badge">REPORTER PANEL</p>

          <h1>Create New News</h1>

          <p className="page-description">
            Enter the required information to create a new news report.
          </p>
        </div>

        <div className="header-icon">📰</div>
      </div>

      {/* MAIN FORM */}
      <form
        className="create-news-card"
        onSubmit={handleSubmit}
      >
        {/* SECTION HEADER */}
        <div className="section-header">
          <div className="section-number">01</div>

          <div>
            <h2>News Information</h2>

            <p>
              Provide the basic information of your news.
            </p>
          </div>
        </div>

        {/* FORM GRID */}
        <div className="form-grid">
          {/* NEWS ID */}
          <div className="form-group">
            <label>News ID</label>

            <div className="readonly-field">
              <span>🆔</span>

              <input
                type="text"
                value="Auto Generated"
                readOnly
              />
            </div>

            <small>
              News ID will be generated automatically.
            </small>
          </div>

          {/* NEWS FORMAT */}
          <div className="form-group">
            <label>
              News Format <span>*</span>
            </label>

            <select
              name="newsFormat"
              value={formData.newsFormat}
              onChange={handleChange}
              required
            >
              <option value="">Select News Format</option>
              <option value="AV">AV</option>
              <option value="AVB">AVB</option>
              <option value="TikTak">TikTak</option>
              <option value="WKT">WKT</option>
              <option value="PKG">PKG</option>
              <option value="One-to-One">One-to-One</option>
            </select>
          </div>

          {/* NEWS SLUG */}
          <div className="form-group">
            <label>
              News Slug <span>*</span>
            </label>

            <input
              type="text"
              name="newsSlug"
              value={formData.newsSlug}
              onChange={handleChange}
              placeholder="Enter news slug"
              required
            />
          </div>

          {/* LOCATION */}
          <div className="form-group">
            <label>
              Reporting Location <span>*</span>
            </label>

            <div className="input-with-icon">
              <span>📍</span>

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter city / location"
                required
              />
            </div>
          </div>

          {/* EVENT DATE */}
          <div className="form-group">
            <label>
              Event Date &amp; Time <span>*</span>
            </label>

            <input
              type="datetime-local"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* REQUIRED NOTE */}
        <div className="required-note">
          <span>ⓘ</span>

          <p>
            All fields marked with <b>*</b> are mandatory.
            Please complete all fields before creating the news.
          </p>
        </div>

        {/* BUTTON */}
        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
          >
            <span>Create News</span>
            <span className="button-arrow">→</span>
          </button>
        </div>

        {/* SUCCESS MESSAGE */}
        {submitted && (
          <div className="success-message">
            <div className="success-icon">✓</div>

            <div>
              <strong>News Created Successfully!</strong>

              <p>
                Your news has been created successfully.
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default CreateNews;
