import { useState, useEffect } from 'react';
import { FiCopy, FiPlus, FiLink, FiActivity, FiUsers, FiPercent } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ReferralLinks = () => {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newLinkData, setNewLinkData] = useState({ campaign: '', source: '', code: '' });
    const [generating, setGenerating] = useState(false);

    // Fetch existing links
    const fetchLinks = async () => {
        try {
            const { data } = await api.get('/affiliate/referral-links');
            // Backend returns { success: true, data: { referralCode: '...', totalClicks: 0, ... } }
            if (data.data && data.data.referralCode) {
                setLinks([{
                    _id: 'primary',
                    code: data.data.referralCode,
                    clicks: data.data.totalClicks || 0,
                    registrations: data.data.totalRegistrations || 0,
                    createdAt: data.data.createdAt || new Date().toISOString(),
                    campaign: 'Primary Referral Link'
                }]);
            } else if (Array.isArray(data.data)) {
                setLinks(data.data);
            } else {
                setLinks([]);
            }
        } catch (error) {
            console.error('Failed to fetch referral links', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLinks();
    }, []);

    // Generate new link
    const handleGenerate = async (e) => {
        e.preventDefault();
        setGenerating(true);
        try {
            await api.post('/affiliate/referral-links', {
                slug: newLinkData.code || newLinkData.campaign
            });
            toast.success('Referral link generated');
            setShowCreateForm(false);
            setNewLinkData({ campaign: '', source: '', code: '' });
            fetchLinks();
        } catch (error) {
            // Error handled by interceptor
        } finally {
            setGenerating(false);
        }
    };

    // Copy to clipboard
    const handleCopy = (code) => {
        const url = `${window.location.origin}/ref/${code}`;
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Referral Links</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your tracking links and monitor their performance.</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    <FiPlus className="w-4 h-4" />
                    {showCreateForm ? 'Cancel' : 'Create New Link'}
                </button>
            </div>

            {showCreateForm && (
                <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-dark-border p-6 animate-in slide-in-from-top-4 duration-300">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generate Custom Link</h3>
                    <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Custom Link Slug (Optional)</label>
                            <input
                                type="text"
                                placeholder="e.g. summer-promo"
                                value={newLinkData.code}
                                onChange={(e) => setNewLinkData({ ...newLinkData, code: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-bg dark:text-white"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={generating}
                            className="w-full sm:w-auto px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium disabled:opacity-75"
                        >
                            {generating ? 'Generating...' : 'Generate'}
                        </button>
                    </form>
                </div>
            )}

            {/* Links List */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading links...</div>
                ) : links.length === 0 ? (
                    <div className="text-center py-10 bg-white dark:bg-dark-card rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <FiLink className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No referral links yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Create your first link to start tracking referrals.</p>
                    </div>
                ) : (
                    links.map((link) => (
                        <div key={link._id} className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-dark-border p-5 hover:border-primary-200 dark:hover:border-primary-900/50 transition-colors">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                                            {link.campaign || 'Default Campaign'}
                                        </h4>
                                        {link.isDefault && (
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs rounded-full font-medium">Default</span>
                                        )}
                                        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-dark-bg px-2 py-0.5 rounded">
                                            {new Date(link.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-dark-bg p-2 rounded-lg border border-gray-200 dark:border-dark-border max-w-xl">
                                        <code className="text-sm text-primary-600 dark:text-primary-400 flex-1 truncate">
                                            {`${window.location.origin}/ref/${link.code}`}
                                        </code>
                                        <button
                                            onClick={() => handleCopy(link.code)}
                                            className="p-1.5 hover:bg-white dark:hover:bg-dark-card rounded text-gray-500 hover:text-primary-600 transition-colors"
                                            title="Copy Link"
                                        >
                                            <FiCopy className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-dark-border pt-4 lg:pt-0 lg:pl-8">
                                    <div className="text-center">
                                        <div className="flex items-center gap-1 text-gray-500 text-xs uppercase font-medium mb-1">
                                            <FiActivity className="w-3 h-3" /> Clicks
                                        </div>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">{link.clicks}</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center gap-1 text-gray-500 text-xs uppercase font-medium mb-1">
                                            <FiUsers className="w-3 h-3" /> Signups
                                        </div>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white text-green-600">{link.registrations}</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center gap-1 text-gray-500 text-xs uppercase font-medium mb-1">
                                            <FiPercent className="w-3 h-3" /> Conv. Rate
                                        </div>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                                            {(link.clicks || 0) > 0 ? (((link.registrations || 0) / link.clicks) * 100).toFixed(1) : 0}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ReferralLinks;
