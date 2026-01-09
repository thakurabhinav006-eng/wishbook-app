'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Phone, Calendar, Heart, Globe, Tag, FileText, User, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContactDetailsModal({ contact, onClose }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted || !contact) return null;

    return createPortal(
        <AnimatePresence>
            <div
                className="fixed inset-0 !z-[99999] flex items-center justify-center p-4 isolation-auto"
                style={{ zIndex: 99999 }}
            >
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-md"
                    style={{ zIndex: -1 }}
                    onClick={onClose}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[#121218] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="relative h-32 bg-gradient-to-r from-purple-900/50 to-blue-900/50 shrink-0">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="absolute -bottom-10 left-8">
                            <div className="w-20 h-20 bg-gray-800 rounded-2xl border-4 border-[#121218] flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                                {contact.name.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>

                    <div className="pt-12 px-8 pb-8 space-y-6 overflow-y-auto custom-scrollbar">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                {contact.name}
                                <span className="text-xs font-normal px-2 py-1 bg-white/5 rounded-full border border-white/10 text-gray-400">
                                    {contact.relationship}
                                </span>
                            </h2>
                            <p className="text-gray-400">{contact.email}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {contact.phone && (
                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                    <Phone className="w-4 h-4 text-purple-400" />
                                    <div className="text-sm">
                                        <div className="text-gray-500 text-xs">Phone</div>
                                        <div className="text-white">{contact.phone}</div>
                                    </div>
                                </div>
                            )}
                            {contact.gender && (
                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                    <User className="w-4 h-4 text-blue-400" />
                                    <div className="text-sm">
                                        <div className="text-gray-500 text-xs">Gender</div>
                                        <div className="text-white">{contact.gender}</div>
                                    </div>
                                </div>
                            )}
                            {contact.birthday && (
                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                    <Calendar className="w-4 h-4 text-pink-400" />
                                    <div className="text-sm">
                                        <div className="text-gray-500 text-xs">Birthday</div>
                                        <div className="text-white">{new Date(contact.birthday).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            )}
                            {contact.anniversary && (
                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                    <Heart className="w-4 h-4 text-red-400" />
                                    <div className="text-sm">
                                        <div className="text-gray-500 text-xs">Anniversary</div>
                                        <div className="text-white">{new Date(contact.anniversary).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            )}
                            {contact.custom_occasion_name && (
                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 col-span-2">
                                    <Star className="w-4 h-4 text-yellow-400" />
                                    <div className="text-sm">
                                        <div className="text-gray-500 text-xs">{contact.custom_occasion_name}</div>
                                        <div className="text-white">
                                            {contact.custom_occasion_date ? new Date(contact.custom_occasion_date).toLocaleDateString() : 'No date set'}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {contact.notes && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                    <FileText className="w-3 h-3" /> Notes
                                </label>
                                <p className="text-sm text-gray-300 bg-black/20 p-4 rounded-xl border border-white/5 leading-relaxed">
                                    {contact.notes}
                                </p>
                            </div>
                        )}

                        {contact.tags && (
                            <div className="flex flex-wrap gap-2">
                                {contact.tags.split(',').map((tag, i) => (
                                    <span key={i} className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs text-purple-300 flex items-center gap-1">
                                        <Tag className="w-3 h-3" /> {tag.trim()}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
}
