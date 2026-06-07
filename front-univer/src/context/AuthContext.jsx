import { createContext, useState } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export { AuthContext };

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [loading] = useState(false);

    const login = async (email, password) => {
        const res = await authAPI.login({ email, password });
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        return userData;
    };

    const register = async (data) => {
        const res = await authAPI.register(data);
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const refreshUser = async () => {
        if (!token) return;
        try {
            const res = await authAPI.me();
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
        } catch {
            logout();
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, refreshUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

