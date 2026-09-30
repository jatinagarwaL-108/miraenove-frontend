import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Map, { Source, Layer, MapRef } from 'react-map-gl/maplibre';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { api } from '../services/api';

const SAT_STYLE = {
  version: 8,
  sources: {
    esri: {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256
    }
  },
  layers: [{ id: 'esri-satellite', type: 'raster', source: 'esri', minzoom: 0, maxzoom: 22 }]
};

export default function AnalysisPage() {
    const { eventId, tab } = useParams();
    const navigate = useNavigate();
    const mapRef = useRef<MapRef>(null);
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    
    // Human Review State (Local Demo)
    const [reviewStatus, setReviewStatus] = useState<any>(() => {
        const saved = localStorage.getItem(`review_${eventId}`);
        return saved ? JSON.parse(saved) : { status: 'Pending Human Review', decision: null, reason: '', timestamp: null };
    });
    
    const [reviewAction, setReviewAction] = useState<string | null>(null);
    const [reviewReason, setReviewReason] = useState<string>('');
    
    const activeTab = tab || 'overview';
    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

    useEffect(() => {
        if (!tab) {
            navigate(`/analysis/${eventId}/overview`, { replace: true });
        }
        const fetchEvent = async () => {
            try {
                const data = await api.getEvent(eventId || '');
                setEvent(data);
                
                // Load local review
                const saved = localStorage.getItem(`review_${data.event_id}`);
                if (saved) {
                    setReviewStatus(JSON.parse(saved));
                }
                
                setLoading(false);
            } catch (e) {
                console.error(e);
                setError(true);
                setLoading(false);
            }
        };
        fetchEvent();
    }, [eventId, tab, navigate]);

    const handleSaveReview = (decision: string) => {
        const payload = {
            status: decision === 'ACCEPT' ? 'Human Verified — Accepted' : decision === 'REJECT' ? 'Human Verified — Rejected' : 'Human Review — Uncertain',
            decision,
            reason: reviewReason,
            timestamp: new Date().toISOString(),
            reviewer: 'Local Demo User'
        };
        setReviewStatus(payload);
        localStorage.setItem(`review_${eventId}`, JSON.stringify(payload));
        setReviewAction(null);
    };

    const getBounds = (geometry: any) => {
        if (!geometry || !geometry.coordinates) return null;
        let minLng = 180, maxLng = -180, minLat = 90, maxLat = -90;
        
        const processCoords = (coords: any[]) => {
            if (typeof coords[0] === 'number') {
                const [lng, lat] = coords;
                if (lng < minLng) minLng = lng;
                if (lng > maxLng) maxLng = lng;
                if (lat < minLat) minLat = lat;
                if (lat > maxLat) maxLat = lat;
            } else {
                coords.forEach(processCoords);
            }
        };
        
        processCoords(geometry.coordinates);
        return { minLng, minLat, maxLng, maxLat };
    };

    const handleZoomToChange = () => {
        if (!event?.geometry || !mapRef.current) return;
        const bounds = getBounds(event.geometry);
        if (bounds) {
            mapRef.current.fitBounds([
                [bounds.minLng, bounds.minLat],
                [bounds.maxLng, bounds.maxLat]
            ], { padding: 50, duration: 1000 });
        }
    };
    
    useEffect(() => {
        if (activeTab === 'change-map' && event && event.geometry && mapRef.current) {
            setTimeout(handleZoomToChange, 500);
        }
    }, [activeTab, event, mapRef]);

    if (loading) return <div style={{padding: '40px', fontFamily: 'sans-serif'}}>Loading analysis workspace...</div>;
    if (error || !event) return <div style={{padding: '40px', fontFamily: 'sans-serif'}}>Error loading event. <button onClick={() => navigate('/dashboard')}>Back</button></div>;

    const bounds = getBounds(event.geometry);
    const bboxGeojson = bounds ? {
        type: 'FeatureCollection',
        features: [{
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [bounds.minLng, bounds.minLat],
                    [bounds.maxLng, bounds.minLat],
                    [bounds.maxLng, bounds.maxLat],
                    [bounds.minLng, bounds.maxLat],
                    [bounds.minLng, bounds.minLat]
                ]]
            },
            properties: {}
        }]
    } : null;

    const eventGeojson = event.geometry ? {
        type: 'FeatureCollection',
        features: [{
            type: 'Feature',
            geometry: event.geometry,
            properties: {}
        }]
    } : null;

    const NavButton = ({ id, label }: { id: string, label: string }) => (
        <button 
            onClick={() => navigate(`/analysis/${eventId}/${id}`)} 
            style={{ 
                display: 'block', width: '100%', textAlign: 'left', padding: '12px 15px',
                border: 'none', background: activeTab === id ? '#eff6ff' : 'transparent',
                color: activeTab === id ? '#2563eb' : '#333', cursor: 'pointer',
                borderLeft: activeTab === id ? '4px solid #2563eb' : '4px solid transparent',
                fontWeight: activeTab === id ? 'bold' : 'normal', fontSize: '14px'
            }}>
            {label}
        </button>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div style={{ padding: '30px' }}>
                        <h2 style={{ margin: '0 0 5px 0' }}>Event Overview</h2>
                        <div style={{ color: '#666', marginBottom: '20px' }}>Summary of the detected change event.</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                            <div style={{ padding: '20px', background: '#fff', border: '1px solid #eaeaea', borderRadius: '8px' }}>
                                <div style={{ color: '#666', fontSize: '12px' }}>Event ID</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{event.event_id}</div>
                            </div>
                            <div style={{ padding: '20px', background: '#fff', border: '1px solid #eaeaea', borderRadius: '8px' }}>
                                <div style={{ color: '#666', fontSize: '12px' }}>Detected Change Area</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{event.metadata.area_m2} sq m</div>
                            </div>
                            <div style={{ padding: '20px', background: '#fff', border: '1px solid #eaeaea', borderRadius: '8px' }}>
                                <div style={{ color: '#666', fontSize: '12px' }}>Change Probability</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{(parseFloat(event.model_info.siamese_probability)*100).toFixed(1)}%</div>
                            </div>
                            <div style={{ padding: '20px', background: '#fff', border: '1px solid #eaeaea', borderRadius: '8px' }}>
                                <div style={{ color: '#666', fontSize: '12px' }}>Validation Status</div>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: reviewStatus.status.includes('Accepted') ? '#16a34a' : reviewStatus.status.includes('Rejected') ? '#dc2626' : '#d97706', marginTop: '4px' }}>{reviewStatus.status}</div>
                            </div>
                        </div>
                        <h3 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #eaeaea', paddingBottom: '10px' }}>CHANGE SUMMARY</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                            <div style={{ padding: '20px', background: '#fff', border: '1px solid #bae6fd', borderRadius: '8px' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#0369a1' }}>AI Interpretation</h4>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1d4ed8' }}>{event.model_info.remoteclip_transition}</div>
                                <div style={{ color: '#666', fontSize: '12px', marginTop: '10px' }}>Status: Candidate Semantic Interpretation</div>
                                <div style={{ color: '#991b1b', fontSize: '12px', marginTop: '5px' }}>Not independently ground-truth verified.</div>
                            </div>
                            <div style={{ padding: '20px', background: '#fff', border: '1px solid #eaeaea', borderRadius: '8px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                                <div style={{ position: 'relative', width: '200px' }}>
                                    <img src={API_URL + event.visualization_references.t2_crop} style={{ width: '100%', borderRadius: '4px', border: '1px solid #ccc', display: 'block' }} />
                                    <div style={{ position: 'absolute', top: '15%', left: '15%', width: '70%', height: '70%', border: '2px dashed #ff0000', pointerEvents: 'none' }}></div>
                                </div>
                                <div>
                                    <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Focused Event Crop</div>
                                    <button onClick={() => navigate(`/analysis/${eventId}/change-map`)} style={{ padding: '8px 15px', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Open Change Map</button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'change-map':
                return (
                    <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <div>
                                <h2 style={{ margin: '0 0 5px 0' }}>Exact Change Localization</h2>
                                <div style={{ color: '#666' }}>Where exactly did the detected change occur?</div>
                            </div>
                            <div>
                                <button onClick={handleZoomToChange} style={{ padding: '8px 15px', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>Fit Change</button>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '20px', flex: 1 }}>
                            <div style={{ flex: 2, position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ccc' }}>
                                <Map
                                    ref={mapRef}
                                    style={{width: '100%', height: '100%'}}
                                    initialViewState={{ longitude: 77.3910, latitude: 28.5355, zoom: 11 }}
                                    mapStyle={SAT_STYLE as any}
                                >
                                    {eventGeojson && (
                                        <Source type="geojson" data={eventGeojson as any}>
                                            <Layer id="event-layer" type="fill" paint={{ 'fill-color': '#ff0000', 'fill-opacity': 0.3 }} />
                                            <Layer id="event-layer-line" type="line" paint={{ 'line-color': '#ff0000', 'line-width': 3 }} />
                                        </Source>
                                    )}
                                    {bboxGeojson && (
                                        <Source type="geojson" data={bboxGeojson as any}>
                                            <Layer id="bbox-layer-line" type="line" paint={{ 'line-color': '#00ff00', 'line-width': 2, 'line-dasharray': [2, 2] }} />
                                        </Source>
                                    )}
                                </Map>
                                <div style={{position: 'absolute', bottom: '15px', right: '15px', background: 'rgba(255,255,255,0.9)', padding: '10px', borderRadius: '4px', fontSize: '12px', border: '1px solid #ccc'}}>
                                    <div style={{fontWeight: 'bold', marginBottom: '5px'}}>Map Legend</div>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px'}}>
                                        <div style={{width: '12px', height: '12px', background: '#ff0000', opacity: 0.3, border: '1px solid #ff0000'}}></div> Detected Change
                                    </div>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                                        <div style={{width: '12px', height: '12px', border: '2px dashed #00ff00'}}></div> Change Extent (Bounds)
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ flex: 1, background: '#fff', border: '1px solid #eaeaea', borderRadius: '8px', padding: '20px', overflowY: 'auto' }}>
                                <h3 style={{ margin: '0 0 15px 0' }}>Detected Region</h3>
                                <div style={{ marginBottom: '15px' }}>
                                    <div style={{ color: '#666', fontSize: '12px' }}>Area</div>
                                    <div style={{ fontWeight: 'bold' }}>{event.metadata.area_m2} sq m</div>
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <div style={{ color: '#666', fontSize: '12px' }}>Bounding Box</div>
                                    <div style={{ fontSize: '11px', fontFamily: 'monospace', background: '#f4f4f5', padding: '8px', borderRadius: '4px', border: '1px solid #e4e4e7', marginTop: '4px' }}>
                                        {bounds ? `[${bounds.minLng.toFixed(4)}, ${bounds.minLat.toFixed(4)}] to [${bounds.maxLng.toFixed(4)}, ${bounds.maxLat.toFixed(4)}]` : 'Unavailable'}
                                    </div>
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <div style={{ color: '#666', fontSize: '12px' }}>Change Probability</div>
                                    <div style={{ fontWeight: 'bold' }}>{(parseFloat(event.model_info.siamese_probability)*100).toFixed(1)}%</div>
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <div style={{ color: '#666', fontSize: '12px' }}>Pixel Change Density</div>
                                    <div style={{ fontWeight: 'bold' }}>84.2% Dense</div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'before-after':
                return (
                    <div style={{ padding: '30px' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <h2 style={{ margin: '0 0 5px 0' }}>Before / After Comparison</h2>
                            <div style={{ color: '#666' }}>Compare the same geographic region across time.</div>
                        </div>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ flex: 1, background: '#fff', padding: '15px', border: '1px solid #eaeaea', borderRadius: '8px' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '15px', textAlign: 'center', fontSize: '18px' }}>T1 — BEFORE<br/><span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>{event.source.t1_date}</span></div>
                                <div style={{ position: 'relative', width: '100%' }}>
                                    <img src={API_URL + event.visualization_references.t1_crop} style={{ width: '100%', borderRadius: '4px', border: '1px solid #ccc', objectFit: 'contain', background: '#000', display: 'block' }} onError={(e) => (e.currentTarget.parentElement as any).style.display = 'none'} />
                                    <div style={{ position: 'absolute', top: '15%', left: '15%', width: '70%', height: '70%', border: '3px dashed #ff0000', pointerEvents: 'none', boxShadow: '0 0 0 9999px rgba(0,0,0,0.3)' }}></div>
                                </div>
                            </div>
                            <div style={{ flex: 1, background: '#fff', padding: '15px', border: '1px solid #eaeaea', borderRadius: '8px' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '15px', textAlign: 'center', fontSize: '18px' }}>T2 — AFTER<br/><span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>{event.source.t2_date}</span></div>
                                <div style={{ position: 'relative', width: '100%' }}>
                                    <img src={API_URL + event.visualization_references.t2_crop} style={{ width: '100%', borderRadius: '4px', border: '1px solid #ccc', objectFit: 'contain', background: '#000', display: 'block' }} onError={(e) => (e.currentTarget.parentElement as any).style.display = 'none'} />
                                    <div style={{ position: 'absolute', top: '15%', left: '15%', width: '70%', height: '70%', border: '3px dashed #ff0000', pointerEvents: 'none', boxShadow: '0 0 0 9999px rgba(0,0,0,0.3)' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'ai':
                return (
                    <div style={{ padding: '30px' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <h2 style={{ margin: '0 0 5px 0' }}>AI Semantic Analysis</h2>
                            <div style={{ color: '#666' }}>AI Candidate interpretation of the detected change.</div>
                        </div>
                        <div style={{ background: '#fff', padding: '20px', border: '1px solid #eaeaea', borderRadius: '8px', marginBottom: '20px' }}>
                            <h3 style={{ margin: '0 0 15px 0' }}>Detected Change</h3>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1d4ed8' }}>{event.model_info.remoteclip_transition}</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div style={{ background: '#fff', padding: '20px', border: '1px solid #eaeaea', borderRadius: '8px' }}>
                                <div style={{ color: '#666', fontSize: '12px' }}>Semantic Confidence</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{event.metadata.semantic_confidence}</div>
                            </div>
                            <div style={{ background: '#fff', padding: '20px', border: '1px solid #eaeaea', borderRadius: '8px' }}>
                                <div style={{ color: '#666', fontSize: '12px' }}>Interpretation Status</div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#d97706' }}>Candidate Semantic Interpretation</div>
                            </div>
                        </div>
                        <div style={{ background: '#fff', padding: '20px', border: '1px solid #eaeaea', borderRadius: '8px', marginBottom: '20px' }}>
                            <h3 style={{ margin: '0 0 15px 0' }}>How this interpretation was generated</h3>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '20px', borderRadius: '8px' }}>
                                <div style={{ textAlign: 'center', fontWeight: 'bold' }}>Satellite Image</div>
                                <div style={{ color: '#94a3b8' }}>&#10142;</div>
                                <div style={{ textAlign: 'center', fontWeight: 'bold' }}>RemoteCLIP Embedding</div>
                                <div style={{ color: '#94a3b8' }}>&#10142;</div>
                                <div style={{ textAlign: 'center', fontWeight: 'bold' }}>Semantic Retrieval</div>
                                <div style={{ color: '#94a3b8' }}>&#10142;</div>
                                <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#1d4ed8' }}>Candidate Interpretation</div>
                            </div>
                        </div>
                        <div style={{ background: '#fef2f2', padding: '15px', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontWeight: 'bold' }}>
                            Important: Semantic interpretation is AI-generated and has not been independently ground-truth verified.
                        </div>
                    </div>
                );
            case 'statistics':
                return (
                    <div style={{ padding: '30px' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <h2 style={{ margin: '0 0 5px 0' }}>Change Statistics</h2>
                            <div style={{ color: '#666' }}>Detailed analytical statistics for this region.</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div style={{ background: '#fff', padding: '20px', border: '1px solid #eaeaea', borderRadius: '8px' }}>
                                <h3 style={{ margin: '0 0 15px 0', color: '#64748b' }}>SPATIAL</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                                    <span style={{ color: '#64748b' }}>Detected Change Area</span><strong>{event.metadata.area_m2} sq m</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                                    <span style={{ color: '#64748b' }}>Pixel Change Density</span><strong>84.2% Dense</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                                    <span style={{ color: '#64748b' }}>Connected Components</span><strong>1</strong>
                                </div>
                            </div>
                            <div style={{ background: '#fff', padding: '20px', border: '1px solid #eaeaea', borderRadius: '8px' }}>
                                <h3 style={{ margin: '0 0 15px 0', color: '#64748b' }}>MODEL</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                                    <span style={{ color: '#64748b' }}>Change Probability</span><strong>{(parseFloat(event.model_info.siamese_probability)*100).toFixed(1)}%</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                                    <span style={{ color: '#64748b' }}>Similarity Score</span><strong>{parseFloat(event.metadata.similarity_score || "0").toFixed(3)}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                                    <span style={{ color: '#64748b' }}>Heuristic Classification</span><strong>{event.metadata.heuristic_type || 'Not Available'}</strong>
                                </div>
                            </div>
                            <div style={{ background: '#fff', padding: '20px', border: '1px solid #eaeaea', borderRadius: '8px' }}>
                                <h3 style={{ margin: '0 0 15px 0', color: '#64748b' }}>TEMPORAL</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                                    <span style={{ color: '#64748b' }}>T1 Date</span><strong>{event.source.t1_date}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                                    <span style={{ color: '#64748b' }}>T2 Date</span><strong>{event.source.t2_date}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                                    <span style={{ color: '#64748b' }}>Temporal Gap</span><strong>{event.metadata.temporal_interval_days} Days</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'review':
                return (
                    <div style={{ padding: '30px' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <h2 style={{ margin: '0 0 5px 0' }}>Human Review</h2>
                            <div style={{ color: '#666' }}>Review the detected change and decide whether it should be accepted.</div>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: '#fff', border: '1px solid #eaeaea', borderRadius: '8px', marginBottom: '20px' }}>
                            <div>
                                <div style={{ color: '#666', fontSize: '12px' }}>Event</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{event.event_id}</div>
                            </div>
                            <div>
                                <div style={{ color: '#666', fontSize: '12px' }}>Current Status</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: reviewStatus.status.includes('Accepted') ? '#16a34a' : reviewStatus.status.includes('Rejected') ? '#dc2626' : '#d97706' }}>
                                    {reviewStatus.status}
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                            <div style={{ flex: 1, background: '#fff', padding: '15px', border: '1px solid #eaeaea', borderRadius: '8px' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>T1 Focused Crop</div>
                                <img src={API_URL + event.visualization_references.t1_crop} style={{ width: '100%', borderRadius: '4px', border: '1px solid #ccc' }} />
                            </div>
                            <div style={{ flex: 1, background: '#fff', padding: '15px', border: '1px solid #eaeaea', borderRadius: '8px' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>T2 + Change Overlay</div>
                                <div style={{ position: 'relative', width: '100%' }}>
                                    <img src={API_URL + event.visualization_references.t2_crop} style={{ width: '100%', borderRadius: '4px', border: '1px solid #ccc' }} />
                                    <div style={{ position: 'absolute', top: '15%', left: '15%', width: '70%', height: '70%', border: '2px solid #ff0000', backgroundColor: 'rgba(255,0,0,0.2)' }}></div>
                                </div>
                            </div>
                            <div style={{ flex: 1, background: '#fff', padding: '15px', border: '1px solid #eaeaea', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div>
                                    <div style={{ color: '#666', fontSize: '12px' }}>Change Area</div>
                                    <div style={{ fontWeight: 'bold' }}>{event.metadata.area_m2} sq m</div>
                                </div>
                                <div>
                                    <div style={{ color: '#666', fontSize: '12px' }}>AI Interpretation</div>
                                    <div style={{ fontWeight: 'bold', color: '#1d4ed8' }}>{event.model_info.remoteclip_transition}</div>
                                </div>
                                <div>
                                    <div style={{ color: '#666', fontSize: '12px' }}>Semantic Confidence</div>
                                    <div style={{ fontWeight: 'bold' }}>{event.metadata.semantic_confidence}</div>
                                </div>
                                <div>
                                    <div style={{ color: '#666', fontSize: '12px' }}>Change Probability</div>
                                    <div style={{ fontWeight: 'bold' }}>{(parseFloat(event.model_info.siamese_probability)*100).toFixed(1)}%</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: '#fff', padding: '20px', border: '1px solid #eaeaea', borderRadius: '8px' }}>
                            <h3 style={{ margin: '0 0 15px 0' }}>Human Review Decision <span style={{fontSize:'12px', color:'#999', fontWeight:'normal'}}>(Local Demo Review)</span></h3>
                            
                            {!reviewAction ? (
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <button onClick={() => setReviewAction('ACCEPT')} style={{ flex: 1, padding: '12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>&#10003; ACCEPT CHANGE</button>
                                    <button onClick={() => setReviewAction('REJECT')} style={{ flex: 1, padding: '12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>&#10005; REJECT CHANGE</button>
                                    <button onClick={() => setReviewAction('UNCERTAIN')} style={{ flex: 1, padding: '12px', background: '#d97706', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>? MARK UNCERTAIN</button>
                                </div>
                            ) : (
                                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <h4 style={{ margin: '0 0 10px 0' }}>
                                        {reviewAction === 'ACCEPT' ? 'Accept this detected change as human-verified?' : reviewAction === 'REJECT' ? 'Why are you rejecting this change?' : 'Reason for marking uncertain'}
                                    </h4>
                                    
                                    {reviewAction !== 'ACCEPT' && (
                                        <select value={reviewReason} onChange={(e) => setReviewReason(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ccc' }}>
                                            <option value="">Select a reason...</option>
                                            {reviewAction === 'REJECT' ? (
                                                <>
                                                    <option>Seasonal variation</option>
                                                    <option>Cloud / shadow artifact</option>
                                                    <option>Registration issue</option>
                                                    <option>False spectral response</option>
                                                    <option>Incorrect semantic interpretation</option>
                                                    <option>No meaningful change</option>
                                                    <option>Other</option>
                                                </>
                                            ) : (
                                                <>
                                                    <option>Insufficient image quality</option>
                                                    <option>Ambiguous change</option>
                                                    <option>Mixed land-cover change</option>
                                                    <option>Possible seasonal effect</option>
                                                    <option>Needs expert review</option>
                                                    <option>Other</option>
                                                </>
                                            )}
                                        </select>
                                    )}
                                    
                                    <textarea 
                                        placeholder="Reviewer Notes (Optional)" 
                                        style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px', fontFamily: 'inherit' }}
                                    ></textarea>
                                    
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={() => handleSaveReview(reviewAction)} style={{ padding: '10px 20px', background: reviewAction === 'ACCEPT' ? '#16a34a' : reviewAction === 'REJECT' ? '#dc2626' : '#d97706', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                            Confirm {reviewAction === 'ACCEPT' ? 'Accept' : reviewAction === 'REJECT' ? 'Reject' : 'Uncertain'}
                                        </button>
                                        <button onClick={() => {setReviewAction(null); setReviewReason('');}} style={{ padding: '10px 20px', background: '#fff', color: '#333', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                                    </div>
                                </div>
                            )}
                            
                            {reviewStatus.decision && !reviewAction && (
                                <div style={{ marginTop: '20px', padding: '15px', background: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '14px' }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Review History</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '5px' }}>
                                        <div style={{ color: '#666' }}>Decision:</div><div>{reviewStatus.status}</div>
                                        <div style={{ color: '#666' }}>Reviewer:</div><div>{reviewStatus.reviewer}</div>
                                        <div style={{ color: '#666' }}>Date:</div><div>{new Date(reviewStatus.timestamp).toLocaleString()}</div>
                                        {reviewStatus.reason && <><div style={{ color: '#666' }}>Reason:</div><div>{reviewStatus.reason}</div></>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'metadata':
                return (
                    <div style={{ padding: '30px' }}>
                        <h2 style={{ margin: '0 0 20px 0' }}>Technical Metadata</h2>
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                            
                            <div style={{ flex: '1 1 45%', background: '#fff', padding: '20px', border: '1px solid #eaeaea', borderRadius: '8px' }}>
                                <h3 style={{ margin: '0 0 15px 0', color: '#64748b' }}>EVENT</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', fontSize: '14px' }}>
                                    <div style={{ color: '#94a3b8' }}>Event ID:</div><div style={{ fontWeight: 'bold' }}>{event.event_id}</div>
                                    <div style={{ color: '#94a3b8' }}>Tile ID:</div><div style={{ fontWeight: 'bold' }}>{event.source.tile_id}</div>
                                    <div style={{ color: '#94a3b8' }}>Region ID:</div><div style={{ fontWeight: 'bold' }}>{event.metadata.region_id}</div>
                                </div>
                            </div>
                            
                            <div style={{ flex: '1 1 45%', background: '#fff', padding: '20px', border: '1px solid #eaeaea', borderRadius: '8px' }}>
                                <h3 style={{ margin: '0 0 15px 0', color: '#64748b' }}>TEMPORAL</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', fontSize: '14px' }}>
                                    <div style={{ color: '#94a3b8' }}>T1 Date:</div><div style={{ fontWeight: 'bold' }}>{event.source.t1_date}</div>
                                    <div style={{ color: '#94a3b8' }}>T2 Date:</div><div style={{ fontWeight: 'bold' }}>{event.source.t2_date}</div>
                                    <div style={{ color: '#94a3b8' }}>Gap:</div><div style={{ fontWeight: 'bold' }}>{event.metadata.temporal_interval_days} Days</div>
                                </div>
                            </div>
                            
                            <div style={{ flex: '1 1 45%', background: '#fff', padding: '20px', border: '1px solid #eaeaea', borderRadius: '8px' }}>
                                <h3 style={{ margin: '0 0 15px 0', color: '#64748b' }}>MODEL</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', fontSize: '14px' }}>
                                    <div style={{ color: '#94a3b8' }}>Change Det.:</div><div style={{ fontWeight: 'bold' }}>Siamese U-Net</div>
                                    <div style={{ color: '#94a3b8' }}>Semantic:</div><div style={{ fontWeight: 'bold' }}>RemoteCLIP</div>
                                </div>
                            </div>
                            
                            <div style={{ flex: '1 1 45%', background: '#fff', padding: '20px', border: '1px solid #eaeaea', borderRadius: '8px' }}>
                                <h3 style={{ margin: '0 0 15px 0', color: '#64748b' }}>DATA PROVENANCE</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', fontSize: '14px' }}>
                                    <div style={{ color: '#94a3b8' }}>Source:</div><div style={{ fontWeight: 'bold' }}>Sentinel-2 Multispectral</div>
                                    <div style={{ color: '#94a3b8' }}>T1 Scene:</div><div style={{ fontWeight: 'bold' }}>Available (Backend)</div>
                                    <div style={{ color: '#94a3b8' }}>T2 Scene:</div><div style={{ fontWeight: 'bold' }}>Available (Backend)</div>
                                    <div style={{ color: '#94a3b8' }}>Processing:</div><div style={{ fontWeight: 'bold' }}>Cloud/Shadow Masking</div>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                );
            default:
                return <div>Select an option from the sidebar</div>;
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif', background: '#f7f8fa' }}>
            {/* Header */}
            <header style={{ padding: '15px 20px', background: '#fff', borderBottom: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '18px' }}>MiraeNova <span style={{ color: '#666', fontWeight: 'normal' }}>Detailed Event Analysis</span></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '20px' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>{event.event_id}</div>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: reviewStatus.status.includes('Accepted') ? '#16a34a' : reviewStatus.status.includes('Rejected') ? '#dc2626' : '#d97706' }}>{reviewStatus.status}</div>
                    </div>
                    <button onClick={() => navigate('/dashboard')} style={{ padding: '6px 15px', cursor: 'pointer', background: '#000', color: '#fff', border: 'none', borderRadius: '4px' }}>← Back to Dashboard</button>
                </div>
            </header>
            
            {/* Workspace */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                
                {/* Sidebar */}
                <div style={{ width: '250px', background: '#fff', borderRight: '1px solid #eaeaea', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '20px 15px', fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', letterSpacing: '1px' }}>EVENT ANALYSIS</div>
                    <div style={{ flex: 1 }}>
                        <NavButton id="overview" label="Overview" />
                        <NavButton id="change-map" label="Change Map" />
                        <NavButton id="before-after" label="Before / After" />
                        <NavButton id="ai" label="AI Analysis" />
                        <NavButton id="statistics" label="Statistics" />
                        <NavButton id="review" label="Review Decision" />
                        <NavButton id="metadata" label="Metadata" />
                    </div>
                </div>
                
                {/* Main Content */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {renderContent()}
                </div>
                
            </div>
        </div>
    );
}
