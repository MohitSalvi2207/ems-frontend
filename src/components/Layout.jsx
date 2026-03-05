import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (!mobile) setMobileOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSidebarToggle = () => {
        if (isMobile) {
            setMobileOpen(!mobileOpen);
        } else {
            setCollapsed(!collapsed);
        }
    };

    const closeMobileSidebar = () => {
        if (isMobile) setMobileOpen(false);
    };

    return (
        <div className="app-layout">
            {/* Mobile overlay */}
            {isMobile && mobileOpen && (
                <div className="sidebar-overlay" onClick={closeMobileSidebar}></div>
            )}

            <Sidebar
                collapsed={isMobile ? false : collapsed}
                mobileOpen={mobileOpen}
                onToggle={handleSidebarToggle}
                onNavClick={closeMobileSidebar}
                isMobile={isMobile}
            />
            <div className={`main-area ${collapsed && !isMobile ? 'collapsed' : ''}`}>
                <Navbar
                    onMobileToggle={handleSidebarToggle}
                    collapsed={collapsed}
                    isMobile={isMobile}
                />
                <main className="page-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
