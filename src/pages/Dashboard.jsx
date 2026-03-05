import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import StatsCard from '../components/StatsCard';
import {
    HiOutlineUserGroup, HiOutlineOfficeBuilding, HiOutlineClock,
    HiOutlineClipboardList, HiOutlineCurrencyRupee, HiOutlineCheckCircle
} from 'react-icons/hi';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import './Dashboard.css';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#8b5cf6'];

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const { data } = await api.get('/dashboard');
            if (data.success) setStats(data.data);
        } catch (err) {
            console.error('Dashboard error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    if (!stats) return <div className="empty-state"><p>Unable to load dashboard</p></div>;

    const taskData = [
        { name: 'Pending', value: stats.tasks.pending },
        { name: 'In Progress', value: stats.tasks.inProgress },
        { name: 'Completed', value: stats.tasks.completed },
        { name: 'Overdue', value: stats.tasks.overdue }
    ];

    return (
        <div className="dashboard animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Overview of your organization</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <StatsCard
                    title="Total Employees"
                    value={stats.employees.active}
                    icon={HiOutlineUserGroup}
                    color="primary"
                    trend="up"
                    trendValue={`${stats.employees.total} total`}
                />
                <StatsCard
                    title="Departments"
                    value={stats.departments}
                    icon={HiOutlineOfficeBuilding}
                    color="info"
                />
                <StatsCard
                    title="Today's Attendance"
                    value={`${stats.attendance.percentage}%`}
                    icon={HiOutlineClock}
                    color="success"
                    trend={stats.attendance.percentage >= 80 ? 'up' : 'down'}
                    trendValue={`${stats.attendance.today} present`}
                />
                <StatsCard
                    title="Pending Tasks"
                    value={stats.tasks.pending}
                    icon={HiOutlineClipboardList}
                    color="warning"
                    trendValue={`${stats.tasks.total} total`}
                />
                <StatsCard
                    title="Completed Tasks"
                    value={stats.tasks.completed}
                    icon={HiOutlineCheckCircle}
                    color="success"
                />
                <StatsCard
                    title="Monthly Payroll"
                    value={`₹${(stats.payroll.totalPayroll || 0).toLocaleString('en-IN')}`}
                    icon={HiOutlineCurrencyRupee}
                    color="danger"
                    trendValue={`${stats.payroll.paidCount || 0} paid`}
                />
            </div>

            {/* Charts Row */}
            <div className="charts-grid">
                {/* Attendance Trend */}
                <div className="card chart-card">
                    <h3>Attendance Trend (Last 7 Days)</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={stats.attendance.trend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="_id" tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                                tickFormatter={val => val?.slice(5)} />
                            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)'
                                }}
                            />
                            <Legend />
                            <Bar dataKey="onTime" fill="#6366f1" name="On Time" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="late" fill="#f59e0b" name="Late" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Task Distribution */}
                <div className="card chart-card">
                    <h3>Task Distribution</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={taskData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {taskData.map((entry, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Department Distribution */}
                <div className="card chart-card">
                    <h3>Department Distribution</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={stats.departmentDistribution} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                            <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} width={90} />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px'
                                }}
                            />
                            <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} name="Employees" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="card activity-card">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                    {stats.recentActivity?.length > 0 ? stats.recentActivity.map((log, i) => (
                        <div key={i} className="activity-item animate-slideInLeft" style={{ animationDelay: `${i * 50}ms` }}>
                            <div className="activity-avatar">
                                {log.user?.name?.charAt(0) || '?'}
                            </div>
                            <div className="activity-info">
                                <span className="activity-user">{log.user?.name || 'System'}</span>
                                <span className="activity-action">{log.action}</span>
                            </div>
                            <span className="activity-time">
                                {new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    )) : (
                        <p className="empty-state" style={{ padding: '30px' }}>No recent activity</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
