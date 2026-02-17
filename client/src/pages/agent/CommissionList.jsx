import { useState, useEffect } from 'react';
import { FiDownload, FiCalendar, FiFilter } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const CommissionList = () => {
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [params, setParams] = useState({
        page: 1,
        limit: 10,
        startDate: '',
        endDate: '',
    });
    const [totalPages, setTotalPages] = useState(1);
    const [totalCommission, setTotalCommission] = useState(0);

    const fetchCommissions = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/agent/commissions', { params });
            setCommissions(data.data?.commissions || []);
            setTotalPages(data.data?.pagination?.pages || 1);
            setTotalCommission(data.data?.totalCommission || 0);
        } catch (error) {
            console.error('Failed to fetch commissions', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommissions();
    }, [params]);

    const handleExport = async () => {
        try {
            const response = await api.get('/agent/commissions/export', {
                params: { startDate: params.startDate, endDate: params.endDate },
                responseType: 'blob',
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `commissions-${format(new Date(), 'yyyy-MM-dd')}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Export downloaded successfully');
        } catch (error) {
            toast.error('Failed to export data');
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setParams({ ...params, page: newPage });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Commission History</h1>
                <button
                    onClick={handleExport}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
                >
                    <FiDownload className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            {/* Filters & Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-dark-border p-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <FiFilter className="w-4 h-4" /> Filter by Date
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                            <div className="relative">
                                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="date"
                                    value={params.startDate}
                                    onChange={(e) => setParams({ ...params, startDate: e.target.value, page: 1 })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-bg dark:text-white transition-colors"
                                />
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">End Date</label>
                            <div className="relative">
                                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="date"
                                    value={params.endDate}
                                    onChange={(e) => setParams({ ...params, endDate: e.target.value, page: 1 })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-bg dark:text-white transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
                    <p className="text-primary-100 text-sm font-medium mb-1">Total Commission Earned</p>
                    <h3 className="text-3xl font-bold">${totalCommission.toFixed(2)}</h3>
                    <p className="text-primary-200 text-xs mt-2">
                        Lifetime earnings from all players
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-dark-bg text-gray-500 dark:text-gray-400 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">From Player</th>
                                <th className="px-6 py-4">Wager Amount</th>
                                <th className="px-6 py-4">Commission (10%)</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        Loading commission data...
                                    </td>
                                </tr>
                            ) : commissions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No commission records found for this period
                                    </td>
                                </tr>
                            ) : (
                                commissions.map((comm) => (
                                    <tr key={comm._id} className="hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {new Date(comm.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white text-sm">
                                                {comm.fromUser?.name || 'Unknown User'}
                                            </div>
                                            <div className="text-xs text-gray-500">{comm.fromUser?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            ${comm.amount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-green-600 dark:text-green-400">
                                            +${(comm.amount || 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                Paid
                                            </span>
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
        </div>
    );
};

export default CommissionList;
