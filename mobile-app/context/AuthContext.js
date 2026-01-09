import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import { getApiUrl } from '../lib/utils';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  // Helper to fetch user profile
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
        await logout();
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    } finally {
      setLoading(false);
    }
    return null;
  };

  // Check auth state on mount
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          await fetchCurrentUser(storedToken);
        } else {
            setLoading(false);
        }
      } catch (e) {
        console.error("Failed to load auth", e);
        setLoading(false);
      }
    };
    loadAuth();
  }, []);

  // Login
  const login = async (accessToken) => {
    try {
        await AsyncStorage.setItem('token', accessToken);
        setToken(accessToken);
        await fetchCurrentUser(accessToken);
        router.replace('/(tabs)');
    } catch (e) {
        console.error("Login error", e);
    }
  };

  // Logout
  const logout = async () => {
    try {
        await AsyncStorage.removeItem('token');
        setToken(null);
        setUser(null);
        router.replace('/login');
    } catch (e) {
        console.error("Logout error", e);
    }
  };

  // Register
  const register = async (email, password, fullName) => {
    try {
        const res = await fetch(getApiUrl('/api/register'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, full_name: fullName, terms_accepted: 1 }),
        });

        if (res.ok) {
            const data = await res.json();
            await login(data.access_token);
            return true;
        }
        return false;
    } catch (error) {
        console.error("Registration failed", error);
        return false;
    }
  };
  
   const refreshUser = async () => {
        if (token) {
            await fetchCurrentUser(token);
        }
    };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
