import "./Draft.css";

export default function Draft() {
  return (
    <div className="wrap">
      <div className="sidebar">
        <div className="logo"><span className="ea">EA</span> EM-AXIS</div>
        <ul>
          <li>🏠 Dashboard</li>
          <li>👤 Profile</li>
          <li>📄 Check News Status</li>
          <li>📰 My News</li>
          <li>🔔 Notification</li>
          <li>⚙️ Setting</li>
        </ul>
      </div>

      <div className="main">
        <div className="top-bar">
          <h2><span>📋</span> Draft</h2>
          <div className="top-controls">
            <div className="search"><span>🔍</span><input placeholder="Search by News ID/Title" /></div>
            <select><option>All Categories</option></select>
            <div className="bell">🔔<i>1</i></div>
            <div className="profile"><b>K</b><div><p>Kamal</p><small>Reporter</small></div></div>
            <div className="count">2</div>
          </div>
        </div>

        <div className="table-card">
          <table>
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
              <tr>
                <td>N009</td>
                <td className="slug"><img src="https://picsum.photos/seed/n9/50/30" /> New Highway project to boost connectivity</td>
                <td>Av</td>
                <td>11-08-2025<br/><span>04:15 PM</span></td>
                <td>12-08-2025<br/><span>10:30 AM</span></td>
                <td><div className="act"><span className="b">👁</span><span className="y">✏</span><span className="r">🗑</span></div></td>
              </tr>
              <tr>
                <td>N010</td>
                <td className="slug"><img src="https://picsum.photos/seed/n10/50/30" /> New education policy brings major changes</td>
                <td>Avb</td>
                <td>08-08-2025<br/><span>01:20 PM</span></td>
                <td>10-08-2025<br/><span>02:45 PM</span></td>
                <td><div className="act"><span className="b">👁</span><span className="y">✏</span><span className="r">🗑</span></div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}