'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/lib/utils';
import { Search, Filter, Sparkles, Calendar, PartyPopper, Heart, Briefcase, Share2, Trash2 } from 'lucide-react';
import useSWR from 'swr';

const getIcon = (occasion) => {
    const lower = occasion?.toLowerCase() || '';
    if (lower.includes('birth')) return PartyPopper;
    if (lower.includes('love') || lower.includes('anniv')) return Heart;
    if (lower.includes('job') || lower.includes('boss')) return Briefcase;
    return Sparkles;
};

const Card3D = ({ wish, index }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [10, -10]);
    const rotateY = useTransform(x, [-100, 100], [-10, 10]);

    function handleMouseMove(event) {
        const rect = event.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set(event.clientX - centerX);
        y.set(event.clientY - centerY);
    }

    const getStatusColor = (status) => {
        switch(status?.toLowerCase()) {
            case 'sent': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.05, type: 'spring' }}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { x.set(0); y.set(0); }}
            className="relative group perspective-1000 cursor-pointer h-full"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
            
            <div className="relative h-full bg-[#0a0a12] border border-white/10 rounded-3xl p-6 overflow-hidden transform-style-3d group-hover:border-purple-500/50 transition-colors duration-300 flex flex-col">
                {/* Holographic Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none" />
                
                {/* Header */}
                <div className="flex justify-between items-start mb-4 relative z-10 transform-style-3d translate-z-10">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform">
                            {React.createElement(getIcon(wish.occasion), { className: "w-5 h-5 text-purple-400" })}
                        </div>
                        <div className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getStatusColor(wish.status || 'scheduled')}`}>
                            {wish.status || 'Scheduled'}
                        </div>
                    </div>
                    
                    {wish.auto_send === 1 && (
                         <div className="flex items-center space-x-1 text-xs text-purple-400/80 bg-purple-500/10 px-2 py-1 rounded-full border border-purple-500/10">
                             <Sparkles className="w-3 h-3" />
                             <span className="text-[10px]">Auto</span>
                         </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 transform-style-3d translate-z-20 space-y-3">
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{wish.recipient_name}</h3>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">{wish.occasion}</p>
                    </div>
                    
                    <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed group-hover:text-gray-300 transition-colors italic border-l-2 border-white/10 pl-3">
                        &quot;{wish.generated_wish || "Wish pending generation..."}&quot;
                    </p>

                    {/* Schedule Details */}
                    <div className="pt-2 flex flex-col space-y-1.5 text-xs text-gray-400">
                             <Calendar className="w-3 h-3 text-white/40" />
                             <span>Scheduled: <span className="text-gray-300">
                                 {wish.scheduled_time ? new Date(wish.scheduled_time).toLocaleString() : 'Not set'}
                             </span></span>
                        </div>
                        {wish.updated_at && (
                             <div className="pl-5 text-[10px] text-gray-600">
                                 Last Updated: {new Date(wish.updated_at).toLocaleDateString()}
                             </div>
                        )}
                    </div>
                {/* Footer / Actions */}
                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center transform-style-3d translate-z-10 opacity-60 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-gray-600">ID: {wish.user_id ? `User-${wish.user_id}` : 'Me'}</span>
                    <div className="flex space-x-2">
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-purple-400">
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const fetcher = ([url, token]) => fetch(url, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json());

export default function WishGallery() {
    const [filter, setFilter] = useState('');
    const { token } = useAuth();

    const { data: wishes = [], error, isLoading } = useSWR(
        token ? [getApiUrl('/api/wishes/history'), token] : null,
        fetcher
    );

    const filteredWishes = wishes.filter(w => 
        w.recipient_name?.toLowerCase().includes(filter.toLowerCase()) ||
        w.occasion?.toLowerCase().includes(filter.toLowerCase())
    );

    if (isLoading) return <div className="text-center py-20 text-gray-500">Loading your memories...</div>;

    return (
        <div className="space-y-8">
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search recipients, occasions..." 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all font-light"
                    />
                </div>
                <div className="flex space-x-2">
                    <button className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-all shadow-lg shadow-purple-900/20">
                        <Filter className="w-4 h-4" />
                        <span>Filter</span>
                    </button>
                </div>
            </div>

            {/* Cinema Grid */}
            {filteredWishes.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-300">No wishes found</h3>
                    <p className="text-gray-500 mt-2">Create some magic to see it here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredWishes.map((wish, idx) => (
                        <Card3D key={wish.id} wish={wish} index={idx} />
                    ))}
                </div>
            )}
        </div>
    );
}
