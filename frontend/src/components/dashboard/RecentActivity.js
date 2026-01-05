import React from 'react';
import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/lib/utils';
import { Activity, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const fetcher = ([url, token]) => fetch(url, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json());

export default function RecentActivity() {
    const { token } = useAuth();
    const { data: activities, error, isLoading } = useSWR(
        token ? [getApiUrl('/api/activity/recent'), token] : null,
        fetcher
    );

    if (isLoading) {
        return (
            <div className="glass-card rounded-3xl p-6 border border-white/10 animate-pulse">
                <div className="h-6 w-32 bg-white/10 rounded mb-6"></div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-12 bg-white/5 rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!activities || activities.length === 0) {
        return (
            <div className="glass-card rounded-3xl p-8 border border-white/10 text-center">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-6 h-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-1">No Recent Activity</h3>
                <p className="text-gray-400 text-sm">Your recent actions and scheduled wishes will appear here.</p>
            </div>
        );
    }

    return (
        <div className="glass-card rounded-3xl  border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Activity className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                </div>
            </div>
            
            <div className="divide-y divide-white/5">
                {activities.map((activity, index) => {
                    const isSuccess = activity.action === 'wish_sent' || activity.action === 'wish_scheduled';
                    const isFailure = activity.action === 'wish_failed';
                    
                    return (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 hover:bg-white/5 transition-colors flex items-start space-x-4"
                        >
                            <div className={`mt-1 rounded-full p-1.5 ${
                                isSuccess ? 'bg-green-500/20 text-green-400' : 
                                isFailure ? 'bg-red-500/20 text-red-400' : 
                                'bg-blue-500/20 text-blue-400'
                            }`}>
                                {isSuccess ? <CheckCircle2 className="w-4 h-4" /> : 
                                 isFailure ? <AlertCircle className="w-4 h-4" /> : 
                                 <Clock className="w-4 h-4" />}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {activity.details}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5 flex items-center">
                                    {new Date(activity.created_at).toLocaleString()}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
