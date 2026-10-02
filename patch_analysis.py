import re

with open('ml_satellite/frontend/src/pages/AnalysisPage.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Add Export Menu State
state_regex = re.compile(r'const \[reviewReason, setReviewReason\] = useState<string>\(\'\'\);')
code = state_regex.sub("const [reviewReason, setReviewReason] = useState<string>('');\n    const [showExportMenu, setShowExportMenu] = useState(false);", code)

# 2. Add handleExport function
export_fn = '''
    const handleExport = (type: string) => {
        window.open(${API_URL}/api/events//export/, '_blank');
        setShowExportMenu(false);
    };
'''
code = code.replace('const handleZoomToChange = () => {', export_fn + '\n    const handleZoomToChange = () => {')

# 3. Add Export Button to Header
header_regex = re.compile(r'<div style=\{\{ display: \'flex\', flexDirection: \'column\', alignItems: \'flex-end\', marginRight: \'10px\' \}\}>')
export_btn = '''
                        <div style={{ position: 'relative', marginRight: '20px' }}>
                            <button onClick={() => setShowExportMenu(!showExportMenu)} style={{ padding: '8px 15px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: '#334155', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                Export / Download ▼
                            </button>
                            {showExportMenu && (
                                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '5px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 1000, width: '200px' }}>
                                    <div onClick={() => handleExport('pdf')} style={{ padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>PDF Report</div>
                                    <div onClick={() => handleExport('csv')} style={{ padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>CSV</div>
                                    <div onClick={() => handleExport('json')} style={{ padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>JSON</div>
                                    <div onClick={() => handleExport('geojson')} style={{ padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>GeoJSON</div>
                                    <div onClick={() => handleExport('png')} style={{ padding: '10px 15px', cursor: 'pointer' }}>Visualization PNG</div>
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '10px' }}>
'''
code = header_regex.sub(export_btn, code)

# 4. Overhaul Review UI
old_review_ui_regex = re.compile(r'case \'review\':\n\s+return \(\n\s+<div style=\{\{ padding: \'30px\' \}\}>.*?</div>\n\s+\);\n\s+case \'metadata\':', re.DOTALL)

new_review_ui = '''case 'review':
                return (
                    <div style={{ padding: '30px' }}>
                        <div style={{ marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                            <h2 style={{ margin: '0 0 5px 0' }}>EVENT REVIEW</h2>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                            <div>
                                <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold' }}>Event ID</div>
                                <div style={{ fontSize: '16px', marginBottom: '15px' }}>{event.event_id}</div>
                                
                                <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold' }}>Current Status</div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: reviewStatus.status.includes('ACCEPTED') ? '#16a34a' : reviewStatus.status.includes('REJECTED') ? '#dc2626' : reviewStatus.status.includes('UNCERTAIN') ? '#d97706' : '#64748b' }}>
                                    ● {reviewStatus.status.replace('_', ' ')}
                                </div>
                            </div>
                            <div>
                                <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold' }}>AI SEMANTIC INTERPRETATION</div>
                                <div style={{ fontSize: '16px', marginBottom: '5px' }}>{event.model_info.remoteclip_transition}</div>
                                <div style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>Confidence: {event.metadata.semantic_confidence}</div>
                                
                                <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold' }}>DETECTED AREA</div>
                                <div style={{ fontSize: '16px' }}>{event.metadata.area_m2} m²</div>
                            </div>
                        </div>
                        
                        <div style={{ marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                            <h3 style={{ margin: '0' }}>REVIEW DECISION</h3>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                            <button onClick={() => setReviewAction('ACCEPT')} style={{ padding: '10px 20px', background: reviewAction === 'ACCEPT' ? '#16a34a' : '#fff', color: reviewAction === 'ACCEPT' ? '#fff' : '#16a34a', border: '1px solid #16a34a', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>✓ Accept Change</button>
                            <button onClick={() => setReviewAction('REJECT')} style={{ padding: '10px 20px', background: reviewAction === 'REJECT' ? '#dc2626' : '#fff', color: reviewAction === 'REJECT' ? '#fff' : '#dc2626', border: '1px solid #dc2626', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>✕ Reject Change</button>
                            <button onClick={() => setReviewAction('UNCERTAIN')} style={{ padding: '10px 20px', background: reviewAction === 'UNCERTAIN' ? '#d97706' : '#fff', color: reviewAction === 'UNCERTAIN' ? '#fff' : '#d97706', border: '1px solid #d97706', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>? Mark Uncertain</button>
                        </div>
                        
                        {reviewAction && (
                            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Reason / Notes</label>
                                    <textarea 
                                        value={reviewReason} 
                                        onChange={(e) => setReviewReason(e.target.value)}
                                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }}
                                        placeholder={reviewAction === 'REJECT' ? 'e.g. Seasonal variation, Cloud artifact...' : 'Optional notes...'}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={submitReview} style={{ padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Submit Review</button>
                                    <button onClick={() => setReviewAction(null)} style={{ padding: '10px 20px', background: '#fff', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                                </div>
                            </div>
                        )}
                        
                        <div style={{ marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                            <h3 style={{ margin: '0' }}>REVIEW HISTORY</h3>
                        </div>
                        
                        {reviewStatus.status !== 'PENDING' ? (
                            <div style={{ padding: '15px', background: '#f1f5f9', borderRadius: '4px' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{new Date(reviewStatus.created_at || Date.now()).toLocaleString()} — Status updated to {reviewStatus.status}</div>
                                <div style={{ color: '#475569' }}>Reviewer: {reviewStatus.reviewer || 'Demo Analyst'}</div>
                                {(reviewStatus.reason || reviewStatus.notes) && <div style={{ marginTop: '5px', color: '#334155' }}>Note: {reviewStatus.reason || reviewStatus.notes}</div>}
                            </div>
                        ) : (
                            <div style={{ color: '#64748b' }}>No review actions recorded yet.</div>
                        )}
                    </div>
                );
            case 'metadata':'''
code = old_review_ui_regex.sub(new_review_ui, code)

with open('ml_satellite/frontend/src/pages/AnalysisPage.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
