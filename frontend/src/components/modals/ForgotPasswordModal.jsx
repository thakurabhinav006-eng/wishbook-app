import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { getApiUrl } from '@/lib/utils';

export default function ForgotPasswordModal({ isOpen, onClose }) {
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

            if (!res.ok) {
                setStatus('error');
                setMessage(data.detail || 'Something went wrong.');
                return;
            }

            setStatus('success');
            setMessage('If an account exists, a reset link has been sent.');

        } catch (error) {
            setStatus('error');
            setMessage('Something went wrong. Please try again.');
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#121218] border border-white/10 w-full max-w-md rounded-3xl p-8 relative overflow-hidden shadow-2xl"
                        >
                            {/* Background Glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="mb-6">
                                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 text-purple-400 border border-purple-500/20">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Enter your email address and we'll send you a link to reset your password.
                                </p>
                            </div>

                            {status === 'success' ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center"
                                >
                                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-400">
                                        <CheckCircle className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-green-400 font-bold mb-1">Check your inbox</h3>
                                    <p className="text-gray-400 text-xs">{message}</p>
                                    <button
                                        onClick={onClose}
                                        className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-colors"
                                    >
                                        Back to Login
                                    </button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 transition-colors focus:ring-1 focus:ring-purple-500 outline-none placeholder-gray-600 block"
                                            placeholder="name@example.com"
                                        />
                                    </div>

                                    {status === 'error' && (
                                        <p className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                                            {message}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-2 group"
                                    >
                                        {status === 'loading' ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                Send Reset Link <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
