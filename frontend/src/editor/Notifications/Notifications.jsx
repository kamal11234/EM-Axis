import { useState } from "react";
import "./Notifications.css";

export default function Notifications() {
  const [filter, setFilter] = useState("All");

  const data = [
    { id: 1, title: "New News Submitted", desc: "Tanavi submitted a new news report: local-road-update.", by: "By Tanavi", time: "Today, 10:30 AM", status: "Unread", icon: "📰", bg: "#dbeafe" },
    { id: 2, title: "News Resubmitted", desc: "A reporter resubmitted news after making the requested corrections.", by: "By Rohan Desai", time: "Today, 9:45 AM", status: "Unread", icon: "🔄", bg: "#ffedd5" },
    { id: 3, title: "News Status Updated", desc: "A news report has been approved by an Editor.", by: "By System", time: "Yesterday, 4:15 PM", status: "Read", icon: "✅", bg: "#dcfce7" },
    { id: 4, title: "News Sent to Output Team", desc: "An approved news report was sent to the Output Team.", by: "By System", time: "Yesterday, 3:30 PM", status: "Read", icon: "👥", bg: "#f3e8ff" },
  ];

  const filtered = filter === "All" ? data : data.filter(d => d.status === filter);

  return (
    <div className="notif-page">
      <div className="notif-header">
        <div>
          <h1>Notifications</h1>
          <p>Stay updated with news submissions and editorial activities.</p>
        </div>
        <button className="mark-btn">✓ Mark All as Read</button>
      </div>

      <div className="notif-stats">
        <div className="stat-card"><span className="stat-icon blue">🔔</span><div><small>Total Notifications</small><b className="orange">24</b></div></div>
        <div className="stat-card"><span className="stat-icon orange-bg">✉️</span><div><small>Unread</small><b className="orange">8</b></div></div>
        <div className="stat-card"><span className="stat-icon green-bg">✅</span><div><small>Read</small><b className="green">16</b></div></div>
      </div>

      <div className="notif-filters">
        <div className="search-box">🔍<input placeholder="Search notifications..." /></div>
        <div className="filter-tabs">
          {["All","Unread","Read"].map(f=>(
            <button key={f} className={filter===f ? "active" : ""} onClick={()=>setFilter(f)}>{f}</button>
          ))}
        </div>
      </div>

      <div className="notif-list">
        {filtered.map(item=>(
          <div key={item.id} className={`notif-item ${item.status==="Unread" ? "unread" : ""}`}>
            <div className="left">
              {item.status==="Unread" && <span className="dot"></span>}
              <span className="n-icon" style={{background:item.bg}}>{item.icon}</span>
              <div>
                <b>{item.title}</b>
                <p>{item.desc}</p>
                <small>{item.by}</small>
              </div>
            </div>
            <div className="right">
              <span className={`badge ${item.status}`}>● {item.status}</span>
              <span className="time">🕒 {item.time}</span>
              <button className="view-btn">View Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}