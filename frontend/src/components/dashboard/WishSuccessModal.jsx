'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Sparkles, ArrowRight, History, Plus, Calendar, Palette, Loader2, PartyPopper } from 'lucide-react';
import { createPortal } from 'react-dom';

const Particle = ({ delay }) => (
    <motion.div
        initial={{ y: 0, x: 0, opacity: 1, scale: 0 }}
        animate={{
            y: [0, -100, -50],
            x: [0, (Math.random() - 0.5) * 200],
            opacity: [1, 1, 0],
            scale: [0, 1, 0.5]
        }}
        transition={{ duration: 2, delay, ease: "easeOut" }}
        className="absolute w-2 h-2 rounded-full bg-gradient-to-tr from-purple-400 to-pink-400"
    />
);

export default function WishSuccessModal({ isOpen, onClose, onAction, data }) {
    const [countdown, setCountdown] = useState(3);
    const [isPaused, setIsPaused] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShowConfetti(true);
            const timer = setTimeout(() => setShowConfetti(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && !isPaused) {
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        onAction('poster');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isOpen, isPaused, onAction]);

    if (!isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />

            <motion.div
                initial={{ scale: 0.8, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.8, y: 50, opacity: 0 }}
                className="relative w-full max-w-lg bg-[#050508] border border-white/10 rounded-[3rem] shadow-[0_0_100px_rgba(168,85,247,0.15)] overflow-hidden"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {/* Progress Bar for Countdown */}
                <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                    <motion.div
                        initial={{ width: "100%" }}
                        animate={{ width: isPaused ? undefined : "0%" }}
                        transition={{ duration: countdown, ease: "linear" }}
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    />
                </div>

                {/* Confetti simulation */}
                {showConfetti && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
                        {[...Array(20)].map((_, i) => (
                            <Particle key={i} delay={i * 0.1} />
                        ))}
                    </div>
                )}

                <div className="p-12 text-center relative z-10">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
                        className="w-28 h-28 bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(236,72,153,0.3)] relative"
                    >
                        <div className="absolute inset-0 rounded-full animate-ping bg-pink-500/20" />
                        <PartyPopper className="w-14 h-14 text-white" />
                    </motion.div>

                    <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Wish Scheduled!</h2>
                    <p className="text-gray-400 mb-8 text-lg leading-relaxed">
                        Magic is on its way to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-bold">{data?.recipient_name || 'your recipient'}</span>.
                    </p>

                    <div className="bg-white/5 rounded-3xl p-6 border border-white/5 mb-10 text-left">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Event Details</span>
                            <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/10">Active</span>
                        </div>
                        <h4 className="text-white font-semibold text-lg">{data?.occasion || data?.event_name}</h4>
                        <p className="text-sm text-gray-400">{new Date(data?.scheduled_time).toLocaleDateString(undefined, { dateStyle: 'long' })} at {new Date(data?.scheduled_time).toLocaleTimeString(undefined, { timeStyle: 'short' })}</p>
                    </div>

                    {/* Auto-Redirect Status */}
                    <div className="mb-8 p-5 bg-gradient-to-r from-amber-500/10 to-purple-500/10 rounded-2xl border border-white/5 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-amber-500">{countdown}</span>
                                </div>
                            </div>
                            <p className="text-sm font-medium text-gray-300">
                                Opening <span className="text-white">Poster Studio</span>
                            </p>
                        </div>
                        <button
                            onClick={() => onAction('poster')}
                            className="text-xs font-bold text-amber-500 hover:text-amber-400 uppercase tracking-widest"
                        >
                            Go Now
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <button
                            onClick={() => onAction('gallery')}
                            className="flex flex-col items-center justify-center space-y-2 p-5 bg-white/5 border border-white/10 text-white rounded-[2rem] hover:bg-white/10 transition-all group"
                        >
                            <History className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Gallery</span>
                        </button>
                        <button
                            onClick={() => onAction('calendar')}
                            className="flex flex-col items-center justify-center space-y-2 p-5 bg-white/5 border border-white/10 text-white rounded-[2rem] hover:bg-white/10 transition-all group"
                        >
                            <Calendar className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Calendar</span>
                        </button>
                        <button
                            onClick={() => onAction('create')}
                            className="flex flex-col items-center justify-center space-y-2 p-5 bg-white/5 border border-white/10 text-white rounded-[2rem] hover:bg-white/10 transition-all group"
                        >
                            <Plus className="w-6 h-6 text-teal-400 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Another</span>
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
