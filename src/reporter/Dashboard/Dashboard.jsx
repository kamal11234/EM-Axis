import { useState } from "react";
import "./dashboard.css";
import repoimg from "../../assets/repoimg.png";

function Dashboard() {
  const [showFilters, setShowFilters] = useState(true);

  const [searchText, setSearchText] = useState("");
  const [newsType, setNewsType] = useState("All");
  const [status, setStatus] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* =========================
     SAMPLE NEWS DATA
  ========================= */

  const newsData = [
    {
      id: 1,
      title: "City Development Update",
      type: "Text",
      area: "Mumbai",
      date: "2026-10-02",
      status: "Approved",
    },
    {
      id: 2,
      title: "Traffic Update",
      type: "Video",
      area: "Pune",
      date: "2026-10-02",
      status: "Pending",
    },
    {
      id: 3,
      title: "Local Sports Event",
      type: "AV",
      area: "Delhi",
      date: "2026-10-01",
      status: "Published",
    },
    {
      id: 4,
      title: "Education Policy Update",
      type: "Text",
      area: "Bangalore",
      date: "2026-09-30",
      status: "Draft",
    },
    {
      id: 5,
      title: "Local Event Report",
      type: "AVB",
      area: "Hubballi",
      date: "2026-09-29",
      status: "Rejected",
    },
  ];

  /* =========================
     FILTER NEWS
  ========================= */

  const filteredNews = newsData.filter((news) => {
    const search = searchText.toLowerCase().trim();

    const matchesSearch =
      news.title.toLowerCase().includes(search) ||
      news.type.toLowerCase().includes(search) ||
      news.area.toLowerCase().includes(search) ||
      news.status.toLowerCase().includes(search) ||
      String(news.id).includes(search);

    const matchesType =
      newsType === "All" || news.type === newsType;

    const matchesStatus =
      status === "All" || news.status === status;

    const matchesFromDate =
      !fromDate || news.date >= fromDate;

    const matchesToDate =
      !toDate || news.date <= toDate;

    return (
      matchesSearch &&
      matchesType &&
      matchesStatus &&
      matchesFromDate &&
      matchesToDate
    );
  });

  /* =========================
     CLEAR FILTER
  ========================= */

  const clearFilters = () => {
    setSearchText("");
    setNewsType("All");
    setStatus("All");
    setFromDate("");
    setToDate("");
  };

  return (
    <div className="dashboard-content">

      {/* =========================
          WELCOME SECTION
      ========================= */}

      <div className="welcome-section">

        <div className="welcome-text">
          <h1>Welcome to EM-AXIS</h1>

          <h3>Kamal Vadar</h3>

          <p>
            Create and manage your news
            <br />
            stories-all in one place
          </p>
        </div>

        <div className="welcome-image">
          <img
            src={repoimg}
            alt="Reporter News"
          />
        </div>

      </div>


      {/* =========================
          MAIN DASHBOARD
      ========================= */}

      <div className="dashboard-main-layout">

        {/* =========================
            LEFT COLUMN
        ========================= */}

        <div className="dashboard-left">

          {/* ACTION SECTION */}

          <div className="action-section">

            <button className="create-news-btn">
              + Create News
            </button>

            <div className="search-box">

              <span>⌕</span>

              <input
                type="text"
                placeholder="Search by title, category, or ID"
                value={searchText}
                onChange={(e) =>
                  setSearchText(e.target.value)
                }
              />

            </div>

            <button
              className={`filter-btn ${
                showFilters ? "active-filter" : ""
              }`}
              onClick={() =>
                setShowFilters(!showFilters)
              }
            >

              <span>⚱</span>

              Filter

              <span className="filter-arrow">
                {showFilters ? "⌃" : "⌄"}
              </span>

            </button>

          </div>


          {/* =========================
              FILTER SECTION
          ========================= */}

          {showFilters && (
            <div className="filter-section">

              {/* NEWS TYPE */}

              <div className="filter-field">

                <label>
                  News Type
                </label>

                <select
                  value={newsType}
                  onChange={(e) =>
                    setNewsType(e.target.value)
                  }
                >

                  <option value="All">
                    All
                  </option>

                  <option value="Text">
                    Text
                  </option>

                  <option value="Audio">
                    Audio
                  </option>

                  <option value="Video">
                    Video
                  </option>

                  <option value="AV">
                    AV
                  </option>

                  <option value="AVB">
                    AVB
                  </option>

                </select>

              </div>


              {/* STATUS */}

              <div className="filter-field">

                <label>
                  Status
                </label>

                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value)
                  }
                >

                  <option value="All">
                    All
                  </option>

                  <option value="Draft">
                    Draft
                  </option>

                  <option value="Pending">
                    Pending
                  </option>

                  <option value="Approved">
                    Approved
                  </option>

                  <option value="Rejected">
                    Rejected
                  </option>

                  <option value="Published">
                    Published
                  </option>

                </select>

              </div>


              {/* DATE */}

              <div className="filter-field date-field">

                <label>
                  Date range
                </label>

                <div className="date-range-box">

                  <div className="date-part">

                    <span>▣</span>

                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) =>
                        setFromDate(e.target.value)
                      }
                    />

                  </div>

                  <span className="date-separator">
                    -
                  </span>

                  <div className="date-part">

                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) =>
                        setToDate(e.target.value)
                      }
                    />

                  </div>

                </div>

              </div>


              {/* CLEAR */}

              <button
                className="clear-filter-btn"
                onClick={clearFilters}
              >
                Clear
              </button>

            </div>
          )}


          {/* =========================
              NEWS RESULTS
          ========================= */}

          <div className="news-results-section">

            <div className="news-results-header">

              <div>
                <h2>
                  News Results
                </h2>

                <p>
                  {filteredNews.length} news found
                </p>
              </div>

            </div>


            {/* NEWS LIST */}

            <div className="news-list">

              {filteredNews.length > 0 ? (

                filteredNews.map((news) => (

                  <div
                    className="news-card"
                    key={news.id}
                  >

                    <div className="news-card-left">

                      <div className="news-title-row">

                        <h3>
                          {news.title}
                        </h3>

                        <span
                          className={`status-badge ${news.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {news.status}
                        </span>

                      </div>

                      <div className="news-details">

                        <span>
                          {news.type}
                        </span>

                        <span>
                          •
                        </span>

                        <span>
                          {news.area}
                        </span>

                        <span>
                          •
                        </span>

                        <span>
                          {news.date}
                        </span>

                      </div>

                    </div>


                    <button className="view-news-btn">
                      View
                    </button>

                  </div>

                ))

              ) : (

                <div className="no-news">

                  <div className="no-news-icon">
                    🔍
                  </div>

                  <h3>
                    No news found
                  </h3>

                  <p>
                    Try changing your search or
                    filter options.
                  </p>

                </div>

              )}

            </div>

          </div>

        </div>


        {/* =========================
            RIGHT COLUMN
        ========================= */}

        <div className="dashboard-right">

          {/* =========================
              QUICK STATUS
          ========================= */}

          <div className="quick-status-section">

            <div className="quick-status-header">

              <h2>
                Quick Status
              </h2>

              <span>
                Overview
              </span>

            </div>


            <div className="status-card">

              <div className="status-icon draft">
                📝
              </div>

              <div>
                <h3>
                  Draft
                </h3>

                <p>
                  3 News
                </p>
              </div>

            </div>


            <div className="status-card">

              <div className="status-icon pending">
                ⏳
              </div>

              <div>
                <h3>
                  Pending
                </h3>

                <p>
                  5 News
                </p>
              </div>

            </div>


            <div className="status-card">

              <div className="status-icon approved">
                ✓
              </div>

              <div>
                <h3>
                  Approved
                </h3>

                <p>
                  8 News
                </p>
              </div>

            </div>


            <div className="status-card">

              <div className="status-icon published">
                ◉
              </div>

              <div>
                <h3>
                  Published
                </h3>

                <p>
                  12 News
                </p>
              </div>

            </div>


            <div className="status-card">

              <div className="status-icon rejected">
                !
              </div>

              <div>
                <h3>
                  Rejected
                </h3>

                <p>
                  2 News
                </p>
              </div>

            </div>

          </div>


          {/* =========================
              RECENT NOTIFICATIONS
          ========================= */}

          <div className="notification-section">

            <div className="notification-header">

              <div>

                <h2>
                  Recent Notifications
                </h2>

                <p>
                  Latest updates
                </p>

              </div>

              <button className="view-all-btn">
                View All
              </button>

            </div>


            <div className="notification-list">

              <div className="notification-card unread">

                <div className="notification-icon">
                  ✓
                </div>

                <div className="notification-content">

                  <h3>
                    News Submitted
                  </h3>

                  <p>
                    City Development Update submitted.
                  </p>

                  <span>
                    5 min ago
                  </span>

                </div>

              </div>


              <div className="notification-card unread">

                <div className="notification-icon warning">
                  !
                </div>

                <div className="notification-content">

                  <h3>
                    Correction Required
                  </h3>

                  <p>
                    Correction requested in Traffic Update.
                  </p>

                  <span>
                    25 min ago
                  </span>

                </div>

              </div>


              <div className="notification-card">

                <div className="notification-icon">
                  ✓
                </div>

                <div className="notification-content">

                  <h3>
                    News Approved
                  </h3>

                  <p>
                    Local Sports Event approved.
                  </p>

                  <span>
                    1 hour ago
                  </span>

                </div>

              </div>


              <div className="notification-card">

                <div className="notification-icon">
                  ✓
                </div>

                <div className="notification-content">

                  <h3>
                    News Published
                  </h3>

                  <p>
                    Local Event Report published.
                  </p>

                  <span>
                    2 hours ago
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;
