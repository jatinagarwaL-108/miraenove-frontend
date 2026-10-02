import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Map, { Source, Layer, NavigationControl } from 'react-map-gl/maplibre';
import { api } from '../services/api';

const SAT_STYLE = {
    version: 8,
    sources: { esri: { type: 'raster', tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], tileSize: 256 } },
    layers: [{ id: 'esri-satellite', type: 'raster', source: 'esri', minzoom: 0, maxzoom: 22 }]
};

export default function ChangeExplorer() {
    const navigate = useNavigate();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ accepted: true, pending: true, rejected: true, uncertain: true, labels: true });
    
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

    useEffect(() => {
        api.searchEvents('', 1000).then(data => {
            setEvents(data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const filteredEvents = events.filter(e => {
        if (!e.review_status) return filters.pending;
        if (e.review_status.includes('ACCEPTED')) return filters.accepted;
        if (e.review_status.includes('REJECTED')) return filters.rejected;
        if (e.review_status.includes('UNCERTAIN')) return filters.uncertain;
        return filters.pending;
    });

    const geojson = {
        type: 'FeatureCollection',
        features: filteredEvents.filter(e => e.geometry).map(e => ({
            type: 'Feature',
            geometry: e.geometry,
            properties: { 
                id: e.event_id, 
                status: e.review_status || 'PENDING',
                color: e.review_status?.includes('ACCEPTED') ? '#16a34a' : e.review_status?.includes('REJECTED') ? '#dc2626' : e.review_status?.includes('UNCERTAIN') ? '#d97706' : '#3b82f6'
            }
        }))
    };

    const selectedEvent = events.find(e => e.event_id === selectedEventId);

    const onMapClick = (event: any) => {
        const feature = event.features?.[0];
        if (feature) {
            setSelectedEventId(feature.properties.id);
        } else {
            setSelectedEventId(null);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', fontFamily: 'sans-serif' }}>
            <Sidebar />
            
            <div style={{ width: '300px', background: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
                    <h2 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#0f172a' }}>CHANGE EXPLORER</h2>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Explore detected events geographically.</div>
                </div>
                
                <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', marginBottom: '15px' }}>Map Controls</div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#334155' }}>
                            <input type="checkbox" checked={filters.pending} onChange={e => setFilters({...filters, pending: e.target.checked})} />
                            <div style={{ width: 14, height: 14, background: '#3b82f6', borderRadius: '3px' }}></div> Pending ({events.filter(e => !e.review_status || e.review_status === 'PENDING').length})
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#334155' }}>
                            <input type="checkbox" checked={filters.accepted} onChange={e => setFilters({...filters, accepted: e.target.checked})} />
                            <div style={{ width: 14, height: 14, background: '#16a34a', borderRadius: '3px' }}></div> Accepted ({events.filter(e => e.review_status?.includes('ACCEPTED')).length})
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#334155' }}>
                            <input type="checkbox" checked={filters.rejected} onChange={e => setFilters({...filters, rejected: e.target.checked})} />
                            <div style={{ width: 14, height: 14, background: '#dc2626', borderRadius: '3px' }}></div> Rejected ({events.filter(e => e.review_status?.includes('REJECTED')).length})
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#334155' }}>
                            <input type="checkbox" checked={filters.uncertain} onChange={e => setFilters({...filters, uncertain: e.target.checked})} />
                            <div style={{ width: 14, height: 14, background: '#d97706', borderRadius: '3px' }}></div> Uncertain ({events.filter(e => e.review_status?.includes('UNCERTAIN')).length})
                        </label>
                        
                        <div style={{ borderTop: '1px solid #e2e8f0', margin: '10px 0' }}></div>
                        
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#334155' }}>
                            <input type="checkbox" checked={filters.labels} onChange={e => setFilters({...filters, labels: e.target.checked})} />
                            Show Event Labels
                        </label>
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, position: 'relative' }}>
                {loading ? <div style={{ padding: '20px', color: '#0f172a', fontWeight: 'bold' }}>Loading Geospatial Intelligence...</div> : (
                    <Map 
                        initialViewState={{ longitude: 35.0, latitude: 31.5, zoom: 6 }} 
                        mapStyle={SAT_STYLE as any}
                        onClick={onMapClick}
                        interactiveLayerIds={['changes-fill']}
                        cursor="pointer"
                    >
                        <NavigationControl position="top-right" />
                        <Source type="geojson" data={geojson as any}>
                            <Layer id="changes-fill" type="fill" paint={{ 'fill-color': ['get', 'color'], 'fill-opacity': 0.5 }} />
                            <Layer id="changes-line" type="line" paint={{ 'line-color': ['get', 'color'], 'line-width': 2 }} />
                            {filters.labels && <Layer id="changes-label" type="symbol" layout={{ 'text-field': ['get', 'id'], 'text-size': 13, 'text-anchor': 'bottom', 'text-offset': [0, -1] }} paint={{ 'text-color': '#fff', 'text-halo-color': '#000', 'text-halo-width': 2 }} />}
                        </Source>
                    </Map>
                )}

                {selectedEvent && (
                    <div style={{ position: 'absolute', bottom: 30, left: 30, background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', width: '350px', zIndex: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>{selectedEvent.event_id}</h3>
                            <button onClick={() => setSelectedEventId(null)} style={{ background: 'transparent', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px', fontSize: '13px', color: '#475569' }}>
                            <div><span style={{ color: '#94a3b8', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>T1 Date</span> {selectedEvent.t1_date}</div>
                            <div><span style={{ color: '#94a3b8', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>T2 Date</span> {selectedEvent.t2_date}</div>
                            <div><span style={{ color: '#94a3b8', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Detected Area</span> {selectedEvent.area_m2} m²</div>
                            <div><span style={{ color: '#94a3b8', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Confidence</span> {selectedEvent.semantic_confidence}</div>
                        </div>
                        
                        <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0', marginBottom: '15px', fontSize: '13px', color: '#0f172a', fontWeight: '500' }}>
                            {selectedEvent.remoteclip_transition}
                        </div>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            <button onClick={() => navigate(`/analysis/${selectedEvent.event_id}/overview`)} style={{ flex: '1 1 45%', padding: '8px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Open Analysis</button>
                            <button onClick={() => navigate(`/compare/${selectedEvent.event_id}`)} style={{ flex: '1 1 45%', padding: '8px', background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Compare</button>
                            <button onClick={() => navigate(`/analysis/${selectedEvent.event_id}/review`)} style={{ flex: '1 1 45%', padding: '8px', background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Review</button>
                            <button onClick={() => navigate(`/reports?event_id=${selectedEvent.event_id}`)} style={{ flex: '1 1 45%', padding: '8px', background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Report</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
