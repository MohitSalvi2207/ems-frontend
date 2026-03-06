import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { HiOutlineClock, HiOutlineLogout, HiOutlineCalendar } from 'react-icons/hi';
import { toast } from 'react-toastify';
import './Attendance.css';

const Attendance = () => {
    const { user, isAdmin } = useAuth();
    const [todayStatus, setTodayStatus] = useState(null);
    const [myAttendance, setMyAttendance] = useState([]);
    const [allAttendance, setAllAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [view, setView] = useState(isAdmin ? 'all' : 'my');

    useEffect(() => { fetchData(); }, [selectedMonth, selectedYear, view]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [todayRes] = await Promise.all([api.get('/attendance/today')]);
            setTodayStatus(todayRes.data.data);

            if (view === 'my' || !isAdmin) {
                const { data } = await api.get('/attendance/me', { params: { month: selectedMonth, year: selectedYear } });
                if (data.success) setMyAttendance(data.data);
            } else {
                const { data } = await api.get('/attendance', { params: { month: selectedMonth, year: selectedYear, limit: 100 } });
                if (data.success) setAllAttendance(data.data);
            }
        } catch { } finally { setLoading(false); }
    };

    const handleCheckIn = async () => {
        try {
            await api.post('/attendance/checkin');
            toast.success('Checked in successfully!');
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Check-in failed');
        }
    };

    const handleCheckOut = async () => {
        try {
            await api.post('/attendance/checkout');
            toast.success('Checked out successfully!');
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Check-out failed');
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            'present': 'badge-success',
            'late': 'badge-warning',
            'half-day': 'badge-info',
            'absent': 'badge-danger',
            'on-leave': 'badge-primary'
        };
        return <span className={`badge ${map[status] || 'badge-info'}`}>{status}</span>;
    };

    const attendanceData = view === 'my' || !isAdmin ? myAttendance : allAttendance;

    return (
        <div className="attendance-page animate-fadeIn">
            <div className="page-header">
                <div><h1>Attendance</h1><p>Track and manage attendance records</p></div>
            </div>

            {/* Today's Status Card */}
            <div className="today-card card">
                <div className="today-info">
                    <h3><HiOutlineCalendar /> Today — {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                    <div className="today-status">
                        {todayStatus ? (
                            <div className="check-times">
                                <div className="check-time">
                                    <span className="check-label">Check In</span>
                                    <span className="check-value">{new Date(todayStatus.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                {todayStatus.checkOut && (
                                    <div className="check-time">
                                        <span className="check-label">Check Out</span>
                                        <span className="check-value">{new Date(todayStatus.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                )}
                                {todayStatus.workHours > 0 && (
                                    <div className="check-time">
                                        <span className="check-label">Hours</span>
                                        <span className="check-value">{todayStatus.workHours}h</span>
                                    </div>
                                )}
                                <div className="check-time">{getStatusBadge(todayStatus.status)}</div>
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-muted)' }}>Not checked in yet</p>
                        )}
                    </div>
                </div>
                <div className="today-actions">
                    {!todayStatus && (
                        <button className="btn btn-success btn-lg" onClick={handleCheckIn}>
                            <HiOutlineClock /> Check In
                        </button>
                    )}
                    {todayStatus && !todayStatus.checkOut && (
                        <button className="btn btn-danger btn-lg" onClick={handleCheckOut}>
                            <HiOutlineLogout /> Check Out
                        </button>
                    )}
                    {todayStatus?.checkOut && (
                        <span className="badge badge-success" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>✓ Completed</span>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar card">
                {isAdmin && (
                    <div className="view-toggle">
                        <button className={`toggle-btn ${view === 'all' ? 'active' : ''}`} onClick={() => setView('all')}>All Employees</button>
                        <button className={`toggle-btn ${view === 'my' ? 'active' : ''}`} onClick={() => setView('my')}>My Attendance</button>
                    </div>
                )}
                <div className="date-filters">
                    <select className="input-field" value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))}>
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {new Date(0, i).toLocaleString('en', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                    <select className="input-field" value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}>
                        {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="card table-card">
                {loading ? (
                    <div className="loading-container"><div className="spinner"></div></div>
                ) : (
                    <>
                        {/* Desktop table view */}
                        <table className="data-table">
                            <thead>
                                <tr>
                                    {(view === 'all' && isAdmin) && <th>Employee</th>}
                                    <th>Date</th>
                                    <th>Check In</th>
                                    <th>Check Out</th>
                                    <th>Work Hours</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceData.map(att => (
                                    <tr key={att._id}>
                                        {(view === 'all' && isAdmin) && <td>{att.user?.name || '—'}</td>}
                                        <td>{att.date}</td>
                                        <td>{att.checkIn ? new Date(att.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                                        <td>{att.checkOut ? new Date(att.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                                        <td>{att.workHours ? `${att.workHours}h` : '—'}</td>
                                        <td>{getStatusBadge(att.status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Mobile card view */}
                        <div className="attendance-cards">
                            {attendanceData.map(att => (
                                <div className="attendance-card-item" key={att._id}>
                                    <div className="att-card-header">
                                        <span className="att-card-name">
                                            {(view === 'all' && isAdmin) ? (att.user?.name || '—') : att.date}
                                        </span>
                                        <span>{getStatusBadge(att.status)}</span>
                                    </div>
                                    <div className="att-card-details">
                                        {(view === 'all' && isAdmin) && (
                                            <div className="att-card-field">
                                                <span className="att-card-field-label">Date</span>
                                                <span className="att-card-field-value">{att.date}</span>
                                            </div>
                                        )}
                                        <div className="att-card-field">
                                            <span className="att-card-field-label">Check In</span>
                                            <span className="att-card-field-value">{att.checkIn ? new Date(att.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                                        </div>
                                        <div className="att-card-field">
                                            <span className="att-card-field-label">Check Out</span>
                                            <span className="att-card-field-value">{att.checkOut ? new Date(att.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                                        </div>
                                        <div className="att-card-field">
                                            <span className="att-card-field-label">Hours</span>
                                            <span className="att-card-field-value">{att.workHours ? `${att.workHours}h` : '—'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
                {!loading && attendanceData.length === 0 && <div className="empty-state"><p>No attendance records found</p></div>}
            </div>
        </div>
    );
};

export default Attendance;
