import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast'; // Ensure we use toast for errors

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await login(email, password);
        setLoading(false);

        if (result.success) {
            if (result.role === 'agent') {
                navigate('/agent/dashboard');
            } else if (result.role === 'affiliate') {
                navigate('/affiliate/dashboard');
            } else if (result.role === 'admin') {
                // Admin panel not in scope yet, but good to have
                toast('Admin panel coming soon!');
            } else {
                toast.error('Unknown role');
            }
        } else {
            // Error handled by interceptor or context, but can show specific UI feedback here
            console.error('Login failed', result.error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-dark-card p-10 rounded-xl shadow-lg border border-gray-100 dark:border-dark-border">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">
                        Nexora Gaming
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Partner Suite Login
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <input type="hidden" name="remember" value="true" />
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm dark:bg-dark-bg transition-colors"
                                placeholder="Email address"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm dark:bg-dark-bg transition-colors"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                                Forgot your password?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                    <svg className="animate-spin h-5 w-5 text-primary-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </span>
                            ) : null}
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-dark-border"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-dark-card text-gray-500 dark:text-gray-400">
                                Demo Credentials
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-center">
                        <div className="p-2 bg-gray-50 dark:bg-dark-bg rounded border border-gray-200 dark:border-dark-border cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-border/50" onClick={() => { setEmail('agent@nexora.com'); setPassword('agent123'); }}>
                            <p className="font-semibold text-gray-900 dark:text-white">Agent</p>
                            <p className="text-gray-500">agent@nexora.com</p>
                            <p className="text-gray-500">agent123</p>
                        </div>
                        <div className="p-2 bg-gray-50 dark:bg-dark-bg rounded border border-gray-200 dark:border-dark-border cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-border/50" onClick={() => { setEmail('affiliate@nexora.com'); setPassword('affiliate123'); }}>
                            <p className="font-semibold text-gray-900 dark:text-white">Affiliate</p>
                            <p className="text-gray-500">affiliate@nexora.com</p>
                            <p className="text-gray-500">affiliate123</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
