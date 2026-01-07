'use client';
import React, { createContext, useState, useEffect, useContext } from 'react';
import { getApiUrl } from '@/lib/utils';
import { useRouter } from 'next/navigation'; // Added useRouter

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter(); // Initialized useRouter


    const fetchCurrentUser = async (accessToken) => {
        try {
            const res = await fetch(getApiUrl('/api/users/me'), {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
                return userData;
            } else if (res.status === 401) {
                localStorage.removeItem('token');
                setToken(null);
            }
        } catch (error) {
            console.error("Failed to fetch user profile");
        }
        setLoading(false);
        return null;
    };

    const updateUser = (userData) => {
        setUser(userData);
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setToken(storedToken);
            fetchCurrentUser(storedToken);
        } else {
            setLoading(false);
        }
    }, []);

    const register = async (email, password) => {
        try {
            const res = await fetch(getApiUrl('/api/register'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('token', data.access_token);
                setToken(data.access_token);
                const userRes = await fetch(getApiUrl('/api/users/me'), {
                    headers: { 'Authorization': `Bearer ${data.access_token}` }
                });
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUser(userData);
                    router.push('/dashboard');
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error("Registration failed", error);
            return false;
        }
    };

    const login = async (accessToken) => {
        localStorage.setItem('token', accessToken);
        setToken(accessToken);
        const userData = await fetchCurrentUser(accessToken);
        return userData;
    };

    const googleLogin = async (googleToken) => {
        try {
            const res = await fetch(getApiUrl('/api/auth/google'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: googleToken }),
            });
            if (res.ok) {
                const data = await res.json();
                await login(data.access_token);
                router.push('/dashboard');
                return true;
            }
            return false;
        } catch (error) {
            console.error("Google Login failed", error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        window.location.href = '/login';
    };

    const refreshUser = async () => {
        if (token) {
            await fetchCurrentUser(token);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, token, updateUser, googleLogin, refreshUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
