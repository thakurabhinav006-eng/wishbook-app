'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
    Wand2, 
    BookType, 
    Users, 
    ShieldCheck, 
    LogOut,
    Sparkles,
    LayoutDashboard,
    History,
    Palette,
    Calendar
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const NavItem = ({ id, icon: Icon, label, activeTab, isMobile }) => {
    const isActive = activeTab === id;
    
    return (
        <Link 
            href={`/dashboard?tab=${id}`}
            className={`relative flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group overflow-hidden ${
                isActive ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
        >
            {isActive && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/20 rounded-xl backdrop-blur-sm"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}
            <span className="relative z-10 flex items-center space-x-3">
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110 text-purple-400' : 'group-hover:scale-110'}`} />
                <span className={`font-medium tracking-wide ${isActive ? 'text-white' : ''}`}>{label}</span>
            </span>
            {isActive && (
                <motion.div 
                    layoutId="activeGlow"
                    className="absolute right-2 w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                />
            )}
        </Link>
    );
};

const SidebarContent = ({ mobileOpen, setMobileOpen }) => {
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'overview'; // Default to overview
    const { user, logout } = useAuth();

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={`hidden md:flex fixed z-30 w-72 h-screen flex-col bg-[#05050A]/80 backdrop-blur-xl border-r border-white/5`}>
                {/* Logo Area */}
                <div className="p-8">
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-purple-600 blur opacity-40 group-hover:opacity-75 transition-opacity rounded-full"></div>
                            <div className="relative bg-gradient-to-tr from-gray-900 to-black p-2.5 rounded-xl border border-white/10 group-hover:border-purple-500/50 transition-colors">
                                <Sparkles className="w-6 h-6 text-purple-400" />
                            </div>
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-white transition-all">
                            WishAI
                        </span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                    <div className="px-4 pb-2">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Dashboard</p>
                    </div>
                    <NavItem id="overview" icon={LayoutDashboard} label="Overview" activeTab={activeTab} />
                    <NavItem id="basic" icon={Wand2} label="Create Wish" activeTab={activeTab} />
                    <NavItem id="calendar" icon={Calendar} label="Calendar" activeTab={activeTab} />
                    <NavItem id="gallery" icon={History} label="My Wishes" activeTab={activeTab} />
                    
                    <div className="my-6 mx-4 border-t border-white/5"></div>
                    
                    <div className="px-4 pb-2">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Tools</p>
                    </div>
                    <NavItem id="words" icon={BookType} label="Word Magic" activeTab={activeTab} />
                    <NavItem id="contacts" icon={Users} label="Contacts" activeTab={activeTab} />
                    
                    <Link 
                        href="/poster/build"
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group"
                    >
                         <Palette className="w-5 h-5 group-hover:text-purple-400 transition-colors" />
                         <span className="font-medium">Poster Studio</span>
                    </Link>

                    {user?.role === 'admin' && (
                        <>
                            <div className="my-6 mx-4 border-t border-white/5"></div>
                            <div className="px-4 pb-2">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Admin</p>
                            </div>
                            <Link 
                                href="/admin"
                                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group"
                            >
                                <ShieldCheck className="w-5 h-5 group-hover:text-amber-400 transition-colors" />
                                <span className="font-medium">Admin Panel</span>
                            </Link>
                        </>
                    )}
                </nav>

                {/* User Profile */}
                <div className="p-4 m-4">
                    <Link href="/dashboard?tab=profile" className="block p-4 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 hover:border-white/10 transition-colors group cursor-pointer">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-900/20 ring-2 ring-black">
                                {user?.email?.[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate group-hover:text-purple-200 transition-colors">{user?.email}</p>
                                <p className="text-xs text-gray-500 truncate capitalize">{user?.role || 'User'}</p>
                            </div>
                        </div>
                    </Link>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium text-red-300/70 hover:text-red-200 bg-red-500/5 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20 mt-2"
                    >
                        <LogOut className="w-3 h-3" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
}

export default function Sidebar(props) {
    return (
        <React.Suspense fallback={<div className="hidden md:flex fixed z-30 w-72 h-screen bg-[#05050A]/80 backdrop-blur-xl border-r border-white/5" />}>
            <SidebarContent {...props} />
        </React.Suspense>
    );
}
