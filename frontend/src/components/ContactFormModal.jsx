import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { createPortal } from 'react-dom';

export default function ContactFormModal({ isOpen, onClose, onSubmit, initialData = null, title = "Add New Contact" }) {
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        relationship: 'Friend',
        phone: '',
        birthday: '',
        anniversary: '',
        custom_occasion_name: '',
        custom_occasion_date: '',
        gender: '',
        notes: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                email: initialData.email || '',
                relationship: initialData.relationship || 'Friend',
                phone: initialData.phone || '',
                birthday: initialData.birthday ? initialData.birthday.split('T')[0] : '',
                anniversary: initialData.anniversary ? initialData.anniversary.split('T')[0] : '',
                custom_occasion_name: initialData.custom_occasion_name || '',
                custom_occasion_date: initialData.custom_occasion_date ? initialData.custom_occasion_date.split('T')[0] : '',
                gender: initialData.gender || '',
                notes: initialData.notes || ''
            });
        } else {
            // Reset if no initial data (Add mode)
            setFormData({
                name: '', email: '', relationship: 'Friend', phone: '', birthday: '', anniversary: '',
                custom_occasion_name: '', custom_occasion_date: '', gender: '', notes: ''
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-[#181820] w-full max-w-2xl h-[85vh] md:h-auto md:max-h-[90vh] rounded-3xl overflow-hidden flex flex-col border border-white/10 shadow-2xl m-4"
                    >
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#181820] z-10 shrink-0">
                            <h3 className="text-xl font-bold text-white">{title}</h3>
                            <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto custom-scrollbar flex-1">
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Full Name *</label>
                                        <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-all focus:bg-white/5" placeholder="John Doe" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Relationship *</label>
                                        <select value={formData.relationship} onChange={e => setFormData({ ...formData, relationship: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-all focus:bg-white/5 appearance-none">
                                            <option value="Friend">Friend</option>
                                            <option value="Family">Family</option>
                                            <option value="Colleague">Colleague</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Email (Optional)</label>
                                        <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-all focus:bg-white/5" placeholder="john@example.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">WhatsApp / Phone</label>
                                        <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-all focus:bg-white/5" placeholder="+1234567890" />
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Birthday</label>
                                        <input type="date" value={formData.birthday} onChange={e => setFormData({ ...formData, birthday: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-all focus:bg-white/5" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Anniversary</label>
                                        <input type="date" value={formData.anniversary} onChange={e => setFormData({ ...formData, anniversary: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-all focus:bg-white/5" />
                                    </div>
                                </div>

                                {/* Custom Occasion */}
                                <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                                    <h4 className="text-xs font-bold uppercase text-purple-400 tracking-wider">Custom Occasion</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Occasion Name</label>
                                            <input type="text" value={formData.custom_occasion_name} onChange={e => setFormData({ ...formData, custom_occasion_name: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-purple-500 outline-none transition-all focus:bg-white/5" placeholder="e.g. Graduation" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Date</label>
                                            <input type="date" value={formData.custom_occasion_date} onChange={e => setFormData({ ...formData, custom_occasion_date: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-purple-500 outline-none transition-all focus:bg-white/5" />
                                        </div>
                                    </div>
                                </div>

                                {/* Extra Details */}
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Gender</label>
                                        <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-all focus:bg-white/5 appearance-none">
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Notes</label>
                                        <textarea rows="3" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-all focus:bg-white/5" placeholder="Likes jazz, prefers email wishes..." />
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-[#181820] shrink-0">
                            <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors">Cancel</button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {loading ? 'Saving...' : 'Save Contact'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
