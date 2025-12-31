'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getApiUrl } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Lock, Mail, Loader2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import ForgotPasswordModal from '@/components/modals/ForgotPasswordModal';


export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);
    const { login, googleLogin, token, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && token) {
            router.push('/dashboard');
        }
    }, [loading, token, router]);

    // Show nothing or a loader while checking auth state to prevent flicker
    if (loading || (token && !loading)) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                 <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('username', email); // OAuth2 expects 'username'
            formData.append('password', password);

            const response = await fetch(getApiUrl('/api/token'), {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || 'Login failed');
            }

            const data = await response.json();
            login(data.access_token);
            router.push('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-premium overflow-hidden">
            {/* Left Side: Visuals */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 relative">
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
                        <h1 className="text-5xl font-bold text-white tracking-tight">AI Wishing Tool</h1>
                    </motion.div>

                    <motion.p 
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl text-gray-300 max-w-lg leading-relaxed"
                    >
                        Craft the perfect wish for every occasion. <br />
                        <span className="text-purple-300 font-medium">Personalized, thoughtful, and magical.</span>
                    </motion.p>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="grid grid-cols-2 gap-4 max-w-sm"
                    >
                        {[
                            { icon: "🎂", label: "Birthdays", delay: 0.5 },
                            { icon: "🎉", label: "Anniversaries", delay: 0.6 },
                            { icon: "💼", label: "Professional", delay: 0.7 },
                            { icon: "❤️", label: "Love & Care", delay: 0.8 }
                        ].map((item, idx) => (
                            <motion.div 
                                key={idx}
                                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
                                className="glass-card p-4 rounded-2xl border border-white/10 cursor-default transition-colors"
                            >
                                <span className="text-3xl block mb-2">{item.icon}</span>
                                <p className="font-semibold text-gray-200">{item.label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* Abstract Background Element */}
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-600/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
                <div className="absolute top-0 -right-20 w-80 h-80 bg-blue-600/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-black/20 backdrop-blur-sm relative">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="glass-card w-full max-w-md p-8 md:p-10 rounded-3xl shadow-2xl border border-white/10"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                        <p className="text-gray-400 mb-6">Sign in to manage your wishes</p>
                        
                        <div className="flex justify-center mb-6">
                            <GoogleLogin
                                onSuccess={credentialResponse => {
                                    googleLogin(credentialResponse.credential);
                                }}
                                onError={() => {
                                    setError('Google Login Failed');
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

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors w-5 h-5" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/20 text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-black/50 focus:border-transparent outline-none transition-all placeholder-gray-400"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors w-5 h-5" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/20 text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-black/50 focus:border-transparent outline-none transition-all placeholder-gray-400"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm px-1">
                            <label className="flex items-center text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
                                <input type="checkbox" className="mr-2 rounded text-purple-600 focus:ring-purple-500 bg-white/10 border-white/20 w-4 h-4 cursor-pointer" />
                                Remember me
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowForgotModal(true)}
                                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                            >
                                Forgot password?
                            </button>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300 flex items-center justify-center group ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Signing In...
                                </>
                            ) : (
                                <>
                                    Sign In <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </motion.button>
                    </form>



                    <div className="mt-8 text-center text-sm text-gray-400">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="text-purple-400 font-bold hover:text-purple-300 transition-colors ml-1">
                            Create free account
                        </Link>
                    </div>
                </motion.div>
            </div>
            
            <ForgotPasswordModal 
                isOpen={showForgotModal} 
                onClose={() => setShowForgotModal(false)} 
            />
        </div>
    );
};

