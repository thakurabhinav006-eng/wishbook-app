'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock,
    Plus,
    MoreHorizontal,
    X,
    MapPin,
    Users,
    AlignLeft,
    Check
} from 'lucide-react';
import { getApiUrl } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import CreateWishWizard from './CreateWishWizard';
import WishSuccessModal from './WishSuccessModal';
import Toast from '@/components/Toast';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [view, setView] = useState('month'); // 'month', 'week', 'day'
    const [wishes, setWishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [successModal, setSuccessModal] = useState({ isOpen: false, data: null });
    const [toast, setToast] = useState(null);
    const { token } = useAuth();

    const showToast = (message, type = 'info') => setToast({ message, type });

    // Fetch wishes
    useEffect(() => {
        if (!token) return;

        const fetchWishes = async () => {
            try {
                const res = await fetch(getApiUrl('/api/scheduled-wishes'), {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setWishes(data);
                }
            } catch (error) {
                console.error("Failed to fetch wishes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWishes();
    }, [token]);

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        return { daysInMonth, firstDayOfMonth };
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDateClick = (day) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(newDate);
        setIsCreateModalOpen(true);
    };

    const handleEventClick = (e, wish) => {
        e.stopPropagation();
        setSelectedEvent(wish);
    };

    const isSameDay = (date1, date2) => {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    };



    // Render Logic
    const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentDate);
    const days = [];
    // Padding for prev month
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    // --- Recurrence Projection Logic ---
    const getProjectedEvents = () => {
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        let allEvents = [...wishes];

        wishes.forEach(wish => {
            if (!wish.is_recurring || wish.is_recurring === 0 || wish.is_recurring === 'none') return;

            const wishDate = new Date(wish.scheduled_time);
            let nextDate = new Date(wishDate);

            // Advance to start of detailed projection if wish is in past
            // Simple approach: Iterate from wish date until we pass end of current month

            // Safety break
            let loopCount = 0;
            while (nextDate <= endOfMonth && loopCount < 1000) {
                loopCount++;

                // Calculate next increment
                const prevDate = new Date(nextDate);
                // Handle legacy integer (1-4), backend integer (1, 7, 30, 365), and string ('yearly') formats
                const recType = String(wish.recurrence || wish.is_recurring || '').toLowerCase();

                if (recType === '1' || recType === 'daily') {
                    nextDate.setDate(prevDate.getDate() + 1);
                } else if (recType === '2' || recType === 'weekly' || recType === '7') {
                    nextDate.setDate(prevDate.getDate() + 7);
                } else if (recType === '3' || recType === 'monthly' || recType === '30') {
                    nextDate.setMonth(prevDate.getMonth() + 1);
                } else if (recType === '4' || recType === 'yearly' || recType === '365') {
                    nextDate.setFullYear(prevDate.getFullYear() + 1);
                } else {
                    // console.warn(`Unknown recurrence type: ${recType}`);
                    break; // Critical: Prevent infinite loop if type is unknown
                }

                // If the generated date is within the current month view, add it
                // AND it's not the original wish (which is already in allEvents)
                if (nextDate >= startOfMonth && nextDate <= endOfMonth) {
                    // Create a virtual event
                    allEvents.push({
                        ...wish,
                        id: `${wish.id}-recurring-${nextDate.getTime()}`, // Unique ID for key
                        scheduled_time: nextDate.toISOString(),
                        is_virtual: true // Flag to style differently if needed
                    });
                }
            }
        });

        return allEvents;
    };

    const displayEvents = getProjectedEvents();

    const getEventsForDay = (day) => {
        const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        return displayEvents.filter(wish => {
            const wishDate = new Date(wish.scheduled_time);
            return isSameDay(wishDate, targetDate);
        });
    };
    return (
        <div className="h-full flex flex-col bg-[#0a0a0f] text-white">
            {/* Calendar Toolbar */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-20">
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-sm font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-colors">
                            Today
                        </button>
                        <div className="flex items-center space-x-2">
                            <button onClick={handlePrevMonth} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button onClick={handleNextMonth} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                        {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                </div>

                <div className="flex items-center space-x-4">
                    {/* View Selector (Mock functionality for now) */}
                    <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                        {['Month', 'Week', 'Day'].map((v) => (
                            <button
                                key={v}
                                onClick={() => setView(v.toLowerCase())}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === v.toLowerCase() ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => {
                            setSelectedDate(new Date());
                            setIsCreateModalOpen(true);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-white text-purple-900 rounded-lg font-bold hover:scale-105 transition-transform shadow-lg shadow-white/20"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create</span>
                    </button>
                </div>
            </div>

            {view === 'month' && (
                <div className="flex-1 overflow-auto p-6">
                    <div className="grid grid-cols-7 gap-px bg-white/10 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                        {DAYS.map(day => (
                            <div key={day} className="p-4 text-center text-sm font-bold text-gray-400 bg-[#0f0f16] border-b border-white/5 uppercase tracking-wider">
                                {day}
                            </div>
                        ))}
                        {days.map((day, idx) => (
                            <div
                                key={idx}
                                onClick={() => day && handleDateClick(day)}
                                className={`min-h-[140px] bg-[#0f0f16]/95 hover:bg-[#151520] transition-colors p-2 border-b border-r border-white/5 relative group cursor-pointer ${!day ? 'bg-[#0a0a0f]' : ''}`}
                            >
                                {day && (
                                    <>
                                        <div className={`text-sm font-medium mb-2 w-7 h-7 flex items-center justify-center rounded-full ${isSameDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), day), new Date())
                                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                                            : 'text-gray-400 group-hover:text-white'
                                            }`}>
                                            {day}
                                        </div>
                                        <div className="space-y-1.5">
                                            {getEventsForDay(day).map(wish => (
                                                <motion.div
                                                    key={wish.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    onClick={(e) => handleEventClick(e, wish)}
                                                    className={`px-2 py-1.5 text-xs rounded-md truncate cursor-pointer transition-transform hover:scale-[1.02] border-l-2 shadow-lg ${wish.platform === 'whatsapp' ? 'bg-green-500/20 text-green-300 border-green-500' :
                                                        wish.platform === 'telegram' ? 'bg-sky-500/20 text-sky-300 border-sky-500' :
                                                            'bg-purple-500/20 text-purple-200 border-purple-500'
                                                        }`}
                                                >
                                                    <span className="font-bold opacity-80">{new Date(wish.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    <span className="mx-1">•</span>
                                                    <span className="font-medium">{wish.recipient_name}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white">
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {view === 'week' && (
                <div className="flex-1 overflow-auto p-6">
                    <div className="grid grid-cols-7 gap-px mb-2">
                        {[...Array(7)].map((_, i) => {
                            const d = new Date(currentDate);
                            d.setDate(currentDate.getDate() - currentDate.getDay() + i);
                            return (
                                <div key={i} className={`p-4 text-center font-bold uppercase tracking-wider rounded-xl bg-white/5 border border-white/10 ${isSameDay(d, new Date()) ? 'ring-2 ring-purple-500' : ''}`}>
                                    <div className="text-xs text-gray-500">{DAYS[i]}</div>
                                    <div className="text-xl text-white">{d.getDate()}</div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="grid grid-cols-7 gap-px bg-white/10 border border-white/10 rounded-2xl overflow-hidden shadow-2xl min-h-[600px]">
                        {[...Array(7)].map((_, i) => {
                            const d = new Date(currentDate);
                            d.setDate(currentDate.getDate() - currentDate.getDay() + i);
                            // We need to use `getEventsForDay` but it expects 'day' number relative to 'currentDate' month...
                            // Actually `getEventsForDay` in original code used `currentDate.getMonth()`.
                            // If week spans across months, `getEventsForDay` might fail if we pass just `getDate()`.
                            // I need to update `getEventsForDay` logic logic or write a custom filter here.
                            // Custom filter is safer.
                            const dayEvents = displayEvents.filter(w => isSameDay(new Date(w.scheduled_time), d));

                            return (
                                <div key={i} className="bg-[#0f0f16]/95 border-r border-white/5 p-2 relative group min-h-[600px]" onClick={() => handleDateClick(d.getDate())}>
                                    {dayEvents.map(wish => (
                                        <motion.div
                                            key={wish.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            onClick={(e) => handleEventClick(e, wish)}
                                            className={`mb-2 p-3 text-xs rounded-xl border-l-4 shadow-lg cursor-pointer hover:scale-[1.02] transition-all ${wish.platform === 'whatsapp' ? 'bg-green-500/10 border-green-500 text-green-200' :
                                                wish.platform === 'telegram' ? 'bg-sky-500/10 border-sky-500 text-sky-200' :
                                                    'bg-purple-500/10 border-purple-500 text-purple-200'
                                                }`}
                                        >
                                            <div className="font-bold text-sm mb-1">{wish.recipient_name}</div>
                                            <div className="flex items-center opacity-70 mb-2">
                                                <CalendarIcon className="w-3 h-3 mr-1" />
                                                {new Date(wish.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="bg-black/30 px-2 py-1 rounded inline-block text-[10px] uppercase tracking-wider">{wish.occasion}</div>
                                        </motion.div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {view === 'day' && (
                <div className="flex-1 overflow-auto p-6">
                    <div className="max-w-4xl mx-auto bg-[#0f0f16] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <div>
                                <h3 className="text-3xl font-bold text-white">{currentDate.getDate()}</h3>
                                <p className="text-purple-400 font-medium uppercase tracking-widest">{DAYS[currentDate.getDay()]}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-400 text-sm">Events</p>
                                <p className="text-2xl font-bold text-white">
                                    {displayEvents.filter(w => isSameDay(new Date(w.scheduled_time), currentDate)).length}
                                </p>
                            </div>
                        </div>
                        <div className="divide-y divide-white/5">
                            {[...Array(24)].map((_, hour) => {
                                const dayEvents = displayEvents.filter(w => isSameDay(new Date(w.scheduled_time), currentDate) && new Date(w.scheduled_time).getHours() === hour);
                                return (
                                    <div key={hour} className="flex min-h-[100px] group hover:bg-white/[0.02] transition-colors">
                                        <div className="w-24 p-4 text-right border-r border-white/5">
                                            <span className="text-sm font-medium text-gray-500">
                                                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                                            </span>
                                        </div>
                                        <div className="flex-1 p-2 relative">
                                            {dayEvents.map(wish => (
                                                <motion.div
                                                    key={wish.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    onClick={(e) => handleEventClick(e, wish)}
                                                    className={`mb-2 p-3 rounded-xl border-l-4 shadow-lg cursor-pointer hover:translate-x-1 transition-transform flex justify-between items-center ${wish.platform === 'whatsapp' ? 'bg-green-500/10 border-green-500' :
                                                        wish.platform === 'telegram' ? 'bg-sky-500/10 border-sky-500' :
                                                            'bg-purple-500/10 border-purple-500'
                                                        }`}
                                                >
                                                    <div>
                                                        <div className={`font-bold text-sm ${wish.platform === 'whatsapp' ? 'text-green-300' : wish.platform === 'telegram' ? 'text-sky-300' : 'text-purple-300'
                                                            }`}>
                                                            {wish.recipient_name}
                                                        </div>
                                                        <div className="text-xs text-gray-400 mt-1 flex items-center">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 opacity-50" />
                                                            {wish.occasion}
                                                        </div>
                                                    </div>
                                                    <div className="text-2xl font-bold opacity-10 font-mono">
                                                        {new Date(wish.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
                        onClick={() => setIsCreateModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="w-full max-w-2xl bg-[#0a0a0f] border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute top-4 right-4 z-10">
                                <button onClick={() => setIsCreateModalOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-8">
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                    <CalendarIcon className="w-6 h-6 text-purple-400" />
                                    Schedule for {selectedDate?.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                                </h2>
                                <CreateWishWizard
                                    loading={loading}
                                    initialData={{
                                        scheduled_time: selectedDate ? new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000)).toISOString().replace('Z', '') : ''
                                    }}
                                    onGenerate={async (formData) => {
                                        if (loading) return;
                                        setLoading(true);
                                        try {
                                            const apiEndpoint = getApiUrl('/api/schedule');
                                            // Ensure scheduled_time is set
                                            const payload = {
                                                ...formData,
                                                scheduled_time: formData.scheduled_time || (selectedDate ? new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000)).toISOString().replace('Z', '') : '')
                                            };

                                            const res = await fetch(apiEndpoint, {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'Authorization': `Bearer ${token}`
                                                },
                                                body: JSON.stringify(payload),
                                            });

                                            const data = await res.json();
                                            if (res.ok) {
                                                setSuccessModal({ isOpen: true, data: formData });
                                                setIsCreateModalOpen(false);
                                                // Refresh wishes
                                                const historyRes = await fetch(getApiUrl('/api/scheduled-wishes'), {
                                                    headers: { 'Authorization': `Bearer ${token}` }
                                                });
                                                if (historyRes.ok) {
                                                    setWishes(await historyRes.json());
                                                }
                                            } else {
                                                showToast(data.detail || 'Failed to schedule wish', 'error');
                                            }
                                        } catch (error) {
                                            console.error(error);
                                            showToast("Failed to schedule wish", "error");
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Event Details Modal */}
            <AnimatePresence>
                {selectedEvent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedEvent(null)}
                    >
                        <motion.div
                            layoutId={`event-${selectedEvent.id}`}
                            className="w-full max-w-md bg-[#181820] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={`h-24 bg-gradient-to-r ${selectedEvent.platform === 'whatsapp' ? 'from-green-600 to-emerald-800' :
                                selectedEvent.platform === 'telegram' ? 'from-blue-600 to-sky-800' :
                                    'from-purple-600 to-indigo-800'
                                } relative p-6 flex flex-col justify-end`}>
                                <div className="absolute top-4 right-4 flex space-x-2">
                                    <button className="p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setSelectedEvent(null)} className="p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <h3 className="text-2xl font-bold text-white">{selectedEvent.occasion}</h3>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                        <Clock className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Time</p>
                                        <p className="text-white font-medium">{new Date(selectedEvent.scheduled_time).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                        <Users className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Recipient</p>
                                        <p className="text-white font-medium">{selectedEvent.recipient_name} <span className="text-gray-500 text-sm">({selectedEvent.recipient_email || selectedEvent.phone_number})</span></p>
                                    </div>
                                </div>

                                {selectedEvent.extra_details && (
                                    <div className="flex items-start space-x-4">
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mt-1">
                                            <AlignLeft className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400 mb-1">Details</p>
                                            <p className="text-gray-300 text-sm leading-relaxed">{selectedEvent.extra_details}</p>
                                        </div>
                                    </div>
                                )}

                                {selectedEvent.generated_wish && (
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                        <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">Generated Wish</p>
                                        <p className="text-gray-300 italic">&quot;{selectedEvent.generated_wish}&quot;</p>
                                    </div>
                                )}

                                <div className="flex space-x-3 pt-4">
                                    <button className="flex-1 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
                                        Edit
                                    </button>
                                    <button className="flex-1 py-3 bg-red-500/10 text-red-400 font-bold rounded-xl hover:bg-red-500/20 transition-colors border border-red-500/20">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* System Toasts */}
            <AnimatePresence>
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}
            </AnimatePresence>

            <WishSuccessModal
                isOpen={successModal.isOpen}
                onClose={() => setSuccessModal({ isOpen: false, data: null })}
                onAction={(action) => {
                    setSuccessModal({ isOpen: false, data: null });
                    if (action === 'gallery') window.location.href = '/dashboard?tab=gallery';
                    if (action === 'poster') {
                        const wishText = successModal.data?.generated_wish || '';
                        const recipient = successModal.data?.recipient_name || '';
                        window.location.href = `/poster/build?wish=${encodeURIComponent(wishText)}&recipient=${encodeURIComponent(recipient)}`;
                    }
                    if (action === 'create') setIsCreateModalOpen(true);
                }}
                data={successModal.data}
            />
        </div>
    );
}
