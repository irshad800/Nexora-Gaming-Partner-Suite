import { useState, useEffect } from 'react';
import { FiBarChart2, FiUsers, FiDollarSign, FiMousePointer, FiArrowRight } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import api from '../../services/api';
import { format } from 'date-fns';

const FunnelStats = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFunnel = async () => {
            try {
                const { data } = await api.get('/affiliate/funnel');
                setData(data.data);
            } catch (error) {
                console.error('Failed to fetch funnel stats', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFunnel();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const { funnel, recentReferrals } = data;

    const funnelData = [
        { name: 'Clicks', value: funnel.clicks, fill: '#6366f1', rate: '100%' },
        { name: 'Registrations', value: funnel.registrations, fill: '#8b5cf6', rate: `${funnel.clickToRegRate}%` },
        { name: 'First Deposits', value: funnel.deposits, fill: '#22c55e', rate: `${funnel.regToDepositRate}%` },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Funnel Analysis</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Funnel Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-dark-border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Conversion Funnel</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={funnelData}
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                                    {funnelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                    <LabelList dataKey="rate" position="right" style={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-medium">Click-to-Reg</p>
                            <p className="text-lg font-bold text-primary-600">{funnel.clickToRegRate}%</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-medium">Reg-to-Deposit</p>
                            <p className="text-lg font-bold text-green-600">{funnel.regToDepositRate}%</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-medium">Overall Conv.</p>
                            <p className="text-lg font-bold text-indigo-600">{funnel.overallConversionRate}%</p>
                        </div>
                    </div>
                </div>

                {/* Summary Metrics */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-dark-border p-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Metric Breakdown</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                                        <FiMousePointer className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Clicks</span>
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white">{funnel.clicks}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600">
                                        <FiUsers className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Registrations</span>
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white">{funnel.registrations}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600">
                                        <FiDollarSign className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Depositors</span>
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white">{funnel.deposits}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-xl shadow-md p-6 text-white text-center">
                        <p className="text-primary-100 text-xs font-medium uppercase tracking-wider mb-1">Potential Earnings</p>
                        <h4 className="text-2xl font-bold mb-2">Grow Your Funnel</h4>
                        <p className="text-sm text-primary-100 opacity-80 mb-4">More clicks mean more registrations. Share your link today!</p>
                        <button className="px-4 py-2 bg-white text-primary-700 font-semibold rounded-lg text-sm hover:bg-primary-50 transition-colors">
                            Get Marketing Assets
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Referrals */}
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-dark-border">
                <div className="p-6 border-b border-gray-100 dark:border-dark-border">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Referrals</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-dark-bg/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User ID/Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Registered At</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">First Deposit</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                            {recentReferrals.length > 0 ? (
                                recentReferrals.map((ref) => (
                                    <tr key={ref._id} className="hover:bg-gray-50 dark:hover:bg-dark-bg/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {ref.userName || 'Anonymous'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                            {format(new Date(ref.registeredAt), 'MMM dd, yyyy')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                            {ref.firstDeposit ? (
                                                <span className="text-green-600 font-medium">Yes</span>
                                            ) : (
                                                <span className="text-gray-400">No</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                                            ${ref.revenueGenerated || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {ref.firstDeposit ? (
                                                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                                            ) : (
                                                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Registered</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No referrals yet. Keep sharing!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FunnelStats;
