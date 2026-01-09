'use client';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose, duration = 5000 }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (message) {
            console.log('Toast displayed:', message);
            const timer = setTimeout(() => {
                console.log('Toast auto-dismissing');
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [message, duration]); // Intentionally exclude onClose to prevent timer resets on re-renders

    if (!mounted) return null;

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-400" />,
        error: <AlertCircle className="w-5 h-5 text-red-400" />,
        info: <Info className="w-5 h-5 text-blue-400" />
    };

    const styles = {
        success: 'bg-green-500/10 border-green-500/20 text-green-100',
        error: 'bg-red-500/10 border-red-500/20 text-red-100',
        info: 'bg-blue-500/10 border-blue-500/20 text-blue-100'
    };


    return createPortal(
        <AnimatePresence mode="wait">
            {message && (
                <motion.div
                    key="toast-alert"
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="fixed top-6 right-6 z-[100000] flex items-center gap-3 px-6 py-4 rounded-xl border backdrop-blur-md shadow-2xl max-w-md w-full"
                >
                    <div className={`flex items-center gap-3 w-full p-2 rounded-lg ${styles[type]} bg-opacity-20 border-opacity-50`}>
                        {/* Inner content wrapper for styling flexibility */}
                        <div className={`p-2 rounded-full bg-white/5`}>
                            {icons[type]}
                        </div>
                        <p className="flex-1 text-sm font-medium">{message}</p>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-white/10 rounded-lg transition-colors opacity-70 hover:opacity-100"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
