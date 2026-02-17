import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FiHome, FiUsers, FiDollarSign, FiCreditCard, FiSettings,
    FiMousePointer, FiShare2, FiBarChart2, FiLogOut
} from 'react-icons/fi';

const Sidebar = () => {
    const { user, isAgent, isAffiliate, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const agentLinks = [
        { name: 'Dashboard', path: '/agent/dashboard', icon: FiHome },
        { name: 'Users', path: '/agent/users', icon: FiUsers },
        { name: 'Commissions', path: '/agent/commissions', icon: FiDollarSign },
        { name: 'Withdrawals', path: '/agent/withdrawals', icon: FiCreditCard },
        { name: 'Settings', path: '/agent/settings', icon: FiSettings },
    ];

    const affiliateLinks = [
        { name: 'Dashboard', path: '/affiliate/dashboard', icon: FiHome },
        { name: 'Referral Links', path: '/affiliate/referral-links', icon: FiShare2 },
        { name: 'Click History', path: '/affiliate/clicks', icon: FiMousePointer },
        { name: 'Funnel Stats', path: '/affiliate/funnel', icon: FiBarChart2 },
        { name: 'Earnings', path: '/affiliate/earnings', icon: FiDollarSign },
        { name: 'Marketing Assets', path: '/affiliate/assets', icon: FiShare2 }, // Reusing icon for assets
        { name: 'Settings', path: '/affiliate/settings', icon: FiSettings },
    ];

    const links = isAgent ? agentLinks : isAffiliate ? affiliateLinks : [];

    return (
        <aside className="w-64 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border min-h-screen flex flex-col fixed left-0 top-0 z-30 transition-colors duration-300">
            <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-dark-border px-6">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
                    Nexora Gaming
                </h1>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
                {links.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.path);
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${active
                                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-bg hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${active ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`} />
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-dark-border">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-sm">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {user?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user?.role === 'agent' ? 'Agent Partner' : 'Affiliate Partner'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                    <FiLogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
