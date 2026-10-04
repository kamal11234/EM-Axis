import React from 'react'

export default function CheckNewsStatus() {
  return (
    <div style={{ fontFamily: 'Arial', background: '#f5f7fb', minHeight: '100vh' }}>
      <div style={{ background: 'white', display: 'flex', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid #ddd' }}>
        <div style={{ fontWeight: 'bold' }}><span style={{ background: '#1e40af', color: 'white', padding: '4px 8px', borderRadius: '4px', marginRight: '6px' }}>EA</span>EM-AXIS</div>
        <div>👩 Kamal Reporter</div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '200px', background: '#2238a0', color: 'white', minHeight: '90vh', paddingTop: '10px' }}>
          <div style={{ padding: '12px 15px' }}>🏠 Dashboard</div>
          <div style={{ padding: '12px 15px', background: 'rgba(255,255,255,0.2)' }}>📄 Check News Status</div>
          <div style={{ padding: '12px 15px' }}>📰 My News</div>
        </div>
        <div style={{ flex: 1, margin: '10px', background: 'white', borderRadius: '8px', padding: '20px' }}>
          <h3>📰 Check News Status</h3>
          <p style={{ color: '#666' }}>Search by News ID, Title, Category, Status to see current status.</p>
          <input placeholder="Enter News ID..." style={{ padding: '8px 12px', width: '300px', borderRadius: '20px', border: '1px solid #ccc', marginTop: '10px' }} />
          <div style={{ marginTop: '20px', padding: '15px', background: '#eef2ff', borderRadius: '8px' }}>
            Example: N001 - Published, N002 - Pending, N003 - Draft
          </div>
        </div>
      </div>
    </div>
  )
}