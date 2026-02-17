import { useState, useEffect } from 'react';
import { FiPlus, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import api from '../../services/api';
import WithdrawalRequestModal from './WithdrawalRequestModal';

const WithdrawalList = () => {
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(0);
    const [params, setParams] = useState({
        page: 1,
        limit: 10,
        status: '',
    });
    const [totalPages, setTotalPages] = useState(1);
    const [showRequestModal, setShowRequestModal] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch withdrawals
            const { data } = await api.get('/agent/withdrawals', { params });
            setWithdrawals(data.data.withdrawals);
            setTotalPages(data.data.pagination.pages);

            // Fetch current balance for the modal
            const dashboardData = await api.get('/agent/dashboard');
            setBalance(dashboardData.data.data.withdrawableBalance);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [params]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setParams({ ...params, page: newPage });
        }
    };

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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Withdrawals</h1>
                <button
                    onClick={() => setShowRequestModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    <FiPlus className="w-4 h-4" />
                    Request Withdrawal
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-dark-border p-4">
                <div className="flex gap-4">
                    <select
                        value={params.status}
                        onChange={(e) => setParams({ ...params, status: e.target.value, page: 1 })}
                        className="px-4 py-2 border border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-bg dark:text-white transition-colors"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-dark-bg text-gray-500 dark:text-gray-400 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Date</th>
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
                                        Loading withdrawals...
                                    </td>
                                </tr>
                            ) : withdrawals.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No withdrawal history found
                                    </td>
                                </tr>
                            ) : (
                                withdrawals.map((item) => (
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

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-dark-border flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Page {params.page} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(params.page - 1)}
                            disabled={params.page === 1}
                            className="px-3 py-1 text-sm border border-gray-200 dark:border-dark-border rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors dark:text-gray-300"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => handlePageChange(params.page + 1)}
                            disabled={params.page === totalPages}
                            className="px-3 py-1 text-sm border border-gray-200 dark:border-dark-border rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors dark:text-gray-300"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {showRequestModal && (
                <WithdrawalRequestModal
                    isOpen={showRequestModal}
                    onClose={() => setShowRequestModal(false)}
                    onSuccess={fetchData}
                    balance={balance}
                />
            )}
        </div>
    );
};

export default WithdrawalList;
