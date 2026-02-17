import { useState, useEffect } from 'react';
import { FiPlus, FiClock, FiCheckCircle, FiXCircle, FiDollarSign } from 'react-icons/fi';
import api from '../../services/api';
import PayoutRequestModal from './PayoutRequestModal';

const EarningsList = () => {
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(0);
    const [stats, setStats] = useState(null);
    const [showRequestModal, setShowRequestModal] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch payouts history
            const { data } = await api.get('/affiliate/payouts');
            setPayouts(data.data);

            // Fetch dashboard data for balance and earnings stats
            const dashboardData = await api.get('/affiliate/dashboard');
            setBalance(dashboardData.data.data.withdrawableBalance);
            setStats(dashboardData.data.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <FiCheckCircle className="w-3 h-3" /> Approved
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        <FiXCircle className="w-3 h-3" /> Rejected
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        <FiClock className="w-3 h-3" /> Pending
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Earnings & Payouts</h1>
                <button
                    onClick={() => setShowRequestModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    <FiPlus className="w-4 h-4" />
                    Request Payout
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-dark-border p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <FiDollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Earnings</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">${stats?.totalRevenue || 0}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-dark-border p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                            <FiClock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Pending Payouts</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.pendingWithdrawals || 0}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-dark-border p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                            <FiCheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Paid Out</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">${stats?.totalWithdrawn || 0}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-dark-border">
                <div className="p-6 border-b border-gray-100 dark:border-dark-border">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payout History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-dark-bg text-gray-500 dark:text-gray-400 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Date Requested</th>
                                <th className="px-6 py-4">Method</th>
                                <th className="px-6 py-4">Details</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        Loading payout history...
                                    </td>
                                </tr>
                            ) : payouts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No payout history found
                                    </td>
                                </tr>
                            ) : (
                                payouts.map((item) => (
                                    <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white capitalize">
                                            {item.paymentMethod.replace('_', ' ')}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                                            {item.paymentDetails}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                                            ${item.amount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(item.status)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showRequestModal && (
                <PayoutRequestModal
                    isOpen={showRequestModal}
                    onClose={() => setShowRequestModal(false)}
                    onSuccess={fetchData}
                    balance={balance}
                />
            )}
        </div>
    );
};

export default EarningsList;
