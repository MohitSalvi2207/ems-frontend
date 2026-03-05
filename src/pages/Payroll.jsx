import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { HiOutlineCurrencyRupee, HiOutlineDownload, HiOutlineCheck } from 'react-icons/hi';
import { toast } from 'react-toastify';
import './Payroll.css';

const Payroll = () => {
    const { user, isAdmin } = useAuth();
    const [payrolls, setPayrolls] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showGenerate, setShowGenerate] = useState(false);
    const [genForm, setGenForm] = useState({
        userId: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(),
        allowances: { hra: 0, transport: 2500, medical: 1500, other: 1000 },
        deductions: { tax: 0, pf: 0, insurance: 500, other: 0 }
    });
    const [filterMonth, setFilterMonth] = useState('');
    const [filterYear, setFilterYear] = useState('');

    useEffect(() => { fetchData(); }, [filterMonth, filterYear]);

    const fetchData = async () => {
        try {
            const params = { limit: 50 };
            if (filterMonth) params.month = filterMonth;
            if (filterYear) params.year = filterYear;
            const { data } = await api.get('/payroll', { params });
            if (data.success) setPayrolls(data.data);

            if (isAdmin) {
                const empRes = await api.get('/employees', { params: { limit: 100 } });
                if (empRes.data.success) setEmployees(empRes.data.data);
            }
        } catch { } finally { setLoading(false); }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/payroll/generate', genForm);
            toast.success('Payroll generated');
            setShowGenerate(false);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Generation failed');
        }
    };

    const handlePay = async (id) => {
        try {
            await api.put(`/payroll/${id}/pay`);
            toast.success('Marked as paid');
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        }
    };

    const handleDownload = async (id) => {
        try {
            const response = await api.get(`/payroll/${id}/payslip`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(response.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = `payslip_${id}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success('Payslip downloaded');
        } catch (err) {
            toast.error('Download failed');
        }
    };

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
        <div className="payroll-page animate-fadeIn">
            <div className="page-header">
                <div><h1>Payroll</h1><p>{isAdmin ? 'Manage payroll and generate payslips' : 'Your salary history'}</p></div>
                {isAdmin && (
                    <button className="btn btn-primary" onClick={() => setShowGenerate(!showGenerate)}>
                        <HiOutlineCurrencyRupee /> Generate Payroll
                    </button>
                )}
            </div>

            {/* Generate Form (Admin) */}
            {showGenerate && isAdmin && (
                <div className="card generate-card animate-slideUp">
                    <h3>Generate Payroll</h3>
                    <form onSubmit={handleGenerate}>
                        <div className="gen-grid">
                            <div className="input-group">
                                <label>Employee *</label>
                                <select className="input-field" required value={genForm.userId} onChange={e => setGenForm({ ...genForm, userId: e.target.value })}>
                                    <option value="">Select Employee</option>
                                    {employees.map(e => <option key={e._id} value={e._id}>{e.name} (₹{e.salary?.toLocaleString('en-IN')})</option>)}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Month</label>
                                <select className="input-field" value={genForm.month} onChange={e => setGenForm({ ...genForm, month: parseInt(e.target.value) })}>
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>{monthNames[i]}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Year</label>
                                <select className="input-field" value={genForm.year} onChange={e => setGenForm({ ...genForm, year: parseInt(e.target.value) })}>
                                    {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="gen-grid" style={{ marginTop: 16 }}>
                            <div className="input-group"><label>HRA</label><input className="input-field" type="number" value={genForm.allowances.hra} onChange={e => setGenForm({ ...genForm, allowances: { ...genForm.allowances, hra: Number(e.target.value) } })} /></div>
                            <div className="input-group"><label>Transport</label><input className="input-field" type="number" value={genForm.allowances.transport} onChange={e => setGenForm({ ...genForm, allowances: { ...genForm.allowances, transport: Number(e.target.value) } })} /></div>
                            <div className="input-group"><label>Tax</label><input className="input-field" type="number" value={genForm.deductions.tax} onChange={e => setGenForm({ ...genForm, deductions: { ...genForm.deductions, tax: Number(e.target.value) } })} /></div>
                            <div className="input-group"><label>PF</label><input className="input-field" type="number" value={genForm.deductions.pf} onChange={e => setGenForm({ ...genForm, deductions: { ...genForm.deductions, pf: Number(e.target.value) } })} /></div>
                        </div>
                        <div className="gen-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowGenerate(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary">Generate</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filters */}
            <div className="filters-bar card">
                <select className="input-field filter-select" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
                    <option value="">All Months</option>
                    {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{monthNames[i]}</option>)}
                </select>
                <select className="input-field filter-select" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
                    <option value="">All Years</option>
                    {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
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
                                        {isAdmin && <th>Employee</th>}
                                        <th>Period</th>
                                        <th>Basic</th>
                                        <th>Allowances</th>
                                        <th>Deductions</th>
                                        <th>Net Salary</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payrolls.map(pay => (
                                        <tr key={pay._id}>
                                            {isAdmin && <td>{pay.user?.name || '—'}</td>}
                                            <td>{monthNames[pay.month - 1]} {pay.year}</td>
                                            <td>₹{pay.basicSalary?.toLocaleString('en-IN')}</td>
                                            <td className="amount-positive">+₹{pay.totalAllowances?.toLocaleString('en-IN')}</td>
                                            <td className="amount-negative">-₹{pay.totalDeductions?.toLocaleString('en-IN')}</td>
                                            <td className="amount-net"><strong>₹{pay.netSalary?.toLocaleString('en-IN')}</strong></td>
                                            <td><span className={`badge ${pay.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>{pay.status}</span></td>
                                            <td>
                                                <div className="action-btns">
                                                    <button className="btn btn-sm btn-secondary" onClick={() => handleDownload(pay._id)}>
                                                        <HiOutlineDownload /> PDF
                                                    </button>
                                                    {isAdmin && pay.status === 'pending' && (
                                                        <button className="btn btn-sm btn-success" onClick={() => handlePay(pay._id)}>
                                                            <HiOutlineCheck /> Pay
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Mobile Cards ── */}
                        <div className="mobile-payroll-list">
                            {payrolls.map(pay => (
                                <div key={pay._id} className="mobile-payroll-card">
                                    <div className="mobile-payroll-header">
                                        <div>
                                            <div className="mobile-payroll-period">{monthNames[pay.month - 1]} {pay.year}</div>
                                            {isAdmin && <div className="mobile-payroll-emp">{pay.user?.name}</div>}
                                        </div>
                                        <span className={`badge ${pay.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>{pay.status}</span>
                                    </div>
                                    <div className="mobile-payroll-amounts">
                                        <div className="mobile-payroll-field">
                                            <span className="mobile-field-label">Basic Salary</span>
                                            <span className="mobile-field-value">₹{pay.basicSalary?.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="mobile-payroll-field">
                                            <span className="mobile-field-label">Allowances</span>
                                            <span className="mobile-field-value amount-positive">+₹{pay.totalAllowances?.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="mobile-payroll-field">
                                            <span className="mobile-field-label">Deductions</span>
                                            <span className="mobile-field-value amount-negative">-₹{pay.totalDeductions?.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="mobile-payroll-field">
                                            <span className="mobile-field-label">Net Salary</span>
                                            <span className="net-salary-highlight">₹{pay.netSalary?.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                    <div className="mobile-payroll-footer">
                                        <div className="action-btns">
                                            <button className="btn btn-sm btn-secondary" onClick={() => handleDownload(pay._id)}>
                                                <HiOutlineDownload /> PDF
                                            </button>
                                            {isAdmin && pay.status === 'pending' && (
                                                <button className="btn btn-sm btn-success" onClick={() => handlePay(pay._id)}>
                                                    <HiOutlineCheck /> Pay
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {payrolls.length === 0 && <div className="empty-state"><p>No payroll records found</p></div>}
                    </>
                )}
            </div>
        </div>
    );
};

export default Payroll;
