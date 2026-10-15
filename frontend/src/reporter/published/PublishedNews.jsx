import { useNavigate } from 'react-router-dom';
export default function ReporterPublished() {
  const navigate = useNavigate();
  const tab = (a) => ({ padding: '8px 16px', borderRadius: '20px', border: '1px solid #2045d6', fontSize: '13px', cursor: 'pointer', background: a ? '#2045d6' : 'white', color: a ? 'white' : '#2045d6' });
  return (
    <div style={{ padding: '20px', background: '#f5f7fb', minHeight: '100vh' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button style={tab(false)} onClick={() => navigate('/draft')}>Draft</button>
        <button style={tab(false)} onClick={() => navigate('/pending')}>Pending News</button>
        <button style={tab(false)} onClick={() => navigate('/submitted')}>Submitted News</button>
        <button style={tab(true)}>Published News</button>
      </div>
      <h2>✅ Published News</h2>
      <div style={{ background: 'white', borderRadius: '12px', marginTop: '15px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr style={{ background: '#dbe6ff', textAlign: 'left' }}><th style={{ padding: '12px' }}>News ID</th><th>News Slug</th><th>Date</th><th>Action</th></tr></thead><tbody><tr><td style={{ padding: '12px' }}>N001</td><td>Election results declared in city</td><td>10-08-2025</td><td>👁️</td></tr></tbody></table>
      </div>
    </div>
  );
}