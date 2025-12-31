'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/utils';
import GreetingCard from '@/components/GreetingCard';
import CustomizationControls from '@/components/dashboard/CustomizationControls';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';

export default function BuildPosterPage() {
    const { token, user, loading: authLoading } = useAuth();
    const router = useRouter();
    
    // Core State
    const [wishText, setWishText] = useState('Happy Birthday! May your day be filled with joy.');
    
    // Customization State
    const [activeTemplate, setActiveTemplate] = useState('modern');
    const [customFont, setCustomFont] = useState('modern');
    const [customColor, setCustomColor] = useState(null);
    const [customImageTexture, setCustomImageTexture] = useState(null);
    const [isGeneratingBg, setIsGeneratingBg] = useState(false);
    
    // Email Sending State
    const [recipientEmail, setRecipientEmail] = useState('');
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (!authLoading && !token) {
            router.push('/login');
        }
    }, [authLoading, token, router]);

    const handleGenerateMagicBg = async () => {
        if (!wishText) return;
        setIsGeneratingBg(true);
        try {
            const res = await fetch(getApiUrl('/api/generate-image-prompt'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ wish: wishText })
            });

            const data = await res.json();
            if (res.ok) {
                setCustomImageTexture(data.url);
                if (!activeTemplate) setActiveTemplate('modern');
            } else {
                alert("Failed to generate background");
            }
        } catch (err) {
            console.error("AI BG Failed:", err);
            alert("Network error generated background");
        } finally {
             setIsGeneratingBg(false);
        }
    };

    const handleSendEmail = async (e) => {
        e.preventDefault();
        setIsSending(true);
        // Note: In a real app, we would capture the screenshot here or send the config to backend.
        // For now, we'll demonstrate the "Send Poster" intent.
        
        // Simulating backend call
        await new Promise(r => setTimeout(r, 2000));
        
        alert(`Poster Sent to ${recipientEmail}! (Simulation)`);
        setIsSending(false);
        setRecipientEmail('');
    };

    if (authLoading || !token) return null;

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col">
            {/* Header */}
            <header className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
                 <button onClick={() => router.back()} className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Dashboard</span>
                 </button>
                 <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Poster Studio</h1>
                 <div className="w-20"></div> {/* Spacer */}
            </header>

            <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden">
                
                {/* Left: Preview Canvas */}
                <div className="flex-1 bg-black/50 relative flex flex-col">
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                     
                     {/* Edit Text Overlay */}
                     <div className="p-4 z-10 w-full max-w-2xl mx-auto mt-4">
                        <input 
                            type="text" 
                            value={wishText}
                            onChange={(e) => setWishText(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-center text-lg focus:ring-2 focus:ring-purple-500 outline-none placeholder-gray-600 transition-all hover:bg-black/60"
                            placeholder="Type your wish here..."
                        />
                     </div>

                     <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
                          <div className="w-full max-w-2xl aspect-[1.6] shadow-2xl shadow-purple-900/20 rounded-3xl">
                                <GreetingCard 
                                    text={wishText}
                                    theme={activeTemplate || 'modern'}
                                    customFont={customFont}
                                    customColor={customColor}
                                    activeTemplate={activeTemplate}
                                    customImageTexture={customImageTexture}
                                />
                          </div>
                     </div>
                </div>

                {/* Right: Controls Sidebar */}
                <div className="w-full lg:w-96 bg-slate-900 border-l border-white/10 flex flex-col h-full overflow-y-auto">
                    <div className="p-6 space-y-8 flex-1">
                        
                        {/* 1. Design Controls */}
                        <CustomizationControls
                            activeTemplate={activeTemplate}
                            setActiveTemplate={setActiveTemplate}
                            customFont={customFont}
                            setCustomFont={setCustomFont}
                            customColor={customColor}
                            setCustomColor={setCustomColor}
                            onGenerateMagicBg={handleGenerateMagicBg}
                            isGeneratingBg={isGeneratingBg}
                        />

                        {/* 2. Send Actions */}
                        <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5 space-y-4">
                            <h3 className="font-semibold flex items-center space-x-2">
                                <Send className="w-4 h-4 text-green-400" />
                                <span>Send to Friend</span>
                            </h3>
                            <form onSubmit={handleSendEmail} className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-400 uppercase font-medium">Recipient Email</label>
                                    <input 
                                        type="email" 
                                        required
                                        value={recipientEmail}
                                        onChange={(e) => setRecipientEmail(e.target.value)}
                                        className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-green-500 outline-none"
                                        placeholder="friend@example.com"
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={isSending}
                                    className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send Poster</span>}
                                </button>
                            </form>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
