import { useState, useEffect } from 'react';
import { FiDownload, FiImage, FiCode, FiCopy } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Dummy assets data since we don't have a real CMS for this
const dummyAssets = [
    {
        id: 1,
        title: 'Main Banner - 728x90',
        type: 'banner',
        size: '728x90',
        url: 'https://via.placeholder.com/728x90/4f46e5/ffffff?text=Play+at+Nexora+Casino',
        preview: 'https://via.placeholder.com/728x90/4f46e5/ffffff?text=Play+at+Nexora+Casino'
    },
    {
        id: 2,
        title: 'Sidebar Ad - 300x250',
        type: 'banner',
        size: '300x250',
        url: 'https://via.placeholder.com/300x250/4f46e5/ffffff?text=Join+Now!%0AStart+Winning',
        preview: 'https://via.placeholder.com/300x250/4f46e5/ffffff?text=Join+Now!%0AStart+Winning'
    },
    {
        id: 3,
        title: 'Square Logo - 250x250',
        type: 'logo',
        size: '250x250',
        url: 'https://via.placeholder.com/250x250/4f46e5/ffffff?text=Nexora+Logo',
        preview: 'https://via.placeholder.com/250x250/4f46e5/ffffff?text=Nexora+Logo'
    }
];

const MarketingAssets = () => {
    const [assets, setAssets] = useState(dummyAssets); // In real app, fetch from API
    const [referralCode, setReferralCode] = useState('');

    useEffect(() => {
        // Fetch user profile to get default referral code for embed snippets
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/affiliate/dashboard');
                setReferralCode(data.data.referralCode);
            } catch (error) {
                console.error('Failed to load profile', error);
            }
        };
        fetchProfile();
    }, []);

    const handleCopyCode = (assetUrl) => {
        const code = `<a href="${window.location.origin}/ref/${referralCode || 'YOUR_CODE'}" target="_blank"><img src="${assetUrl}" alt="Play at Nexora" /></a>`;
        navigator.clipboard.writeText(code);
        toast.success('Embed code copied');
    };

    const handleDownload = (assetUrl, filename) => {
        const link = document.createElement('a');
        link.href = assetUrl;
        link.setAttribute('download', filename);
        link.setAttribute('target', '_blank');
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Marketing Assets</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Download high-quality banners and logos to promote our platform.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {assets.map((asset) => (
                    <div key={asset.id} className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-dark-border p-4 flex flex-col">
                        <div className="bg-gray-100 dark:bg-dark-bg rounded-lg p-2 mb-4 flex items-center justify-center min-h-[160px]">
                            <img src={asset.preview} alt={asset.title} className="max-w-full h-auto object-contain rounded" />
                        </div>

                        <div className="mb-4 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold uppercase text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded">
                                    {asset.type}
                                </span>
                                <span className="text-xs text-gray-500">{asset.size}</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{asset.title}</h3>
                        </div>

                        <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100 dark:border-dark-border">
                            <button
                                onClick={() => handleCopyCode(asset.url)}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-dark-bg dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium transition-colors"
                            >
                                <FiCode className="w-3 h-3" /> Copy Code
                            </button>
                            <button
                                onClick={() => handleDownload(asset.url, `nexora-asset-${asset.id}.png`)}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-medium transition-colors"
                            >
                                <FiDownload className="w-3 h-3" /> Download
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MarketingAssets;
