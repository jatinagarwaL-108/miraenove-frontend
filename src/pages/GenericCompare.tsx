import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { api } from '../services/api';

export default function GenericCompare() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    const [eventData, setEventData] = useState<any>(null);
    const [eventLoading, setEventLoading] = useState(false);

    useEffect(() => {
        if (eventId) {
            setEventLoading(true);
            api.getEvent(eventId).then(data => {
                setEventData(data);
                setEventLoading(false);
            }).catch(() => setEventLoading(false));
        } else {
            setEventData(null);
            handleSearch(); // Load initial events
        }
    }, [eventId]);

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

    if (eventId && eventData) {
        return (
            <div style={{ display: 'flex', height: '100vh', background: '#0f172a', fontFamily: 'sans-serif' }}>
                <Sidebar />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '15px 25px', background: '#1e293b', color: '#fff', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <button onClick={() => navigate('/compare')} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', marginBottom: '5px', padding: 0, fontWeight: 'bold' }}>← Back to Event Selection</button>
                            <h2 style={{ margin: 0, fontSize: '20px' }}>COMPARE IMAGERY <span style={{ color: '#64748b', fontSize: '16px', marginLeft: '10px' }}>{eventId}</span></h2>
                        </div>
                        <div style={{ display: 'flex', gap: '20px', fontSize: '13px' }}>
                            <div><span style={{ color: '#94a3b8', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>T1 Date</span> {eventData.t1_date || eventData.source?.t1_date}</div>
                            <div><span style={{ color: '#94a3b8', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>T2 Date</span> {eventData.t2_date || eventData.source?.t2_date}</div>
                            <div><span style={{ color: '#94a3b8', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Detected Area</span> {eventData.area_m2} m²</div>
                        </div>
                    </div>
                    
                    <div style={{ padding: '15px 25px', background: '#0f172a', display: 'flex', gap: '10px', borderBottom: '1px solid #334155' }}>
                        <button style={{ padding: '8px 15px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Side by Side</button>
                        <button onClick={() => alert('Swipe tool is in development')} style={{ padding: '8px 15px', background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Swipe</button>
                        <button onClick={() => alert('Flicker tool is in development')} style={{ padding: '8px 15px', background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Flicker</button>
                        <button style={{ padding: '8px 15px', background: '#1e293b', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginLeft: 'auto' }}>Show Change Overlay</button>
                        <button onClick={() => navigate(`/analysis/${eventId}/overview`)} style={{ padding: '8px 15px', background: '#fff', color: '#0f172a', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Open Analysis</button>
                    </div>

                    <div style={{ flex: 1, display: 'flex', gap: '15px', padding: '20px' }}>
                        <div style={{ flex: 1, position: 'relative', border: '1px solid #334155', borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
                            <div style={{ position: 'absolute', top: 15, left: 15, background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '6px 12px', borderRadius: '4px', zIndex: 10, fontWeight: 'bold' }}>BEFORE T1</div>
                            <div style={{ position: 'absolute', bottom: 15, right: 15, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 8px', borderRadius: '4px', zIndex: 10, fontSize: '11px' }}>Enhanced for visualization</div>
                            <img src={(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000') + (eventData.visualization_references?.t1_crop || '')} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <div style={{ flex: 1, position: 'relative', border: '1px solid #334155', borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
                            <div style={{ position: 'absolute', top: 15, left: 15, background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '6px 12px', borderRadius: '4px', zIndex: 10, fontWeight: 'bold' }}>AFTER T2</div>
                            <div style={{ position: 'absolute', bottom: 15, right: 15, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 8px', borderRadius: '4px', zIndex: 10, fontSize: '11px' }}>Enhanced for visualization</div>
                            <img src={(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000') + (eventData.visualization_references?.t2_crop || '')} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            <div style={{ position: 'absolute', top: '15%', left: '15%', width: '70%', height: '70%', border: '2px dashed #ef4444', pointerEvents: 'none' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', fontFamily: 'sans-serif' }}>
            <Sidebar />
            <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                <h2 style={{ color: '#0f172a', margin: '0 0 10px 0' }}>COMPARE IMAGERY</h2>
                <div style={{ color: '#64748b', marginBottom: '30px' }}>Compare the before and after satellite imagery for a detected change event.</div>
                
                <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '30px', display: 'flex', gap: '10px' }}>
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        placeholder="Search event ID or semantic query..." 
                        style={{ flex: 1, padding: '10px 15px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '15px' }} 
                    />
                    <button onClick={handleSearch} style={{ padding: '10px 20px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Search</button>
                </div>

                {loading ? (
                    <div>Loading change events...</div>
                ) : events.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>No matching events found.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {events.map(ev => (
                            <div key={ev.event_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#0f172a' }}>{ev.event_id}</div>
                                        <div style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', background: ev.review_status?.includes('ACCEPTED') ? '#dcfce7' : ev.review_status?.includes('REJECTED') ? '#fee2e2' : '#f1f5f9', color: ev.review_status?.includes('ACCEPTED') ? '#166534' : ev.review_status?.includes('REJECTED') ? '#991b1b' : '#475569' }}>
                                            ● {ev.review_status ? ev.review_status.replace('_', ' ') : 'PENDING'}
                                        </div>
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
                                    <button onClick={() => navigate(`/compare/${ev.event_id}`)} style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                        Compare
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
