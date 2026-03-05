import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import {
    HiOutlineBell, HiOutlineCheckCircle, HiOutlineTrash,
    HiOutlineX, HiOutlineInformationCircle
} from 'react-icons/hi';
import './NotificationPanel.css';

const TYPE_ICONS = {
    info: '💡',
    success: '✅',
    warning: '⚠️',
    danger: '🚨',
    task: '📋',
    attendance: '🕐',
    payroll: '💰'
};

const NotificationPanel = () => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const panelRef = useRef(null);

    // Close panel on outside click
    useEffect(() => {
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Fetch on open & poll every 30s
    useEffect(() => { fetchCount(); }, []);
    useEffect(() => {
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (open) fetchNotifications();
    }, [open]);

    const fetchCount = async () => {
        try {
            const { data } = await api.get('/notifications', { params: { limit: 1 } });
            if (data.success) setUnreadCount(data.unreadCount);
        } catch { }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/notifications', { params: { limit: 20 } });
            if (data.success) {
                setNotifications(data.data);
                setUnreadCount(data.unreadCount);
            }
        } catch { } finally { setLoading(false); }
    };

    const handleMarkRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch { }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch { }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            const removed = notifications.find(n => n._id === id);
            setNotifications(prev => prev.filter(n => n._id !== id));
            if (removed && !removed.isRead) setUnreadCount(prev => Math.max(0, prev - 1));
        } catch { }
    };

    const handleClick = (notif) => {
        if (!notif.isRead) handleMarkRead(notif._id);
        if (notif.link) {
            navigate(notif.link);
            setOpen(false);
        }
    };

    const timeAgo = (dateStr) => {
        const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    return (
        <div className="notification-wrapper" ref={panelRef}>
            <button className="navbar-btn notification-trigger" onClick={() => setOpen(!open)}>
                <HiOutlineBell />
                {unreadCount > 0 && (
                    <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            {open && (
                <div className="notif-panel animate-slideUp">
                    <div className="notif-header">
                        <h3>Notifications</h3>
                        <div className="notif-header-actions">
                            {unreadCount > 0 && (
                                <button className="notif-action-btn" onClick={handleMarkAllRead} title="Mark all as read">
                                    <HiOutlineCheckCircle /> Read All
                                </button>
                            )}
                            <button className="notif-close" onClick={() => setOpen(false)}>
                                <HiOutlineX />
                            </button>
                        </div>
                    </div>

                    <div className="notif-list">
                        {loading && <div className="notif-loading"><div className="spinner" style={{ width: 24, height: 24 }}></div></div>}
                        {!loading && notifications.length === 0 && (
                            <div className="notif-empty">
                                <HiOutlineInformationCircle style={{ fontSize: '2rem', opacity: 0.4 }} />
                                <p>No notifications yet</p>
                            </div>
                        )}
                        {!loading && notifications.map(notif => (
                            <div
                                key={notif._id}
                                className={`notif-item ${!notif.isRead ? 'unread' : ''}`}
                                onClick={() => handleClick(notif)}
                            >
                                <div className="notif-icon">{TYPE_ICONS[notif.type] || '📌'}</div>
                                <div className="notif-content">
                                    <div className="notif-title">{notif.title}</div>
                                    <div className="notif-message">{notif.message}</div>
                                    <div className="notif-time">{timeAgo(notif.createdAt)}</div>
                                </div>
                                <button
                                    className="notif-delete"
                                    onClick={(e) => { e.stopPropagation(); handleDelete(notif._id); }}
                                    title="Delete"
                                >
                                    <HiOutlineTrash />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;
