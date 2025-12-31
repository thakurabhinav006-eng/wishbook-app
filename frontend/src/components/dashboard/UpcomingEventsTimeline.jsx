import React from 'react';
import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/lib/utils';
import { Cake, Heart, Calendar, Mail, Clock, ArrowRight } from 'lucide-react';

const fetcher = ([url, token]) => fetch(url, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json());

export default function UpcomingEventsTimeline() {
    const { token } = useAuth();
    const { data: events, isLoading } = useSWR(
        token ? [getApiUrl('/api/events/upcoming?days=30'), token] : null,
        fetcher
    );

    if (isLoading) return <div className="p-10 text-center text-gray-400">Loading timeline...</div>;
    if (!events || events.length === 0) return (
        <div className="glass-card border border-white/10 rounded-3xl p-8 text-center bg-white/5">
            <Calendar className="w-12 h-12 mx-auto text-gray-600 mb-3" />
            <h3 className="text-gray-300 font-medium">No Upcoming Events</h3>
            <p className="text-gray-500 text-sm">You're all caught up for the next 30 days!</p>
        </div>
    );

    return (
        <div className="bg-[#121218] border border-white/10 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-400" />
                    Upcoming Timeline
                </h3>
                <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full border border-white/5">Next 30 Days</span>
            </div>

            <div className="relative border-l border-white/10 ml-3 space-y-8 py-2">
                {events.map((event, index) => {
                    const dateObj = new Date(event.date);
                    const isToday = new Date().toDateString() === dateObj.toDateString();

                    let Icon = Calendar;
                    let color = "text-gray-400";
                    let bg = "bg-gray-500/20";

                    if (event.title.includes("Birthday")) { Icon = Cake; color = "text-pink-400"; bg = "bg-pink-500/10"; }
                    else if (event.title.includes("Anniversary")) { Icon = Heart; color = "text-red-400"; bg = "bg-red-500/10"; }
                    else if (event.type === "scheduled_wish") { Icon = Mail; color = "text-blue-400"; bg = "bg-blue-500/10"; }

                    return (
                        <div key={event.id} className="relative pl-8 group">
                            {/* Dot */}
                            <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ${isToday ? "bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" : "bg-gray-700 group-hover:bg-purple-500/50"} transition-colors border border-[#121218]`}></div>

                            <div className="flex items-start justify-between group-hover:translate-x-1 transition-transform">
                                <div>
                                    <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isToday ? "text-purple-400" : "text-gray-500"}`}>
                                        {dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                        {isToday && <span className="ml-2 px-1.5 py-0.5 bg-purple-500 text-white rounded text-[10px]">TODAY</span>}
                                    </p>
                                    <h4 className="text-gray-200 font-medium">{event.title}</h4>
                                    {event.type === 'scheduled_wish' && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20 capitalize">
                                                To: {event.title.split(":")[0].replace("Wish for ", "")}
                                            </span>
                                            <span className="text-[10px] text-gray-500">{event.platform}</span>
                                        </div>
                                    )}
                                </div>
                                <div className={`p-2 rounded-xl ${bg} ${color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button className="w-full mt-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors flex items-center justify-center gap-2">
                View Full Calendar <ArrowRight className="w-3 h-3" />
            </button>
        </div>
    );
}
