import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineBriefcase, HiOutlineSave } from 'react-icons/hi';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
    const { user, checkAuth } = useAuth();
    const [form, setForm] = useState({
        name: '', phone: '', address: '', position: ''
    });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setForm({ name: user.name || '', phone: user.phone || '', address: user.address || '', position: user.position || '' });
        }
    }, [user]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/employees/${user._id}`, form);
            toast.success('Profile updated');
            checkAuth();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="profile-page animate-fadeIn">
            <div className="page-header">
                <div><h1>My Profile</h1><p>Manage your personal information</p></div>
            </div>

            <div className="profile-grid">
                {/* Profile Info Card */}
                <div className="card profile-card">
                    <div className="profile-avatar-section">
                        <div className="profile-avatar-lg">
                            {user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <h2>{user?.name}</h2>
                        <p className="profile-position">{user?.position || 'Employee'}</p>
                        <span className={`badge ${user?.role === 'superadmin' ? 'badge-danger' : user?.role === 'admin' ? 'badge-warning' : 'badge-info'}`}>
                            {user?.role}
                        </span>
                    </div>

                    <div className="profile-details">
                        <div className="detail-item">
                            <HiOutlineMail />
                            <div><span className="detail-label">Email</span><span className="detail-value">{user?.email}</span></div>
                        </div>
                        <div className="detail-item">
                            <HiOutlinePhone />
                            <div><span className="detail-label">Phone</span><span className="detail-value">{user?.phone || 'Not set'}</span></div>
                        </div>
                        <div className="detail-item">
                            <HiOutlineBriefcase />
                            <div><span className="detail-label">Department</span><span className="detail-value">{user?.department?.name || 'N/A'}</span></div>
                        </div>
                        <div className="detail-item">
                            <HiOutlineUser />
                            <div><span className="detail-label">Joined</span><span className="detail-value">{user?.joiningDate ? new Date(user.joiningDate).toLocaleDateString('en-IN') : 'N/A'}</span></div>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="card edit-card">
                    <h3>Edit Profile</h3>
                    <form onSubmit={handleUpdate}>
                        <div className="input-group" style={{ marginBottom: 16 }}>
                            <label>Full Name</label>
                            <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div className="input-group" style={{ marginBottom: 16 }}>
                            <label>Phone</label>
                            <input className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                        </div>
                        <div className="input-group" style={{ marginBottom: 16 }}>
                            <label>Position</label>
                            <input className="input-field" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} />
                        </div>
                        <div className="input-group" style={{ marginBottom: 20 }}>
                            <label>Address</label>
                            <textarea className="input-field" rows={3} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            <HiOutlineSave /> {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
