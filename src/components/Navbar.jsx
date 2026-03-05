import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { HiOutlineLogout, HiOutlineSun, HiOutlineMoon, HiOutlineMenu } from 'react-icons/hi';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import NotificationPanel from './NotificationPanel';
import './Navbar.css';

const Navbar = ({ onMobileToggle, collapsed, isMobile }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const navbarLeft = isMobile ? 0 : (collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)');

    return (
        <header className="navbar" style={{ left: navbarLeft }}>
            <div className="navbar-left">
                <button className="mobile-menu-btn" onClick={onMobileToggle}>
                    <HiOutlineMenu />
                </button>
                <div className="navbar-greeting">
                    <span className="greeting-text">Welcome back,</span>
                    <span className="greeting-name">{user?.name?.split(' ')[0]}</span>
                </div>
            </div>

            <div className="navbar-right">
                <button className="navbar-btn" onClick={toggleTheme} title="Toggle theme">
                    {theme === 'dark' ? <HiOutlineSun /> : <HiOutlineMoon />}
                </button>

                <NotificationPanel />

                <div className="navbar-user" onClick={() => setShowDropdown(!showDropdown)}>
                    <div className="navbar-avatar">
                        {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    {showDropdown && (
                        <div className="user-dropdown animate-slideUp">
                            <div className="dropdown-header">
                                <strong>{user?.name}</strong>
                                <span>{user?.email}</span>
                            </div>
                            <div className="dropdown-divider"></div>
                            <button onClick={() => { navigate('/profile'); setShowDropdown(false); }}>
                                My Profile
                            </button>
                            <button onClick={handleLogout} className="logout-btn">
                                <HiOutlineLogout /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
