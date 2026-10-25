
import React from "react";
import "./dashboard.css";
import bannerImage from "../../assets/banner.jpg";

const stats = [
  { title: "Total News", count: 102, icon: "▤", color: "blue" },
  { title: "Pending Review", count: 18, icon: "◷", color: "yellow" },
  { title: "Under Review", count: 12, icon: "⌕", color: "purple" },
  { title: "Approved", count: 45, icon: "✓", color: "green" },
  { title: "Rejected", count: 5, icon: "✕", color: "red" },
  { title: "Correction Required", count: 7, icon: "↻", color: "orange" },
  { title: "Published", count: 15, icon: "↑", color: "cyan" },
];

const news = [
  {
    slug: "local-road-update",
    reporter: "Tanavi",
    format: "AV",
    date: "15 Oct 2026",
    status: "Pending Review",
    statusClass: "pending",
  },
  {
    slug: "sports-final-report",
    reporter: "Kamal",
    format: "PKG",
    date: "15 Oct 2026",
    status: "Approved",
    statusClass: "approved",
  },
  {
    slug: "education-news-update",
    reporter: "Vaishnavi",
    format: "AVB",
    date: "14 Oct 2026",
    status: "Correction Required",
    statusClass: "correction",
  },
];

const activities = [
  {
    icon: "▤",
    color: "blue",
    title: "New news submitted",
    description: "Tanavi submitted a new news: local-road-update",
    time: "15 Oct 2026, 10:24 AM",
  },
  {
    icon: "✓",
    color: "green",
    title: "News approved",
    description: "Kamal's news sports-final-report was approved by Editor.",
    time: "15 Oct 2026, 09:12 AM",
  },
  {
    icon: "↻",
    color: "orange",
    title: "Sent for correction",
    description: "Vaishnavi's news education-news-update was sent for correction.",
    time: "14 Oct 2026, 04:36 PM",
  },
  {
    icon: "↑",
    color: "purple",
    title: "Sent to output team",
    description: "Tanavi's news local-road-update was sent to the Output Team.",
    time: "14 Oct 2026, 11:20 AM",
  },
];

function Dashboard() {
  return (
    <main className="editor-dashboard">

      {/* Welcome Banner */}
      
<section className="editor-welcome premium-welcome">
  <div className="welcome-glow welcome-glow-one" aria-hidden="true" />
  <div className="welcome-glow welcome-glow-two" aria-hidden="true" />

  <div className="welcome-text premium-welcome-text">
    <span className="welcome-eyebrow">
      <span className="welcome-live-dot" />
      EM-AXIS <span className="welcome-eyebrow-divider">/</span> EDITOR WORKSPACE
    </span>

    <h2>
      Welcome Back,
      <span className="welcome-title-highlight"> Editor!</span>
    </h2>

    <p>
      Your newsroom at a glance. Review stories, manage submissions,
      and keep the news moving.
    </p>

    <div className="welcome-bottom-line">
      <span className="welcome-bottom-mark" />
      <span>YOUR NEWSROOM. YOUR CONTROL.</span>
    </div>
  </div>

  <div className="welcome-image premium-welcome-image">
    <img src={bannerImage} alt="EM-AXIS News Studio" />

    <div className="welcome-image-shade" />

    <div className="welcome-image-label">
      <span className="welcome-label-dot" />
      EDITORIAL DESK
    </div>
  </div>

  <div className="welcome-bottom-accent" aria-hidden="true" />
</section>


      {/* Statistics Cards */}
      <section className="editor-stats" aria-label="News statistics">
        {stats.map((stat) => (
          <article className={`editor-stat-card ${stat.color}`} key={stat.title}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-info">
              <p>{stat.title}</p>
              <h3>{stat.count}</h3>
            </div>
            <span className="stat-arrow">›</span>
          </article>
        ))}
      </section>

      {/* Recent News and Activity */}
      <section className="editor-dashboard-bottom">
        <article className="recent-news-panel">
          <div className="panel-heading">
            <div className="panel-title">
              <span className="heading-icon">▤</span>
              <h3>Recent News Submissions</h3>
            </div>

            <button
              className="view-all-button"
              onClick={() => window.location.assign("/editor/all-news")}
            >
              View All News <span>→</span>
            </button>
          </div>

          <div className="news-table-wrapper">
            <table className="editor-news-table">
              <thead>
                <tr>
                  <th>News Slug</th>
                  <th>Reporter</th>
                  <th>News Format</th>
                  <th>Submission Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {news.map((item) => (
                  <tr key={item.slug}>
                    <td className="news-slug">{item.slug}</td>
                    <td>{item.reporter}</td>
                    <td>{item.format}</td>
                    <td className="news-date">{item.date}</td>
                    <td>
                      <span className={`news-status ${item.statusClass}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="news-view-button"
                        onClick={() =>
                          window.location.assign("/editor/all-news")
                        }
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="recent-activity-panel">
          <div className="activity-heading">
            <span className="heading-icon">◷</span>
            <h3>Recent Activity</h3>
          </div>

          <div className="activity-list">
            {activities.map((activity) => (
              <div className="activity-item" key={activity.title}>
                <span className={`activity-icon ${activity.color}`}>
                  {activity.icon}
                </span>

                <div className="activity-content">
                  <h4>{activity.title}</h4>
                  <p>{activity.description}</p>
                  <span className="activity-time">
                    ◷ &nbsp;{activity.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

export default Dashboard;
