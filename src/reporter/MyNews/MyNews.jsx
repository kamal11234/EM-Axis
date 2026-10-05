
import React, { useState } from "react";
import "./MyNews.css";

const MyNews = () => {
  const [searchText, setSearchText] = useState("");
  const [format, setFormat] = useState("All format");

  const publishedNews = [
    {
      id: "N001",
      slug: "heavy-rainfall-alert-konkan",
      format: "AV",
      date: "02 Oct 2026",
      status: "Published",
    },
    {
      id: "N002",
      slug: "new-highway-project-update",
      format: "PKG",
      date: "01 Oct 2026",
      status: "Published",
    },
    {
      id: "N003",
      slug: "students-win-state-level-competition",
      format: "WKT",
      date: "30 Sep 2026",
      status: "Published",
    },
    {
      id: "N004",
      slug: "konkan-tourism-festival-announcement",
      format: "One to One",
      date: "28 Sep 2026",
      status: "Published",
    },
  ];

  const formats = [
    "All format",
    "AV",
    "AVB",
    "WKT",
    "TikTak",
    "PKG",
    "One to One",
  ];

  const matchesSearch = (item) => {
    const search = searchText.trim().toLowerCase();

    return (
      item.id.toLowerCase().includes(search) ||
      item.slug.toLowerCase().includes(search)
    );
  };

  const filteredPublished = publishedNews.filter(
    (item) =>
      matchesSearch(item) &&
      (format === "All format" || item.format === format)
  );

  const handleView = (item) => {
    window.alert(
      `News ID: ${item.id}\nNews Slug: ${item.slug}\nFormat: ${item.format}\nCreated Date: ${item.date}\nStatus: ${item.status}`
    );
  };

  return (
    <div className="my-news">
      {/* Page Title */}
      <div className="title-section">
        <div className="news-icon">▣</div>
        <h1>My News</h1>
      </div>

      {/* Search and Format Filter */}
      <div className="top-section">
        <div className="tabs">
          <button type="button" className="published">
            Published News <span>99</span>
          </button>
        </div>

        <div className="search-box">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search by News ID, Title"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <select
          className="category"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          aria-label="Filter by news format"
        >
          {formats.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {/* Published News Table */}
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
          {filteredPublished.length > 0 ? (
            filteredPublished.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.slug}</td>
                <td>{item.format}</td>
                <td>{item.date}</td>
                <td>
                  <span className="status-published">
                    {item.status}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="view-btn"
                    onClick={() => handleView(item)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No published news found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MyNews;
