import React from "react";
import "./MyNews.css";

const MyNews = () => {
  return (
    <div className="my-news">

      <div className="title-section">
        <div className="news-icon">▣</div>
        <h1>My News</h1>
      </div>

      <div className="top-section">

        <div className="tabs">
          <button className="published">
            Published News <span>99</span>
          </button>

          <button className="draft-tab">
            Draft <span>2</span>
          </button>
        </div>

        <div className="search-box">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search by News ID, Title"
          />
        </div>

        <select className="category">
          <option>All Categories</option>
        </select>

      </div>

      {/* Published News */}

      <table className="news-table">
        <thead>
          <tr>
            <th>News ID</th>
            <th>News Slug</th>
            <th>Format</th>
            <th>Created Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          <tr><td colSpan="6"></td></tr>
          <tr><td colSpan="6"></td></tr>
          <tr><td colSpan="6"></td></tr>
          <tr><td colSpan="6"></td></tr>
        </tbody>
      </table>

      {/* Draft */}

      <h2 className="draft-title">Draft</h2>

      <table className="news-table">
        <thead>
          <tr>
            <th>News ID</th>
            <th>News Slug</th>
            <th>Format</th>
            <th>Created Date</th>
            <th>Last Updated Date</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          <tr><td colSpan="6"></td></tr>
          <tr><td colSpan="6"></td></tr>
        </tbody>
      </table>

    </div>
  );
};

export default MyNews;