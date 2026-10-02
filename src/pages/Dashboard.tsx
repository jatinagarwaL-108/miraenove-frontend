import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Map, { Source, Layer } from 'react-map-gl/maplibre';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { api } from '../services/api';
import { EventResult } from '../types/event';
import Sidebar from '../components/Sidebar';

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

export default function Dashboard() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Filter State
    const [query, setQuery] = useState(searchParams.get('query') || '');
    const [topK, setTopK] = useState(Number(searchParams.get('top_k')) || 10);
    const [fromDate, setFromDate] = useState(searchParams.get('start_date') || '');
    const [toDate, setToDate] = useState(searchParams.get('end_date') || '');
    const [minArea, setMinArea] = useState(searchParams.get('min_area') || '');
    const [maxArea, setMaxArea] = useState(searchParams.get('max_area') || '');
    const [confidence, setConfidence] = useState(searchParams.get('confidence') || '');
    const [reviewStatus, setReviewStatus] = useState(searchParams.get('review_status') || 'All');
    const [transition, setTransition] = useState(searchParams.get('transition') || '');
    
    // UI State
    const [results, setResults] = useState<EventResult[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    
    const rawUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const API_URL = rawUrl.replace(/\/$/, '');

    // Synchronize initial URL state if query exists
    useEffect(() => {
        if (searchParams.get('query')) {
            handleSearch(false);
        }
    }, []);

    const handleSearch = async (updateUrl = true) => {
        if (!query.trim()) return;
        
        // Validation
        if (fromDate && toDate && fromDate > toDate) {
            setErrorMsg('From date cannot be later than To date.');
            return;
        }
        
        setErrorMsg('');
        setIsLoading(true);
        setHasSearched(true);
        setSelectedEvent(null);

        if (updateUrl) {
            const params: Record<string, string> = { query, top_k: topK.toString() };
            if (fromDate) params.start_date = fromDate;
            if (toDate) params.end_date = toDate;
            if (minArea) params.min_area = minArea;
            if (maxArea) params.max_area = maxArea;
            if (confidence) params.confidence = confidence;
            if (transition) params.transition = transition;
            setSearchParams(params);
        }

        try {
            const res = await api.searchEvents(
                query, topK, fromDate, toDate, minArea, maxArea, confidence, transition
            );
            setResults(res || []);
        } catch (e) {
            console.error(e);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setQuery('');
        setTopK(10);
        setFromDate('');
        setToDate('');
        setMinArea('');
        setMaxArea('');
        setConfidence('');
        setReviewStatus('All');
        setTransition('');
        setResults([]);
        setHasSearched(false);
        setSelectedEvent(null);
        setErrorMsg('');
        setSearchParams({});
    };

    const handleEventClick = async (eventId: string) => {
        try {
            const data = await api.getEvent(eventId);
            setSelectedEvent(data);
            localStorage.setItem('last_eventId', eventId);
        } catch (e) {
            console.error("Failed to load event details");
        }
    };

    const geojsonData = {
        type: 'FeatureCollection',
        features: (results || []).map(r => ({
            type: 'Feature',
            geometry: r.geometry,
            properties: { id: r.event_id, selected: selectedEvent?.event_id === r.event_id }
        })).filter(f => f.geometry)
    };
    
    // Build active filter summary
    const activeFilters = [];
    if (fromDate || toDate) activeFilters.push('Date: ' + (fromDate || 'Any') + ' - ' + (toDate || 'Any'));
    if (minArea || maxArea) activeFilters.push("Area: " + (minArea || '0') + " - " + (maxArea || 'MAX') + " m²");
    if (confidence) activeFilters.push("Confidence: " + confidence);
    if (reviewStatus !== 'All') activeFilters.push("Review: " + reviewStatus);
    if (transition) activeFilters.push("Transition: " + transition);

    return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif', background: '#f8fafc', overflow: 'hidden' }}>
            <Sidebar />
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <header style={{ padding: '15px 25px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#0f172a' }}>Search & Discover</div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>Demo User</div>
                </header>
                
                {/* Compact Filter Panel */}
                <div style={{ background: '#fff', padding: '15px 25px', borderBottom: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end', fontSize: '12px' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontWeight: 'bold', color: '#475569' }}>SEARCH</label>
                        <input type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && !isLoading && handleSearch()} placeholder="Natural language query..." style={{ padding: '8px', width: '220px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontWeight: 'bold', color: '#475569' }}>TOP K</label>
                        <select value={topK} onChange={e => setTopK(Number(e.target.value))} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#fff' }}>
                            <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontWeight: 'bold', color: '#475569' }}>FROM DATE</label>
                        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#333' }} />
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontWeight: 'bold', color: '#475569' }}>TO DATE</label>
                        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#333' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontWeight: 'bold', color: '#475569' }}>MIN AREA (m²)</label>
                        <input type="number" value={minArea} onChange={e => setMinArea(e.target.value)} placeholder="0" style={{ padding: '8px', width: '100px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontWeight: 'bold', color: '#475569' }}>MAX AREA (m²)</label>
                        <input type="number" value={maxArea} onChange={e => setMaxArea(e.target.value)} placeholder="?" style={{ padding: '8px', width: '100px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontWeight: 'bold', color: '#475569' }}>REVIEW STATUS</label>
                        <select 
                            value={reviewStatus} 
                            onChange={(e) => setReviewStatus(e.target.value)}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            <option value="All">All</option>
                            <option value="PENDING">Pending</option>
                            <option value="ACCEPTED">Accepted</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="UNCERTAIN">Uncertain</option>
                        </select>
                        <label style={{ fontWeight: 'bold', color: '#475569' }}>CONFIDENCE</label>
                        <select value={confidence} onChange={e => setConfidence(e.target.value)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#fff' }}>
                            <option value="">All</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleSearch()} disabled={isLoading} style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: isLoading ? 'not-allowed' : 'pointer', fontWeight: 'bold', opacity: isLoading ? 0.7 : 1 }}>
                            {isLoading ? 'Searching...' : 'Apply Filters'}
                        </button>
                        <button onClick={handleClear} style={{ padding: '8px 16px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}>
                            Clear Filters
                        </button>
                    </div>
                </div>

                {errorMsg && <div style={{ padding: '10px 25px', background: '#fef2f2', color: '#dc2626', fontSize: '13px', borderBottom: '1px solid #fecaca' }}>{errorMsg}</div>}

                {/* Main Content Area */}
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    
                    {/* Results List */}
                    <div style={{ width: '320px', borderRight: '1px solid #e2e8f0', overflowY: 'auto', background: '#fff' }}>
                        <div style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                            <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Search Results ({results.length})</div>
                            {activeFilters.length > 0 && (
                                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '5px', lineHeight: '1.4' }}>
                                    {activeFilters.map((f, i) => <div key={i}>{f}</div>)}
                                </div>
                            )}
                        </div>
                        
                        {isLoading && <div style={{ padding: '30px 20px', color: '#64748b', textAlign: 'center', fontSize: '13px' }}>Searching satellite change events...</div>}
                        
                        {!isLoading && hasSearched && results.length === 0 && (
                            <div style={{ padding: '30px 20px', color: '#64748b', fontSize: '13px' }}>
                                <div style={{ fontWeight: 'bold', color: '#334155', marginBottom: '10px' }}>No matching change events found.</div>
                                <div>Try:</div>
                                <ul style={{ margin: '5px 0 0 15px', padding: 0 }}>
                                    <li>expanding the date range</li>
                                    <li>increasing Top K</li>
                                    <li>removing an area constraint</li>
                                    <li>changing the semantic query</li>
                                </ul>
                            </div>
                        )}

                        {!isLoading && results.map((r, i) => (
                            <div key={i} onClick={() => handleEventClick(r.event_id)} style={{ padding: '15px 20px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', background: selectedEvent?.event_id === r.event_id ? '#eff6ff' : '#fff', transition: 'background 0.2s' }}>
                                <div style={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '5px', fontSize: '14px' }}>#{r.rank} {r.event_id}</div>
                                <div style={{ fontSize: '12px', color: '#475569', marginBottom: '6px', fontWeight: '500' }}>{r.remoteclip_transition}</div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>Area: {r.area_m2} m² | Sim: {r.similarity_score.toFixed(3)}</div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Map Area */}
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Map
                            style={{width: '100%', height: '100%'}}
                            initialViewState={{ longitude: 77.3910, latitude: 28.5355, zoom: 11 }}
                            mapStyle={SAT_STYLE as any}
                        >
                            {geojsonData.features.length > 0 && (
                                <Source type="geojson" data={geojsonData as any}>
                                    <Layer 
                                        id="event-layer"
                                        type="fill"
                                        paint={{ 
                                            'fill-color': ['case', ['boolean', ['get', 'selected'], false], '#2563eb', '#ef4444'], 
                                            'fill-opacity': 0.6 
                                        }}
                                    />
                                    <Layer 
                                        id="event-layer-line"
                                        type="line"
                                        paint={{ 
                                            'line-color': ['case', ['boolean', ['get', 'selected'], false], '#1d4ed8', '#b91c1c'], 
                                            'line-width': 2 
                                        }}
                                    />
                                </Source>
                            )}
                        </Map>
                    </div>

                    {/* Selected Event Sidebar */}
                    {selectedEvent && (
                        <div style={{ width: '380px', borderLeft: '1px solid #e2e8f0', overflowY: 'auto', background: '#fff' }}>
                            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, background: '#fff', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>{selectedEvent.event_id}</h3>
                                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Temporal: {selectedEvent.source.t1_date} ? {selectedEvent.source.t2_date}</div>
                                </div>
                                <button onClick={() => navigate('/analysis/' + selectedEvent.event_id + '/overview')} style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Open Analysis</button>
                            </div>
                            
                            <div style={{ padding: '20px' }}>
                                <div style={{ marginBottom: '20px', padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase' }}>AI Semantic Interpretation</div>
                                    <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '14px' }}>{selectedEvent.model_info.remoteclip_transition}</div>
                                    <div style={{ fontSize: '12px', color: '#475569', marginTop: '6px' }}>Confidence: <span style={{fontWeight: 'bold', color: selectedEvent.metadata.semantic_confidence==='HIGH'?'#16a34a':'#d97706'}}>{selectedEvent.metadata.semantic_confidence}</span></div>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                                    <div style={{ padding: '12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Area (m²)</div>
                                        <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '14px' }}>{selectedEvent.metadata.area_m2}</div>
                                    </div>
                                    <div style={{ padding: '12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Probability</div>
                                        <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '14px' }}>{(parseFloat(selectedEvent.model_info.siamese_probability)*100).toFixed(1)}%</div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '10px' }}>Imagery Comparison</div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '10px', color: '#64748b', textAlign: 'center', marginBottom: '4px', fontWeight: 'bold' }}>T1 BEFORE</div>
                                            <div style={{ position: 'relative', width: '100%', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                                <img src={API_URL + selectedEvent.visualization_references.t1_crop} style={{ width: '100%', display: 'block' }} onError={(e) => (e.currentTarget.parentElement as any).style.display = 'none'} />
                                                <div style={{ position: 'absolute', top: '15%', left: '15%', width: '70%', height: '70%', border: '2px solid rgba(239,68,68,0.5)', pointerEvents: 'none' }}></div>
                                            </div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '10px', color: '#64748b', textAlign: 'center', marginBottom: '4px', fontWeight: 'bold' }}>T2 AFTER</div>
                                            <div style={{ position: 'relative', width: '100%', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                                <img src={API_URL + selectedEvent.visualization_references.t2_crop} style={{ width: '100%', display: 'block' }} onError={(e) => (e.currentTarget.parentElement as any).style.display = 'none'} />
                                                <div style={{ position: 'absolute', top: '15%', left: '15%', width: '70%', height: '70%', border: '2px solid rgba(239,68,68,0.5)', pointerEvents: 'none' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: '10px', background: '#fef2f2', color: '#991b1b', fontSize: '11px', borderRadius: '4px', border: '1px solid #fecaca' }}>
                                    <strong>Note:</strong> {selectedEvent.disclaimer}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

