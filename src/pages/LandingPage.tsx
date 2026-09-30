import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const [activePreview, setActivePreview] = useState('overview');

    const handleExplore = () => navigate('/login');

    const PreviewTab = ({ id, label }: { id: string, label: string }) => (
        <button 
            onClick={() => setActivePreview(id)}
            style={{
                padding: '10px 20px', background: activePreview === id ? '#000' : '#f8fafc',
                color: activePreview === id ? '#fff' : '#475569',
                border: '1px solid', borderColor: activePreview === id ? '#000' : '#e2e8f0',
                borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
                transition: 'all 0.2s'
            }}>
            {label}
        </button>
    );

    const renderPreviewContent = () => {
        switch(activePreview) {
            case 'overview':
                return (
                    <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', height: '100%', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ width: '80%', height: '200px', background: 'url(https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/15/13760/23322)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'contrast(1.2) brightness(1.1) saturate(1.5)', borderRadius: '8px', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'url(https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/13/3440/5830)', backgroundSize: 'cover' }}></div>
                            <div style={{ position: 'absolute', top: '30%', left: '40%', width: '20%', height: '40%', background: 'rgba(255,0,0,0.4)', border: '2px solid red' }}></div>
                        </div>
                        <h3 style={{ fontSize: '24px', margin: '0 0 10px 0' }}>Identify Meaningful Change</h3>
                        <p style={{ color: '#64748b', maxWidth: '400px' }}>Automatically detect spatial changes across large geographic areas using temporal satellite analysis.</p>
                    </div>
                );
            case 'change-map':
                return (
                    <div style={{ padding: '40px', background: '#f8fafc', height: '100%', borderRadius: '12px', display: 'flex', gap: '20px' }}>
                        <div style={{ flex: 2, background: 'url(https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/15/13760/23322)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'contrast(1.2) brightness(1.1) saturate(1.5)', borderRadius: '8px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'url(https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/14/6880/11660)', backgroundSize: 'cover', transform: 'scale(0.5)', transition: 'transform 2s' }}></div>
                            <div style={{ position: 'absolute', top: '40%', left: '40%', width: '20%', height: '20%', border: '2px dashed #00ff00', boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)' }}></div>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>Detected Area</div>
                                <div style={{ fontWeight: 'bold' }}>27,400 sq m</div>
                            </div>
                            <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>Change Extent</div>
                                <div style={{ fontWeight: 'bold' }}>[77.3, 28.5]</div>
                            </div>
                        </div>
                    </div>
                );
            case 'before-after':
                return (
                    <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', height: '100%', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <h3 style={{ fontSize: '20px', margin: '0 0 20px 0' }}>Compare the same location across time.</h3>
                        <div style={{ display: 'flex', gap: '20px', height: '250px' }}>
                            <div style={{ flex: 1, background: 'url(https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/15/13760/23322)', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '8px', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#fff', padding: '5px 10px', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px' }}>T1 â€” BEFORE</div>
                            </div>
                            <div style={{ flex: 1, background: 'url(https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/15/13760/23322)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'contrast(1.2) brightness(1.1) saturate(1.5)', borderRadius: '8px', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#fff', padding: '5px 10px', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px' }}>T2 â€” AFTER</div>
                            </div>
                        </div>
                    </div>
                );
            case 'ai':
                return (
                    <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', height: '100%', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>RemoteCLIP Semantic Interpretation</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1d4ed8', marginBottom: '30px' }}>Forest / Dense Vegetation <br/>&darr;<br/> Building / Built-up Construction</div>
                        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '15px', borderRadius: '8px', fontSize: '14px', maxWidth: '80%' }}>
                            <strong>Note:</strong> AI interpretation is a candidate semantic interpretation and is not independently ground-truth verified.
                        </div>
                    </div>
                );
            case 'review':
                return (
                    <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', height: '100%', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '20px', margin: '0 0 10px 0' }}>Human-in-the-Loop Validation</h3>
                        <p style={{ color: '#64748b', marginBottom: '30px' }}>Analysts can independently review and validate detected events.</p>
                        
                        <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '30px', borderRadius: '12px', width: '80%' }}>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>Detected Change: <span style={{ color: '#d97706' }}>Pending Review</span></div>
                            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                                <button style={{ padding: '10px 20px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>&#10003; Accept</button>
                                <button style={{ padding: '10px 20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>&#10005; Reject</button>
                                <button style={{ padding: '10px 20px', background: '#d97706', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>? Uncertain</button>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div style={{ fontFamily: 'sans-serif', color: '#0f172a', overflowX: 'hidden' }}>
            {/* Navbar */}
            <nav style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>MiraeNova</div>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <button onClick={handleExplore} style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Login</button>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{ padding: '100px 20px', textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '64px', fontWeight: '900', lineHeight: '1.1', margin: '0 0 20px 0', letterSpacing: '-1.5px' }}>
                    See What Changed.<br/>Understand Why.
                </h1>
                <p style={{ fontSize: '20px', color: '#475569', margin: '0 auto 40px auto', maxWidth: '600px', lineHeight: '1.5' }}>
                    AI-powered satellite intelligence for semantic search and multi-temporal change analysis.
                </p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <button onClick={handleExplore} style={{ padding: '16px 32px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>Explore MiraeNova</button>
                    <button onClick={() => setIsVideoOpen(true)} style={{ padding: '16px 32px', background: '#fff', color: '#000', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        &#9654; Watch How It Works
                    </button>
                </div>
            </section>

            {/* Product Preview Section */}
            <section style={{ padding: '60px 20px', background: '#fff' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#2563eb', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>INTERACTIVE DEMO PREVIEW</div>
                    <h2 style={{ fontSize: '40px', fontWeight: 'bold', margin: '0 0 15px 0', letterSpacing: '-1px' }}>Explore MiraeNova</h2>
                    <p style={{ color: '#475569', fontSize: '18px' }}>From satellite imagery to actionable change intelligence.</p>
                </div>
                
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '30px', flexWrap: 'wrap' }}>
                        <PreviewTab id="overview" label="Overview" />
                        <PreviewTab id="change-map" label="Change Map" />
                        <PreviewTab id="before-after" label="Before / After" />
                        <PreviewTab id="ai" label="AI Analysis" />
                        <PreviewTab id="review" label="Human Review" />
                    </div>
                    
                    <div style={{ height: '450px', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', overflow: 'hidden' }}>
                        {renderPreviewContent()}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section style={{ padding: '80px 20px', background: '#f8fafc' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '40px', fontWeight: 'bold', margin: '0 0 15px 0', letterSpacing: '-1px' }}>How MiraeNova Works</h2>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center', maxWidth: '1200px', margin: '0 auto' }}>
                    {[
                        { step: '01', title: 'SEARCH', desc: 'Search satellite imagery using natural language.' },
                        { step: '02', title: 'DETECT', desc: 'Identify spatial changes across time.' },
                        { step: '03', title: 'LOCALIZE', desc: 'Precisely locate detected change regions.' },
                        { step: '04', title: 'INTERPRET', desc: 'Generate candidate semantic interpretations using AI.' },
                        { step: '05', title: 'REVIEW', desc: 'Allow analysts to accept, reject, or mark changes uncertain.' }
                    ].map((s, i) => (
                        <div key={i} style={{ flex: '1 1 200px', background: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                            <div style={{ fontSize: '48px', fontWeight: '900', color: '#e2e8f0', marginBottom: '15px' }}>{s.step}</div>
                            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{s.title}</h3>
                            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>{s.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Interactive Pipeline */}
            <section style={{ padding: '80px 20px', background: '#fff', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '40px' }}>Automated Analysis Pipeline</h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', color: '#475569', fontSize: '14px', fontWeight: 'bold' }}>
                        <div style={{ padding: '10px 20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>Sentinel-2</div>
                        <div>&#8594;</div>
                        <div style={{ padding: '10px 20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>Preprocessing</div>
                        <div>&#8594;</div>
                        <div style={{ padding: '10px 20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>Change Detection</div>
                        <div>&#8594;</div>
                        <div style={{ padding: '10px 20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>Change Region</div>
                        <div>&#8594;</div>
                        <div style={{ padding: '10px 20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>RemoteCLIP</div>
                        <div>&#8594;</div>
                        <div style={{ padding: '10px 20px', background: '#eff6ff', color: '#2563eb', borderRadius: '8px', border: '1px solid #bfdbfe' }}>Semantic Interpretation</div>
                        <div>&#8594;</div>
                        <div style={{ padding: '10px 20px', background: '#f0fdf4', color: '#16a34a', borderRadius: '8px', border: '1px solid #bbf7d0' }}>Human Review</div>
                    </div>
                </div>
            </section>

            {/* From Pixels to Intelligence */}
            <section style={{ padding: '80px 20px', background: '#0f172a', color: '#fff' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '40px', fontWeight: 'bold', margin: '0 0 15px 0', letterSpacing: '-1px' }}>From Pixels to Intelligence</h2>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'center', maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ flex: '1 1 300px', textAlign: 'center' }}>
                        <div style={{ width: '100%', height: '200px', background: 'url(https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/14/6880/11661)', backgroundSize: 'cover', borderRadius: '12px', marginBottom: '20px' }}></div>
                        <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>RAW SATELLITE DATA</h3>
                        <p style={{ color: '#94a3b8', fontSize: '14px' }}>Multispectral temporal feeds.</p>
                    </div>
                    <div style={{ flex: '1 1 300px', textAlign: 'center' }}>
                        <div style={{ width: '100%', height: '200px', background: 'url(https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/14/6880/11661)', backgroundSize: 'cover', borderRadius: '12px', marginBottom: '20px', border: '2px solid #ef4444', position: 'relative' }}><div style={{ position: 'absolute', top: '30%', left: '30%', width: '40%', height: '40%', background: 'rgba(239,68,68,0.4)' }}></div></div>
                        <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>DETECTED CHANGE</h3>
                        <p style={{ color: '#94a3b8', fontSize: '14px' }}>Algorithmic anomaly localization.</p>
                    </div>
                    <div style={{ flex: '1 1 300px', textAlign: 'center' }}>
                        <div style={{ width: '100%', height: '200px', background: 'url(https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/14/6880/11661)', backgroundSize: 'cover', borderRadius: '12px', marginBottom: '20px', border: '2px solid #3b82f6', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ background: '#3b82f6', color: '#fff', padding: '5px 10px', borderRadius: '4px', fontWeight: 'bold', fontSize: '14px' }}>Building / Built-up</div></div>
                        <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>SEMANTIC INTELLIGENCE</h3>
                        <p style={{ color: '#94a3b8', fontSize: '14px' }}>AI-driven contextual transition.</p>
                    </div>
                </div>
            </section>

            {/* Technology Section */}
            <section style={{ padding: '80px 20px', background: '#f8fafc' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '40px', fontWeight: 'bold', margin: '0 0 15px 0', letterSpacing: '-1px' }}>Built for Geospatial Intelligence</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ margin: '0 0 10px 0' }}>Sentinel-2</h3>
                        <p style={{ color: '#64748b', fontSize: '14px' }}>Multispectral satellite imagery.</p>
                    </div>
                    <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ margin: '0 0 10px 0' }}>Siamese U-Net</h3>
                        <p style={{ color: '#64748b', fontSize: '14px' }}>Temporal change detection.</p>
                    </div>
                    <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ margin: '0 0 10px 0' }}>RemoteCLIP</h3>
                        <p style={{ color: '#64748b', fontSize: '14px' }}>Semantic interpretation and retrieval.</p>
                    </div>
                    <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ margin: '0 0 10px 0' }}>MapLibre + Deck.gl</h3>
                        <p style={{ color: '#64748b', fontSize: '14px' }}>Interactive geospatial visualization.</p>
                    </div>
                    <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ margin: '0 0 10px 0' }}>FastAPI</h3>
                        <p style={{ color: '#64748b', fontSize: '14px' }}>ML/backend service layer.</p>
                    </div>
                    <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ margin: '0 0 10px 0' }}>Human Review</h3>
                        <p style={{ color: '#64748b', fontSize: '14px' }}>Analyst validation workflow.</p>
                    </div>
                </div>
            </section>

            {/* Scientific Transparency */}
            <section style={{ padding: '60px 20px', background: '#fff', textAlign: 'center' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '30px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px' }}>
                    <h3 style={{ fontSize: '20px', margin: '0 0 15px 0', color: '#991b1b' }}>Scientific Transparency</h3>
                    <p style={{ color: '#7f1d1d', margin: 0, lineHeight: '1.6' }}>
                        MiraeNova processes Multispectral Sentinel-2 input using 6-band temporal analysis. 
                        <strong> Important note: </strong> 
                        AI interpretations are candidate interpretations and should not be treated as independently verified ground truth without human validation.
                    </p>
                </div>
            </section>

            {/* Final CTA */}
            <section style={{ padding: '100px 20px', textAlign: 'center', background: '#000', color: '#fff' }}>
                <h2 style={{ fontSize: '48px', fontWeight: '900', margin: '0 0 20px 0', letterSpacing: '-1px' }}>Ready to Explore the Intelligence Layer?</h2>
                <p style={{ fontSize: '20px', color: '#94a3b8', margin: '0 auto 40px auto', maxWidth: '700px' }}>
                    Search, investigate, interpret, and review satellite change events in one workspace.
                </p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <button onClick={handleExplore} style={{ padding: '16px 32px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>Explore MiraeNova</button>
                    <button onClick={() => setIsVideoOpen(true)} style={{ padding: '16px 32px', background: 'transparent', color: '#fff', border: '2px solid #334155', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>Watch Full Demo</button>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '40px 20px', textAlign: 'center', borderTop: '1px solid #e2e8f0', color: '#64748b', fontSize: '14px' }}>
                MiraeNova &copy; 2026. Built for Smart India Hackathon.
            </footer>

            {/* Video Modal */}
            {isVideoOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', justifyContent: 'flex-end', padding: '20px' }}>
                        <button onClick={() => setIsVideoOpen(false)} style={{ background: 'transparent', color: '#fff', border: 'none', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold' }}>&#10005; Close</button>
                    </div>
                    <div style={{ width: '90%', maxWidth: '1000px', aspectRatio: '16/9', background: '#000', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333' }}>
                        <video width="100%" height="100%" controls poster="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/13/3440/5830">
                            {/* Uses a placeholder since real video asset path isn't provided */}
                            <source src="demo-video.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>
            )}
        </div>
    );
}

