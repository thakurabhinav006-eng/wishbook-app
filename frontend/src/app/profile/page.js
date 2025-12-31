'use client';
import React, { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/lib/utils';
import { User, Mail, Phone, Clock, Globe, Bell, Camera, ArrowLeft, Loader2, Save, Lock, Shield, KeyRound } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const { user, token, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('personal'); // 'personal' or 'security'
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    // Personal Info State
    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        mobile_number: user?.mobile_number || '',
        timezone: user?.timezone || 'UTC',
        language: user?.language || 'en',
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const res = await fetch(getApiUrl('/api/users/me'), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const updatedUser = await res.json();
                updateUser(updatedUser);
                setMessage('Profile updated successfully!');
            } else {
                setError('Failed to update profile.');
            }
        } catch (error) {
            setError('An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        if (passwordData.new_password !== passwordData.confirm_password) {
            setError("New passwords do not match.");
            setLoading(false);
            return;
        }

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

            const data = await res.json();
            if (res.ok) {
                setMessage('Password changed successfully!');
                setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
            } else {
                setError(data.detail || 'Failed to change password');
            }
        } catch (error) {
            setError('An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const data = new FormData();
        data.append('file', file);

        try {
            const res = await fetch(getApiUrl('/api/users/upload-avatar'), {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: data
            });

            if (res.ok) {
                const { url } = await res.json();
                updateUser({ ...user, profile_photo_url: url });
            }
        } catch (error) {
            console.error('Upload failed', error);
        } finally {
            setUploading(false);
        }
    };

    if (!user) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-400" />
                    </Link>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                        Account Settings
                    </h1>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Nav */}
                    <div className="w-full md:w-64 space-y-2">
                        <button
                            onClick={() => { setActiveTab('personal'); setMessage(''); setError(''); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                                activeTab === 'personal' ? 'bg-white/10 text-white font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <User className="w-5 h-5" />
                            Personal Info
                        </button>
                        <button
                            onClick={() => { setActiveTab('security'); setMessage(''); setError(''); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                                activeTab === 'security' ? 'bg-white/10 text-white font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <Shield className="w-5 h-5" />
                            Security
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-8">
                        {/* Messages */}
                        {(message || error) && (
                            <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${message ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                {message || error}
                            </div>
                        )}

                        {activeTab === 'personal' && (
                            <>
                                <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
                                {/* Avatar Section */}
                                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/10">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 bg-gray-800">
                                            {user.profile_photo_url ? (
                                                <img src={getApiUrl(user.profile_photo_url)} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-500">
                                                    {user.email[0].toUpperCase()}
                                                </div>
                                            )}
                                            
                                            <div 
                                                onClick={() => fileInputRef.current?.click()}
                                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                                            >
                                                {uploading ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : <Camera className="w-6 h-6 text-white" />}
                                            </div>
                                        </div>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            onChange={handleFileChange} 
                                            accept="image/*" 
                                            className="hidden" 
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Profile Photo</h3>
                                        <p className="text-sm text-gray-400">Click to upload a new photo.</p>
                                    </div>
                                </div>

                                <form onSubmit={handleProfileSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                                <User className="w-3 h-3" /> Full Name
                                            </label>
                                            <input
                                                name="full_name"
                                                value={formData.full_name}
                                                onChange={handleChange}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none transition-colors"
                                                placeholder="John Doe"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                                <Phone className="w-3 h-3" /> Mobile Number
                                            </label>
                                            <input
                                                name="mobile_number"
                                                value={formData.mobile_number}
                                                onChange={handleChange}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none transition-colors"
                                                placeholder="+1 234 567 890"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                                <Mail className="w-3 h-3" /> Email
                                            </label>
                                            <input
                                                value={user.email}
                                                disabled
                                                className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-gray-500 cursor-not-allowed"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                                <Clock className="w-3 h-3" /> Timezone
                                            </label>
                                            <select
                                                name="timezone"
                                                value={formData.timezone}
                                                onChange={handleChange}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none transition-colors"
                                            >
                                                <option value="UTC">UTC</option>
                                                <option value="America/New_York">New York</option>
                                                <option value="Europe/London">London</option>
                                                <option value="Asia/Tokyo">Tokyo</option>
                                                <option value="Asia/Kolkata">Kolkata</option>
                                            </select>
                                        </div>
                                         
                                         <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                                <Globe className="w-3 h-3" /> Language
                                            </label>
                                            <select
                                                name="language"
                                                value={formData.language}
                                                onChange={handleChange}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none transition-colors"
                                            >
                                                <option value="en">English</option>
                                                <option value="es">Spanish</option>
                                                <option value="fr">French</option>
                                                <option value="hi">Hindi</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="bg-white text-black hover:bg-gray-200 px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2"
                                        >
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}

                        {activeTab === 'security' && (
                            <>
                                <h2 className="text-2xl font-bold mb-6">Security Settings</h2>
                                <p className="text-gray-400 mb-8 text-sm">Manage your password and security preferences.</p>

                                <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                            <Lock className="w-3 h-3" /> Current Password
                                        </label>
                                        <input
                                            type="password"
                                            name="old_password"
                                            required
                                            value={passwordData.old_password}
                                            onChange={handlePasswordChange}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none transition-colors"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    
                                    <div className="border-t border-white/5 my-6"></div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                            <KeyRound className="w-3 h-3" /> New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="new_password"
                                            required
                                            value={passwordData.new_password}
                                            onChange={handlePasswordChange}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none transition-colors"
                                            placeholder="••••••••"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                            <KeyRound className="w-3 h-3" /> Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="confirm_password"
                                            required
                                            value={passwordData.confirm_password}
                                            onChange={handlePasswordChange}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none transition-colors"
                                            placeholder="••••••••"
                                        />
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2"
                                        >
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Update Password
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
