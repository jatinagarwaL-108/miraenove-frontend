import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { api } from '../services/api';


const RecentReports = () => {
    const [reports, setReports] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    
    React.useEffect(() => {
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        fetch(`${API_URL}/api/reports`)
            .then(res => res.json())
            .then(data => { setReports(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, color: '#0f172a' }}>RECENT REPORTS</h3>
                <button onClick={() => window.location.reload()} style={{ background: 'transparent', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }}>Refresh</button>
            </div>
            {loading ? (
                <div style={{ padding: '20px', color: '#64748b' }}>Loading report history...</div>
            ) : reports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No reports generated yet.</div>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>
                            <th style={{ padding: '10px' }}>Date</th>
                            <th style={{ padding: '10px' }}>Event ID</th>
                            <th style={{ padding: '10px' }}>Report Type</th>
                            <th style={{ padding: '10px' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(reports) && reports.map((r, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '14px' }}>
                                <td style={{ padding: '10px', color: '#64748b' }}>{new Date(r.created_at).toLocaleString()}</td>
                                <td style={{ padding: '10px', fontWeight: 'bold' }}>{r.event_id}</td>
                                <td style={{ padding: '10px' }}>{r.report_type}</td>
                                <td style={{ padding: '10px' }}>
                                    <span style={{ padding: '4px 8px', background: '#dcfce7', color: '#166534', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                                        {r.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {!Array.isArray(reports) && (
                            <tr><td colSpan={4} style={{ padding: '10px', textAlign: 'center', color: '#dc2626' }}>Failed to load reports from backend. Please restart FastAPI server.</td></tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default function Reports() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const eventId = searchParams.get('event_id');
    
    const [searchQuery, setSearchQuery] = useState('');
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    const [showEventSelect, setShowEventSelect] = useState(false);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const data = await api.searchEvents(searchQuery, 10);
            setEvents(data);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const handleExport = (type: string) => {
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        window.open(`${API_URL}/api/events/${eventId}/export/${type}`, '_blank');
    };

    if (eventId) {
        return (
            <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', fontFamily: 'sans-serif' }}>
                <Sidebar />
                <div style={{ flex: 1, padding: '40px' }}>
                    <button onClick={() => { setSearchParams({}); setShowEventSelect(false); }} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '15px', padding: 0, fontWeight: 'bold' }}>← Back to Reports</button>
                    <h2 style={{ color: '#0f172a', margin: '0 0 5px 0' }}>EVENT REPORT</h2>
                    <div style={{ color: '#64748b', marginBottom: '30px' }}>Selected Event: <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{eventId}</span></div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <button onClick={() => handleExport('pdf')} style={{ padding: '20px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold', fontSize: '16px', color: '#0f172a' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ padding: '10px', background: '#fee2e2', color: '#dc2626', borderRadius: '6px' }}>PDF</div>
                                <div>
                                    Generate PDF Report
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'normal', marginTop: '4px' }}>Comprehensive visual intelligence report</div>
                                </div>
                            </div>
                        </button>
                        <button onClick={() => handleExport('csv')} style={{ padding: '20px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold', fontSize: '16px', color: '#0f172a' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ padding: '10px', background: '#dcfce7', color: '#16a34a', borderRadius: '6px' }}>CSV</div>
                                <div>
                                    Download CSV
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'normal', marginTop: '4px' }}>Tabular metadata for spreadsheets</div>
                                </div>
                            </div>
                        </button>
                        <button onClick={() => handleExport('json')} style={{ padding: '20px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold', fontSize: '16px', color: '#0f172a' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ padding: '10px', background: '#fef3c7', color: '#d97706', borderRadius: '6px' }}>JSON</div>
                                <div>
                                    Download JSON
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'normal', marginTop: '4px' }}>Raw data for programmatic analysis</div>
                                </div>
                            </div>
                        </button>
                        <button onClick={() => handleExport('geojson')} style={{ padding: '20px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold', fontSize: '16px', color: '#0f172a' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ padding: '10px', background: '#e0e7ff', color: '#4f46e5', borderRadius: '6px' }}>GEO</div>
                                <div>
                                    Download GeoJSON
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'normal', marginTop: '4px' }}>Spatial polygons for GIS software</div>
                                </div>
                            </div>
                        </button>
                        <button onClick={() => handleExport('png')} style={{ padding: '20px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold', fontSize: '16px', color: '#0f172a', gridColumn: '1 / -1' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ padding: '10px', background: '#f3e8ff', color: '#9333ea', borderRadius: '6px' }}>PNG</div>
                                <div>
                                    Download Visualization
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'normal', marginTop: '4px' }}>High-resolution T1/T2 change overview</div>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (showEventSelect) {
        return (
            <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', fontFamily: 'sans-serif' }}>
                <Sidebar />
                <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                    <button onClick={() => setShowEventSelect(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '15px', padding: 0, fontWeight: 'bold' }}>← Back to Reports</button>
                    <h2 style={{ color: '#0f172a', margin: '0 0 10px 0' }}>EVENT SELECTION</h2>
                    <div style={{ color: '#64748b', marginBottom: '30px' }}>Search and select an event to generate a report.</div>
                    
                    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '30px', display: 'flex', gap: '10px' }}>
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            placeholder="Event ID or semantic query..." 
                            style={{ flex: 1, padding: '10px 15px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '15px' }} 
                        />
                        <button onClick={handleSearch} style={{ padding: '10px 20px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Search</button>
                    </div>

                    {loading ? (
                        <div>Loading change events...</div>
                    ) : events.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>No matching events found. Please search.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {events.map(ev => (
                                <div key={ev.event_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#0f172a' }}>{ev.event_id}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '20px', color: '#64748b', fontSize: '13px', marginBottom: '10px' }}>
                                            <div>{ev.t1_date} → {ev.t2_date}</div>
                                            <div>{ev.area_m2} m²</div>
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>
                                            {ev.remoteclip_transition}
                                        </div>
                                    </div>
                                    <div>
                                        <button onClick={() => setSearchParams({ event_id: ev.event_id })} style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                            Generate Report
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', fontFamily: 'sans-serif' }}>
            <Sidebar />
            <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                <h2 style={{ color: '#0f172a', margin: '0 0 5px 0' }}>REPORT CENTER</h2>
                <div style={{ color: '#64748b', marginBottom: '30px' }}>Generate and manage intelligence reports.</div>
                
                <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                    <div style={{ flex: 1, background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '30px' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>EVENT REPORT</h3>
                        <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Analyze one detected event and generate a full multi-page visual intelligence report.</div>
                        <button onClick={() => { setShowEventSelect(true); handleSearch(); }} style={{ padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Select Event</button>
                    </div>
                    
                    <div style={{ flex: 1, background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '30px' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>SEARCH SUMMARY</h3>
                        <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Report on filtered results based on spatial, temporal, and semantic criteria.</div>
                        <button onClick={() => alert('Search summary reports are currently in development for Phase 2.')} style={{ padding: '10px 20px', background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Configure Search</button>
                    </div>
                </div>

                <RecentReports />
            </div>
        </div>
    );
}
