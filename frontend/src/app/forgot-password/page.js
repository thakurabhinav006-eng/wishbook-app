'use client';
import React, { useState } from 'react';
import { getApiUrl } from '@/lib/utils';
import { Mail, ArrowLeft, Loader2, Send } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        
        try {
            const res = await fetch(getApiUrl('/api/auth/forgot-password'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            
            // We always show success for security, unless network error
            setStatus('success');
            setMessage('If an account exists with this email, you will receive a password reset link shortly.');
            
            // For dev/demo purposes, if a mock token was returned, log it
            if (data.mock_token) {
                console.log("DEV: Mock Reset Token:", data.mock_token);
            }
        } catch (error) {
            setStatus('error');
            setMessage('An unexpected error occurred. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#121218] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <Link href="/login" className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-500/20 text-purple-400">
                        <Mail className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Forgot Password?</h1>
                    <p className="text-gray-400 text-sm">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                {status === 'success' ? (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                        <p className="text-green-400 text-sm">{message}</p>
                        <p className="text-xs text-green-500/50 mt-4 uppercase font-bold">Check your spam folder</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 transition-colors focus:ring-1 focus:ring-purple-500 outline-none placeholder-gray-600"
                                placeholder="name@example.com"
                            />
                        </div>

                        {status === 'error' && (
                            <p className="text-red-400 text-sm text-center">{message}</p>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-2"
                        >
                            {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            Send Reset Link
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
