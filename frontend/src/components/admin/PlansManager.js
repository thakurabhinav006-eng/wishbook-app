import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Check, X, Loader2, Save } from 'lucide-react';
import { getApiUrl } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function PlansManager({ token, onViewUsers }) { // Accept token via props if passed from parent, else context fallback might be needed but main page passes it. 
    // Actually the parent passes `token` prop in admin/page.js, but this component uses useAuth() internally too. 
    // Let's defer to props if available or keep useAuth. The admin page passes `token` prop.
    // simpler: define props clearly.
    // const { token } = useAuth(); // If we rely on prop, using context as well is fine but prop is cleaner for 'token' here based on usage in admin/page.js
    // Re-aligning with admin/page.js usage: <PlansManager token={token} ... />

    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'Free', // Free or Paid
        price: 0,
        contact_limit: 0,
        message_limit: 0,
        whatsapp_enabled: false,
        email_enabled: false,
        ai_enabled: false,
        bulk_import_enabled: false,
        is_active: 1
    });

    useEffect(() => {
        if(token) fetchPlans();
    }, [token]);

    const fetchPlans = async () => {
        try {
            const res = await fetch(getApiUrl('/api/admin/plans'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPlans(data);
            }
        } catch (error) {
            console.error("Failed to fetch plans", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (plan = null) => {
        if (plan) {
            setEditingPlan(plan);
            const features = plan.features ? JSON.parse(plan.features) : {};
            setFormData({
                name: plan.name,
                type: features.type || 'Free',
                price: plan.price || 0,
                contact_limit: plan.contact_limit,
                message_limit: plan.message_limit,
                whatsapp_enabled: features.whatsapp_enabled || false,
                email_enabled: features.email_enabled || false,
                ai_enabled: features.ai_enabled || false,
                bulk_import_enabled: features.bulk_import_enabled || false,
                is_active: plan.is_active !== undefined ? plan.is_active : 1
            });
        } else {
            setEditingPlan(null);
            setFormData({
                name: '',
                type: 'Free',
                price: 0,
                contact_limit: 10,
                message_limit: 50,
                whatsapp_enabled: false,
                email_enabled: true,
                ai_enabled: false,
                bulk_import_enabled: false,
                is_active: 1
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingPlan 
                ? getApiUrl(`/api/admin/plans/${editingPlan.id}`)
                : getApiUrl('/api/admin/plans');
            
            const method = editingPlan ? 'PUT' : 'POST';
            
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchPlans();
            } else {
                alert("Failed to save plan");
            }
        } catch (error) {
            console.error("Error saving plan", error);
        }
    };

    const Toggle = ({ label, checked, onChange }) => (
        <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-300">{label}</span>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    checked ? 'bg-purple-600' : 'bg-gray-700'
                }`}
            >
                <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        checked ? 'translate-x-5' : ''
                    }`}
                />
            </button>
        </div>
    );

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-purple-500" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Subscription Plans</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-colors font-medium text-sm"
                >
                    <Plus className="w-4 h-4" /> Add Plan
                </button>
            </div>

            <div className="overflow-x-auto bg-[#121218] rounded-2xl border border-white/10">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-white/5 text-gray-200 uppercase font-bold text-xs">
                        <tr>
                            <th className="px-6 py-4">Plan Name</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-center">Active Users</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4 text-center">Contacts</th>
                            <th className="px-6 py-4 text-center">Messages</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {plans.map((plan) => {
                             const features = plan.features ? JSON.parse(plan.features) : {};
                             return (
                                <tr key={plan.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">{plan.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${plan.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {plan.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => onViewUsers && onViewUsers(plan.name)}
                                            className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-md font-bold text-xs transition-colors cursor-pointer"
                                            title="View Users"
                                        >
                                            {plan.user_count || 0}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        {features.type === 'Free' ? 'Free' : `$${plan.price}`}
                                    </td>
                                    <td className="px-6 py-4 text-center">{plan.contact_limit}</td>
                                    <td className="px-6 py-4 text-center">{plan.message_limit}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleOpenModal(plan)}
                                            className="p-2 hover:bg-white/10 rounded-lg text-blue-400 transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                             );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center pt-24 p-4">
                    <div className="bg-[#181820] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[75vh] overflow-y-auto shadow-2xl">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#181820] z-10">
                            <h3 className="text-xl font-bold text-white">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-2">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <h4 className="text-purple-400 font-bold text-xs uppercase tracking-wider">Basic Info</h4>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Plan Name</label>
                                        <input 
                                            type="text" 
                                            value={formData.name}
                                            onChange={e => setFormData({...formData, name: e.target.value})}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none"
                                            required 
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                         <div>
                                            <label className="block text-sm text-gray-400 mb-1">Type</label>
                                            <select 
                                                value={formData.type}
                                                onChange={e => setFormData({...formData, type: e.target.value})}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white outline-none"
                                            >
                                                <option value="Free">Free</option>
                                                <option value="Paid">Paid</option>
                                            </select>
                                        </div>
                                         <div>
                                            <label className="block text-sm text-gray-400 mb-1">Price</label>
                                            <input 
                                                type="number" 
                                                value={formData.price}
                                                onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                     <div>
                                        <label className="block text-sm text-gray-400 mb-1">Status</label>
                                        <select 
                                            value={formData.is_active}
                                            onChange={e => setFormData({...formData, is_active: parseInt(e.target.value)})}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white outline-none"
                                        >
                                            <option value={1}>Active</option>
                                            <option value={0}>Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Limits */}
                                <div className="space-y-4">
                                    <h4 className="text-purple-400 font-bold text-xs uppercase tracking-wider">Limits</h4>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Contact Limit</label>
                                        <input 
                                            type="number" 
                                            value={formData.contact_limit}
                                            onChange={e => setFormData({...formData, contact_limit: parseInt(e.target.value) || 0})}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Message Limit (Monthly)</label>
                                        <input 
                                            type="number" 
                                            value={formData.message_limit}
                                            onChange={e => setFormData({...formData, message_limit: parseInt(e.target.value) || 0})}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="border-t border-white/10 pt-6">
                                <h4 className="text-purple-400 font-bold text-xs uppercase tracking-wider mb-4">Features & Toggles</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                                    <Toggle 
                                        label="WhatsApp Enabled" 
                                        checked={formData.whatsapp_enabled} 
                                        onChange={v => setFormData({...formData, whatsapp_enabled: v})}
                                    />
                                    <Toggle 
                                        label="Email Enabled" 
                                        checked={formData.email_enabled} 
                                        onChange={v => setFormData({...formData, email_enabled: v})}
                                    />
                                    <Toggle 
                                        label="AI Message Generator" 
                                        checked={formData.ai_enabled} 
                                        onChange={v => setFormData({...formData, ai_enabled: v})}
                                    />
                                    <Toggle 
                                        label="Bulk Import Enabled" 
                                        checked={formData.bulk_import_enabled} 
                                        onChange={v => setFormData({...formData, bulk_import_enabled: v})}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/10 sticky bottom-0 bg-[#181820] pb-2">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" /> Save Plan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
