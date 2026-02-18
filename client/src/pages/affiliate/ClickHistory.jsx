import { useState, useEffect } from 'react';
import { FiMousePointer, FiExternalLink, FiSearch } from 'react-icons/fi';
import api from '../../services/api';
import { format } from 'date-fns';

const ClickHistory = () => {
    const [clicks, setClicks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });

    const fetchClicks = async (page = 1) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/affiliate/clicks?page=${page}&limit=20`);
            setClicks(data.data.clicks);
            setPagination(data.data.pagination);
        } catch (error) {
            console.error('Failed to fetch clicks', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClicks();
    }, []);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            fetchClicks(newPage);
        }
    };

    if (loading && clicks.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Click History</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <FiMousePointer />
                    <span>Total Clicks Tracked: {pagination.total}</span>
                </div>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-dark-bg/50 border-b border-gray-100 dark:border-dark-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">IP Address</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Country</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Source</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Device/UA</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                            {clicks.length > 0 ? (
                                clicks.map((click) => (
                                    <tr key={click._id} className="hover:bg-gray-50 dark:hover:bg-dark-bg/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                            {format(new Date(click.timestamp), 'MMM dd, yyyy HH:mm')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                                            {click.ip}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-dark-bg text-gray-800 dark:text-gray-400">
                                                {click.country}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                            {click.source}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-500 max-w-xs truncate">
                                            {click.userAgent}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {click.converted ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                    Converted
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-dark-bg dark:text-gray-500">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                                    Clicked
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        No click data available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-bg/30">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.pages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700 dark:text-gray-400">
                                    Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-bg disabled:opacity-50"
                                    >
                                        <span className="sr-only">Previous</span>
                                        &larr;
                                    </button>
                                    {[...Array(pagination.pages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => handlePageChange(i + 1)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${pagination.page === i + 1
                                                ? 'z-10 bg-primary-50 border-primary-500 text-primary-600 dark:bg-primary-900/20 dark:border-primary-500'
                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-dark-card dark:border-dark-border dark:hover:bg-dark-bg'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page === pagination.pages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-bg disabled:opacity-50"
                                    >
                                        <span className="sr-only">Next</span>
                                        &rarr;
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClickHistory;
