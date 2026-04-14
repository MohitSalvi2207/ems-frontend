import { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import {
    HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineUserGroup,
    HiOutlineChevronRight, HiOutlineMail, HiOutlineBriefcase,
    HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineArrowLeft
} from 'react-icons/hi';
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

    // Department detail state
    const [selectedDept, setSelectedDept] = useState(null);
    const [deptDetail, setDeptDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

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

    // ─── View Department Detail ───────────────────────────────────────────
    const openDeptDetail = async (dept) => {
        setSelectedDept(dept);
        setDeptDetail(null);
        setDetailLoading(true);
        try {
            const res = await api.get(`/departments/${dept._id}`);
            if (res.data.success) setDeptDetail(res.data.data);
        } catch {
            toast.error('Failed to load department details');
        } finally {
            setDetailLoading(false);
        }
    };

    const closeDeptDetail = () => {
        setSelectedDept(null);
        setDeptDetail(null);
    };

    // ─── CRUD ─────────────────────────────────────────────────────────────
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
            if (selectedDept && editing && editing._id === selectedDept._id) {
                closeDeptDetail();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/departments/${id}`);
            toast.success('Department deleted');
            fetchData();
            if (selectedDept && selectedDept._id === id) closeDeptDetail();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Cannot delete');
        }
    };

    const openEdit = (dept, e) => {
        e?.stopPropagation();
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

    // ─── Department Detail Panel ──────────────────────────────────────────
    if (selectedDept) {
        return (
            <div className="departments-page animate-fadeIn">
                {/* Header */}
                <div className="page-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button className="btn btn-secondary btn-icon" onClick={closeDeptDetail} title="Back">
                            <HiOutlineArrowLeft />
                        </button>
                        <div>
                            <h1>{selectedDept.name}</h1>
                            <p>Department Details &amp; Employees</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary" onClick={(e) => openEdit(selectedDept, e)}>
                            <HiOutlinePencil /> Edit
                        </button>
                        <button className="btn btn-danger" onClick={() => setConfirmDelete({ open: true, id: selectedDept._id })}>
                            <HiOutlineTrash /> Delete
                        </button>
                    </div>
                </div>

                {detailLoading ? (
                    <div className="loading-container"><div className="spinner"></div></div>
                ) : deptDetail ? (
                    <div className="dept-detail-layout">
                        {/* Info Card */}
                        <div className="dept-detail-info card">
                            <div className="dept-detail-icon-wrap">
                                <HiOutlineUserGroup />
                            </div>
                            <h2 className="dept-detail-name">{deptDetail.name}</h2>
                            <p className="dept-detail-desc">{deptDetail.description || 'No description provided.'}</p>

                            <div className="dept-detail-stats">
                                <div className="dept-detail-stat">
                                    <span className="dept-detail-stat-value">{deptDetail.employees?.length ?? 0}</span>
                                    <span className="dept-detail-stat-label">Total Employees</span>
                                </div>
                                <div className="dept-detail-stat">
                                    <span className="dept-detail-stat-value" style={{ color: 'var(--accent-400)' }}>
                                        {deptDetail.employees?.filter(e => e.isActive).length ?? 0}
                                    </span>
                                    <span className="dept-detail-stat-label">Active</span>
                                </div>
                                <div className="dept-detail-stat">
                                    <span className="dept-detail-stat-value" style={{ color: 'var(--danger-400)' }}>
                                        {deptDetail.employees?.filter(e => !e.isActive).length ?? 0}
                                    </span>
                                    <span className="dept-detail-stat-label">Inactive</span>
                                </div>
                            </div>

                            {deptDetail.head && (
                                <div className="dept-detail-head-section">
                                    <span className="dept-detail-head-label">Department Head</span>
                                    <div className="dept-detail-head-card">
                                        <div className="dept-detail-big-avatar">
                                            {deptDetail.head.profileImage ? (
                                                <img src={deptDetail.head.profileImage} alt={deptDetail.head.name} />
                                            ) : (
                                                deptDetail.head.name?.charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <div className="dept-detail-head-name">{deptDetail.head.name}</div>
                                            <div className="dept-detail-head-pos">{deptDetail.head.position || 'Head'}</div>
                                            <div className="dept-detail-head-email">
                                                <HiOutlineMail /> {deptDetail.head.email}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Employees Table */}
                        <div className="dept-detail-employees">
                            <div className="dept-detail-employees-header">
                                <h3><HiOutlineUserGroup /> Employees in this Department</h3>
                                <span className="badge badge-primary">{deptDetail.employees?.length ?? 0} members</span>
                            </div>

                            {deptDetail.employees?.length === 0 ? (
                                <div className="empty-state" style={{ padding: '40px 20px' }}>
                                    <HiOutlineUserGroup style={{ width: 48, height: 48, opacity: 0.3 }} />
                                    <p>No employees in this department yet.</p>
                                </div>
                            ) : (
                                <div className="dept-emp-list">
                                    {deptDetail.employees.map((emp, idx) => (
                                        <div key={emp._id} className="dept-emp-row animate-fadeIn" style={{ animationDelay: `${idx * 40}ms` }}>
                                            <div className="dept-emp-avatar">
                                                {emp.profileImage ? (
                                                    <img src={emp.profileImage} alt={emp.name} />
                                                ) : (
                                                    emp.name?.charAt(0)
                                                )}
                                            </div>
                                            <div className="dept-emp-info">
                                                <div className="dept-emp-name">{emp.name}</div>
                                                <div className="dept-emp-pos">
                                                    <HiOutlineBriefcase />
                                                    {emp.position || 'Employee'}
                                                </div>
                                            </div>
                                            <div className="dept-emp-email">
                                                <HiOutlineMail />
                                                <span>{emp.email}</span>
                                            </div>
                                            <div className="dept-emp-status">
                                                {emp.isActive ? (
                                                    <span className="badge badge-success">
                                                        <HiOutlineCheckCircle /> Active
                                                    </span>
                                                ) : (
                                                    <span className="badge badge-danger">
                                                        <HiOutlineXCircle /> Inactive
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}

                {/* Edit / Delete Dialogs */}
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
    }

    // ─── Department Grid (default view) ──────────────────────────────────
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
                    <div
                        key={dept._id}
                        className="card dept-card dept-card-clickable"
                        onClick={() => openDeptDetail(dept)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && openDeptDetail(dept)}
                    >
                        <div className="dept-card-header">
                            <div className="dept-icon"><HiOutlineUserGroup /></div>
                            <div className="dept-actions" onClick={e => e.stopPropagation()}>
                                <button className="btn btn-icon btn-secondary" onClick={(e) => openEdit(dept, e)} title="Edit"><HiOutlinePencil /></button>
                                <button className="btn btn-icon btn-danger" onClick={(e) => { e.stopPropagation(); setConfirmDelete({ open: true, id: dept._id }); }} title="Delete"><HiOutlineTrash /></button>
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
                        <div className="dept-card-footer">
                            <span className="dept-view-detail">View Details <HiOutlineChevronRight /></span>
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
