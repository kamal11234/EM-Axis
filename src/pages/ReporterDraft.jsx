import { useNavigate } from 'react-router-dom';

export default function ReporterDraft() {
  const navigate = useNavigate();
  const tab = (active) => ({
    padding: '8px 16px', borderRadius: '20px', border: '1px solid #2045d6',
    fontSize: '13px', cursor: 'pointer',
    background: active ? '#2045d6' : 'white',
    color: active ? 'white' : '#2045d6'
  });

  return (
    <div style={{ padding: '20px', background: '#f5f7fb', minHeight: '100vh' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button style={tab(true)}>Draft</button>
        <button style={tab(false)} onClick={() => navigate('/pending')}>Pending News</button>
        <button style={tab(false)} onClick={() => navigate('/submitted')}>Submitted News</button>
        <button style={tab(false)} onClick={() => navigate('/published')}>Published News</button>
      </div>

      <h2>📋 Draft</h2>
      <div style={{ background: 'white', borderRadius: '12px', marginTop: '15px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead><tr style={{ background: '#dbe6ff', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>News ID</th><th>News Slug</th><th>Format</th><th>Created Date</th><th>Last Updated Date</th><th>Action</th>
          </tr></thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: '12px' }}>N009</td><td>New Highway project to boost connectivity</td><td>Av</td><td>11-08-2025 04:15 PM</td><td>12-08-2025 10:30 AM</td><td>👁️ ✏️ 🗑️</td></tr>
            <tr><td style={{ padding: '12px' }}>N010</td><td>New education policy brings major changes</td><td>Avb</td><td>08-08-2025 01:20 PM</td><td>10-08-2025 02:45 PM</td><td>👁️ ✏️ 🗑️</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}