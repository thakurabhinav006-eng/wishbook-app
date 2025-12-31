'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, X } from 'lucide-react';

export default function SmartCalendar({ value, onChange, onClose, minDate = new Date() }) {
    // Initialize state with value or current date
    const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date());
    const [viewDate, setViewDate] = useState(new Date(currentDate)); // For navigating months without changing selection
    const [view, setView] = useState('date'); // 'date' or 'time'

    // Sync internal state if prop changes
    useEffect(() => {
        if (value) {
            const date = new Date(value);
            setCurrentDate(date);
            // Only update viewDate if the new value is in a different month
            if (date.getMonth() !== viewDate.getMonth() || date.getFullYear() !== viewDate.getFullYear()) {
                setViewDate(new Date(date));
            }
        }
    }, [value]);

    const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleDateClick = (day) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        // Preserve time from current selection
        newDate.setHours(currentDate.getHours());
        newDate.setMinutes(currentDate.getMinutes());

        setCurrentDate(newDate);
        onChange(newDate);
    };

    const handleTimeChange = (type, val) => {
        const newDate = new Date(currentDate);
        if (type === 'hour') newDate.setHours(parseInt(val));
        if (type === 'minute') newDate.setMinutes(parseInt(val));
        setCurrentDate(newDate);
        onChange(newDate);
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Generate days array
    const totalDays = daysInMonth(viewDate);
    const startDay = firstDayOfMonth(viewDate);
    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(i);

    const isToday = (day) => {
        const today = new Date();
        return day === today.getDate() && viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear();
    };

    const isSelected = (day) => {
        return day === currentDate.getDate() && viewDate.getMonth() === currentDate.getMonth() && viewDate.getFullYear() === currentDate.getFullYear();
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="w-full max-w-sm bg-[#0a0a0f]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden font-sans select-none">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${view === 'date' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'} cursor-pointer transition-colors`} onClick={() => setView('date')}>
                        <CalendarIcon className="w-4 h-4" />
                    </div>
                    <div className={`p-2 rounded-lg ${view === 'time' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'} cursor-pointer transition-colors`} onClick={() => setView('time')}>
                        <Clock className="w-4 h-4" />
                    </div>
                </div>
                <div className="text-sm font-medium text-purple-200">
                    {monthNames[currentDate.getMonth()].substring(0, 3)} {currentDate.getDate()}, {formatTime(currentDate)}
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="p-4 min-h-[320px]">
                <AnimatePresence mode="wait">
                    {view === 'date' ? (
                        <motion.div
                            key="date-view"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Month Navigation */}
                            <div className="flex justify-between items-center mb-4">
                                <button onClick={handlePrevMonth} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <span className="font-bold text-white text-lg">
                                    {monthNames[viewDate.getMonth()]} <span className="text-purple-400">{viewDate.getFullYear()}</span>
                                </span>
                                <button onClick={handleNextMonth} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Week Days */}
                            <div className="grid grid-cols-7 mb-2">
                                {weekDays.map(d => (
                                    <div key={d} className="text-center text-xs font-bold text-gray-500 uppercase tracking-wide py-1">
                                        {d}
                                    </div>
                                ))}
                            </div>

                            {/* Days Grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {days.map((day, idx) => (
                                    <div key={idx} className="aspect-square relative">
                                        {day && (
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleDateClick(day)}
                                                className={`w-full h-full text-sm rounded-lg flex items-center justify-center transition-all relative z-10 
                                                    ${isSelected(day)
                                                        ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 font-bold'
                                                        : isToday(day)
                                                            ? 'bg-white/10 text-purple-300 border border-purple-500/30'
                                                            : 'text-gray-300 hover:bg-white/5'
                                                    }`}
                                            >
                                                {day}
                                                {isSelected(day) && (
                                                    <motion.div
                                                        layoutId="glow"
                                                        className="absolute inset-0 rounded-lg bg-white/20 blur-sm -z-10"
                                                    />
                                                )}
                                            </motion.button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="time-view"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col items-center justify-center h-full pt-4 space-y-8"
                        >
                            <div className="text-center">
                                <h3 className="text-white text-lg font-medium mb-1">Set Time</h3>
                                <p className="text-gray-400 text-sm">When should the magic happen?</p>
                            </div>

                            <div className="flex items-center space-x-6">
                                {/* Hours */}
                                <div className="flex flex-col items-center gap-2">
                                    <label className="text-xs font-bold text-purple-400 uppercase tracking-widest">Hour</label>
                                    <div
                                        className="h-32 w-16 bg-white/5 rounded-2xl border border-white/10 overflow-hidden relative group"
                                        onScroll={(e) => {
                                            const index = Math.round(e.target.scrollTop / 40);
                                            if (index >= 0 && index < 24 && index !== currentDate.getHours()) {
                                                handleTimeChange('hour', index);
                                            }
                                        }}
                                    >
                                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 bg-purple-500/20 shadow-inner z-0 pointer-events-none border-y border-purple-500/30" />
                                        <div className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide py-[calc(50%-1.25rem)] scroll-smooth">
                                            {Array.from({ length: 24 }).map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleTimeChange('hour', i)}
                                                    className={`w-full h-10 flex items-center justify-center snap-center relative z-10 text-lg transition-all duration-200 ${currentDate.getHours() === i ? 'text-white font-bold scale-110' : 'text-gray-500 hover:text-gray-300'}`}
                                                >
                                                    {i.toString().padStart(2, '0')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-2xl text-gray-500 font-light">:</div>

                                {/* Minutes */}
                                <div className="flex flex-col items-center gap-2">
                                    <label className="text-xs font-bold text-purple-400 uppercase tracking-widest">Minute</label>
                                    <div
                                        className="h-32 w-16 bg-white/5 rounded-2xl border border-white/10 overflow-hidden relative group"
                                        onScroll={(e) => {
                                            const index = Math.round(e.target.scrollTop / 40);
                                            if (index >= 0 && index < 60 && index !== currentDate.getMinutes()) {
                                                handleTimeChange('minute', index);
                                            }
                                        }}
                                    >
                                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 bg-purple-500/20 shadow-inner z-0 pointer-events-none border-y border-purple-500/30" />
                                        <div className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide py-[calc(50%-1.25rem)] scroll-smooth">
                                            {Array.from({ length: 60 }).map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleTimeChange('minute', i)}
                                                    className={`w-full h-10 flex items-center justify-center snap-center relative z-10 text-lg transition-all duration-200 ${currentDate.getMinutes() === i ? 'text-white font-bold scale-110' : 'text-gray-500 hover:text-gray-300'}`}
                                                >
                                                    {i.toString().padStart(2, '0')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setView('date')}
                                className="px-6 py-2 rounded-full bg-white/5 hover:bg-white/10 text-sm text-gray-300 transition-colors border border-white/5"
                            >
                                Back to Date
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div >
    );
}
