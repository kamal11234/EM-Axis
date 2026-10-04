import React from "react";
import "./Notifications.css";

const Notifications = () => {
  localStorage.removeItem("em-notifications");
  
  return (
    <div className="notif-wrapper">
      <div className="notif-header">
        <h2>🔔 Notification</h2>
        <span className="mark-read">Mark all as read</span>
      </div>

      <div className="notif-list">
        <div className="notif-card submitted"></div>
        <div className="notif-card review"></div>
        <div className="notif-card approved"></div>
        <div className="notif-card correction"></div>
        <div className="notif-card rejected"></div>
        <div className="notif-card published active"></div>
        <div className="notif-card draft"></div>
        <div className="notif-card resubmitted"></div>
      </div>
    </div>
  );
};

export default Notifications;