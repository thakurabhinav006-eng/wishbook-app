'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Sparkles, User, Calendar, MessageSquare, Mail, Phone, ArrowRight, ArrowLeft, Send, CheckCircle, Smartphone, Users, Paperclip, X, Image as ImageIcon, Eye, Wand2, Zap, Palette } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/lib/utils';
import SmartCalendar from '../SmartCalendar';
import GreetingCard from '../GreetingCard';
import Toast from '../Toast';

const StepIndicator = ({ currentStep, steps }) => (
    <div className="flex justify-center items-center space-x-2 mb-8">
        {steps.map((step, idx) => (
            <div key={idx} className="flex items-center">
                <div 
                    className={`w-3 h-3 rounded-full transition-all duration-500 ${
                        idx <= currentStep ? 'bg-purple-500 scale-125 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-white/10'
                    }`}
                />
                {idx < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-1 transition-colors duration-500 ${idx < currentStep ? 'bg-purple-500/50' : 'bg-white/5'}`} />
                )}
            </div>
        ))}
    </div>
);

// Step 0: Who is this for? (Multi-select)
const StepWho = ({ contacts, formData, handleChange, toggleContact }) => (
    <div className="space-y-6">
        <h3 className="text-2xl font-bold text-center text-white mb-6">Select Contact(s)</h3>
        
        {/* Contact Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {contacts.map(contact => {
                const isSelected = formData.selectedContacts.some(c => c.id === contact.id);
                return (
                    <button
                        key={contact.id}
                        onClick={() => toggleContact(contact)}
                        className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                            isSelected
                                ? 'bg-purple-500/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                                : 'bg-white/5 border-white/10 hover:border-white/30'
                        }`}
                    >
                        <div>
                            <div className="font-bold text-white">{contact.name}</div>
                            <div className="text-xs text-gray-400">{contact.email}</div>
                        </div>
                        {isSelected && <CheckCircle className="w-5 h-5 text-purple-400" />}
                    </button>
                );
            })}
        </div>
        
        {/* Manual Entry Fallback */}
        <div className="pt-4 border-t border-white/10">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Or Manual Entry (One Time)</p>
            <div className="space-y-4">
                <input
                    type="text"
                    placeholder="Recipient Name"
                    value={formData.recipient_name}
                    onChange={(e) => handleChange('recipient_name', e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
                <input
                    type="email"
                    placeholder="Recipient Email"
                    value={formData.recipient_email}
                    onChange={(e) => handleChange('recipient_email', e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
            </div>
        </div>

         {/* Platform Selection */}
         <div className="grid grid-cols-3 gap-2 mt-4">
            {[
                { id: 'email', icon: Mail, label: 'Email' },
                // { id: 'whatsapp', icon: MessageSquare, label: 'WhatsApp' },
                // { id: 'telegram', icon: Send, label: 'Telegram' }
            ].map(p => (
                <button
                    key={p.id}
                    onClick={() => handleChange('platform', p.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                        formData.platform === p.id 
                            ? 'bg-purple-500/20 border-purple-500 text-white' 
                            : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                >
                    <p.icon className="w-5 h-5 mb-1" />
                    <span className="text-xs">{p.label}</span>
                </button>
            ))}
        </div>
    </div>
);

// Step 1: Event Details
const StepEvent = ({ formData, handleChange }) => (
    <div className="space-y-6">
        <h3 className="text-2xl font-bold text-center text-white mb-6">Event Details</h3>
        
        <div className="space-y-5">
             <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Event Type *</label>
                <div className="grid grid-cols-2 gap-3">
                    {['Birthday', 'Anniversary', 'Festival', 'Custom Event'].map(type => (
                        <button
                            key={type}
                            onClick={() => {
                                handleChange('event_type', type);
                                // Auto-fill name logic
                                if (type !== 'Custom Event') {
                                    handleChange('event_name', type);
                                } else {
                                    handleChange('event_name', ''); // Reset for custom entry
                                }
                                handleChange('occasion', type); // Sync occasion
                            }}
                            className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                                formData.event_type === type 
                                    ? 'bg-purple-500 text-white border-purple-500' 
                                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Event Name *</label>
                <input
                    type="text"
                    value={formData.event_name}
                    onChange={(e) => handleChange('event_name', e.target.value)}
                    placeholder="e.g. John's Birthday"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Event Date *</label>
                     <SmartCalendar
                        value={formData.scheduled_time}
                        onChange={(date) => {
                            // Send "Face Value" time (Local Time as ISO) to ensure visual consistency
                            // e.g. User picks 2:30 PM -> Send 14:30 (ignore UTC conversion)
                            const offset = date.getTimezoneOffset() * 60000;
                            const localDate = new Date(date.getTime() - offset);
                            // Strip 'Z' immediately to create a "Local ISO" string
                            handleChange('scheduled_time', localDate.toISOString().replace('Z', ''));
                        }}
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Time (Optional)</label>
                    <input 
                        type="time" 
                        value={formData.scheduled_time ? formData.scheduled_time.split('T')[1]?.slice(0,5) : ''}
                        onChange={(e) => {
                             if(formData.scheduled_time) {
                                 const [date] = formData.scheduled_time.split('T');
                                 handleChange('scheduled_time', `${date}T${e.target.value}`);
                             }
                        }}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                </div>
            </div>
            
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Repeats</label>
                <select
                    value={formData.recurrence}
                    onChange={(e) => handleChange('recurrence', e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none"
                >
                    <option value="none">Once</option>
                    <option value="yearly">Yearly</option>
                    {/* <option value="custom">Custom Recurrence</option> */}
                </select>
            </div>
             
             <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Reminder Before Event</label>
                <select
                    value={formData.reminder_days_before}
                    onChange={(e) => handleChange('reminder_days_before', parseInt(e.target.value))}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none"
                >
                    <option value={0}>Same day</option>
                    <option value={1}>1 day before</option>
                    <option value={2}>2 days before</option>
                </select>
            </div>
        </div>
    </div>
);

// Step 2: Message & Tone & Template & Media
// Step 2: Message & Tone & Template & Media
const StepMessage = ({ formData, handleChange, handleFileUpload, uploading, handleGeneratePreview, generating }) => (
    <div className="space-y-6">
        <h3 className="text-2xl font-bold text-center text-white mb-6">Message & Content</h3>
        
        <div className="space-y-4">
             {/* Template Selector */}
             <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Greeting Template</label>
                <div className="grid grid-cols-3 gap-2">
                    {['Modern', 'Classic', 'Fun', 'Elegant'].map(temp => (
                         <button
                            key={temp}
                            onClick={() => handleChange('template_id', temp.toLowerCase())}
                            className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                                formData.template_id === temp.toLowerCase()
                                    ? 'bg-purple-500 text-white border-purple-500' 
                                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                            }`}
                        >
                            {temp}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Tone</label>
                <div className="flex flex-wrap gap-2">
                    {['Funny', 'Heartfelt', 'Professional', 'Poetic'].map(tone => (
                        <button
                            key={tone}
                            onClick={() => handleChange('tone', tone)}
                            className={`flex-1 py-3 px-4 rounded-xl text-sm border transition-all ${
                                formData.tone === tone 
                                    ? 'bg-purple-500 text-white border-purple-500' 
                                    : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                            }`}
                        >
                            {tone}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Personal Message / Context</label>
                    <button 
                        onClick={() => handleGeneratePreview(true)} // Silent generation
                        disabled={generating}
                        className="flex items-center space-x-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20"
                    >
                        {generating ? <Sparkles className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                        <span>{generating ? 'Generating...' : 'Magic Generate'}</span>
                    </button>
                </div>
                <textarea
                    value={formData.extra_details}
                    onChange={(e) => handleChange('extra_details', e.target.value)}
                    placeholder="Mention specific memories, nicknames, or inside jokes..."
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors h-24 resize-none"
                />
            </div>

            {formData.generated_wish && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                >
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Generated Magic Wish</label>
                    <textarea
                        value={formData.generated_wish}
                        onChange={(e) => handleChange('generated_wish', e.target.value)}
                        className="w-full bg-purple-500/5 border border-purple-500/20 rounded-xl px-4 py-3 text-gray-200 text-sm h-32 resize-none focus:outline-none focus:border-purple-500/50"
                        placeholder="Your wish will appear here..."
                    />
                    <p className="text-[10px] text-gray-500 italic">Tip: You can edit this text directly before proceeding.</p>
                </motion.div>
            )}

             {/* Media Attachment */}
             <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Media Attachment (Optional)</label>
                <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer transition-colors">
                        <Paperclip className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">{uploading ? 'Uploading...' : 'Choose File'}</span>
                        <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,video/mp4" disabled={uploading} />
                    </label>
                    {formData.media_url && (
                        <div className="relative group">
                             <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/20">
                                 <img src={getApiUrl(formData.media_url)} alt="Attached" className="w-full h-full object-cover" />
                             </div>
                             <button 
                                onClick={() => handleChange('media_url', null)}
                                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                                 <X className="w-3 h-3 text-white" />
                             </button>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl border border-white/5">
                <input 
                    type="checkbox" 
                    checked={formData.auto_send === 1}
                    onChange={(e) => handleChange('auto_send', e.target.checked ? 1 : 0)}
                    className="w-5 h-5 rounded border-gray-600 text-purple-600 bg-black/20 focus:ring-purple-500"
                />
                 <div className="flex-1">
                     <span className="text-sm font-bold text-gray-200">Auto-Send Message</span>
                     <p className="text-xs text-gray-500">If unchecked, you'll need to manually approve the message before it sends.</p>
                 </div>
            </div>
        </div>
    </div>
);

// Step 3: Preview
const StepPreview = ({ formData, handleChange, onDesign }) => (
    <div className="space-y-6 text-center">
        <h3 className="text-2xl font-bold text-white mb-2">Ready to Schedule?</h3>
        <p className="text-gray-400 text-sm">Review and edit your wish before scheduling.</p>

        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-left space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-gray-400 text-sm">To:</span>
                <span className="text-white font-medium">{formData.recipient_name || "Recipient"}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-gray-400 text-sm">Event:</span>
                <span className="text-white font-medium">{formData.event_name} ({formData.scheduled_time?.split('T')[0]})</span>
            </div>
            
            <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Message Preview</p>
                </div>
                <textarea 
                    value={formData.generated_wish || ""}
                    onChange={(e) => handleChange('generated_wish', e.target.value)}
                    className="w-full p-4 bg-black/20 rounded-xl border border-white/5 text-gray-300 text-sm min-h-[120px] focus:outline-none focus:border-purple-500 transition-colors resize-none"
                    placeholder="Your magical wish will appear here..."
                />
            </div>

            {formData.media_url && (
                <div className="pt-2">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Attachment</p>
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/40">
                        <img src={getApiUrl(formData.media_url)} alt="Attachment" className="w-full h-full object-contain" />
                    </div>
                </div>
            )}

            <button
                onClick={onDesign}
                className="w-full flex items-center justify-center space-x-2 py-3 mt-4 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 rounded-xl border border-purple-500/20 transition-all font-medium text-sm group"
            >
                <Palette className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Customize Background in Design Studio</span>
            </button>
        </div>
    </div>
);

export default function CreateWishWizard({ onGenerate, loading, initialData = {} }) {
    const [step, setStep] = useState(0);
    const [contacts, setContacts] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState(null);
    const { token } = useAuth();
    const router = useRouter();
    
    const showToast = (message, type = 'info') => setToast({ message, type });
    
    const [formData, setFormData] = useState({
        occasion: 'Birthday',
        recipient_name: '',
        recipient_email: '',
        selectedContacts: [], // Array of contact objects
        platform: 'email',
        tone: 'Heartfelt',
        length: 'Short',
        extra_details: '',
        scheduled_time: '',
        recurrence: 'none',
        
        // Event Fields
        event_name: '',
        event_type: '',
        reminder_days_before: 0,
        auto_send: 1,
        
        // New Fields
        template_id: 'modern',
        media_url: null,
        
        ...initialData
    });

    useEffect(() => {
        if (token) {
            fetch(getApiUrl('/api/contacts'), {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => setContacts(data || []))
            .catch(err => console.error(err));
        }
    }, [token]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const data = new FormData();
        data.append('file', file);

        try {
            const res = await fetch(getApiUrl('/api/upload-media'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: data
            });

            if (res.ok) {
                const result = await res.json();
                handleChange('media_url', result.url);
                showToast("File uploaded successfully!", "success");
            } else {
                const errorData = await res.json();
                showToast(errorData.detail || "Upload failed", "error");
            }
        } catch (error) {
            console.error("Error uploading:", error);
            showToast("Network error during upload", "error");
        } finally {
            setUploading(false);
        }
    };

    const toggleContact = (contact) => {
        setFormData(prev => {
            const exists = prev.selectedContacts.find(c => c.id === contact.id);
            let newSelected;
            if (exists) {
                newSelected = prev.selectedContacts.filter(c => c.id !== contact.id);
            } else {
                newSelected = [...prev.selectedContacts, contact];
            }
            
            // Auto update single recipient name if 1 is selected
            if (newSelected.length === 1) {
                return { ...prev, selectedContacts: newSelected, recipient_name: newSelected[0].name, recipient_email: newSelected[0].email };
            } else if (newSelected.length > 1) {
                return { ...prev, selectedContacts: newSelected, recipient_name: 'Multiple Recipients', recipient_email: '' };
            }
            
            return { ...prev, selectedContacts: newSelected, recipient_name: '', recipient_email: '' };
        });
    };

    const validateStep = (currentStep, options = {}) => {
        const { skipWishCheck = false } = options;
        
        if (currentStep === 0) {
            if (formData.selectedContacts.length === 0) {
                if (!formData.recipient_name.trim()) {
                    showToast("Please select a contact or enter a recipient name", "error");
                    return false;
                }
                
                // Name validation: No pure numbers/symbols, at least 2 chars
                const nameRegex = /^[a-zA-Z\s]{2,50}$/;
                if (!nameRegex.test(formData.recipient_name.trim())) {
                    showToast("Please enter a valid recipient name (letters only, min 2 chars)", "error");
                    return false;
                }

                if (formData.platform === 'email') {
                    if (!formData.recipient_email) {
                        showToast("Please enter a recipient email", "error");
                        return false;
                    }
                    const emailRegex = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
                    if (!emailRegex.test(formData.recipient_email)) {
                        showToast("Please enter a valid email address", "error");
                        return false;
                    }
                }
            }
        } else if (currentStep === 1) {
            if (!formData.event_type) {
                showToast("Please select an event type", "error");
                return false;
            }
            if (!formData.event_name.trim()) {
                showToast("Please enter an event name", "error");
                return false;
            }
            // Validation: Must contain at least one alphanumeric char (Bug #1828)
            if (!/[a-zA-Z0-9]/.test(formData.event_name)) {
                showToast("Event name must contain at least one letter or number", "error");
                return false;
            }
            if (!formData.scheduled_time) {
                showToast("Please select an event date", "error");
                return false;
            }
        } else if (currentStep === 2) {
            if (!skipWishCheck && !formData.generated_wish) {
                showToast("Please generate your wish first", "error");
                return false;
            }
        }
        return true;
    };

    const isNextDisabled = () => {
        if (step === 0) {
            return !formData.selectedContacts.length && !formData.recipient_name.trim();
        }
        if (step === 1) {
            // Check for empty fields AND invalid alphanumeric content (Bug #1828 & #1829)
            const hasValidContent = /[a-zA-Z0-9]/.test(formData.event_name);
            return !formData.event_type || !formData.event_name.trim() || !hasValidContent || !formData.scheduled_time;
        }
        return false;
    };

    const handleNext = (overrideData = null) => {
        // Use overrideData to bypass async state lag if needed
        const currentFormData = overrideData ? { ...formData, ...overrideData } : formData;
        
        // Custom validation check using current data
        if (step === 0) {
            if (currentFormData.selectedContacts.length === 0) {
                if (!currentFormData.recipient_name.trim()) {
                    showToast("Please select a contact or enter a recipient name", "error");
                    return;
                }
                const nameRegex = /^[a-zA-Z\s]{2,50}$/;
                if (!nameRegex.test(currentFormData.recipient_name.trim())) {
                    showToast("Please enter a valid recipient name (letters only, min 2 chars)", "error");
                    return;
                }
            }
        } else if (step === 1) {
            if (!currentFormData.event_type || !currentFormData.event_name.trim() || !currentFormData.scheduled_time) {
                showToast("Please complete all event details", "error");
                return;
            }
            if (!/[a-zA-Z0-9]/.test(currentFormData.event_name)) {
                showToast("Event name must contain at least one letter or number", "error");
                return;
            }
        } else if (step === 2) {
            if (!currentFormData.generated_wish) {
                showToast("Please generate your wish first", "error");
                return;
            }
        }

        setStep(prev => prev + 1);
    };
    const handleBack = () => setStep(prev => prev - 1);

    const [generating, setGenerating] = useState(false);

    const handleGeneratePreview = async (silent = false) => {
        if (!validateStep(step, { skipWishCheck: true })) return;
        setGenerating(true);
        try {
            const res = await fetch(getApiUrl('/api/generate'), {
                method: 'POST',
                headers: {
                     'Content-Type': 'application/json',
                     'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    occasion: formData.occasion,
                    recipient_name: formData.recipient_name,
                    tone: formData.tone,
                    extra_details: formData.extra_details,
                    length: formData.length
                })
            });
            
            if (res.ok) {
                const data = await res.json();
                handleChange('generated_wish', data.wish);
                if (!silent) {
                    handleNext({ generated_wish: data.wish });
                } else {
                    showToast("Wish generated magically!", "success");
                }
            } else {
                showToast("Failed to generate wish", "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Network error during generation", "error");
        } finally {
            setGenerating(false);
        }
    };

    const handleSubmit = async () => {
        // Final sanity check before submission
        if (!validateStep(0) || !validateStep(1) || !validateStep(2)) {
            return;
        }
        onGenerate(formData);
    };

    const handleScheduleNow = () => {
        // Enforce validation before instant scheduling (Bug #1830)
        if (!validateStep(0) || !validateStep(1)) {
            return;
        }
        if (!formData.generated_wish) {
            showToast("Please generate your wish first", "error");
            return;
        }

        const now = new Date();
        now.setMinutes(now.getMinutes() + 1); // Set for 1 min in future to ensure it picks up
        // Strip 'Z' to be compatible with Python's datetime.fromisoformat (pre-3.11)
        const isoString = now.toISOString().replace('Z', '');
        const instantData = { ...formData, scheduled_time: isoString };
        onGenerate(instantData);
    };

    const handleDesign = () => {
        const params = new URLSearchParams();
        if (formData.generated_wish) params.set('wish', formData.generated_wish);
        if (formData.recipient_name) params.set('recipient', formData.recipient_name);
        router.push(`/poster/build?${params.toString()}`);
    };

    const steps = ['Select', 'Event', 'Message', 'Preview'];

    return (
        <div className="w-full max-w-2xl mx-auto">
             <div className="glass-card rounded-3xl p-8 md:p-10 relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                 <StepIndicator currentStep={step} steps={steps} />

                 <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="min-h-[400px]"
                    >
                        {step === 0 && <StepWho contacts={contacts} formData={formData} handleChange={handleChange} toggleContact={toggleContact} />}
                        {step === 1 && <StepEvent formData={formData} handleChange={handleChange} />}
                        {step === 2 && <StepMessage formData={formData} handleChange={handleChange} handleFileUpload={handleFileUpload} uploading={uploading} handleGeneratePreview={handleGeneratePreview} generating={generating} />}
                        {step === 3 && <StepPreview formData={formData} handleChange={handleChange} onDesign={handleDesign} />}
                    </motion.div>
                 </AnimatePresence>

                 <div className="flex justify-between mt-8 pt-6 border-t border-white/5">
                    {step > 0 ? (
                        <button 
                            onClick={handleBack}
                            disabled={loading || generating}
                            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                        </button>
                    ) : (
                        <div />
                    )}

                    {step < steps.length - 1 ? (
                        step === 2 ? (
                            <div className="flex space-x-3">
                                <button 
                                    onClick={handleScheduleNow}
                                    disabled={generating || loading}
                                    className={`flex items-center space-x-2 bg-white/10 border border-white/20 text-white px-4 py-3 rounded-xl font-bold hover:bg-white/20 transition-all ${
                                        generating || loading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    <Zap className="w-5 h-5 text-amber-400" />
                                    <span>Schedule Now</span>
                                </button>
                                <button 
                                    onClick={handleGeneratePreview}
                                    disabled={generating}
                                    className={`flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all ${
                                        generating ? 'opacity-75 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {generating ? <Sparkles className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                                    <span>{generating ? 'Magic in progress...' : 'Generate Preview'}</span>
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={handleNext}
                                disabled={isNextDisabled()}
                                className={`flex items-center space-x-2 bg-white text-black px-6 py-3 rounded-xl font-bold transition-all ${
                                    isNextDisabled() 
                                    ? 'opacity-50 cursor-not-allowed' 
                                    : 'hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                                }`}
                            >
                                <span>Next Step</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        )
                    ) : (
                        <div className="flex space-x-3">
                             <button 
                                onClick={handleScheduleNow}
                                disabled={loading}
                                className={`flex items-center space-x-2 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-all ${
                                    loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                <Zap className="w-5 h-5 text-amber-400" />
                                <span>Schedule Now</span>
                            </button>
                            <button 
                                onClick={handleSubmit}
                                disabled={loading}
                                className={`flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-purple-900/40 transition-all ${
                                    loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-purple-500/30'
                                }`}
                            >
                                {loading ? (
                                    <Sparkles className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>Schedule Wish</span>
                                        <Sparkles className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                 </div>
             </div>

             {/* System Toasts */}
             <AnimatePresence>
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// Trigger Vercel Deploy: Force update for Wand2 fix
