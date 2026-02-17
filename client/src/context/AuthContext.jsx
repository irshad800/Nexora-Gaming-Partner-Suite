import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize auth state from local storage
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Verify token validity by fetching user profile
                    const { data } = await api.get('/auth/me');
                    setUser(data.data.user);
                    setProfile(data.data.profile);
                } catch (error) {
                    console.error('Auth initialization failed:', error);
                    logout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    // Login function
    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });

            const { token, user, profile } = data.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            setUser(user);
            setProfile(profile);

            toast.success(`Welcome back, ${user.name}!`);
            return { success: true, role: user.role };
        } catch (error) {
            // Error is handled by axios interceptor toast
            return { success: false, error };
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setProfile(null);
        toast.success('Logged out successfully');
    };

    // Update profile in state (after edit)
    const updateProfileState = (updatedUser, updatedProfile) => {
        if (updatedUser) setUser(updatedUser);
        if (updatedProfile) setProfile(updatedProfile);
    };

    const value = {
        user,
        profile,
        loading,
        login,
        logout,
        updateProfileState,
        isAuthenticated: !!user,
        isAgent: user?.role === 'agent',
        isAffiliate: user?.role === 'affiliate',
        isAdmin: user?.role === 'admin',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
