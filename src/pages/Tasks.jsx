import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { toast } from 'react-toastify';
import './Tasks.css';

const Tasks = () => {
    const { user, isAdmin } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '', status: 'pending'
    });
    const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

    useEffect(() => { fetchData(); }, [filterStatus, filterPriority]);

    const fetchData = async () => {
        try {
            const params = { limit: 50 };
            if (filterStatus) params.status = filterStatus;
            if (filterPriority) params.priority = filterPriority;
            const { data } = await api.get('/tasks', { params });
            if (data.success) setTasks(data.data);

            if (isAdmin) {
                const empRes = await api.get('/employees', { params: { limit: 100 } });
                if (empRes.data.success) setEmployees(empRes.data.data);
            }
        } catch { } finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await api.put(`/tasks/${editing._id}`, form);
                toast.success('Task updated');
            } else {
                await api.post('/tasks', form);
                toast.success('Task created');
            }
            closeModal();
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        }
    };

    const handleStatusChange = async (taskId, status) => {
        try {
            await api.put(`/tasks/${taskId}`, { status });
            toast.success(`Task marked as ${status}`);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/tasks/${id}`);
            toast.success('Task deleted');
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        }
    };

    const openEdit = (task) => {
        setEditing(task);
        setForm({
            title: task.title, description: task.description || '',
            assignedTo: task.assignedTo?._id || '', priority: task.priority,
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
            status: task.status
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
        setForm({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '', status: 'pending' });
    };

    const getPriorityBadge = (priority) => {
        const map = { low: 'badge-info', medium: 'badge-warning', high: 'badge-danger', urgent: 'badge-danger' };
        return <span className={`badge ${map[priority]}`}>{priority}</span>;
    };

    const getStatusBadge = (status) => {
        const map = { pending: 'badge-warning', 'in-progress': 'badge-info', completed: 'badge-success', overdue: 'badge-danger' };
        return <span className={`badge ${map[status]}`}>{status}</span>;
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="tasks-page animate-fadeIn">
            <div className="page-header">
                <div><h1>Tasks</h1><p>{isAdmin ? 'Manage and assign tasks' : 'Your assigned tasks'}</p></div>
                {isAdmin && (
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <HiOutlinePlus /> Create Task
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="filters-bar card">
                <select className="input-field filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                </select>
                <select className="input-field filter-select" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
                    <option value="">All Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                </select>
            </div>

            {/* Task Cards */}
            <div className="tasks-grid">
                {tasks.map(task => (
                    <div key={task._id} className={`card task-card task-${task.priority}`}>
                        <div className="task-card-top">
                            <div className="task-badges">
                                {getPriorityBadge(task.priority)}
                                {getStatusBadge(task.status)}
                            </div>
                            {isAdmin && (
                                <div className="task-actions">
                                    <button className="btn btn-icon btn-secondary" onClick={() => openEdit(task)}><HiOutlinePencil /></button>
                                    <button className="btn btn-icon btn-danger" onClick={() => setConfirmDelete({ open: true, id: task._id })}><HiOutlineTrash /></button>
                                </div>
                            )}
                        </div>
                        <h3 className="task-title">{task.title}</h3>
                        <p className="task-desc">{task.description || 'No description'}</p>
                        <div className="task-meta">
                            <div className="task-assignee">
                                <span className="assignee-avatar">{task.assignedTo?.name?.charAt(0)}</span>
                                <span className="assignee-name">{task.assignedTo?.name}</span>
                            </div>
                            <span className="task-due">
                                Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-IN') : '—'}
                            </span>
                        </div>
                        {/* Status change buttons */}
                        <div className="task-status-actions">
                            {task.status !== 'completed' && (
                                <>
                                    {task.status === 'pending' && (
                                        <button className="btn btn-sm btn-secondary" onClick={() => handleStatusChange(task._id, 'in-progress')}>Start</button>
                                    )}
                                    <button className="btn btn-sm btn-success" onClick={() => handleStatusChange(task._id, 'completed')}>Complete</button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {tasks.length === 0 && <div className="empty-state"><p>No tasks found</p></div>}

            {/* Modal */}
            <Modal isOpen={showModal} onClose={closeModal} title={editing ? 'Edit Task' : 'Create Task'} size="lg">
                <form onSubmit={handleSubmit}>
                    <div className="input-group" style={{ marginBottom: 16 }}>
                        <label>Title *</label>
                        <input className="input-field" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                    </div>
                    <div className="input-group" style={{ marginBottom: 16 }}>
                        <label>Description</label>
                        <textarea className="input-field" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="input-group">
                            <label>Assign To *</label>
                            <select className="input-field" required value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
                                <option value="">Select Employee</option>
                                {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Priority</label>
                            <select className="input-field" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Due Date *</label>
                            <input className="input-field" type="date" required value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label>Status</label>
                            <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="overdue">Overdue</option>
                            </select>
                        </div>
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
                title="Delete Task"
                message="Are you sure you want to delete this task? This cannot be undone."
            />
        </div>
    );
};

export default Tasks;
