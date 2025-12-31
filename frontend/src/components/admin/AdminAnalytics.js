import React from 'react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts';

const AdminAnalytics = ({ stats, analytics }) => {
    // Prepare daily activity data properly
    const dailyData = (analytics && analytics.dailyActivity) ? analytics.dailyActivity : [];
    
    // Process platform distribution data
    const platformData = (analytics && analytics.platformStats) ? analytics.platformStats : [];
    const totalWishes = platformData.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Activity Chart */}
                <div className="lg:col-span-2">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center space-x-2">
                        <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                        <span>Weekly Wish Activity</span>
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyData}>
                                <defs>
                                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                <XAxis 
                                    dataKey="date" 
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis 
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                                        borderRadius: '12px', 
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        color: '#fff'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="count" 
                                    stroke="#818cf8" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorVisits)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Platform Distribution */}
                <div className="space-y-8">
                     <div className="bg-white/5 border border-white/10 p-6 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-bold text-white mb-6">Platform Distribution</h3>
                        <div className="space-y-6">
                            {platformData.map((item, index) => (
                                <div key={item.name} className="relative">
                                    <div className="flex justify-between text-sm mb-2 font-medium">
                                        <span className="text-gray-300 capitalize flex items-center">
                                            {item.name}
                                        </span>
                                        <span className="text-white">{item.value} ({Math.round((item.value / totalWishes) * 100) || 0}%)</span>
                                    </div>
                                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                                item.name === 'whatsapp' ? 'bg-gradient-to-r from-green-400 to-emerald-600' :
                                                item.name === 'telegram' ? 'bg-gradient-to-r from-sky-400 to-blue-600' :
                                                'bg-gradient-to-r from-purple-400 to-indigo-600'
                                            }`}
                                            style={{ width: `${(item.value / totalWishes) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                            {platformData.length === 0 && (
                                <p className="text-gray-500 text-center py-4">No data available</p>
                            )}
                        </div>
                    </div>

                    {/* Top Users Leaderboard */}
                     <div className="bg-white/5 border border-white/10 p-6 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <span>🏆</span>
                            <span>Top Senders</span>
                        </h3>
                        <div className="space-y-4">
                            {analytics && analytics.top_users && analytics.top_users.map((user, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg ${
                                            idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-amber-700' : 'bg-indigo-500/50'
                                        }`}>
                                            {idx + 1}
                                        </div>
                                        <span className="text-sm font-medium text-gray-200 truncate max-w-[150px]" title={user.email}>{user.email}</span>
                                    </div>
                                    <span className="text-sm font-bold text-white bg-indigo-500/20 px-2 py-1 rounded-lg border border-indigo-500/20">
                                        {user.count}
                                    </span>
                                </div>
                            ))}
                             {(!analytics || !analytics.top_users || analytics.top_users.length === 0) && (
                                <p className="text-gray-500 text-center py-4 text-sm">No user data yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
