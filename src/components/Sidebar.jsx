import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    HiOutlineViewGrid, HiOutlineUserGroup, HiOutlineOfficeBuilding,
    HiOutlineClock, HiOutlineClipboardList, HiOutlineCurrencyRupee,
    HiOutlineDocumentReport, HiOutlineUser, HiOutlineChevronLeft,
    HiOutlineChevronRight, HiOutlineX
} from 'react-icons/hi';
import './Sidebar.css';

const Sidebar = ({ collapsed, mobileOpen, onToggle, onNavClick, isMobile }) => {
    const { user } = useAuth();

    const navItems = [
        { path: '/dashboard', icon: HiOutlineViewGrid, label: 'Dashboard', roles: ['superadmin', 'admin'] },
        { path: '/employees', icon: HiOutlineUserGroup, label: 'Employees', roles: ['superadmin', 'admin'] },
        { path: '/departments', icon: HiOutlineOfficeBuilding, label: 'Departments', roles: ['superadmin', 'admin'] },
        { path: '/attendance', icon: HiOutlineClock, label: 'Attendance', roles: ['superadmin', 'admin', 'employee'] },
        { path: '/tasks', icon: HiOutlineClipboardList, label: 'Tasks', roles: ['superadmin', 'admin', 'employee'] },
        { path: '/payroll', icon: HiOutlineCurrencyRupee, label: 'Payroll', roles: ['superadmin', 'admin', 'employee'] },
        { path: '/activity-logs', icon: HiOutlineDocumentReport, label: 'Activity Logs', roles: ['superadmin'] },
        { path: '/profile', icon: HiOutlineUser, label: 'My Profile', roles: ['superadmin', 'admin', 'employee'] },
    ];

    const filteredItems = navItems.filter(item => item.roles.includes(user?.role));

    const sidebarClass = [
        'sidebar',
        collapsed && !isMobile ? 'collapsed' : '',
        isMobile && mobileOpen ? 'mobile-open' : '',
    ].filter(Boolean).join(' ');

    return (
        <aside className={sidebarClass}>
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="logo-icon">
                    <span>E</span>
                </div>
                {!collapsed && <span className="logo-text">EMS</span>}
                {isMobile && mobileOpen && (
                    <button className="mobile-close-btn" onClick={onToggle}>
                        <HiOutlineX />
                    </button>
                )}
            </div>

            {/* Nav Items */}
            <nav className="sidebar-nav">
                {filteredItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        title={collapsed ? item.label : ''}
                        onClick={onNavClick}
                    >
                        <item.icon className="nav-icon" />
                        {!collapsed && <span className="nav-label">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* User Card */}
            {!collapsed && (
                <div className="sidebar-user">
                    <div className="user-avatar">
                        {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="user-info">
                        <span className="user-name">{user?.name}</span>
                        <span className="user-role">{user?.role}</span>
                    </div>
                </div>
            )}

            {/* Toggle Button — Desktop only */}
            {!isMobile && (
                <button className="sidebar-toggle" onClick={onToggle}>
                    {collapsed ? <HiOutlineChevronRight /> : <HiOutlineChevronLeft />}
                </button>
            )}
        </aside>
    );
};

export default Sidebar;
