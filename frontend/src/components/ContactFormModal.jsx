'use client';
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

    const [errors, setErrors] = useState({});

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
        setErrors({});
    }, [initialData, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        // Client-side validation
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Full Name is required';
        }
        if (!formData.relationship || formData.relationship === '') {
            newErrors.relationship = 'Relationship is required';
        }

        const emailRegex = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            newErrors.email = 'Invalid email format (e.g. user@example.com)';
        }

        const phoneRegex = /^\+?[\d]{10,15}$/;
        if (formData.phone && !phoneRegex.test(formData.phone)) {
            newErrors.phone = 'Invalid phone number (e.g. +1234567890, 10-15 digits)';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (err) {
            console.error(err);
            // Handle structured validation errors (422 or 400)
            if (err.details) {
                const backendErrors = {};
                if (Array.isArray(err.details)) {
                    err.details.forEach(e => {
                        const fieldName = e.loc[e.loc.length - 1];
                        backendErrors[fieldName] = e.msg;
                    });
                } else if (typeof err.details === 'string') {
                    // Handle specific collision messages from Bug #1797/#1790
                    if (err.details.includes('name') && err.details.includes('phone')) {
                        backendErrors.name = err.details;
                        backendErrors.phone = err.details;
                    } else if (err.details.includes('name') && err.details.includes('email')) {
                        backendErrors.name = err.details;
                        backendErrors.email = err.details;
                    } else {
                        backendErrors.general = err.details;
                    }
                }
                setErrors(backendErrors);
            } else {
                setErrors({ general: err.message || "Failed to save contact" });
            }
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 !z-[99999] flex items-center justify-center p-4 sm:p-6 isolation-auto"
                    style={{ zIndex: 99999 }}
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/90 backdrop-blur-md"
                        style={{ zIndex: -1 }}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-[#181820] w-full max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col border border-white/10 shadow-2xl text-white font-sans"
                    >
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#181820] z-10 shrink-0">
                            <h3 className="text-xl font-bold text-white">{title}</h3>
                            <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto custom-scrollbar flex-1">
                            {errors.general && (
                                <div className="mx-6 mt-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm flex items-start gap-2">
                                    <div className="mt-0.5 min-w-[16px]">⚠️</div>
                                    <div>{errors.general}</div>
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Full Name <span className="text-red-500">*</span></label>
                                        <input required type="text" value={formData.name} onChange={e => {
                                            setFormData({ ...formData, name: e.target.value });
                                            if (errors.name) setErrors({ ...errors, name: null });
                                        }} className={`w-full bg-black/30 border ${errors.name ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-all focus:bg-white/5`} placeholder="John Doe" />
                                        {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Relationship <span className="text-red-500">*</span></label>
                                        <select value={formData.relationship} onChange={e => {
                                            setFormData({ ...formData, relationship: e.target.value });
                                            if (errors.relationship) setErrors({ ...errors, relationship: null });
                                        }} className={`w-full bg-black/30 border ${errors.relationship ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-all focus:bg-white/5 appearance-none`}>
                                            <option value="" className="bg-[#181820] text-white">Select Relationship</option>
                                            <option value="Friend" className="bg-[#181820] text-white">Friend</option>
                                            <option value="Family" className="bg-[#181820] text-white">Family</option>
                                            <option value="Colleague" className="bg-[#181820] text-white">Colleague</option>
                                            <option value="Work" className="bg-[#181820] text-white">Work</option>
                                            <option value="Other" className="bg-[#181820] text-white">Other</option>
                                        </select>
                                        {errors.relationship && <p className="text-red-500 text-xs mt-1 ml-1">{errors.relationship}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Email (Optional)</label>
                                        <input type="email" value={formData.email} onChange={e => {
                                            setFormData({ ...formData, email: e.target.value });
                                            if (errors.email) setErrors({ ...errors, email: null });
                                        }} className={`w-full bg-black/30 border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-all focus:bg-white/5`} placeholder="john@example.com" />
                                        {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">WhatsApp / Phone</label>
                                        <input type="tel" value={formData.phone} onChange={e => {
                                            setFormData({ ...formData, phone: e.target.value });
                                            if (errors.phone) setErrors({ ...errors, phone: null });
                                        }} className={`w-full bg-black/30 border ${errors.phone ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-all focus:bg-white/5`} placeholder="+1234567890" />
                                        {errors.phone && <p className="text-red-500 text-xs mt-1 ml-1">{errors.phone}</p>}
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Birthday</label>
                                        <input type="date" value={formData.birthday} onChange={e => {
                                            setFormData({ ...formData, birthday: e.target.value });
                                            if (errors.birthday) setErrors({ ...errors, birthday: null });
                                        }} className={`w-full bg-black/30 border ${errors.birthday ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-all focus:bg-white/5`} />
                                        {errors.birthday && <p className="text-red-500 text-xs mt-1 ml-1">{errors.birthday}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Anniversary</label>
                                        <input type="date" value={formData.anniversary} onChange={e => {
                                            setFormData({ ...formData, anniversary: e.target.value });
                                            if (errors.anniversary) setErrors({ ...errors, anniversary: null });
                                        }} className={`w-full bg-black/30 border ${errors.anniversary ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-all focus:bg-white/5`} />
                                        {errors.anniversary && <p className="text-red-500 text-xs mt-1 ml-1">{errors.anniversary}</p>}
                                    </div>
                                </div>

                                {/* Custom Occasion */}
                                <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                                    <h4 className="text-xs font-bold uppercase text-purple-400 tracking-wider">Custom Occasion</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Occasion Name</label>
                                            <input type="text" value={formData.custom_occasion_name} onChange={e => {
                                                setFormData({ ...formData, custom_occasion_name: e.target.value });
                                                if (errors.custom_occasion_name) setErrors({ ...errors, custom_occasion_name: null });
                                            }} className={`w-full bg-black/30 border ${errors.custom_occasion_name ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-2 text-white focus:border-purple-500 outline-none transition-all focus:bg-white/5`} placeholder="e.g. Graduation" />
                                            {errors.custom_occasion_name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.custom_occasion_name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Date</label>
                                            <input type="date" value={formData.custom_occasion_date} onChange={e => {
                                                setFormData({ ...formData, custom_occasion_date: e.target.value });
                                                if (errors.custom_occasion_date) setErrors({ ...errors, custom_occasion_date: null });
                                            }} className={`w-full bg-black/30 border ${errors.custom_occasion_date ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-2 text-white focus:border-purple-500 outline-none transition-all focus:bg-white/5`} />
                                            {errors.custom_occasion_date && <p className="text-red-500 text-xs mt-1 ml-1">{errors.custom_occasion_date}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Extra Details */}
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Gender</label>
                                        <select value={formData.gender} onChange={e => {
                                            setFormData({ ...formData, gender: e.target.value });
                                            if (errors.gender) setErrors({ ...errors, gender: null });
                                        }} className={`w-full bg-black/30 border ${errors.gender ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-all focus:bg-white/5 appearance-none`}>
                                            <option value="" className="bg-[#181820] text-white">Select Gender</option>
                                            <option value="Male" className="bg-[#181820] text-white">Male</option>
                                            <option value="Female" className="bg-[#181820] text-white">Female</option>
                                            <option value="Other" className="bg-[#181820] text-white">Other</option>
                                        </select>
                                        {errors.gender && <p className="text-red-500 text-xs mt-1 ml-1">{errors.gender}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Notes</label>
                                        <textarea rows="3" value={formData.notes} onChange={e => {
                                            setFormData({ ...formData, notes: e.target.value });
                                            if (errors.notes) setErrors({ ...errors, notes: null });
                                        }} className={`w-full bg-black/30 border ${errors.notes ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-all focus:bg-white/5`} placeholder="Likes jazz, prefers email wishes..." />
                                        {errors.notes && <p className="text-red-500 text-xs mt-1 ml-1">{errors.notes}</p>}
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
