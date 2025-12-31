'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout({ children }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
            {/* Global Dashboard Ambience */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-900/20 via-gray-900 to-black -z-20 pointer-events-none" />
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay -z-10 pointer-events-none"></div>

            <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full z-40 bg-black/80 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between">
                <span className="font-bold text-lg tracking-tight">WishAI</span>
                <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-gray-400 hover:text-white">
                    {mobileOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Main Content */}
            <main className="md:ml-72 min-h-screen relative overflow-hidden">
                {/* Top Glass Gradient (Decorative) */}
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none" />
                
                <div className="relative z-10 p-6 md:p-12 pt-20 md:pt-12 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
