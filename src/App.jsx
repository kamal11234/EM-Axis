import React, { useState } from "react";

export default function App() {
  const [tab, setTab] = useState("Draft");

  const thStyle = { padding: "10px 8px", textAlign: "left", whiteSpace: "nowrap", fontSize: "12px", fontWeight: "700" };
  const tdStyle = { padding: "10px 8px", textAlign: "left", whiteSpace: "nowrap", fontSize: "12px", borderBottom: "1px solid #e2e8f0" };

  return (
    <div style={{ background: "#f2f2f2", minHeight: "100vh", padding: "8px", fontFamily: "Arial" }}>
      <div style={{ background: "white", borderRadius: "6px", display: "flex", minHeight: "95vh", overflow: "hidden", border: "1px solid #e2e8f0" }}>
        
        <div style={{ width: "175px", background: "#1e30c7", padding: "14px 10px", color: "white", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ width: "36px", height: "28px", background: "white", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", color: "#1e30c7", fontSize: "14px" }}>EA</div>
            <b style={{ fontSize: "14px" }}>EM-AXIS</b>
          </div>
          <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "16px", fontWeight: "600" }}>
            <div>🏠 Dashboard</div><div>👤 Profile</div><div>📰 Check News Status</div>
            <div style={{ background: "rgba(255,255,255,0.2)", padding: "6px", borderRadius: "5px" }}>📋 My News</div>
            <div>🔔 Notification</div><div>⚙️ Setting</div>
          </div>
        </div>

        <div style={{ flex: 1, padding: "0px", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "14px", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ position: "relative", fontSize: "22px" }}>🔔<span style={{ position: "absolute", top: "-5px", right: "-5px", background: "red", color: "white", fontSize: "10px", width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>1</span></div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#fbbf24", display: "flex", alignItems: "center", justifyContent: "center" }}>👤</div>
              <div style={{ fontSize: "11px", lineHeight: "13px" }}><b>Kamal</b><br/>Reporter</div>
            </div>
          </div>

          <div style={{ padding: "14px 16px", overflowX: "auto" }}>
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              <button onClick={() => setTab("Draft")} style={{ padding: "8px 18px", borderRadius: "20px", fontSize: "13px", fontWeight: "700", cursor: "pointer", border: tab==="Draft" ? "1px solid #1e30c7" : "1px solid #cbd5e1", background: tab==="Draft" ? "#1e30c7" : "white", color: tab==="Draft" ? "white" : "black" }}>📋 Draft</button>
              <button onClick={() => setTab("Pending")} style={{ padding: "8px 18px", borderRadius: "20px", fontSize: "13px", fontWeight: "700", cursor: "pointer", border: tab==="Pending" ? "1px solid #1e30c7" : "1px solid #cbd5e1", background: tab==="Pending" ? "#1e30c7" : "white", color: tab==="Pending" ? "white" : "black" }}>⏳ Pending</button>
              <button onClick={() => setTab("Submitted")} style={{ padding: "8px 18px", borderRadius: "20px", fontSize: "13px", fontWeight: "700", cursor: "pointer", border: tab==="Submitted" ? "1px solid #1e30c7" : "1px solid #cbd5e1", background: tab==="Submitted" ? "#1e30c7" : "white", color: tab==="Submitted" ? "white" : "black" }}>📤 Submitted</button>
              <button onClick={() => setTab("Published")} style={{ padding: "8px 18px", borderRadius: "20px", fontSize: "13px", fontWeight: "700", cursor: "pointer", border: tab==="Published" ? "1px solid #1e30c7" : "1px solid #cbd5e1", background: tab==="Published" ? "#1e30c7" : "white", color: tab==="Published" ? "white" : "black" }}>✅ Published</button>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h2 style={{ margin: 0, fontSize: "20px" }}>{tab} News</h2>
              <input placeholder="🔍 Search by News ID,Title" style={{ border: "1px solid #94a3b8", borderRadius: "18px", padding: "7px 14px", fontSize: "12px", width: "200px" }} />
            </div>

            {/* TABLE - EKAS LINE MADHE ALIGNMENT FIX */}
            <div style={{ width: "100%", overflowX: "auto" }}>
              {tab==="Draft" && (
                <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                  <colgroup><col style={{ width: "12%" }} /><col style={{ width: "28%" }} /><col style={{ width: "12%" }} /><col style={{ width: "20%" }} /><col style={{ width: "20%" }} /><col style={{ width: "18%" }} /></colgroup>
                  <thead><tr style={{ background: "#dbeafe" }}><th style={thStyle}>News ID</th><th style={thStyle}>News Slug</th><th style={thStyle}>Format</th><th style={thStyle}>Created Date</th><th style={thStyle}>Last Updated Date</th><th style={thStyle}>Action</th></tr></thead>
                  <tbody>
                    <tr><td style={tdStyle}>N009</td><td style={tdStyle}>New Highway project</td><td style={tdStyle}>Av</td><td style={tdStyle}>11-08-2025 04:15 PM</td><td style={tdStyle}>12-08-2025 10:30 AM</td><td style={tdStyle}>👁️ ✏️ 🗑️</td></tr>
                    <tr><td style={tdStyle}>N010</td><td style={tdStyle}>New education policy</td><td style={tdStyle}>Avb</td><td style={tdStyle}>08-08-2025 01:20 PM</td><td style={tdStyle}>10-08-2025 02:45 PM</td><td style={tdStyle}>👁️ ✏️ 🗑️</td></tr>
                  </tbody>
                </table>
              )}

              {tab==="Pending" && (
                <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                  <colgroup><col style={{ width: "10%" }} /><col style={{ width: "22%" }} /><col style={{ width: "10%" }} /><col style={{ width: "16%" }} /><col style={{ width: "10%" }} /><col style={{ width: "12%" }} /><col style={{ width: "10%" }} /><col style={{ width: "10%" }} /></colgroup>
                  <thead><tr style={{ background: "#dbeafe" }}><th style={thStyle}>News ID</th><th style={thStyle}>News Slug</th><th style={thStyle}>Format</th><th style={thStyle}>Submitted Date</th><th style={thStyle}>Location</th><th style={thStyle}>Editor</th><th style={thStyle}>Status</th><th style={thStyle}>Action</th></tr></thead>
                  <tbody>
                    <tr><td style={tdStyle}>N001</td><td style={tdStyle}>City to get New Metro</td><td style={tdStyle}>Av</td><td style={tdStyle}>12-08-2025 10:30 AM</td><td style={tdStyle}>Pune</td><td style={tdStyle}>Rahul Sharma</td><td style={tdStyle}>Pending</td><td style={tdStyle}>👁️ ✏️ 🗑️</td></tr>
                    <tr><td style={tdStyle}>N002</td><td style={tdStyle}>Traffic diversions</td><td style={tdStyle}>Avb</td><td style={tdStyle}>10-08-2025 08:45 AM</td><td style={tdStyle}>Mumbai</td><td style={tdStyle}>Riya Mane</td><td style={tdStyle}>Pending</td><td style={tdStyle}>👁️ ✏️ 🗑️</td></tr>
                    <tr><td style={tdStyle}>N003</td><td style={tdStyle}>Local Festival Sale</td><td style={tdStyle}>one to one</td><td style={tdStyle}>08-08-2025 10:30 PM</td><td style={tdStyle}>Kudal</td><td style={tdStyle}>Priya</td><td style={tdStyle}>Pending</td><td style={tdStyle}>👁️ ✏️ 🗑️</td></tr>
                    <tr><td style={tdStyle}>N004</td><td style={tdStyle}>Traffic Rules</td><td style={tdStyle}>pkg</td><td style={tdStyle}>07-08-2025 12:56 PM</td><td style={tdStyle}>Delhi</td><td style={tdStyle}>Shami Roy</td><td style={tdStyle}>Pending</td><td style={tdStyle}>👁️ ✏️ 🗑️</td></tr>
                  </tbody>
                </table>
              )}

              {tab==="Submitted" && (
                <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                  <colgroup><col style={{ width: "8%" }} /><col style={{ width: "18%" }} /><col style={{ width: "14%" }} /><col style={{ width: "12%" }} /><col style={{ width: "14%" }} /><col style={{ width: "12%" }} /><col style={{ width: "12%" }} /><col style={{ width: "10%" }} /></colgroup>
                  <thead><tr style={{ background: "#dbeafe" }}><th style={thStyle}>News ID</th><th style={thStyle}>News Slug</th><th style={thStyle}>Submission Date</th><th style={thStyle}>Editor Name</th><th style={thStyle}>Last updated</th><th style={thStyle}>News Status</th><th style={thStyle}>Correction</th><th style={thStyle}>Action</th></tr></thead>
                  <tbody>
                    <tr><td style={tdStyle}>N001</td><td style={tdStyle}>City to get metro</td><td style={tdStyle}>12-08-2025 10:30AM</td><td style={tdStyle}>Rahul Sharma</td><td style={tdStyle}>12-08-2025</td><td style={tdStyle}>Pending</td><td style={tdStyle}>--</td><td style={tdStyle}>View</td></tr>
                    <tr><td style={tdStyle}>N003</td><td style={tdStyle}>Heavy rains</td><td style={tdStyle}>11-08-2025 04:40AM</td><td style={tdStyle}>Sneha Patil</td><td style={tdStyle}>11-08-2025</td><td style={tdStyle}>Rejected</td><td style={tdStyle}>Title needs clarity</td><td style={tdStyle}>View</td></tr>
                    <tr><td style={tdStyle}>N005</td><td style={tdStyle}>New health camp</td><td style={tdStyle}>09-08-2025 12:10PM</td><td style={tdStyle}>Priya Nair</td><td style={tdStyle}>09-08-2025</td><td style={tdStyle}>Correction</td><td style={tdStyle}>Incorrect district</td><td style={tdStyle}>View / Edit</td></tr>
                  </tbody>
                </table>
              )}

              {tab==="Published" && (
                <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                  <colgroup><col style={{ width: "10%" }} /><col style={{ width: "22%" }} /><col style={{ width: "12%" }} /><col style={{ width: "16%" }} /><col style={{ width: "10%" }} /><col style={{ width: "12%" }} /><col style={{ width: "8%" }} /><col style={{ width: "10%" }} /></colgroup>
                  <thead><tr style={{ background: "#dbeafe" }}><th style={thStyle}>News ID</th><th style={thStyle}>News Slug</th><th style={thStyle}>Format</th><th style={thStyle}>Created Date</th><th style={thStyle}>Location</th><th style={thStyle}>Editor</th><th style={thStyle}>Status</th><th style={thStyle}>Action</th></tr></thead>
                  <tbody>
                    <tr><td style={tdStyle}>N001</td><td style={tdStyle}>City to get Metro</td><td style={tdStyle}>Av</td><td style={tdStyle}>12-08-2025 10:30 AM</td><td style={tdStyle}>Pune</td><td style={tdStyle}>Rahul Sharma</td><td style={tdStyle}>Published</td><td style={tdStyle}>👁️ ✏️ 🗑️</td></tr>
                    <tr><td style={tdStyle}>N005</td><td style={tdStyle}>New Highway project</td><td style={tdStyle}>Wkt Tiktok</td><td style={tdStyle}>11-08-2025 04:15 PM</td><td style={tdStyle}>Lonavala</td><td style={tdStyle}>Raju Desai</td><td style={tdStyle}>Published</td><td style={tdStyle}>👁️ ✏️ 🗑️</td></tr>
                  </tbody>
                </table>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}