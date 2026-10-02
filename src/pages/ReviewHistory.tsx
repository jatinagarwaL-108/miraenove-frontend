import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';

export default function ReviewCenter() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');
    const navigate = useNavigate();

    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        fetch(`${API_URL}/api/reviews/history`)
            .then(res => res.json())
            .then(data => {
                setHistory(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filtered = history.filter(h => statusFilter === 'All' || h.status.includes(statusFilter));
    const counts = {
        pending: history.filter(h => h.status === 'PENDING').length,
        accepted: history.filter(h => h.status.includes('ACCEPTED')).length,
        rejected: history.filter(h => h.status.includes('REJECTED')).length,
        uncertain: history.filter(h => h.status.includes('UNCERTAIN')).length,
    };

    return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif', background: '#f8fafc', overflow: 'hidden' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '30px' }}>
                <div style={{ marginBottom: '25px' }}>
                    <h2 style={{ margin: '0 0 5px 0' }}>Review Center</h2>
                    <div style={{ color: '#64748b' }}>Review and manage previously analyzed satellite change events.</div>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                    <div style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', borderTop: '4px solid #cbd5e1' }}>
                        <div style={{ color: '#64748b', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>Pending Review</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '10px' }}>{counts.pending}</div>
                    </div>
                    <div style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', borderTop: '4px solid #16a34a' }}>
                        <div style={{ color: '#64748b', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>Accepted</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '10px', color: '#16a34a' }}>{counts.accepted}</div>
                    </div>
                    <div style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', borderTop: '4px solid #dc2626' }}>
                        <div style={{ color: '#64748b', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>Rejected</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '10px', color: '#dc2626' }}>{counts.rejected}</div>
                    </div>
                    <div style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', borderTop: '4px solid #d97706' }}>
                        <div style={{ color: '#64748b', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>Uncertain</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '10px', color: '#d97706' }}>{counts.uncertain}</div>
                    </div>
                </div>
                
                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'flex-end', background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '5px' }}>Status Filter</label>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc' }}>
                            <option value="All">All Statuses</option>
                            <option value="ACCEPTED">Accepted</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="UNCERTAIN">Uncertain</option>
                            <option value="PENDING">Pending</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div>Loading audit logs...</div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: '40px', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
                        No human review decisions match your filters.
                    </div>
                ) : (
                    <div style={{ flex: 1, overflowY: 'auto', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: '#f8fafc', position: 'sticky', top: 0, zIndex: 1, borderBottom: '2px solid #e2e8f0' }}>
                                <tr>
                                    <th style={{ padding: '15px', fontWeight: 'bold', color: '#334155', fontSize: '13px', textTransform: 'uppercase' }}>Date/Time</th>
                                    <th style={{ padding: '15px', fontWeight: 'bold', color: '#334155', fontSize: '13px', textTransform: 'uppercase' }}>Event ID</th>
                                    <th style={{ padding: '15px', fontWeight: 'bold', color: '#334155', fontSize: '13px', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '15px', fontWeight: 'bold', color: '#334155', fontSize: '13px', textTransform: 'uppercase' }}>Reviewer</th>
                                    <th style={{ padding: '15px', fontWeight: 'bold', color: '#334155', fontSize: '13px', textTransform: 'uppercase' }}>Notes</th>
                                    <th style={{ padding: '15px', fontWeight: 'bold', color: '#334155', fontSize: '13px', textTransform: 'uppercase' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((log, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '15px', color: '#64748b', fontSize: '14px' }}>{new Date(log.created_at).toLocaleString()}</td>
                                        <td style={{ padding: '15px', fontWeight: 'bold', color: '#0f172a' }}>{log.event_id}</td>
                                        <td style={{ padding: '15px' }}>
                                            <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', background: log.status.includes('ACCEPTED') ? '#dcfce7' : log.status.includes('REJECTED') ? '#fee2e2' : '#fef3c7', color: log.status.includes('ACCEPTED') ? '#166534' : log.status.includes('REJECTED') ? '#991b1b' : '#92400e' }}>
                                                {log.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px', color: '#334155' }}>{log.reviewer}</td>
                                        <td style={{ padding: '15px', color: '#64748b', fontSize: '14px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.reason || log.notes || '-'}</td>
                                        <td style={{ padding: '15px' }}>
                                            <button onClick={() => navigate(`/analysis/${log.event_id}/review`)} style={{ padding: '6px 12px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', color: '#2563eb' }}>
                                                View Analysis
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
