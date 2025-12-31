'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, Send, User, Mail, MessageSquare, Phone } from 'lucide-react';
import SmartCalendar from './SmartCalendar';

export default function WishForm({ onGenerate, loading }) {

    const [formData, setFormData] = useState({
        occasion: 'Birthday',
        recipient_name: '',
        recipient_email: '',
        platform: 'email', // email, telegram, whatsapp
        phone_number: '',
        telegram_chat_id: '',
        tone: 'Warm',
        extra_details: '',
        length: 'Short',
        scheduled_time: '',
        recurrence: 'none' // 'none', 'yearly'
    });
    const [contacts, setContacts] = useState([]);


    useEffect(() => {
        fetch('http://localhost:8000/api/contacts')
            .then(res => res.json())
            .then(data => setContacts(data))
            .catch(err => console.error(err));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleContactSelect = (e) => {
        const contactId = e.target.value;
        if (!contactId) return;

        const contact = contacts.find(c => c.id === parseInt(contactId));
        if (contact) {
            setFormData({
                ...formData,
                recipient_name: contact.name,
                recipient_email: contact.email,
                phone_number: contact.phone || ''
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onGenerate(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
                <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20">
                    <Sparkles className="w-5 h-5 text-pink-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Design Your Wish</h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="group">
                    <label className="block text-sm font-medium text-gray-400 mb-2 transition-colors group-hover:text-purple-400">Occasion</label>
                    <select name="occasion" value={formData.occasion} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-white/5 text-gray-200 focus:bg-white/10 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none p-3 hover:bg-white/10 cursor-pointer appearance-none relative z-10">
                        <option className="bg-[#16162c] text-white" value="Birthday">🎂 Birthday</option>
                        <option className="bg-[#16162c] text-white" value="Anniversary">💑 Anniversary</option>
                        <option className="bg-[#16162c] text-white" value="New Year">🎆 New Year</option>
                        <option className="bg-[#16162c] text-white" value="Promotion">💼 Promotion</option>
                        <option className="bg-[#16162c] text-white" value="Achievement">🏆 Achievement</option>
                        <option className="bg-[#16162c] text-white" value="Get Well Soon">🩹 Get Well Soon</option>
                        <option className="bg-[#16162c] text-white" value="Thank You">🙏 Thank You</option>
                    </select>
                </div>
                <div className="group">
                    <label className="block text-sm font-medium text-gray-400 mb-2 transition-colors group-hover:text-purple-400">Platform</label>
                    <select name="platform" value={formData.platform} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-white/5 text-gray-200 focus:bg-white/10 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none p-3 hover:bg-white/10 cursor-pointer">
                        <option className="bg-[#16162c] text-white" value="email">📧 Email</option>
                        {/* <option className="bg-[#16162c] text-white" value="telegram">✈️ Telegram</option>
                        <option className="bg-[#16162c] text-white" value="whatsapp">💬 WhatsApp</option> */}

                    </select>
                </div>
            </div>

            {/* Quick Select Contact */}
            {contacts.length > 0 && (
                <div className="relative group">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Quick Select Contact</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <select onChange={handleContactSelect} className="w-full pl-10 rounded-xl border border-purple-500/20 bg-purple-500/5 text-gray-200 focus:bg-purple-500/10 focus:ring-2 focus:ring-purple-500 transition-all outline-none p-3 hover:bg-purple-500/10 cursor-pointer">
                            <option className="bg-[#16162c] text-white" value="">-- Select a Friend --</option>
                            {contacts.map(c => (
                                <option className="bg-[#16162c] text-white" key={c.id} value={c.id}>{c.name} ({c.email})</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Recipient Name</label>
                <div className="relative group">
                    <input type="text" name="recipient_name" value={formData.recipient_name} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:bg-white/10 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none p-3 pl-4" placeholder="e.g. Alice" required />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
            </div>

            {/* Dynamic Contact Fields based on Platform */}
            {formData.platform === 'email' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Recipient Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input type="email" name="recipient_email" value={formData.recipient_email} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:bg-white/10 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none p-3 pl-10" placeholder="alice@example.com" />
                    </div>
                </motion.div>
            )}

            {/* {formData.platform === 'telegram' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Telegram Chat ID</label>
                    <div className="relative">
                        <Send className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input type="text" name="telegram_chat_id" value={formData.telegram_chat_id} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:bg-white/10 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none p-3 pl-10" placeholder="12345678" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 pl-1">Found via @userinfobot</p>
                </motion.div>
            )}

            {formData.platform === 'whatsapp' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="block text-sm font-medium text-gray-400 mb-2">WhatsApp Number</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:bg-white/10 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none p-3 pl-10" placeholder="+1234567890" />
                    </div>
                </motion.div>
            )} */}


            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Tone</label>
                    <select name="tone" value={formData.tone} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-white/5 text-gray-200 focus:bg-white/10 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none p-3 hover:bg-white/10 cursor-pointer">
                        <option className="bg-[#16162c] text-white">😊 Warm</option>
                        <option className="bg-[#16162c] text-white">😂 Funny</option>
                        <option className="bg-[#16162c] text-white">👔 Formal</option>
                        <option className="bg-[#16162c] text-white">🌹 Poetic</option>
                        <option className="bg-[#16162c] text-white">🎉 Excited</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Length</label>
                    <select name="length" value={formData.length} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-white/5 text-gray-200 focus:bg-white/10 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none p-3 hover:bg-white/10 cursor-pointer">
                        <option className="bg-[#16162c] text-white">Short</option>
                        <option className="bg-[#16162c] text-white">Medium</option>
                        <option className="bg-[#16162c] text-white">Long</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Extra Details (Optional)</label>
                <textarea name="extra_details" value={formData.extra_details} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:bg-white/10 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none p-3 scrollbar-track-transparent scrollbar-thumb-white/10" rows="3" placeholder="e.g. Loves cats, turning 30"></textarea>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-400 mb-2 cursor-pointer">
                    <Calendar className="w-4 h-4" />
                    <span>Schedule for Later (Optional)</span>
                </label>
                <div className="relative">
                    <SmartCalendar
                        value={formData.scheduled_time}
                        onChange={(date) => {
                            // Format to YYYY-MM-DDTHH:mm for consistency with backend expectation if needed
                            // Or just keep as ISO string
                            const isoString = date.toISOString().slice(0, 16); // Simple format
                            setFormData({ ...formData, scheduled_time: isoString });
                        }}
                    />
                    <div className="mt-2 flex items-center space-x-2">
                        <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-600 bg-white/10 text-purple-600 focus:ring-purple-500"
                            checked={formData.recurrence === 'yearly'}
                            onChange={(e) => setFormData({ ...formData, recurrence: e.target.checked ? 'yearly' : 'none' })}
                        />
                        <span className="text-sm text-gray-400">Repeat every year 🔄</span>
                    </div>
                </div>
            </div>



            <div className="flex space-x-4 pt-4">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                    {loading ? (
                        <>
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Using Magic...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" />
                            <span>Generate Magic Wish</span>
                        </>
                    )}
                </motion.button>

                {formData.scheduled_time && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={(e) => { e.preventDefault(); onGenerate({ ...formData, isSchedule: true }); }}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                        <Send className="w-4 h-4" />
                        <span>Schedule Send</span>
                    </motion.button>
                )}
            </div>
        </form>
    );
}
