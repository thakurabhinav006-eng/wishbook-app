'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/lib/utils';
import { User, Mail, Phone, Globe, Bell, Save, Camera, Shield, CreditCard, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
    const { user, token, refreshUser } = useAuth();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        mobile_number: '',
        timezone: 'UTC',
        language: 'en',
        notification_preferences: '{}'
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [plans, setPlans] = useState([]);
    const [upgradeData, setUpgradeData] = useState({
        selectedPlan: '',
        paymentMethod: 'card'
    });
    const [paymentStatus, setPaymentStatus] = useState(null); // null, 'processing', 'success', 'failed'
    const fileInputRef = React.useRef(null);

    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                email: user.email || '',
                mobile_number: user.mobile_number || '',
                timezone: user.timezone || 'UTC',
                language: user.language || 'en',
                notification_preferences: user.notification_preferences || '{}'
            });
            
            // Fetch plans
            if (token) {
                fetch(getApiUrl('/api/plans'), {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                .then(res => res.json())
                .then(data => setPlans(data || []))
                .catch(err => console.error(err));
            }
        }
    }, [user, token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'mobile_number') {
            // Allow only numbers and plus
            if (!/^[0-9+]*$/.test(value)) return;
        }
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (formData.mobile_number && (formData.mobile_number.length < 10 || formData.mobile_number.length > 15)) {
            setMessage({ type: 'error', text: 'Mobile number must be between 10 and 15 digits' });
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(getApiUrl('/api/users/me'), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    full_name: formData.full_name,
                    mobile_number: formData.mobile_number,
                    timezone: formData.timezone,
                    language: formData.language
                })
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                refreshUser();
            } else {
                const data = await res.json();
                throw new Error(data.detail || 'Update failed');
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(getApiUrl('/api/users/change-password'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    old_password: passwordData.old_password,
                    new_password: passwordData.new_password
                })
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Password updated successfully!' });
                setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
            } else {
                const data = await res.json();
                throw new Error(data.detail || 'Password update failed');
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        try {
            const res = await fetch(getApiUrl('/api/users/upload-avatar'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                refreshUser();
                setMessage({ type: 'success', text: 'Profile photo updated!' });
            } else {
                throw new Error('Failed to upload photo');
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };
    const handlePayment = async (e) => {
        e.preventDefault();
        setPaymentStatus('processing');
        
        // Mock Payment Delay
        setTimeout(() => {
            setPaymentStatus('success');
            setTimeout(() => {
                setPaymentStatus(null);
                refreshUser(); // Ideally backend would update user plan via webhook
            }, 2000);
        }, 1500);
    };

    if (!user) return null;

    const selectedPlanDetails = plans.find(p => p.name === upgradeData.selectedPlan);

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="glass-card rounded-3xl p-8 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                    <User className="w-8 h-8 text-purple-400" />
                    My Profile
                </h2>

                {/* Tabs */}
                <div className="flex space-x-4 mb-8 border-b border-white/10 pb-4">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                            activeTab === 'profile' 
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        Profile Details
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                            activeTab === 'security' 
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        Security
                    </button>
                    <button
                        onClick={() => setActiveTab('subscription')}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                            activeTab === 'subscription' 
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        Subscription
                    </button>
                </div>

                {message && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl text-sm mb-6 ${message.type === 'success' ? 'bg-green-500/20 text-green-200 border border-green-500/30' : 'bg-red-500/20 text-red-200 border border-red-500/30'}`}
                    >
                        {message.text}
                    </motion.div>
                )}

                {activeTab === 'profile' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
                        {/* Left Column: Avatar & Basic Info */}
                        <div className="col-span-1 flex flex-col items-center space-y-4">
                            <div 
                                onClick={handleAvatarClick}
                                className="w-32 h-32 rounded-full border-4 border-white/10 bg-white/5 flex items-center justify-center relative group overflow-hidden cursor-pointer"
                            >
                                {user.profile_photo_url ? (
                                    <img src={getApiUrl(user.profile_photo_url)} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-12 h-12 text-gray-400" />
                                )}
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleAvatarUpload} 
                                className="hidden" 
                                accept="image/*"
                            />
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-white">{user.full_name || 'User'}</h3>
                                <p className="text-sm text-purple-400 uppercase tracking-widest">{user.subscription_plan || 'Free Plan'}</p>
                            </div>
                            {/* Plan Badge */}
                            <div className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-sm text-purple-200">
                                {user.subscription_plan === 'premium' ? '✨ Premium Member' : '🚀 Free Member'}
                            </div>
                        </div>

                        {/* Right Column: Edit Form */}
                        <div className="col-span-1 md:col-span-2">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <User className="w-3 h-3" /> Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleChange}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <Mail className="w-3 h-3" /> Email (Read Only)
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            readOnly
                                            className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <Phone className="w-3 h-3" /> Mobile Number
                                        </label>
                                        <input
                                            type="tel"
                                            name="mobile_number"
                                            value={formData.mobile_number}
                                            onChange={handleChange}
                                            placeholder="+1 234 567 890"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <Globe className="w-3 h-3" /> Timezone
                                        </label>
                                        <select
                                            name="timezone"
                                            value={formData.timezone}
                                            onChange={handleChange}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-colors appearance-none"
                                        >
                                            <option value="UTC" className="bg-[#181820] text-white">UTC</option>
                                            <option value="Asia/Kolkata" className="bg-[#181820] text-white">IST (Asia/Kolkata)</option>
                                            <option value="America/New_York" className="bg-[#181820] text-white">EST (America/New_York)</option>
                                            <option value="Europe/London" className="bg-[#181820] text-white">GMT (Europe/London)</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/40 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Saving...' : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="animate-fade-in max-w-2xl mx-auto">
                        <div className="text-center mb-8">
                             <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
                                <Shield className="w-8 h-8 text-purple-400" />
                             </div>
                             <h3 className="text-xl font-bold text-white">Security & Password</h3>
                             <p className="text-gray-400 text-sm">Update your password to keep your account secure.</p>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.old_password}
                                    onChange={(e) => setPasswordData({...passwordData, old_password: e.target.value})}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-colors"
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.new_password}
                                    onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-colors"
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.confirm_password}
                                    onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-colors"
                                    placeholder="Confirm new password"
                                />
                            </div>
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading || !passwordData.old_password || !passwordData.new_password}
                                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/40 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'subscription' && (
                    <div className="animate-fade-in max-w-2xl mx-auto">
                        <div className="text-center mb-8">
                             <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
                                <CreditCard className="w-8 h-8 text-purple-400" />
                             </div>
                             <h3 className="text-xl font-bold text-white">Upgrade Subscription</h3>
                             <p className="text-gray-400 text-sm">Choose a plan that fits your needs.</p>
                        </div>

                        {paymentStatus === 'success' ? (
                            <div className="text-center p-8 bg-green-500/10 rounded-3xl border border-green-500/30">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Payment Successful!</h3>
                                <p className="text-gray-300">Your plan has been upgraded to {upgradeData.selectedPlan}.</p>
                            </div>
                        ) : (
                            <form onSubmit={handlePayment} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Current Plan
                                    </label>
                                    <div className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-gray-300 capitalize">
                                        {user.subscription_plan || 'Free'}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Upgrade To Plan
                                    </label>
                                    <select
                                        value={upgradeData.selectedPlan}
                                        onChange={(e) => setUpgradeData({...upgradeData, selectedPlan: e.target.value})}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-colors appearance-none"
                                        required
                                    >
                                        <option value="" className="bg-[#181820] text-white">Select a plan</option>
                                        {plans.filter(p => p.name.toLowerCase() !== user.subscription_plan?.toLowerCase()).map(plan => (
                                            <option key={plan.id} value={plan.name} className="bg-[#181820] text-white">
                                                {plan.name} - ${(plan.price / 100).toFixed(2)} / month
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedPlanDetails && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                Plan Price
                                            </label>
                                            <div className="text-xl font-bold text-white">
                                                ${(selectedPlanDetails.price / 100).toFixed(2)}
                                            </div>
                                        </div>
                                         <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                Final Amount
                                            </label>
                                            <div className="text-xl font-bold text-purple-400">
                                                ${(selectedPlanDetails.price / 100).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Payment Method
                                    </label>
                                    <select
                                        value={upgradeData.paymentMethod}
                                        onChange={(e) => setUpgradeData({...upgradeData, paymentMethod: e.target.value})}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-colors appearance-none"
                                    >
                                        <option value="card" className="bg-[#181820] text-white">Credit/Debit Card</option>
                                        <option value="upi" className="bg-[#181820] text-white">UPI</option>
                                        <option value="netbanking" className="bg-[#181820] text-white">Net Banking</option>
                                    </select>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={paymentStatus === 'processing' || !upgradeData.selectedPlan}
                                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/40 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {paymentStatus === 'processing' ? 'Processing...' : 'Confirm & Pay'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
