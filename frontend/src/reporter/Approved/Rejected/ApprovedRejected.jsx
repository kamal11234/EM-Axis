
import React, { useEffect, useState } from "react";
import "./ApprovedRejected.css";

const CheckNewsStatus = () => {
  const [newsList, setNewsList] = useState([]);

  useEffect(() => {
    // Create News zali ki localStorage madhun automatic yetil
    const data = JSON.parse(localStorage.getItem("emaxis_news") || "[]");
    setNewsList(data);
  }, []);

  const skeleton = Array.from({ length: 8 });

  return (
    <div className="check-status-wrapper">
      <div className="check-header">
        <h2>📋 Approved/ Rejected</h2>
        <div className="search-wrapper">
          <span>🔍</span>
          <input placeholder="Search by News ID, Title" className="search-box" />
        </div>
      </div>

      <div className="table-container">
        <table className="status-table">
          <thead>
            <tr>
              <th>News ID</th>
              <th>News Slug</th>
              <th>Submission Date</th>
              <th>Approved/ Rejected Date</th>
              <th>Editor Name</th>
              <th>News Status</th>
              <th>Reason for Rejection</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {newsList.length === 0
              ? skeleton.map((_, i) => (
                  <tr key={i}>
                    <td></td><td></td><td></td><td></td><td></td>
                    <td><span className={`pill s-${i}`}></span></td>
                    <td></td>
                    <td>
                      <div className="double-action">
                        <span className="pill action-blue"></span>
                        { (i===2 || i===4) && <span className="pill action-green"></span>}
                      </div>
                    </td>
                  </tr>
                ))
              : newsList.map((n) => (
                  <tr key={n.id}>
                    <td>{n.id}</td>
                    <td>{n.slug}</td>
                    <td>{n.submissionDate}</td>
                    <td>{n.approvedDate}</td>
                    <td>{n.editorName}</td>
                    <td><span className={`pill ${n.status}`}>{n.status}</span></td>
                    <td>{n.reason}</td>
                    <td><span className="pill action-blue">View News</span></td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default ApprovedRejected;