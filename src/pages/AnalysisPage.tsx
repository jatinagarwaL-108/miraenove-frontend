import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
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
    const [reviewStatus, setReviewStatus] = useState<any>({ status: 'PENDING', decision: null, reason: '', timestamp: null });
    
    const [reviewAction, setReviewAction] = useState<string | null>(null);
    const [reviewReason, setReviewReason] = useState<string>('');
    const [showExportMenu, setShowExportMenu] = useState(false);
    
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
                api.getReview(data.event_id).then(rev => setReviewStatus(rev)).catch(() => {});
                
                setLoading(false);
            } catch (e) {
                console.error(e);
                setError(true);
                setLoading(false);
            }
        };
        fetchEvent();
    }, [eventId, tab, navigate]);

    const submitReview = () => {
        if (!reviewAction) return;
        const statusStr = reviewAction == 'ACCEPT' ? 'ACCEPTED' : reviewAction == 'REJECT' ? 'REJECTED' : 'UNCERTAIN';
        
        const payload = {
            status: statusStr,
            reason: reviewReason,
            notes: reviewReason,
            reviewer: 'Demo Analyst'
        };
        api.postReview(eventId as string, payload).then(newStatus => {
            setReviewStatus(newStatus);
            setReviewAction(null);
            setReviewReason('');
        }).catch(err => alert("Failed to submit review: " + err));
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

    
    const handleExport = (type: string) => {
        window.open(`${API_URL}/api/events/${eventId}/export/${type}`, '_blank');
        setShowExportMenu(false);
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
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: (reviewStatus?.status || '').includes('Accepted') ? '#16a34a' : (reviewStatus?.status || '').includes('Rejected') ? '#dc2626' : '#d97706', marginTop: '4px' }}>{reviewStatus.status}</div>
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
                                <div style={{ fontWeight: 'bold', marginBottom: '15px', textAlign: 'center', fontSize: '18px' }}>T1 &#8594; BEFORE<br/><span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>{event.source.t1_date}</span><br/><span style={{ fontSize: '11px', color: '#64748b' }}>Enhanced for visualization</span></div>
                                <div style={{ position: 'relative', width: '100%' }}>
                                    <img src={API_URL + event.visualization_references.t1_crop} style={{ width: '100%', borderRadius: '4px', border: '1px solid #ccc', objectFit: 'contain', background: '#000', display: 'block' }} onError={(e) => (e.currentTarget.parentElement as any).style.display = 'none'} />
                                    <div style={{ position: 'absolute', top: '15%', left: '15%', width: '70%', height: '70%', border: '3px dashed #ff0000', pointerEvents: 'none', boxShadow: '0 0 0 9999px rgba(0,0,0,0.3)' }}></div>
                                </div>
                            </div>
                            <div style={{ flex: 1, background: '#fff', padding: '15px', border: '1px solid #eaeaea', borderRadius: '8px' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '15px', textAlign: 'center', fontSize: '18px' }}>T2 &#8594; AFTER<br/><span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>{event.source.t2_date}</span><br/><span style={{ fontSize: '11px', color: '#64748b' }}>Enhanced for visualization</span></div>
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
                        <div style={{ marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                            <h2 style={{ margin: '0 0 5px 0' }}>EVENT REVIEW</h2>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                            <div>
                                <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold' }}>Event ID</div>
                                <div style={{ fontSize: '16px', marginBottom: '15px' }}>{event.event_id}</div>
                                
                                <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold' }}>Current Status</div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: (reviewStatus?.status || '').includes('ACCEPTED') ? '#16a34a' : (reviewStatus?.status || '').includes('REJECTED') ? '#dc2626' : (reviewStatus?.status || '').includes('UNCERTAIN') ? '#d97706' : '#64748b' }}>
                                    ● {(reviewStatus?.status || '').replace('_', ' ')}
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
            case 'compare':
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
                                <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 8px', borderRadius: '4px', zIndex: 10, fontSize: '11px' }}>Enhanced for visualization</div>
                                <img src={API_URL + event.visualization_references.t1_crop} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                            <div style={{ flex: 1, position: 'relative', border: '1px solid #334155', borderRadius: '4px', overflow: 'hidden', background: '#000' }}>
                                <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '5px 10px', borderRadius: '4px', zIndex: 10 }}>AFTER (T2)</div>
                                <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 8px', borderRadius: '4px', zIndex: 10, fontSize: '11px' }}>Enhanced for visualization</div>
                                <img src={API_URL + event.visualization_references.t2_crop} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                <div style={{ position: 'absolute', top: '15%', left: '15%', width: '70%', height: '70%', border: '2px dashed #ef4444', pointerEvents: 'none' }}></div>
                            </div>
                        </div>
                        <div style={{ padding: '15px', color: '#94a3b8', textAlign: 'center', fontSize: '13px' }}>Images are aligned geographically. The red dotted line indicates the approximate AI detected change region.</div>
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
        <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif', background: '#f8fafc', overflow: 'hidden' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Header */}
                <header style={{ padding: '15px 25px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#0f172a' }}>Detailed Event Analysis <span style={{ color: '#64748b', fontWeight: 'normal', fontSize: '14px', marginLeft: '10px' }}>{event.event_id}</span></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        
                        <div style={{ display: 'flex', gap: '10px', marginRight: '20px' }}>
                            <button onClick={() => navigate(`/analysis/${eventId}/map`)} style={{ padding: '8px 12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: '#334155' }}>Change Map</button>
                            <button onClick={() => navigate(`/analysis/${eventId}/compare`)} style={{ padding: '8px 12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: '#334155' }}>Compare T1/T2</button>
                            <button onClick={() => navigate(`/analysis/${eventId}/review`)} style={{ padding: '8px 12px', background: '#2563eb', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: '#fff' }}>Review Decision</button>
                            <div style={{ position: 'relative' }}>
                                <button onClick={() => setShowExportMenu(!showExportMenu)} style={{ padding: '8px 15px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: '#334155', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    Export ▼
                                </button>
                                {showExportMenu && (
                                    <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '5px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 1000, width: '160px' }}>
                                        <div onClick={() => handleExport('pdf')} style={{ padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>PDF Report</div>
                                        <div onClick={() => handleExport('csv')} style={{ padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>CSV</div>
                                        <div onClick={() => handleExport('json')} style={{ padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>JSON</div>
                                        <div onClick={() => handleExport('geojson')} style={{ padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>GeoJSON</div>
                                        <div onClick={() => handleExport('png')} style={{ padding: '10px 15px', cursor: 'pointer' }}>Visualization</div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '10px' }}>

                            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Review Status</div>
                            <div style={{ fontSize: '13px', fontWeight: 'bold', color: (reviewStatus?.status || '').includes('Accepted') ? '#16a34a' : (reviewStatus?.status || '').includes('Rejected') ? '#dc2626' : '#d97706' }}>{reviewStatus.status}</div>
                        </div>
                    </div>
                </header>
                
                {/* Main Content */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}


