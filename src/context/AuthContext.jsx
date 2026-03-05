import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const { data } = await api.get('/auth/me');
            if (data.success) setUser(data.user);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        if (data.success) {
            setUser(data.user);
        }
        return data;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch { }
        setUser(null);
    };

    const isSuperAdmin = user?.role === 'superadmin';
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
    const isEmployee = user?.role === 'employee';

    return (
        <AuthContext.Provider value={{
            user, loading, login, logout, checkAuth,
            isSuperAdmin, isAdmin, isEmployee
        }}>
            {children}
        </AuthContext.Provider>
    );
};
