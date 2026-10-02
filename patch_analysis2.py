import re

with open('ml_satellite/frontend/src/pages/AnalysisPage.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add Quick Actions to Header
header_regex = r'<div style=\{\{ display: \'flex\', flexDirection: \'column\', alignItems: \'flex-end\', marginRight: \'10px\' \}\}>.*?<div style=\{\{ display: \'flex\', flexDirection: \'column\', alignItems: \'flex-end\', marginRight: \'10px\' \}\}>'

new_header = '''<div style={{ display: 'flex', gap: '10px', marginRight: '20px' }}>
                            <button onClick={() => navigate(/analysis//map)} style={{ padding: '8px 12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: '#334155' }}>
                                Change Map
                            </button>
                            <button onClick={() => navigate(/analysis//compare)} style={{ padding: '8px 12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: '#334155' }}>
                                Compare T1/T2
                            </button>
                            <button onClick={() => navigate(/analysis//review)} style={{ padding: '8px 12px', background: '#2563eb', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: '#fff' }}>
                                Review Decision
                            </button>
                            <div style={{ position: 'relative' }}>
                                <button onClick={() => setShowExportMenu(!showExportMenu)} style={{ padding: '8px 15px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: '#334155', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    Export ▼
                                </button>
                                {showExportMenu && (
                                    <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '5px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 1000, width: '150px' }}>
                                        <div onClick={() => handleExport('pdf')} style={{ padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>PDF Report</div>
                                        <div onClick={() => handleExport('csv')} style={{ padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>CSV</div>
                                        <div onClick={() => handleExport('json')} style={{ padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>JSON</div>
                                        <div onClick={() => handleExport('geojson')} style={{ padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>GeoJSON</div>
                                        <div onClick={() => handleExport('png')} style={{ padding: '10px 15px', cursor: 'pointer' }}>Visualization</div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '10px' }}>'''

code = re.sub(header_regex, new_header, code, flags=re.DOTALL)

# Update the Review History UI to be a Vertical Timeline
history_regex = r'<div style=\{\{ marginBottom: \'20px\', borderBottom: \'2px solid #e2e8f0\', paddingBottom: \'10px\' \}\}>\s+<h3 style=\{\{ margin: \'0\' \}\}>REVIEW HISTORY</h3>.*?</div>\s+\);\s+case \'metadata\':'

new_history = '''<div style={{ marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                            <h3 style={{ margin: '0' }}>REVIEW HISTORY</h3>
                        </div>
                        
                        {(reviewStatus?.status && reviewStatus.status !== 'PENDING') ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: reviewStatus.status.includes('ACCEPTED') ? '#16a34a' : reviewStatus.status.includes('REJECTED') ? '#dc2626' : '#d97706', border: '3px solid #fff', boxShadow: '0 0 0 2px ' + (reviewStatus.status.includes('ACCEPTED') ? '#16a34a' : reviewStatus.status.includes('REJECTED') ? '#dc2626' : '#d97706') }}></div>
                                        <div style={{ width: '2px', height: '100%', background: '#e2e8f0', margin: '5px 0' }}></div>
                                    </div>
                                    <div style={{ paddingBottom: '30px' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#0f172a' }}>{reviewStatus.status}</div>
                                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '5px' }}>{new Date(reviewStatus.created_at || Date.now()).toLocaleString()}</div>
                                        <div style={{ color: '#475569', fontSize: '14px' }}><span style={{ fontWeight: 'bold' }}>Reviewer:</span> {reviewStatus.reviewer || 'Demo Analyst'}</div>
                                        {(reviewStatus.reason || reviewStatus.notes) && (
                                            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', marginTop: '10px', color: '#334155', fontSize: '14px' }}>
                                                {reviewStatus.reason || reviewStatus.notes}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#94a3b8' }}></div>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#64748b' }}>PENDING</div>
                                        <div style={{ fontSize: '13px', color: '#94a3b8' }}>Initial event generated by ML Pipeline</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#94a3b8' }}></div>
                                </div>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#64748b' }}>PENDING</div>
                                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>Waiting for human review.</div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'metadata':'''

code = re.sub(history_regex, new_history, code, flags=re.DOTALL)

with open('ml_satellite/frontend/src/pages/AnalysisPage.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
