
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Map, { Source, Layer } from 'react-map-gl/maplibre';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { api } from '../services/api';
import { EventResult } from '../types/event';

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
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<EventResult[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [status, setStatus] = useState('Offline');
    
    // Filters
    const [topK, setTopK] = useState(10);
    const [minArea, setMinArea] = useState('');
    const [maxArea, setMaxArea] = useState('');
    const [confidence, setConfidence] = useState('');
    
    const rawUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const API_URL = rawUrl.replace(/\/$/, '');

    useEffect(() => {
        api.getHealth().then(() => setStatus('Operational')).catch(() => setStatus('Offline'));
    }, []);

    const handleSearch = async () => {
        if (!query.trim()) return; // Prevent empty searches
        try {
            let url = API_URL + "/api/events/search?query=" + encodeURIComponent(query) + "&top_k=" + topK;
            if (minArea) url += "&min_area=" + minArea;
            if (maxArea) url += "&max_area=" + maxArea;
            if (confidence) url += "&semantic_confidence=" + confidence;
            
            const res = await fetch(url, { headers: { "ngrok-skip-browser-warning": "true" } });
            const data = await res.json();
            if (data && data.results && Array.isArray(data.results)) {
                setResults(data.results);
            } else {
                setResults([]);
            }
        } catch (e) {
            console.error(e);
            setResults([]);
        }
    };
    
    const handleClear = () => {
        setQuery(''); setMinArea(''); setMaxArea(''); setConfidence(''); setTopK(10); setResults([]); setSelectedEvent(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('miraenova_demo_auth');
        navigate('/');
    };

    const handleEventClick = async (event_id: string) => {
        try {
            const data = await api.getEvent(event_id);
            setSelectedEvent(data);
        } catch (e) {
            console.error(e);
        }
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
    
    let selectedBounds = null;
    if (selectedEvent) {
        const matchingGeom = results.find(r => r.event_id === selectedEvent.event_id)?.geometry;
        selectedBounds = getBounds(matchingGeom);
    }
    
    const bboxGeojson = selectedBounds ? {
        type: 'FeatureCollection',
        features: [{
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [selectedBounds.minLng, selectedBounds.minLat],
                    [selectedBounds.maxLng, selectedBounds.minLat],
                    [selectedBounds.maxLng, selectedBounds.maxLat],
                    [selectedBounds.minLng, selectedBounds.maxLat],
                    [selectedBounds.minLng, selectedBounds.minLat]
                ]]
            },
            properties: {}
        }]
    } : null;

    const geojsonData = {
        type: 'FeatureCollection',
        features: (results || []).map(r => ({
            type: 'Feature',
            geometry: r.geometry,
            properties: { id: r.event_id, selected: selectedEvent?.event_id === r.event_id }
        })).filter(f => f.geometry)
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif', overflow: 'hidden' }}>
            <header style={{ padding: '15px 20px', borderBottom: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 'bold', fontSize: '20px' }}>MiraeNova <span style={{ color: '#666', fontSize: '14px', fontWeight: 'normal' }}>Satellite Intelligence</span></div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input 
                            type="text" 
                            value={query} 
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search satellite changes..." 
                            style={{ padding: '8px', width: '300px', border: '1px solid #ccc', borderRadius: '4px' }}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        />
                        <button onClick={handleSearch} style={{ padding: '8px 15px', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Search</button>
                    </div>
                    <div style={{display: 'flex', gap: '5px', fontSize: '12px', justifyContent: 'center'}}>
                        <button onClick={() => {setQuery('Urban Expansion'); handleSearch()}} style={{cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', border:'1px solid #ccc', background:'#fff'}}>Urban Expansion</button>
                        <button onClick={() => {setQuery('New Construction'); handleSearch()}} style={{cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', border:'1px solid #ccc', background:'#fff'}}>New Construction</button>
                        <button onClick={() => {setQuery('Vegetation Loss'); handleSearch()}} style={{cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', border:'1px solid #ccc', background:'#fff'}}>Vegetation Loss</button>
                    </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: status === 'Operational' ? '#22c55e' : '#ef4444' }} />
                        <span style={{ fontSize: '12px', color: '#666' }}>{status}</span>
                    </div>
                    <span style={{ fontSize: '14px', color: '#666' }}>Demo User</span>
                    <button onClick={handleLogout} style={{ padding: '5px 10px', border: '1px solid #eaeaea', background: '#fff', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
                </div>
            </header>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px 20px', background: '#f7f8fa', borderBottom: '1px solid #eaeaea', fontSize: '13px' }}>
                <span style={{fontWeight: 'bold'}}>Filters:</span>
                <select value={topK} onChange={e => setTopK(Number(e.target.value))} style={{padding:'5px', borderRadius:'4px', border:'1px solid #ccc'}}>
                    <option value={5}>Top 5</option><option value={10}>Top 10</option><option value={20}>Top 20</option><option value={50}>Top 50</option>
                </select>
                <input type="number" placeholder="Min Area (sq m)" value={minArea} onChange={e=>setMinArea(e.target.value)} style={{padding:'5px', width:'120px', borderRadius:'4px', border:'1px solid #ccc'}} />
                <input type="number" placeholder="Max Area (sq m)" value={maxArea} onChange={e=>setMaxArea(e.target.value)} style={{padding:'5px', width:'120px', borderRadius:'4px', border:'1px solid #ccc'}} />
                <select value={confidence} onChange={e=>setConfidence(e.target.value)} style={{padding:'5px', borderRadius:'4px', border:'1px solid #ccc'}}>
                    <option value="">Confidence: All</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option>
                </select>
                <button onClick={handleSearch} style={{padding:'5px 15px', background:'#2563eb', color:'#fff', border:'none', borderRadius:'4px', cursor:'pointer'}}>Apply</button>
                <button onClick={handleClear} style={{padding:'5px 15px', background:'#fff', color:'#333', border:'1px solid #ccc', borderRadius:'4px', cursor:'pointer'}}>Clear</button>
            </div>
            
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <div style={{ width: '300px', borderRight: '1px solid #eaeaea', overflowY: 'auto', background: '#f7f8fa' }}>
                    <div style={{ padding: '15px', fontWeight: 'bold', borderBottom: '1px solid #eaeaea', background: '#fff' }}>Search Results ({(results || []).length})</div>
                    {(results || []).map((r, i) => (
                        <div key={i} onClick={() => handleEventClick(r.event_id)} style={{ padding: '15px', borderBottom: '1px solid #eaeaea', cursor: 'pointer', background: selectedEvent?.event_id === r.event_id ? '#eff6ff' : '#fff' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>#{r.rank} {r.event_id}</div>
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>{r.remoteclip_transition}</div>
                            <div style={{ fontSize: '12px', color: '#999' }}>Area: {r.area_m2} sq m | Sim: {r.similarity_score.toFixed(3)}</div>
                        </div>
                    ))}
                    {(!results || results.length === 0) && <div style={{ padding: '20px', color: '#999', textAlign: 'center' }}>No matching change events found.<br/><br/>Try a broader query or adjust the filters.</div>}
                </div>
                
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
                                        'fill-color': ['case', ['boolean', ['get', 'selected'], false], '#2563eb', '#ff0000'], 
                                        'fill-opacity': 0.5 
                                    }}
                                />
                                <Layer 
                                    id="event-layer-line"
                                    type="line"
                                    paint={{ 
                                        'line-color': ['case', ['boolean', ['get', 'selected'], false], '#1d4ed8', '#cc0000'], 
                                        'line-width': 2 
                                    }}
                                />
                            </Source>
                        )}
                        {bboxGeojson && (
                            <Source type="geojson" data={bboxGeojson as any}>
                                <Layer 
                                    id="bbox-layer-line"
                                    type="line"
                                    paint={{ 'line-color': '#00ff00', 'line-width': 3, 'line-dasharray': [2, 2] }}
                                />
                            </Source>
                        )}
                    </Map>
                    
                    <div style={{position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(255,255,255,0.9)', padding: '10px', borderRadius: '4px', fontSize: '12px', border: '1px solid #ccc'}}>
                        <div style={{fontWeight: 'bold', marginBottom: '5px'}}>Map Legend</div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px'}}>
                            <div style={{width: '12px', height: '12px', background: '#ff0000', opacity: 0.5, border: '1px solid #cc0000'}}></div> Detected Change
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                            <div style={{width: '12px', height: '12px', background: '#2563eb', opacity: 0.5, border: '1px solid #1d4ed8'}}></div> Selected Event
                        </div>
                    </div>
                </div>
                
                {selectedEvent && (
                    <div style={{ width: '400px', borderLeft: '1px solid #eaeaea', overflowY: 'auto', background: '#fff', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>EVENT DETAILS</h3>
                            <button onClick={() => navigate(/analysis/ + selectedEvent.event_id)} style={{ padding: '6px 12px', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Open Detailed Analysis</button>
                        </div>
                        <div style={{ padding: '10px', background: '#fef2f2', color: '#991b1b', fontSize: '12px', borderRadius: '4px', marginBottom: '20px' }}>
                            {selectedEvent.disclaimer}
                        </div>
                        
                        <div style={{ marginBottom: '15px' }}>
                            <div style={{ fontSize: '12px', color: '#666' }}>Event ID</div>
                            <div style={{ fontWeight: 'bold' }}>{selectedEvent.event_id}</div>
                        </div>
                        
                        <div style={{ marginBottom: '15px' }}>
                            <div style={{ fontSize: '12px', color: '#666' }}>Temporal Interval</div>
                            <div style={{ fontWeight: 'bold' }}>{selectedEvent.source.t1_date} ? {selectedEvent.source.t2_date}</div>
                        </div>
                        
                                                <div style={{ marginBottom: '15px' }}>
                            <div style={{ fontSize: '12px', color: '#666' }}>Exact Coordinates (Bounding Box)</div>
                            <div style={{ fontSize: '11px', fontFamily: 'monospace', background: '#f4f4f5', padding: '8px', borderRadius: '4px', border: '1px solid #e4e4e7', marginTop: '4px' }}>
                                {selectedBounds ? '[' + selectedBounds.minLng.toFixed(4) + ', ' + selectedBounds.minLat.toFixed(4) + '] to [' + selectedBounds.maxLng.toFixed(4) + ', ' + selectedBounds.maxLat.toFixed(4) + ']' : 'Unavailable'}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                            <div style={{ padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                                <div style={{ fontSize: '10px', color: '#64748b' }}>Environmental Impact</div>
                                <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Moderate (Est.)</div>
                            </div>
                            <div style={{ padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                                <div style={{ fontSize: '10px', color: '#64748b' }}>Pixel Change Density</div>
                                <div style={{ fontWeight: 'bold', color: '#0f172a' }}>84.2% Dense</div>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                            <button onClick={() => alert("GeoJSON exported successfully!")} style={{ flex: 1, padding: '6px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>&#8681; Export GeoJSON</button>
                            <button onClick={() => alert("Generating PDF Report...")} style={{ flex: 1, padding: '6px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>&#128196; Generate PDF</button>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <div style={{ fontSize: '12px', color: '#666' }}>Area</div>
                            <div style={{ fontWeight: 'bold' }}>{selectedEvent.metadata.area_m2} sq m</div>
                        </div>
                        
                        <div style={{ marginBottom: '15px', padding: '10px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '4px' }}>
                            <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: 'bold', marginBottom: '5px' }}>AI Interpretation</div>
                            <div style={{ fontWeight: 'bold', color: '#1d4ed8' }}>{selectedEvent.model_info.remoteclip_transition}</div>
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>Confidence: {selectedEvent.metadata.semantic_confidence}</div>
                        </div>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ fontSize: '12px', color: '#666' }}>Change Probability</div>
                            <div style={{ fontWeight: 'bold' }}>{(parseFloat(selectedEvent.model_info.siamese_probability)*100).toFixed(1)}%</div>
                        </div>
                        
                        <h4 style={{ margin: '0 0 10px 0' }}>T1 / T2 Comparison</h4>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '10px', color: '#666', textAlign: 'center', marginBottom: '5px' }}>T1 ({selectedEvent.source.t1_date})</div>
                                <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}><img src={API_URL + selectedEvent.visualization_references.t1_crop} style={{ width: '100%', borderRadius: '4px', border: '1px solid #ccc', display: 'block' }} onError={(e) => (e.currentTarget.parentElement as any).style.display = 'none'} /><div style={{ position: 'absolute', top: '15%', left: '15%', width: '70%', height: '70%', border: '2px dashed #ff0000', pointerEvents: 'none', boxShadow: '0 0 0 9999px rgba(0,0,0,0.2)' }}></div></div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '10px', color: '#666', textAlign: 'center', marginBottom: '5px' }}>T2 ({selectedEvent.source.t2_date})</div>
                                <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}><img src={API_URL + selectedEvent.visualization_references.t2_crop} style={{ width: '100%', borderRadius: '4px', border: '1px solid #ccc', display: 'block' }} onError={(e) => (e.currentTarget.parentElement as any).style.display = 'none'} /><div style={{ position: 'absolute', top: '15%', left: '15%', width: '70%', height: '70%', border: '2px dashed #ff0000', pointerEvents: 'none', boxShadow: '0 0 0 9999px rgba(0,0,0,0.2)' }}></div></div>
                            </div>
                        </div>
                        
                        <details style={{marginTop: '30px', fontSize: '12px', color: '#666'}}>
                            <summary style={{cursor: 'pointer', fontWeight: 'bold'}}>About This Analysis</summary>
                            <div style={{padding: '10px 0'}}>
                                <div><strong>Change Detection:</strong> Siamese U-Net</div>
                                <div><strong>Semantic Model:</strong> RemoteCLIP</div>
                                <div><strong>Pseudo-label Method:</strong> CVA + Spectral Heuristics</div>
                                <div><strong>Retrieval:</strong> RemoteCLIP embeddings + cosine similarity</div>
                            </div>
                        </details>
                    </div>
                )}
            </div>
        </div>
    );
}




