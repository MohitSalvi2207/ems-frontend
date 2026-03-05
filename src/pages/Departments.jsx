import { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineUserGroup } from 'react-icons/hi';
import { toast } from 'react-toastify';
import './Departments.css';

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', head: '' });
    const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [deptRes, empRes] = await Promise.all([
                api.get('/departments'),
                api.get('/employees', { params: { limit: 100 } })
            ]);
            if (deptRes.data.success) setDepartments(deptRes.data.data);
            if (empRes.data.success) setEmployees(empRes.data.data);
        } catch { } finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await api.put(`/departments/${editing._id}`, form);
                toast.success('Department updated');
            } else {
                await api.post('/departments', form);
                toast.success('Department created');
            }
            closeModal();
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/departments/${id}`);
            toast.success('Department deleted');
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Cannot delete');
        }
    };

    const openEdit = (dept) => {
        setEditing(dept);
        setForm({ name: dept.name, description: dept.description || '', head: dept.head?._id || '' });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
        setForm({ name: '', description: '', head: '' });
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="departments-page animate-fadeIn">
            <div className="page-header">
                <div><h1>Departments</h1><p>Manage organization departments</p></div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <HiOutlinePlus /> Add Department
                </button>
            </div>

            <div className="dept-grid">
                {departments.map(dept => (
                    <div key={dept._id} className="card dept-card">
                        <div className="dept-card-header">
                            <div className="dept-icon"><HiOutlineUserGroup /></div>
                            <div className="dept-actions">
                                <button className="btn btn-icon btn-secondary" onClick={() => openEdit(dept)}><HiOutlinePencil /></button>
                                <button className="btn btn-icon btn-danger" onClick={() => setConfirmDelete({ open: true, id: dept._id })}><HiOutlineTrash /></button>
                            </div>
                        </div>
                        <h3 className="dept-name">{dept.name}</h3>
                        <p className="dept-desc">{dept.description || 'No description'}</p>
                        <div className="dept-meta">
                            <div className="dept-stat">
                                <span className="dept-stat-value">{dept.employeeCount || 0}</span>
                                <span className="dept-stat-label">Employees</span>
                            </div>
                            <div className="dept-head">
                                {dept.head ? (
                                    <><span className="head-avatar">{dept.head.name?.charAt(0)}</span><span className="head-name">{dept.head.name}</span></>
                                ) : <span className="no-head">No head assigned</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {departments.length === 0 && <div className="empty-state"><p>No departments found</p></div>}

            <Modal isOpen={showModal} onClose={closeModal} title={editing ? 'Edit Department' : 'Add Department'}>
                <form onSubmit={handleSubmit}>
                    <div className="input-group" style={{ marginBottom: 16 }}>
                        <label>Department Name *</label>
                        <input className="input-field" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div className="input-group" style={{ marginBottom: 16 }}>
                        <label>Description</label>
                        <textarea className="input-field" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <div className="input-group" style={{ marginBottom: 16 }}>
                        <label>Department Head</label>
                        <select className="input-field" value={form.head} onChange={e => setForm({ ...form, head: e.target.value })}>
                            <option value="">Select Head</option>
                            {employees.map(e => <option key={e._id} value={e._id}>{e.name} ({e.position || e.role})</option>)}
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                        <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={confirmDelete.open}
                onClose={() => setConfirmDelete({ open: false, id: null })}
                onConfirm={() => handleDelete(confirmDelete.id)}
                title="Delete Department"
                message="Are you sure you want to delete this department? This cannot be undone."
            />
        </div>
    );
};

export default Departments;
