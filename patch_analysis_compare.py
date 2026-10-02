import re

with open('ml_satellite/frontend/src/pages/AnalysisPage.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# I will replace case 'metadata': with case 'compare': return ...; case 'metadata':
old_metadata = r"case 'metadata':"

compare_ui = '''case 'compare':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f172a' }}>
                        <div style={{ padding: '15px', background: '#1e293b', color: '#fff', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: '0' }}>Compare T1 / T2</h3>
                            <div style={{ display: 'flex', gap: '15px', fontSize: '13px' }}>
                                <div><span style={{ color: '#94a3b8' }}>T1:</span> {event.t1_date}</div>
                                <div><span style={{ color: '#94a3b8' }}>T2:</span> {event.t2_date}</div>
                            </div>
                        </div>
                        <div style={{ flex: 1, display: 'flex', gap: '10px', padding: '10px' }}>
                            <div style={{ flex: 1, position: 'relative', border: '1px solid #334155', borderRadius: '4px', overflow: 'hidden', background: '#000' }}>
                                <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '5px 10px', borderRadius: '4px', zIndex: 10 }}>BEFORE (T1)</div>
                                <img src={API_URL + event.visualization_references.t1_crop} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                            <div style={{ flex: 1, position: 'relative', border: '1px solid #334155', borderRadius: '4px', overflow: 'hidden', background: '#000' }}>
                                <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '5px 10px', borderRadius: '4px', zIndex: 10 }}>AFTER (T2)</div>
                                <img src={API_URL + event.visualization_references.t2_crop} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                <div style={{ position: 'absolute', top: '15%', left: '15%', width: '70%', height: '70%', border: '2px dashed #ef4444', pointerEvents: 'none' }}></div>
                            </div>
                        </div>
                        <div style={{ padding: '15px', color: '#94a3b8', textAlign: 'center', fontSize: '13px' }}>Images are aligned geographically. The red dotted line indicates the approximate AI detected change region.</div>
                    </div>
                );
            case 'metadata':'''

code = re.sub(old_metadata, compare_ui, code)

with open('ml_satellite/frontend/src/pages/AnalysisPage.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
