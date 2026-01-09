'use client';
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { getApiUrl } from '@/lib/utils';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, googleLogin } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // FastAPI OAuth2PasswordRequestForm expects form-urlencoded data with 'username' and 'password'
            const formData = new URLSearchParams();
            formData.append('username', email); // backend expects 'username' for the email field
            formData.append('password', password);

            const res = await fetch(getApiUrl('/api/token'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || 'Login failed');
            }

            const user = await login(data.access_token);
            router.push('/dashboard');
        } catch (err) {
            console.error(err);
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-premium overflow-hidden">
            {/* Left Side: Visuals */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 relative bg-white/5 backdrop-blur-sm">
                <div className="relative z-10 space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex items-center"
                    >
                        <div className="p-3 bg-white/10 rounded-2xl mr-4 backdrop-blur-sm border border-white/10">
                            <Sparkles className="w-8 h-8 text-purple-400" />
                        </div>
                        <h1 className="text-4xl font-bold text-white tracking-tight">Welcome Back</h1>
                    </motion.div>
                    
                    <motion.p 
                         initial={{ opacity: 0, x: -50 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ duration: 0.8, delay: 0.2 }}
                         className="text-xl text-gray-300 leading-relaxed max-w-md"
                    >
                        Continue your journey of sending magical wishes and connecting with loved ones.
                    </motion.p>
                </div>
                {/* Abstract Blooms */}
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-600/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-60 animate-blob"></div>
                <div className="absolute top-0 -right-20 w-80 h-80 bg-blue-600/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-60 animate-blob animation-delay-2000"></div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8 bg-black/20 backdrop-blur-md">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="glass-card w-full max-w-md p-6 md:p-10 rounded-3xl border-t-4 border-t-purple-500 shadow-2xl"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">Sign In</h2>
                        <p className="text-gray-400 mb-6">Access your dashboard</p>
                        
                        <div className="flex justify-center mb-6">
                                    <GoogleLogin
                                        onSuccess={async (credentialResponse) => {
                                            try {
                                                const success = await googleLogin(credentialResponse.credential);
                                                if (!success) {
                                                    setError('Google sign-in failed. Please try again.');
                                                }
                                            } catch (err) {
                                                setError('Google sign-in error occurred.');
                                            }
                                        }}
                                        onError={() => {
                                            setError('Google sign-in was cancelled or failed. Please try again.');
                                        }}
                                        theme="filled_black"
                                        shape="pill"
                                        size="large"
                                        text="signin_with"
                                    />
                        </div>
                        
                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-black/20 text-gray-500 backdrop-blur-md">Or continue with email</span>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl text-sm flex items-center"
                        >
                            <span className="mr-2">⚠️</span> {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors w-5 h-5" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white/10 focus:border-transparent outline-none transition-all placeholder-gray-600"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-medium text-gray-300">Password</label>
                                <button type="button" onClick={() => {/* Handle forgot password - possibly a modal or link */}} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                                    Forgot Password?
                                </button>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors w-5 h-5" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white/10 focus:border-transparent outline-none transition-all placeholder-gray-600"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-400 transition-all hover:scale-110 active:scale-95 focus:outline-none p-1 z-10"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300 flex items-center justify-center group ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Signing In...' : (
                                <>
                                    Sign In <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-400">
                        Don't have an account?{' '}
                        <Link href="/signup" className="text-purple-400 font-bold hover:text-purple-300 transition-colors ml-1">
                            Create Account
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
