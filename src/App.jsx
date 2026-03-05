import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import Attendance from './pages/Attendance';
import Tasks from './pages/Tasks';
import Payroll from './pages/Payroll';
import Profile from './pages/Profile';
import ActivityLogs from './pages/ActivityLogs';

function App() {
    return (
        <AuthProvider>
            <Router>
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                />
                <Routes>
                    <Route path="/login" element={<Login />} />

                    {/* Protected Routes with Layout */}
                    <Route element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }>
                        <Route path="/dashboard" element={
                            <ProtectedRoute roles={['superadmin', 'admin']}>
                                <Dashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/employees" element={
                            <ProtectedRoute roles={['superadmin', 'admin']}>
                                <Employees />
                            </ProtectedRoute>
                        } />
                        <Route path="/departments" element={
                            <ProtectedRoute roles={['superadmin', 'admin']}>
                                <Departments />
                            </ProtectedRoute>
                        } />
                        <Route path="/attendance" element={<Attendance />} />
                        <Route path="/tasks" element={<Tasks />} />
                        <Route path="/payroll" element={<Payroll />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/activity-logs" element={
                            <ProtectedRoute roles={['superadmin']}>
                                <ActivityLogs />
                            </ProtectedRoute>
                        } />
                    </Route>

                    {/* Default redirects */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
