'use client';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", cancelText = "Cancel", isDangerous = false }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 !z-[100000] flex items-center justify-center p-4"
                    style={{ zIndex: 100000 }}
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/90 backdrop-blur-sm"
                        style={{ zIndex: -1 }}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-[#181820] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col font-sans"
                    >
                        <div className="p-6 flex flex-col items-center text-center space-y-4">
                            <div className={`p-4 rounded-full ${isDangerous ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'} border ${isDangerous ? 'border-red-500/20' : 'border-blue-500/20'}`}>
                                <AlertTriangle className="w-8 h-8" />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white">{title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {message}
                                </p>
                            </div>
                        </div>

                        <div className="p-4 border-t border-white/10 flex gap-3 bg-white/5">
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-medium transition-colors"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`flex-1 py-2.5 rounded-xl font-bold text-white transition-all shadow-lg ${isDangerous
                                        ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 shadow-red-500/20'
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/20'
                                    }`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
