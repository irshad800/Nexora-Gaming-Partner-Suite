import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useAuth();

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
            {/* Sidebar for Desktop */}
            <div className="hidden lg:block w-64 flex-shrink-0">
                <Sidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-gray-900 bg-opacity-50 transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                >
                    <div className="absolute inset-y-0 left-0 w-64 bg-white dark:bg-dark-card shadow-lg transform transition-transform duration-300 translate-x-0">
                        <Sidebar />
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header toggleSidebar={() => setSidebarOpen(true)} />

                <main className="flex-1 overflow-y-auto focus:outline-none p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
