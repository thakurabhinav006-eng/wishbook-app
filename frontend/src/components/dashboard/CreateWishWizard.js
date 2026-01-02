'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, User, Calendar, MessageSquare, Mail, Phone, ArrowRight, ArrowLeft, Send, CheckCircle, Smartphone, Users, Paperclip, X, Image as ImageIcon, Eye } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/lib/utils';
import SmartCalendar from '../SmartCalendar';
import GreetingCard from '../GreetingCard';

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
                { id: 'whatsapp', icon: MessageSquare, label: 'WhatsApp' },
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
                                if (type !== 'Custom Event') handleChange('event_name', type);
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
                            const offset = date.getTimezoneOffset() * 60000;
                            const localDate = new Date(date.getTime() - offset);
                            const isoString = localDate.toISOString().slice(0, 16);
                            handleChange('scheduled_time', isoString);
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
                    <option value="custom">Custom Recurrence</option>
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
const StepMessage = ({ formData, handleChange, handleFileUpload, uploading }) => (
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
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Personal Message / Context</label>
                <textarea
                    value={formData.extra_details}
                    onChange={(e) => handleChange('extra_details', e.target.value)}
                    placeholder="Mention specific memories, nicknames, or inside jokes..."
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors h-24 resize-none"
                />
            </div>

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
const StepPreview = ({ formData }) => {
    // Generate a temporary preview text based on inputs (or just show inputs)
    // In a real app, we might call a lightweight "preview" API or just show what we have.
    const previewText = `[AI will generate ${formData.tone.toLowerCase()} ${formData.event_type} wish for ${formData.recipient_name}]\nContext: ${formData.extra_details || "None"}`;

    return (
        <div className="space-y-6 text-center">
             <h3 className="text-2xl font-bold text-white mb-2">Ready to Schedule?</h3>
             <p className="text-gray-400 text-sm">Review your wish details below.</p>

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
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Message Preview (simulated)</p>
                      <div className="p-4 bg-black/20 rounded-xl border border-white/5 text-gray-300 italic text-sm">
                          "{formData.extra_details ? `...${formData.extra_details}...` : "Magical wish loading..."}"
                      </div>
                 </div>

                 {formData.media_url && (
                     <div className="pt-2">
                          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Attachment</p>
                          <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/40">
                              <img src={getApiUrl(formData.media_url)} alt="Attachment" className="w-full h-full object-contain" />
                          </div>
                     </div>
                 )}
             </div>
        </div>
    );
}

export default function CreateWishWizard({ onGenerate, loading, initialData = {} }) {
    const [step, setStep] = useState(0);
    const [contacts, setContacts] = useState([]);
    const [uploading, setUploading] = useState(false);
    const { token } = useAuth();
    
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
        event_name: 'Birthday',
        event_type: 'Birthday',
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
            } else {
                console.error("Upload failed");
            }
        } catch (error) {
            console.error("Error uploading:", error);
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

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const [generating, setGenerating] = useState(false);

    const handleGeneratePreview = async () => {
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
                handleNext();
            } else {
                console.error("Failed to generate preview");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setGenerating(false);
        }
    };

    const handleSubmit = async () => {
        onGenerate(formData);
    };

    const steps = ['Select', 'Event', 'Message', 'Preview'];

    return (
        <div className="w-full max-w-2xl mx-auto">
             <div className="glass-card rounded-3xl p-8 md:p-10 border border-white/10 relative overflow-hidden backdrop-blur-xl bg-[#0a0a0f]/60 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
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
                        {step === 2 && <StepMessage formData={formData} handleChange={handleChange} handleFileUpload={handleFileUpload} uploading={uploading} />}
            {step === 3 && (
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
                                            <button 
                                                onClick={() => setStep(2)} // Go back to regenerate parameters
                                                className="text-xs text-purple-400 hover:text-purple-300"
                                            >
                                                Regenerate
                                            </button>
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
                                </div>
                            </div>
                        )}
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
                        ) : (
                            <button 
                                onClick={handleNext}
                                className="flex items-center space-x-2 bg-white text-black px-6 py-3 rounded-xl font-bold hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all"
                            >
                                <span>Next Step</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        )
                    ) : (
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
                                    <span>Confirm Schedule</span>
                                    <Sparkles className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    )}
                 </div>
             </div>
        </div>
    );
}
```
