import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

const ICONS = {
    dashboard: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>,
    map: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>,
    compare: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>,
    ai: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10V2z"></path></svg>,
    stats: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>,
    review: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
    metadata: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>,
    history: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
    explorer: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>,
    swipe: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="3" x2="12" y2="21"></line><path d="M8 12h8"></path><path d="M14 10l2 2-2 2"></path><path d="M10 10l-2 2 2 2"></path></svg>,
    report: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
};

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { eventId } = useParams();

    const intelligenceNav = [
        { id: 'dashboard', label: 'Find Changes', icon: ICONS.dashboard, path: '/find-changes' },
        { id: 'reviews', label: 'Review Center', icon: ICONS.review, path: '/review-center' },
        { id: 'explorer', label: 'Change Explorer', icon: ICONS.explorer, path: '/change-explorer' },
        { id: 'compare', label: 'Compare Imagery', icon: ICONS.swipe, path: '/compare' },
        { id: 'reports', label: 'Reports', icon: ICONS.report, path: '/reports' }
    ];
    
    const analysisNav = [
        { id: 'overview', label: 'Overview', icon: ICONS.dashboard, path: eventId ? '/analysis/' + eventId + '/overview' : null },
        { id: 'change-map', label: 'Change Map', icon: ICONS.map, path: eventId ? '/analysis/' + eventId + '/change-map' : null },
        { id: 'compare', label: 'Before / After', icon: ICONS.compare, path: eventId ? '/analysis/' + eventId + '/compare' : null },
        { id: 'ai', label: 'AI Analysis', icon: ICONS.ai, path: eventId ? '/analysis/' + eventId + '/ai' : null },
        { id: 'statistics', label: 'Statistics', icon: ICONS.stats, path: eventId ? '/analysis/' + eventId + '/statistics' : null },
        { id: 'review', label: 'Review Decision', icon: ICONS.review, path: eventId ? '/analysis/' + eventId + '/review' : null },
        { id: 'metadata', label: 'Metadata', icon: ICONS.metadata, path: eventId ? '/analysis/' + eventId + '/metadata' : null }
    ];

    const [health, setHealth] = React.useState('Checking...');

    React.useEffect(() => {
        const checkHealth = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
                const res = await fetch(API_URL + '/api/health');
                if (res.ok) setHealth('Operational');
                else setHealth('Degraded');
            } catch (e) {
                setHealth('Unavailable');
            }
        };
        checkHealth();
    }, []);

    return (
        <div style={{ width: '220px', background: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
                <h1 style={{ fontSize: '20px', margin: '0 0 5px 0', color: '#0f172a' }}>MiraeNova</h1>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Satellite Intelligence</div>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <div style={{ padding: '15px 10px 5px 15px', fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>
                    Intelligence
                </div>
                {intelligenceNav.map(item => {
                    const isActive = location.pathname === item.path || (item.id === 'dashboard' && location.pathname.startsWith('/find-changes')) || (item.id === 'reviews' && location.pathname.startsWith('/review-center'));
                    return (
                        <div 
                            key={item.id}
                            onClick={() => item.path && navigate(item.path)}
                            style={{ 
                                padding: '12px 20px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '12px', 
                                cursor: item.path ? 'pointer' : 'default',
                                background: isActive ? '#f1f5f9' : 'transparent',
                                color: isActive ? '#2563eb' : (item.path ? '#475569' : '#cbd5e1'),
                                borderRight: isActive ? '3px solid #2563eb' : '3px solid transparent',
                                opacity: item.path ? 1 : 0.5
                            }}
                            onMouseOver={(e) => { if(!isActive && item.path) e.currentTarget.style.background = '#f8fafc' }}
                            onMouseOut={(e) => { if(!isActive && item.path) e.currentTarget.style.background = 'transparent' }}
                        >
                            <div style={{ width: '20px', display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
                            <span style={{ fontSize: '14px', fontWeight: isActive ? 'bold' : 'normal' }}>{item.label}</span>
                        </div>
                    );
                })}

                {eventId && (
                    <>
                        <div style={{ padding: '25px 10px 5px 15px', fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>
                            Event Workspace
                        </div>
                        {analysisNav.map(item => {
                            const isActive = location.pathname.includes(`/analysis/${eventId}/${item.id}`);
                            return (
                                <div 
                                    key={item.id}
                                    onClick={() => item.path && navigate(item.path)}
                                    style={{ 
                                        padding: '10px 20px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '12px', 
                                        cursor: item.path ? 'pointer' : 'default',
                                        background: isActive ? '#f1f5f9' : 'transparent',
                                        color: isActive ? '#2563eb' : (item.path ? '#475569' : '#cbd5e1'),
                                        borderRight: isActive ? '3px solid #2563eb' : '3px solid transparent',
                                        opacity: item.path ? 1 : 0.5
                                    }}
                                    onMouseOver={(e) => { if(!isActive && item.path) e.currentTarget.style.background = '#f8fafc' }}
                                    onMouseOut={(e) => { if(!isActive && item.path) e.currentTarget.style.background = 'transparent' }}
                                >
                                    <div style={{ width: '20px', display: 'flex', justifyContent: 'center', transform: 'scale(0.9)' }}>{item.icon}</div>
                                    <span style={{ fontSize: '13px', fontWeight: isActive ? 'bold' : 'normal' }}>{item.label}</span>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>

            <div style={{ padding: '15px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: health === 'Operational' ? '#10b981' : health === 'Degraded' ? '#f59e0b' : '#ef4444' }}></div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>{health}</div>
            </div>
        </div>
    );
}
