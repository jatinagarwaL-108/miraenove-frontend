import re

with open('ml_satellite/frontend/src/pages/Dashboard.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace the event card mapping with the improved UX
old_card = r'<div key=\{event\.event_id\}.*?</button>\s+</div>\s+</div>'

new_card = '''<div key={event.event_id} style={{ padding: '20px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                        <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '18px' }}>{event.event_id}</div>
                                        <div style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', background: event.review_status?.includes('ACCEPTED') ? '#dcfce7' : event.review_status?.includes('REJECTED') ? '#fee2e2' : '#f1f5f9', color: event.review_status?.includes('ACCEPTED') ? '#166534' : event.review_status?.includes('REJECTED') ? '#991b1b' : '#475569' }}>
                                            ● {event.review_status ? event.review_status.replace('_', ' ') : 'PENDING'}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '30px', color: '#475569', fontSize: '14px', marginBottom: '15px' }}>
                                        <div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>Temporal Window</div>
                                            <div>{event.t1_date} <span style={{ color: '#94a3b8' }}>→</span> {event.t2_date}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>Detected Area</div>
                                            <div>{event.area_m2} m²</div>
                                        </div>
                                    </div>
                                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>AI Interpretation</div>
                                        <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: '500' }}>{event.remoteclip_transition}</div>
                                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>AI Confidence: <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{event.semantic_confidence}</span></div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <button onClick={() => navigate(/analysis//overview)} style={{ padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                        Open Analysis
                                    </button>
                                </div>
                            </div>'''

code = re.sub(old_card, new_card, code, flags=re.DOTALL)

with open('ml_satellite/frontend/src/pages/Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
