import { useState, useEffect } from 'react';
import api from '../api/axios';
import { HiOutlineDocumentReport } from 'react-icons/hi';
import './ActivityLogs.css';

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [filterModule, setFilterModule] = useState('');

    useEffect(() => { fetchLogs(); }, [page, filterModule]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = { page, limit: 20 };
            if (filterModule) params.module = filterModule;
            const { data } = await api.get('/dashboard/logs', { params });
            if (data.success) {
                setLogs(data.data);
                setPagination(data.pagination);
            }
        } catch { } finally { setLoading(false); }
    };

    const getModuleBadge = (mod) => {
        const colors = { auth: 'primary', employee: 'info', department: 'warning', attendance: 'success', task: 'danger', payroll: 'primary', system: 'info' };
        return <span className={`badge badge-${colors[mod] || 'info'}`}>{mod}</span>;
    };

    return (
        <div className="logs-page animate-fadeIn">
            <div className="page-header">
                <div><h1><HiOutlineDocumentReport style={{ verticalAlign: 'middle' }} /> Activity Logs</h1><p>System activity and audit trail</p></div>
            </div>

            <div className="filters-bar card">
                <select className="input-field filter-select" value={filterModule} onChange={e => { setFilterModule(e.target.value); setPage(1); }}>
                    <option value="">All Modules</option>
                    <option value="auth">Auth</option>
                    <option value="employee">Employee</option>
                    <option value="department">Department</option>
                    <option value="attendance">Attendance</option>
                    <option value="task">Task</option>
                    <option value="payroll">Payroll</option>
                </select>
            </div>

            <div className="card table-card">
                {loading ? (
                    <div className="loading-container"><div className="spinner"></div></div>
                ) : (
                    <>
                        {/* ── Desktop Table ── */}
                        <div className="table-responsive-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Action</th>
                                        <th>Module</th>
                                        <th>Details</th>
                                        <th>IP Address</th>
                                        <th>Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map(log => (
                                        <tr key={log._id}>
                                            <td>{log.user?.name || 'System'}</td>
                                            <td>{log.action}</td>
                                            <td>{getModuleBadge(log.module)}</td>
                                            <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{log.details}</td>
                                            <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{log.ipAddress || '—'}</td>
                                            <td style={{ whiteSpace: 'nowrap' }}>
                                                {new Date(log.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Mobile Cards ── */}
                        <div className="mobile-log-list">
                            {logs.map(log => (
                                <div key={log._id} className="mobile-log-card">
                                    <div className="mobile-log-header">
                                        <span className="mobile-log-user">{log.user?.name || 'System'}</span>
                                        <span className="mobile-log-time">
                                            {new Date(log.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="mobile-log-action">{log.action}</div>
                                    {log.details && <div className="mobile-log-details">{log.details}</div>}
                                    <div className="mobile-log-footer">
                                        {getModuleBadge(log.module)}
                                        {log.ipAddress && <span className="mobile-log-ip">{log.ipAddress}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {logs.length === 0 && <div className="empty-state"><p>No logs found</p></div>}
                        {pagination.pages > 1 && (
                            <div className="pagination">
                                <button className="btn btn-sm btn-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
                                <span className="page-info">Page {pagination.page} of {pagination.pages}</span>
                                <button className="btn btn-sm btn-secondary" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>Next</button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ActivityLogs;
