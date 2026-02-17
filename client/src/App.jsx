import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Placeholder components for routes we haven't built yet
const Placeholder = ({ title }) => (
    <div className="p-6">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">{title}</h2>
        <p className="dark:text-gray-400">This module is under construction.</p>
    </div>
);

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <Toaster position="top-right" />
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/" element={<Navigate to="/login" replace />} />

                        {/* Agent Routes */}
                        <Route element={<ProtectedRoute allowedRoles={['agent']} />}>
                            <Route path="/agent" element={<DashboardLayout />}>
                                <Route path="dashboard" element={<Placeholder title="Agent Dashboard" />} />
                                <Route path="users" element={<Placeholder title="User Management" />} />
                                <Route path="commissions" element={<Placeholder title="Commissions" />} />
                                <Route path="withdrawals" element={<Placeholder title="Withdrawals" />} />
                                <Route path="settings" element={<Placeholder title="Settings" />} />
                                <Route index element={<Navigate to="dashboard" replace />} />
                            </Route>
                        </Route>

                        {/* Affiliate Routes */}
                        <Route element={<ProtectedRoute allowedRoles={['affiliate']} />}>
                            <Route path="/affiliate" element={<DashboardLayout />}>
                                <Route path="dashboard" element={<Placeholder title="Affiliate Dashboard" />} />
                                <Route path="referral-links" element={<Placeholder title="Referral Links" />} />
                                <Route path="clicks" element={<Placeholder title="Click History" />} />
                                <Route path="funnel" element={<Placeholder title="Funnel Stats" />} />
                                <Route path="earnings" element={<Placeholder title="Earnings" />} />
                                <Route path="assets" element={<Placeholder title="Marketing Assets" />} />
                                <Route path="settings" element={<Placeholder title="Settings" />} />
                                <Route index element={<Navigate to="dashboard" replace />} />
                            </Route>
                        </Route>

                        {/* Catch all */}
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
