import React from 'react';
import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/lib/utils';
import { Users, Calendar, Mail, Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const fetcher = ([url, token]) => fetch(url, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json());

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className="glass-card border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-white/20 transition-all"
    >
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
            <Icon className="w-24 h-24" />
        </div>
        <div className="relative z-10">
            <div className={`w-12 h-12 rounded-2xl ${color} bg-opacity-20 flex items-center justify-center mb-4 text-white`}>
                <Icon className="w-6 h-6" />
            </div>
            <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
        </div>
    </motion.div>
);

export default function DashboardStats() {
    const { token } = useAuth();
    const { data: stats, error, isLoading } = useSWR(
        token ? [getApiUrl('/api/dashboard/stats'), token] : null,
        fetcher
    );

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-40 glass-card rounded-3xl animate-pulse bg-white/5 mx-auto w-full"></div>
                ))}
            </div>
        );
    }

    if (error || !stats) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard
                title="Total Contacts"
                value={stats.total_contacts}
                icon={Users}
                color="bg-blue-500"
                delay={0}
            />
            <StatCard
                title="Upcoming Events"
                value={stats.upcoming_events}
                icon={Calendar}
                color="bg-purple-500"
                delay={0.1}
            />
            <StatCard
                title="Messages Scheduled"
                value={stats.messages_scheduled}
                icon={Mail}
                color="bg-orange-500"
                delay={0.2}
            />
            <StatCard
                title="Messages Sent"
                value={stats.messages_sent}
                icon={Send}
                color="bg-green-500"
                delay={0.3}
            />
        </div>
    );
}
