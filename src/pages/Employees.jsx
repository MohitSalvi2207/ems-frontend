import { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { HiOutlinePlus, HiOutlineSearch, HiOutlinePencil, HiOutlineTrash, HiOutlineDownload } from 'react-icons/hi';
import { toast } from 'react-toastify';
import './Employees.css';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterDept, setFilterDept] = useState('');
    const [pagination, setPagination] = useState({});
    const [page, setPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [form, setForm] = useState({
        name: '', email: '', password: '', phone: '', position: '',
        role: 'employee', department: '', salary: '', address: ''
    });
    const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

    useEffect(() => { fetchEmployees(); fetchDepartments(); }, [page, search, filterDept]);

    const fetchEmployees = async () => {
        try {
            const params = { page, limit: 10 };
            if (search) params.search = search;
            if (filterDept) params.department = filterDept;
            const { data } = await api.get('/employees', { params });
            if (data.success) {
                setEmployees(data.data);
                setPagination(data.pagination);
            }
        } catch (err) {
            toast.error('Failed to fetch employees');
        } finally { setLoading(false); }
    };

    const fetchDepartments = async () => {
        try {
            const { data } = await api.get('/departments');
            if (data.success) setDepartments(data.data);
        } catch { }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingEmployee) {
                await api.put(`/employees/${editingEmployee._id}`, form);
                toast.success('Employee updated');
            } else {
                await api.post('/employees', { ...form, salary: Number(form.salary) });
                toast.success('Employee created');
            }
            closeModal();
            fetchEmployees();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/employees/${id}`);
            toast.success('Employee deactivated');
            fetchEmployees();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const openEdit = (emp) => {
        setEditingEmployee(emp);
        setForm({
            name: emp.name, email: emp.email, password: '', phone: emp.phone || '',
            position: emp.position || '', role: emp.role, department: emp.department?._id || '',
            salary: emp.salary?.toString() || '', address: emp.address || ''
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingEmployee(null);
        setForm({ name: '', email: '', password: '', phone: '', position: '', role: 'employee', department: '', salary: '', address: '' });
    };

    const handleExport = async (type) => {
        try {
            const response = await api.get(`/employees/export/${type}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(response.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = `employees.${type === 'csv' ? 'csv' : 'xlsx'}`;
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success(`Exported as ${type.toUpperCase()}`);
        } catch {
            toast.error('Export failed');
        }
    };

    return (
        <div className="employees-page animate-fadeIn">
            <div className="page-header">
                <div>
                    <h1>Employees</h1>
                    <p>Manage your organization's workforce</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => handleExport('csv')}>
                        <HiOutlineDownload /> CSV
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleExport('excel')}>
                        <HiOutlineDownload /> Excel
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <HiOutlinePlus /> Add Employee
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar card">
                <div className="search-wrapper input-with-icon">
                    <HiOutlineSearch className="input-icon" />
                    <input
                        className="input-field"
                        placeholder="Search by name, email, position..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
                <select className="input-field filter-select"
                    value={filterDept} onChange={e => { setFilterDept(e.target.value); setPage(1); }}>
                    <option value="">All Departments</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
            </div>

            {/* Table + Mobile Cards */}
            <div className="card table-card">
                {loading ? (
                    <div className="loading-container"><div className="spinner"></div></div>
                ) : (
                    <>
                        {/* ── Desktop Table ── */}
                        <div className="table-responsive-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Position</th>
                                        <th>Department</th>
                                        <th>Role</th>
                                        <th>Salary</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map(emp => (
                                        <tr key={emp._id}>
                                            <td>
                                                <div className="emp-cell">
                                                    <div className="emp-avatar">{emp.name?.charAt(0)}</div>
                                                    <div>
                                                        <div className="emp-name">{emp.name}</div>
                                                        <div className="emp-email">{emp.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{emp.position || '—'}</td>
                                            <td>{emp.department?.name || '—'}</td>
                                            <td><span className={`badge badge-${emp.role === 'superadmin' ? 'danger' : emp.role === 'admin' ? 'warning' : 'info'}`}>{emp.role}</span></td>
                                            <td>₹{emp.salary?.toLocaleString('en-IN')}</td>
                                            <td><span className={`badge ${emp.isActive ? 'badge-success' : 'badge-danger'}`}>{emp.isActive ? 'Active' : 'Inactive'}</span></td>
                                            <td>
                                                <div className="action-btns">
                                                    <button className="btn btn-icon btn-secondary" onClick={() => openEdit(emp)}><HiOutlinePencil /></button>
                                                    <button className="btn btn-icon btn-danger" onClick={() => setConfirmDelete({ open: true, id: emp._id })}><HiOutlineTrash /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Mobile Cards ── */}
                        <div className="mobile-emp-list">
                            {employees.map(emp => (
                                <div key={emp._id} className="mobile-emp-card">
                                    <div className="mobile-emp-header">
                                        <div className="emp-avatar">{emp.name?.charAt(0)}</div>
                                        <div className="mobile-emp-info">
                                            <div className="emp-name">{emp.name}</div>
                                            <div className="emp-email">{emp.email}</div>
                                        </div>
                                        <span className={`badge ${emp.isActive ? 'badge-success' : 'badge-danger'}`}>
                                            {emp.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="mobile-emp-body">
                                        <div className="mobile-emp-field">
                                            <span className="mobile-field-label">Position</span>
                                            <span className="mobile-field-value">{emp.position || '—'}</span>
                                        </div>
                                        <div className="mobile-emp-field">
                                            <span className="mobile-field-label">Department</span>
                                            <span className="mobile-field-value">{emp.department?.name || '—'}</span>
                                        </div>
                                        <div className="mobile-emp-field">
                                            <span className="mobile-field-label">Salary</span>
                                            <span className="mobile-field-value">₹{emp.salary?.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="mobile-emp-field">
                                            <span className="mobile-field-label">Role</span>
                                            <span className={`badge badge-${emp.role === 'superadmin' ? 'danger' : emp.role === 'admin' ? 'warning' : 'info'}`}>{emp.role}</span>
                                        </div>
                                    </div>
                                    <div className="mobile-emp-footer">
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                            Joined {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString('en-IN') : '—'}
                                        </span>
                                        <div className="action-btns">
                                            <button className="btn btn-icon btn-secondary" onClick={() => openEdit(emp)}><HiOutlinePencil /></button>
                                            <button className="btn btn-icon btn-danger" onClick={() => setConfirmDelete({ open: true, id: emp._id })}><HiOutlineTrash /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {employees.length === 0 && <div className="empty-state"><p>No employees found</p></div>}

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="pagination">
                                <button className="btn btn-sm btn-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
                                <span className="page-info">Page {pagination.page} of {pagination.pages}</span>
                                <button className="btn btn-sm btn-secondary" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>Next</button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal */}
            <Modal isOpen={showModal} onClose={closeModal} title={editingEmployee ? 'Edit Employee' : 'Add Employee'} size="lg">
                <form onSubmit={handleSubmit} className="employee-form">
                    <div className="form-grid">
                        <div className="input-group">
                            <label>Full Name *</label>
                            <input className="input-field" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Email *</label>
                            <input className="input-field" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                        </div>
                        {!editingEmployee && (
                            <div className="input-group">
                                <label>Password *</label>
                                <input className="input-field" type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                            </div>
                        )}
                        <div className="input-group">
                            <label>Phone</label>
                            <input className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Position</label>
                            <input className="input-field" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Role</label>
                            <select className="input-field" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                                <option value="employee">Employee</option>
                                <option value="admin">Admin</option>
                                <option value="superadmin">Super Admin</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Department</label>
                            <select className="input-field" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                                <option value="">Select Department</option>
                                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Salary (₹)</label>
                            <input className="input-field" type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} />
                        </div>
                    </div>
                    <div className="input-group" style={{ marginTop: 16 }}>
                        <label>Address</label>
                        <input className="input-field" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                        <button type="submit" className="btn btn-primary">{editingEmployee ? 'Update' : 'Create'}</button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={confirmDelete.open}
                onClose={() => setConfirmDelete({ open: false, id: null })}
                onConfirm={() => handleDelete(confirmDelete.id)}
                title="Deactivate Employee"
                message="Are you sure you want to deactivate this employee? This action can be reversed later."
            />
        </div>
    );
};

export default Employees;
