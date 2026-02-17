import { FiMenu, FiMoon, FiSun, FiBell } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

const Header = ({ toggleSidebar }) => {
    const { darkMode, toggleTheme } = useTheme();

    return (
        <header className="h-16 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border flex items-center justify-between px-6 sticky top-0 z-20 transition-colors duration-300">
            <div className="flex items-center gap-4">
                {/* Mobile sidebar toggle */}
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"
                >
                    <FiMenu className="w-6 h-6" />
                </button>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white hidden sm:block">
                    Dashboard
                </h2>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                {/* Notification Bell (Dummy) */}
                <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors relative">
                    <FiBell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-dark-card"></span>
                </button>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"
                    aria-label="Toggle Dark Mode"
                >
                    {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
                </button>
            </div>
        </header>
    );
};

export default Header;
