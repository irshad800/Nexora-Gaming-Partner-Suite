import { useState, useEffect } from 'react';
import { FiMousePointer, FiUserPlus, FiDollarSign, FiPercent } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../../services/api';
import StatsCard from '../../components/common/StatsCard';
import PayoutRequestModal from './PayoutRequestModal';

const AffiliateDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const fetchDashboard = async () => {
        try {
            const { data } = await api.get('/affiliate/dashboard');
            setStats(data.data);
        } catch (error) {
            console.error('Failed to fetch dashboard stats', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Affiliate Dashboard</h1>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Referral Code: <span className="font-mono font-bold text-primary-600 dark:text-primary-400 ml-1">{stats?.referralCode}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Clicks"
                    value={stats?.totalClicks || 0}
                    icon={FiMousePointer}
                    color="blue"
                />
                <StatsCard
                    title="Registrations"
                    value={stats?.totalRegistrations || 0}
                    icon={FiUserPlus}
                    color="purple"
                />
                <StatsCard
                    title="First Deposits"
                    value={stats?.totalDeposits || 0}
                    icon={FiDollarSign}
                    color="green"
                />
                <StatsCard
                    title="Total Revenue"
                    value={`$${stats?.totalRevenue || 0}`}
                    icon={FiDollarSign}
                    color="orange"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Converstion Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-dark-border p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Conversions Overview</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-indigo-500"></span> Clicks</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> Signups</span>
                        </div>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.chartData || []}>
                                <defs>
                                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorRegs" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    dy={10}
                                    tickFormatter={(val) => val.slice(5)} // Show MM-DD
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="clicks"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorClicks)"
                                    name="Clicks"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="registrations"
                                    stroke="#22c55e"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorRegs)"
                                    name="Registrations"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Balance & Quick Actions */}
                <div className="space-y-6">
                    {/* Balance Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-lg p-6 text-white">
                        <p className="text-indigo-100 text-sm font-medium mb-1">Withdrawable Balance</p>
                        <h3 className="text-3xl font-bold mb-4">${stats?.withdrawableBalance || 0}</h3>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-indigo-400 border-opacity-30">
                            <div>
                                <p className="text-indigo-200 text-xs">Pending Payouts</p>
                                <p className="font-semibold">{stats?.pendingWithdrawals || 0}</p>
                            </div>
                            <div>
                                <p className="text-indigo-200 text-xs">Total Withdrawn</p>
                                <p className="font-semibold">${stats?.totalWithdrawn || 0}</p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={() => setShowModal(true)}
                                className="w-full py-2 bg-white text-indigo-700 font-medium rounded-lg hover:bg-indigo-50 transition-colors shadow-sm"
                            >
                                Request Payout
                            </button>
                        </div>
                    </div>

                    {/* Revenue Share Badge */}
                    <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-dark-border p-6 flex items-center gap-4">
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-full text-yellow-600 dark:text-yellow-400">
                            <FiPercent className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Fixed Revenue Share</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{stats?.revenueSharePercent || 15}%</p>
                        </div>
                    </div>
                </div>
            </div>

            <PayoutRequestModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={fetchDashboard}
                balance={stats?.withdrawableBalance || 0}
            />
        </div>
    );
};

export default AffiliateDashboard;
