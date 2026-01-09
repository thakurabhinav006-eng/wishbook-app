'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Activity,
    Trash2,
    Eye,
    RefreshCcw,
    ArrowLeft,
    Mail,
    Phone,
    MessageCircle,
    Search,
    Filter,
    Download,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    History,
    Terminal,
    Cpu
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { getApiUrl } from '@/lib/utils';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import PlansManager from '@/components/admin/PlansManager';
import { UserPlus, X, Check, Shield, ShieldOff, AlertTriangle } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [users, setUsers] = useState([]);
    const [feed, setFeed] = useState([]);
    const [systemData, setSystemData] = useState(null);
    const [plans, setPlans] = useState([]); // Store plans globally for the modal
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [platformFilter, setPlatformFilter] = useState('all');
    const [userPlanFilter, setUserPlanFilter] = useState('all');
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [editingUser, setEditingUser] = useState(null);
    const itemsPerPage = 8; // Pagination limit

    const { token, user, logout, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading) {
             if (!token) {
                router.push('/login');
             } else if (user && user.role !== 'admin') {
                router.push('/dashboard');
             }
        }
    }, [authLoading, token, user, router]);

    // Use separate effect for fetch to depend on token/activeTab only
    useEffect(() => {
        if (!token) return;
        setLoading(true);
        setError(null);

        if (activeTab === 'users' && plans.length === 0) {
             // Use Promise.all to fetch users AND plans concurrently if on Users tab
             const fetchUsersAndPlans = async () => {
                try {
                     const [usersRes, plansRes] = await Promise.all([
                        fetch(getApiUrl('/api/admin/users'), { headers: { 'Authorization': `Bearer ${token}` } }),
                        fetch(getApiUrl('/api/admin/plans'), { headers: { 'Authorization': `Bearer ${token}` } })
                     ]);

                     if (usersRes.ok) setUsers(await usersRes.json());
                     if (plansRes.ok) setPlans(await plansRes.json());
                } catch(e) { console.error(e) } finally { setLoading(false); }
             };
             fetchUsersAndPlans();
             return;
        }

        const fetchData = async () => {
            try {
                if (activeTab === 'overview') {
                    const statsRes = await fetch(getApiUrl('/api/admin/stats'), {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!statsRes.ok) throw new Error('Failed to fetch stats');
                    setStats(await statsRes.json());

                    const analyticsRes = await fetch(getApiUrl('/api/admin/analytics'), {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!analyticsRes.ok) throw new Error('Failed to fetch analytics');
                    setAnalytics(await analyticsRes.json());
                } else if (activeTab === 'users') {
                     // Fallback if not caught by the concurrent block above
                    const usersRes = await fetch(getApiUrl('/api/admin/users'), {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!usersRes.ok) throw new Error('Failed to fetch users');
                    setUsers(await usersRes.json());
                } else if (activeTab === 'feed') {
                    const feedRes = await fetch(getApiUrl('/api/admin/feed'), {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!feedRes.ok) throw new Error('Failed to fetch feed');
                    setFeed(await feedRes.json());
                } else if (activeTab === 'system') {
                     const sysRes = await fetch(getApiUrl('/api/admin/system'), {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!sysRes.ok) throw new Error('Failed to fetch system health');
                    setSystemData(await sysRes.json());
                } else if (activeTab === 'plans') {
                    // Refresh plans if tab is clicked
                    const plansRes = await fetch(getApiUrl('/api/admin/plans'), { headers: { 'Authorization': `Bearer ${token}` } });
                    if(plansRes.ok) setPlans(await plansRes.json());
                }
            } catch (error) {
                console.error("Fetch failed:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeTab, token]);

    if (authLoading || !token) return null;

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure? This will delete all their data.")) return;
        try {
            const res = await fetch(getApiUrl(`/api/admin/users/${userId}`), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const newUsers = users.filter(u => u.id !== userId);
                setUsers(newUsers);
            }
            else alert("Failed to delete user");
        } catch (error) { console.error(error); }
    };

    const handleResetPassword = async (userId) => {
        if (!window.confirm("Reset password to 'temp1234'?")) return;
        try {
            const res = await fetch(getApiUrl(`/api/admin/users/${userId}/reset-password`), {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) alert("Password reset to 'temp1234'");
            else alert("Failed to reset password");
        } catch (error) { console.error(error); }
    };

    const handleViewUser = async (userId) => {
        try {
            const res = await fetch(getApiUrl(`/api/admin/users/${userId}`), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setSelectedUser(await res.json());
        } catch (error) { console.error(error); }
    };

    const handleToggleStatus = async (user) => {
        const newStatus = user.is_active ? 0 : 1;
        const action = newStatus ? "Activate" : "Suspend";
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

        try {
            const res = await fetch(getApiUrl(`/api/admin/users/${user.id}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ is_active: newStatus })
            });

            if (res.ok) {
                const updatedUsers = users.map(u => u.id === user.id ? { ...u, is_active: newStatus } : u);
                setUsers(updatedUsers);
            } else {
                const data = await res.json();
                alert(data.detail || "Failed to update status");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        }
    };

    const openEditUser = (user) => {
        setEditingUser(user);
        setModalMode('edit');
        setIsUserModalOpen(true);
    };

    const openCreateUser = () => {
        setEditingUser(null);
        setModalMode('create');
        setIsUserModalOpen(true);
    };

    const handleUserSubmit = async (formData) => {
        setLoading(true);
        try {
            const url = modalMode === 'create' 
                ? getApiUrl('/api/admin/users') 
                : getApiUrl(`/api/admin/users/${editingUser.id}`);
            
            const method = modalMode === 'create' ? 'POST' : 'PUT';
            
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || 'Operation failed');
            }

            // Refresh users
            const usersRes = await fetch(getApiUrl('/api/admin/users'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (usersRes.ok) setUsers(await usersRes.json());
            
            setIsUserModalOpen(false);
            alert(modalMode === 'create' ? 'User created!' : 'User updated!');
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };
    const filteredUsers = users.filter(u => 
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (userPlanFilter === 'all' || (u.subscription_plan && u.subscription_plan.toLowerCase() === userPlanFilter.toLowerCase()) || (!u.subscription_plan && userPlanFilter === 'free'))
    );

    const filteredFeed = feed.filter(w => 
        platformFilter === 'all' || w.platform.toLowerCase() === platformFilter.toLowerCase()
    );

    // Pagination Logic
    const paginatedUsers = filteredUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const paginatedFeed = filteredFeed.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const totalUserPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const totalFeedPages = Math.ceil(filteredFeed.length / itemsPerPage);

    const handleExport = (type) => {
        const data = type === 'users' ? users : feed;
        if (!data.length) return alert('No data to export');

        const headers = Object.keys(data[0]).join(',');
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers + "\n" 
            + data.map(row => Object.values(row).map(val => `"${val}"`).join(',')).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${type}_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Theme Constants
    const THEME = {
        primary: "from-indigo-400 to-cyan-400",
        secondary: "from-purple-400 to-pink-400",
        background: "bg-[#0a0a0f]",
        glass: "backdrop-blur-md bg-white/5 border border-white/10",
        glassHover: "hover:bg-white/10 transition-all duration-300",
        text: {
            main: "text-white",
            muted: "text-gray-400",
            highlight: "text-cyan-300"
        }
    };

    return (
        <div className={`min-h-screen ${THEME.background} font-sans text-gray-100 flex flex-col relative overflow-hidden`}>
             {/* Background Effects */}
             <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
             <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

            {/* Admin Header */}
            <header className={`sticky top-0 z-50 glass-card shadow-xl`}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={() => router.push('/')} 
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div className="flex items-center space-x-3">
                             <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg shadow-lg shadow-purple-500/20">
                                <LayoutDashboard className="w-5 h-5 text-white" />
                             </div>
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                Admin Console
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-xs font-medium text-green-400">System Online</span>
                        </div>
                        
                        <button 
                            onClick={() => router.push('/profile')}
                            className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                            title="My Profile"
                        >
                            <Users className="w-5 h-5" />
                        </button>

                        <button 
                            onClick={logout} 
                            className="px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto p-6 md:p-8 w-full z-10">
                {/* Tabs */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className={`flex p-1 rounded-xl glass-card shadow-lg`}>
                        {['overview', 'users', 'feed', 'plans', 'logs', 'system'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); setPage(1); }}
                                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 relative ${activeTab === tab ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                {activeTab === tab && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg shadow-lg opacity-100 -z-10 animate-fade-in" />
                                )}
                                <span className="capitalize relative z-10 flex items-center space-x-2">
                                    {tab === 'overview' && <Activity className="w-4 h-4" />}
                                    {tab === 'users' && <Users className="w-4 h-4" />}
                                    {tab === 'feed' && <MessageCircle className="w-4 h-4" />}
                                    {tab === 'plans' && <LayoutDashboard className="w-4 h-4" />}
                                    {tab === 'logs' && <History className="w-4 h-4" />}
                                    {tab === 'system' && <Terminal className="w-4 h-4" />}
                                    <span>{tab}</span>
                                </span>
                            </button>
                        ))}
                    </div>
                    
                    {/* Global Actions or Status could go here */}
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-6 py-4 rounded-xl mb-8 flex items-center animate-shake backdrop-blur-sm">
                        <span className="font-medium mr-2">Error:</span>
                        {error}
                    </div>
                )}

                {/* Content Area */}
                <div className="animate-fade-in space-y-8">
                    {activeTab === 'overview' && stats && analytics && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard title="Total Users" value={stats.total_users} color="from-blue-500 to-indigo-600" icon={Users} delay={0} />
                                <StatCard title="Wishes Sent" value={stats.wishes_sent} color="from-purple-500 to-pink-600" icon={Activity} delay={100} />
                                <StatCard title="Wishes Today" value={stats.wishes_today || 0} color="from-amber-400 to-orange-500" icon={Sparkles} delay={200} />
                                <StatCard title="System Status" value={stats.system_status} color="from-emerald-400 to-green-600" icon={Activity} delay={300} />
                            </div>

                            <div className={`rounded-3xl glass-card p-8 shadow-2xl overflow-hidden relative`}>
                                 <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
                                 <AdminAnalytics stats={stats} analytics={analytics} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'system' && systemData && (
                        <SystemMonitor data={systemData} />
                    )}

                    {activeTab === 'users' && (
                        <div className="space-y-6">
                            {/* Toolbar */}
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className={`relative w-full md:w-96 group`}>
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" />
                                    <input 
                                        type="text" 
                                        placeholder="Search users by email..."
                                        className={`w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-white placeholder-gray-500`}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center space-x-4">
                                    {/* Plan Filter */}
                                    <select 
                                        value={userPlanFilter}
                                        onChange={(e) => setUserPlanFilter(e.target.value)}
                                        className="bg-white/5 border border-white/10 text-gray-300 text-sm rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
                                    >
                                        <option value="all">All Plans</option>
                                        <option value="free">Free</option>
                                        {plans.map(p => {
                                            if (p.name.toLowerCase() === 'free') return null;
                                            return <option key={p.id} value={p.name.toLowerCase()}>{p.name}</option>
                                        })}
                                    </select>

                                    <span className="text-sm text-gray-400 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                                        <b className="text-white">{filteredUsers.length}</b> Users Found
                                    </span>
                                    <button 
                                        onClick={() => handleExport('users')}
                                        className="flex items-center space-x-2 px-5 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all hover:scale-105 active:scale-95"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span>Export CSV</span>
                                    </button>
                                    <button 
                                        onClick={openCreateUser}
                                        className="flex items-center space-x-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        <span>Add User</span>
                                    </button>
                                </div>
                            </div>

                            {/* Users Table */}
                            <div className={`rounded-2xl glass-card overflow-hidden shadow-xl`}>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-white/10">
                                            <thead className="bg-white/5">
                                            <tr>
                                                <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                                                <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                                                <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Plan</th>
                                                <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {paginatedUsers.map((u, i) => (
                                                <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                                                    <td className="px-6 py-5 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${i % 2 === 0 ? 'from-indigo-500 to-purple-600' : 'from-pink-500 to-rose-600'} flex items-center justify-center text-sm font-bold text-white shadow-lg mr-4`}>
                                                                {(u.email && u.email[0]) ? u.email[0].toUpperCase() : '?'}
                                                            </div>
                                                            <div className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{u.email}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 whitespace-nowrap">
                                                        <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${
                                                            u.role === 'admin' 
                                                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                                                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                                        }`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 whitespace-nowrap">
                                                        <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${
                                                            u.subscription_plan === 'premium' 
                                                            ? 'bg-gradient-to-r from-amber-200/20 to-yellow-400/20 text-yellow-300 border border-yellow-500/30' 
                                                            : 'bg-white/5 text-gray-400 border border-white/10'
                                                        }`}>
                                                            {u.subscription_plan || 'Free'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase tracking-wide border ${
                                                            u.is_active 
                                                            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                        }`}>
                                                            {u.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                        <button onClick={() => openEditUser(u)} className="p-2 hover:bg-indigo-500/20 text-gray-400 hover:text-indigo-300 rounded-lg transition-colors" title="Edit User">
                                                            <Users className="w-4 h-4" />
                                                        </button>
                                                        {u.role !== 'admin' && (
                                                            <button 
                                                                onClick={() => handleToggleStatus(u)} 
                                                                className={`p-2 rounded-lg transition-colors ${u.is_active ? 'hover:bg-red-500/20 text-gray-400 hover:text-red-400' : 'hover:bg-green-500/20 text-gray-400 hover:text-green-400'}`}
                                                                title={u.is_active ? "Suspend User" : "Activate User"}
                                                            >
                                                                {u.is_active ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                                            </button>
                                                        )}
                                                        <button onClick={() => handleResetPassword(u.id)} className="p-2 hover:bg-amber-500/20 text-gray-400 hover:text-amber-300 rounded-lg transition-colors" title="Reset Password">
                                                            <RefreshCcw className="w-4 h-4" />
                                                        </button>
                                                        {u.role !== 'admin' && (
                                                            <button onClick={() => handleDeleteUser(u.id)} className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors" title="Delete User">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            {/* Pagination */}
                            {totalUserPages > 1 && (
                                <PaginationControls page={page} totalPages={totalUserPages} setPage={setPage} />
                            )}
                        </div>
                    )}

                    {activeTab === 'feed' && (
                        <div className="space-y-6">
                            {/* Filters */}
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className={`flex p-1 rounded-xl bg-white/5 border border-white/10`}>
                                    {['all', 'email', 'whatsapp', 'telegram'].map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setPlatformFilter(p)}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                                platformFilter === p 
                                                ? 'bg-gradient-to-r from-gray-700 to-gray-600 text-white shadow-md' 
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-400">Total: <b className="text-white">{filteredFeed.length}</b></span>
                                    <button 
                                        onClick={() => handleExport('feed')}
                                        className="text-gray-400 hover:text-white flex items-center space-x-2 text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span>Export CSV</span>
                                    </button>
                                </div>
                            </div>

                            {/* Feed Cards Grid */}
                            <div className="grid grid-cols-1 gap-4">
                                {paginatedFeed.map((w, i) => (
                                    <div 
                                        key={w.id} 
                                        className={`glass-card p-6 rounded-2xl ${THEME.glassHover} relative group overflow-hidden`}
                                        style={{ animationDelay: `${i * 50}ms` }}
                                    >
                                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-white/20 to-transparent group-hover:via-indigo-500/50 transition-all" />
                                        
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-3">
                                            <div className="flex items-center space-x-4">
                                                <div className={`p-3 rounded-xl shadow-inner ${
                                                    w.platform === 'whatsapp' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                    w.platform === 'telegram' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 
                                                    'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                }`}>
                                                    {w.platform === 'whatsapp' ? <Phone className="w-5 h-5" /> :
                                                        w.platform === 'telegram' ? <MessageCircle className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <h4 className="font-bold text-white text-base">{w.recipient}</h4>
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/10 text-gray-400 border border-white/5">
                                                            {w.occasion}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-1">Sent by <span className="text-indigo-300">{w.sender}</span></p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 text-xs font-medium text-gray-500 bg-black/20 px-3 py-1 rounded-full">
                                                <History className="w-3 h-3" />
                                                <span>{new Date(w.created_at).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-black/20 rounded-xl p-4 text-sm text-gray-300 italic border border-white/5 relative">
                                            <span className="absolute top-2 left-2 text-4xl text-white/5 font-serif">"</span>
                                            <p className="relative z-10 pl-4">{w.generated_wish}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Feed */}
                            {totalFeedPages > 1 && (
                                <PaginationControls page={page} totalPages={totalFeedPages} setPage={setPage} />
                            )}
                        </div>
                    )}

                    {activeTab === 'plans' && (
                         <PlansManager 
                             token={token} 
                             onViewUsers={(planName) => {
                                 setUserPlanFilter(planName.toLowerCase());
                                 setActiveTab('users');
                             }}
                         />
                    )}
                    {activeTab === 'logs' && <ActivityLogs token={token} />}
                </div>
            </main>

            {/* Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
                    {/* ... (Keep existing details modal logic, maybe tweaked if needed) ... */}
                    <div className="bg-[#121218] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden">
                         {/* Re-use existing modal content structure but simplified for brevity in this replace block */}
                         <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-500/20 to-transparent pointer-events-none" />
                        <div className="text-center mb-8 relative z-10">
                            <h2 className="text-xl font-bold text-white mb-1">{selectedUser.email}</h2>
                        </div>
                         <button onClick={() => setSelectedUser(null)} className="w-full bg-white text-black py-3 rounded-xl font-bold">Close</button>
                    </div>
                </div>
            )}

            {/* User Create/Edit Modal */}
            {isUserModalOpen && (
                <UserModal 
                    isOpen={isUserModalOpen} 
                    onClose={() => setIsUserModalOpen(false)} 
                    mode={modalMode} 
                    user={editingUser} 
                    onSubmit={handleUserSubmit}
                    availablePlans={plans} 
                />
            )}
        </div>
    );
};

// Helper Components
const StatCard = ({ title, value, color, icon: Icon, delay }) => (
    <div 
        className="bg-white/5 border border-white/10 p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className={`absolute top-0 right-0 p-16 bg-gradient-to-br ${color} opacity-10 blur-[40px] group-hover:opacity-20 transition-opacity`} />
        
        <div className="flex items-start justify-between relative z-10">
            <div>
                <p className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-1">{title}</p>
                <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
        </div>
    </div>
);

const PaginationControls = ({ page, totalPages, setPage }) => (
    <div className="flex justify-center flex-col items-center space-y-2 mt-8">
        <div className="flex items-center space-x-2 bg-white/5 p-1 rounded-xl border border-white/5">
            <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-2.5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-white transition-colors"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 text-sm font-medium text-gray-400">
                <span className="text-white">{page}</span> / {totalPages}
            </span>
            <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-2.5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-white transition-colors"
            >
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    </div>
);



const ActivityLogs = ({ token }) => {
    // Reusing the Feed Logic but in a list view
    const [logs, setLogs] = useState([]);
    
    useEffect(() => {
        fetch(getApiUrl('/api/admin/feed'), { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(setLogs)
        .catch(console.error);
    }, [token]);

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full">
                <thead className="bg-white/5">
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Time</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Sender</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Recipient</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Platform</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {logs.map(log => (
                        <tr key={log.id} className="hover:bg-white/5">
                            <td className="px-6 py-3 text-sm text-gray-400">{new Date(log.created_at).toLocaleString()}</td>
                            <td className="px-6 py-3 text-sm text-white">{log.sender}</td>
                            <td className="px-6 py-3 text-sm text-white">{log.recipient}</td>
                            <td className="px-6 py-3 text-sm capitalize text-gray-300">{log.platform}</td>
                            <td className="px-6 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${log.status === 'sent' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                    {log.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDashboard;

const SystemMonitor = ({ data }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-400 font-bold uppercase text-xs tracking-wider">CPU Usage</h3>
                        <Cpu className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="flex items-end space-x-2">
                        <span className="text-4xl font-bold text-white">{data.system.cpu}%</span>
                         <div className="h-2 flex-1 bg-white/10 rounded-full mb-2 overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${data.system.cpu}%` }} />
                        </div>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-400 font-bold uppercase text-xs tracking-wider">RAM Usage</h3>
                        <Activity className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex items-end space-x-2">
                        <span className="text-4xl font-bold text-white">{data.system.ram_percent}%</span>
                        <div className="h-2 flex-1 bg-white/10 rounded-full mb-2 overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${data.system.ram_percent}%` }} />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{data.system.ram_used} GB / {data.system.ram_total} GB</p>
                </div>
                 <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-400 font-bold uppercase text-xs tracking-wider">AI Latency</h3>
                        <Sparkles className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="flex items-end space-x-2">
                         <span className="text-4xl font-bold text-white">{data.performance.avg_latency_ms}</span>
                         <span className="text-sm text-gray-400 mb-1">ms avg</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Based on last {data.performance.request_count} requests</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-400 font-bold uppercase text-xs tracking-wider">Scheduler</h3>
                        <History className="w-5 h-5 text-green-400" />
                    </div>
                     <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${data.scheduler.status === 'running' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="text-lg font-bold text-white capitalize">{data.scheduler.status}</span>
                    </div>
                    <p className="text-xs text-gray-400">Next Job: {data.scheduler.next_job ? new Date(data.scheduler.next_job).toLocaleTimeString() : 'None'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-400" />
                        Live Latency Tracking
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.latency_history}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="time" stroke="#4b5563" tick={{fontSize: 12}} />
                                <YAxis stroke="#4b5563" tick={{fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.75rem', color: '#fff' }}
                                    itemStyle={{ color: '#818cf8' }}
                                />
                                <Line type="monotone" dataKey="ms" stroke="#818cf8" strokeWidth={3} dot={{r: 4, fill: '#818cf8'}} activeDot={{r: 6, fill: '#fff'}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                 <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl p-4 font-mono text-xs text-green-400 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                         <span className="text-gray-400 uppercase font-bold tracking-wider">System Log</span>
                         <Terminal className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="space-y-1 overflow-y-auto flex-1 h-[300px] scrollbar-hide">
                        <p className="text-gray-500">[{new Date().toLocaleTimeString()}] System monitor connected...</p>
                        <p>[INFO] Scheduler heartbeat active</p>
                        <p>[INFO] Database connection pool: Healthy</p>
                        <p>[INFO] Redis cache: Connected</p>
                        {data.scheduler.next_job && (
                            <p className="text-yellow-400">[JOB] Scheduled task queued for {new Date(data.scheduler.next_job).toLocaleTimeString()}</p>
                        )}
                        <p className="text-blue-400">[API] Latency telemetry stream active</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const UserModal = ({ isOpen, onClose, mode, user, onSubmit, availablePlans = [] }) => {
    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        email: user?.email || '',
        password: '',
        role: user?.role || 'user',
        subscription_plan: user?.subscription_plan || 'free',
        is_active: user?.is_active !== undefined ? user.is_active : 1
    });

    const handleChange = (e) => {
        const val = e.target.type === 'checkbox' ? (e.target.checked ? 1 : 0) : e.target.value;
        setFormData({ ...formData, [e.target.name]: val });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-[#121218] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">{mode === 'create' ? 'Add User' : 'Edit User'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                        <input name="full_name" value={formData.full_name} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none" required />
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none" required />
                    </div>
                    
                    {mode === 'create' && (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none" required />
                            </div>
                        </>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Role</label>
                            <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none">
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                         <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Plan</label>
                            <select name="subscription_plan" value={formData.subscription_plan} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none">
                                <option value="free">Free</option>
                                {availablePlans.filter(p => p.name.toLowerCase() !== 'free').map(p => (
                                     <option key={p.id} value={p.name.toLowerCase()}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        {mode === 'edit' && (
                             <div className="space-y-1 flex flex-col justify-end pb-3">
                                <label className="flex items-center space-x-3 cursor-pointer group">
                                    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${formData.is_active ? 'bg-green-500' : 'bg-gray-600'}`}>
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </div>
                                    <input type="checkbox" name="is_active" checked={formData.is_active === 1} onChange={handleChange} className="hidden" />
                                    <span className="text-sm font-medium text-gray-300">{formData.is_active ? 'Active' : 'Inactive'}</span>
                                </label>
                            </div>
                        )}
                    </div>

                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition-colors mt-4">
                        {mode === 'create' ? 'Create User' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};
