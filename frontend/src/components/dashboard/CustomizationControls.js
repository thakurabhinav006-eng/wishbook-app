'use client';
import React from 'react';
import { Check, Wand2 } from 'lucide-react';

const CustomizationControls = ({ 
    activeTemplate, 
    setActiveTemplate, 
    customFont, 
    setCustomFont, 
    customColor, 
    setCustomColor,
    onGenerateMagicBg, // New prop for AI generation
    isGeneratingBg
}) => {
    return (
        <div className="w-full lg:w-80 bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-white/10 space-y-8 shrink-0">
            <h4 className="text-white font-semibold text-lg border-b border-white/10 pb-4">Customize Card</h4>
            
            {/* 0. AI Background Generator */}
            {onGenerateMagicBg && (
                 <div className="space-y-3">
                    <label className="text-xs font-medium text-purple-400 uppercase tracking-wider">AI Magic</label>
                    <button
                        onClick={onGenerateMagicBg}
                        disabled={isGeneratingBg}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-105 active:scale-95 transition-all text-white font-bold flex items-center justify-center space-x-2 shadow-lg shadow-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGeneratingBg ? (
                            <span className="animate-pulse">Dreaming...</span>
                        ) : (
                            <>
                                <Wand2 className="w-5 h-5" />
                                <span>Generate AI Background</span>
                            </>
                        )}
                    </button>
                    <p className="text-xs text-gray-500">Creates a unique background based on your wish.</p>
                </div>
            )}

            {/* 1. Template Selector */}
            <div className="space-y-3">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Template</label>
                <div className="grid grid-cols-5 gap-2">
                    {[
                        { id: 'modern', color: 'bg-slate-200', label: 'Clean' },
                        { id: 'birthday', color: 'bg-pink-500', label: 'Party' },
                        { id: 'love', color: 'bg-rose-500', label: 'Love' },
                        { id: 'nature', color: 'bg-emerald-600', label: 'Nature' },
                        { id: 'neon', color: 'bg-purple-600', label: 'Cyber' },
                        { id: 'ocean', color: 'bg-cyan-500', label: 'Ocean' }
                    ].map(theme => (
                        <button
                            key={theme.id}
                            onClick={() => setActiveTemplate(theme.id)}
                            className={`w-10 h-10 rounded-full ${theme.color} transition-all shadow-lg flex items-center justify-center ${activeTemplate === theme.id ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100 hover:scale-105'}`}
                            title={theme.label}
                        >
                            {activeTemplate === theme.id && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Font Selector */}
            <div className="space-y-3">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Typography</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['modern', 'serif', 'handwriting'].map(font => (
                            <button
                                key={font}
                                onClick={() => setCustomFont(font)}
                                className={`px-3 py-2 rounded-lg text-sm border transition-all ${customFont === font ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30'}`}
                            >
                                {font.charAt(0).toUpperCase() + font.slice(1)}
                            </button>
                        ))}
                    </div>
            </div>

            {/* 3. Color Picker */}
            <div className="space-y-3">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Text Color</label>
                <div className="grid grid-cols-6 gap-3">
                    {[
                        '#ffffff', '#000000', // Basic
                        '#fca5a5', '#dc2626', // Red/Pink
                        '#fcd34d', '#ea580c', // Yellow/Orange
                        '#86efac', '#15803d', // Green
                        '#93c5fd', '#1e40af', // Blue
                        '#d8b4fe', '#6b21a8'  // Purple
                    ].map(color => (
                        <button
                            key={color}
                            onClick={() => setCustomColor(color)}
                            className={`w-8 h-8 rounded-full border border-white/10 transition-transform ${customColor === color ? 'scale-110 ring-2 ring-white' : 'hover:scale-105'}`}
                            style={{ backgroundColor: color }}
                            aria-label={`Select color ${color}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CustomizationControls;
