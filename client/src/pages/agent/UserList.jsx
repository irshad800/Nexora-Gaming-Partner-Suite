import { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiMoreVertical, FiUserCheck, FiUserX, FiEye, FiDownload } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import AddUserModal from './AddUserModal'; // We'll create this next

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [params, setParams] = useState({
        page: 1,
        limit: 10,
        search: '',
        status: '',
    });
    const [totalPages, setTotalPages] = useState(1);
    const [showAddModal, setShowAddModal] = useState(false);

    const handleExport = async () => {
        try {
            const response = await api.get('/agent/users/export', {
                params: { search: params.search, status: params.status },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `players-${format(new Date(), 'yyyy-MM-dd')}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Player list exported successfully');
        } catch (error) {
            toast.error('Failed to export player data');
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/agent/users', { params });
            setUsers(data.data?.players || []);
            setTotalPages(data.data?.pagination?.pages || 1);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(timer);
    }, [params]);

    const toggleUserStatus = async (id, currentStatus) => {
        if (!window.confirm(`Are you sure you want to ${currentStatus === 'active' ? 'block' : 'unblock'} this user?`)) return;

        try {
            await api.patch(`/agent/users/${id}/status`);
            toast.success('User status updated');
            fetchUsers(); // Refresh list
        } catch (error) {
            // Error handled by interceptor
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExport}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
                    >
                        <FiDownload className="w-4 h-4" />
                        Export CSV
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        <FiPlus className="w-4 h-4" />
                        Add New User
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-dark-border p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={params.search}
                            onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-bg dark:text-white transition-colors"
                        />
                    </div>
                    <select
                        value={params.status}
                        onChange={(e) => setParams({ ...params, status: e.target.value, page: 1 })}
                        className="px-4 py-2 border border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-bg dark:text-white transition-colors"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-dark-bg text-gray-500 dark:text-gray-400 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Joined Date</th>
                                <th className="px-6 py-4">Revenue</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        Loading users...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-xs">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white text-sm">{user.name}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'active'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : user.status === 'blocked'
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                    }`}
                                            >
                                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                            — {/* Revenue data would come from aggregation if needed */}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-dark-bg transition-colors"
                                                    title="View Details"
                                                >
                                                    <FiEye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => toggleUserStatus(user._id, user.status)}
                                                    className={`p-1.5 rounded-lg transition-colors ${user.status === 'active'
                                                        ? 'text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                        : 'text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                        }`}
                                                    title={user.status === 'active' ? 'Block User' : 'Unblock User'}
                                                >
                                                    {user.status === 'active' ? <FiUserX className="w-4 h-4" /> : <FiUserCheck className="w-4 h-4" />}
                                                </button>
                                            </div>
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

            {showAddModal && (
                <AddUserModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchUsers} />
            )}
        </div>
    );
};

export default UserList;
