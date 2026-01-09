'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Share2, Check, Sparkles, Wand2 } from 'lucide-react';

/**
 * Premium Greeting Card component (Pure React + CSS + Framer Motion)
 * Replaces Three.js implementation for better performance and AI Background integration.
 */

const themes = {
    modern: {
        bg: "bg-slate-900",
        gradient: "bg-gradient-to-br from-slate-900 to-slate-800",
        accent: "text-purple-400",
        glass: "bg-white/10 border-white/20 backdrop-blur-2xl",
        textColor: "text-white",
        iconColor: "text-purple-400"
    },
    birthday: {
        bg: "bg-indigo-600",
        gradient: "bg-[conic-gradient(at_center,_var(--tw-gradient-stops))] from-indigo-500 via-purple-500 to-pink-500",
        accent: "text-yellow-300",
        glass: "bg-white/20 border-white/30 backdrop-blur-xl",
        textColor: "text-white",
        iconColor: "text-yellow-400",
        sparkles: true
    },
    love: {
        bg: "bg-rose-950",
        gradient: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-900 via-pink-900 to-black",
        accent: "text-rose-400",
        glass: "bg-black/30 border-white/10 backdrop-blur-2xl",
        textColor: "text-pink-100",
        iconColor: "text-rose-500"
    },
    neon: {
        bg: "bg-black",
        gradient: "bg-black",
        accent: "text-pink-500",
        glass: "bg-black/60 border-pink-500/50 backdrop-blur-md shadow-[0_0_30px_rgba(236,72,153,0.2)]",
        textColor: "text-white",
        iconColor: "text-pink-500",
        grid: true
    },
    nature: {
        bg: "bg-emerald-950",
        gradient: "bg-gradient-to-br from-green-900 to-emerald-950",
        accent: "text-emerald-400",
        glass: "bg-black/20 border-white/5 backdrop-blur-xl",
        textColor: "text-emerald-50",
        iconColor: "text-emerald-400"
    },
    ocean: {
        bg: "bg-blue-950",
        gradient: "bg-gradient-to-br from-blue-900 to-sky-950",
        accent: "text-cyan-400",
        glass: "bg-white/5 border-white/10 backdrop-blur-2xl",
        textColor: "text-blue-50",
        iconColor: "text-cyan-400"
    },
};

const fontFamilies = {
    modern: 'font-sans',
    serif: 'font-serif',
    handwriting: 'font-handwriting'
};

const GreetingCard = ({
    text,
    theme = 'modern',
    customColor = null,
    customFont = 'modern',
    activeTemplate = null,
    customImageTexture = null
}) => {
    const [copied, setCopied] = useState(false);

    // Determine the active theme visual config
    let displayThemeKey = activeTemplate || theme;

    // Normalize logic to match legacy theme names if needed
    if (!activeTemplate) {
        if (theme === 'anniversary') displayThemeKey = 'love';
        if (theme === 'forest') displayThemeKey = 'nature';
        if (theme === 'sunset') displayThemeKey = 'love';
    }

    if (!themes[displayThemeKey]) displayThemeKey = 'modern';
    const activeTheme = themes[displayThemeKey];

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = (e) => {
        e.stopPropagation();
        if (navigator.share) {
            navigator.share({ title: 'A Magical Wish', text });
        }
    };

    return (
        <div className={`relative w-full aspect-[1.6/1] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-3xl transition-all duration-1000 ${activeTheme.bg} group`}>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
                .font-handwriting { font-family: 'Dancing Script', cursive; }
                .font-serif { font-family: 'Playfair Display', serif; }
            `}</style>

            {/* Background Layer: Gradient or AI Image */}
            <div className="absolute inset-0 z-0">
                <AnimatePresence mode="wait">
                    {customImageTexture ? (
                        <motion.div
                            key={customImageTexture}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.5 }}
                            className="absolute inset-0"
                        >
                            <img
                                src={customImageTexture}
                                alt="AI Background"
                                className="w-full h-full object-cover"
                            />
                            {/* Dark Overlay for Readability */}
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key={displayThemeKey}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            className={`absolute inset-0 ${activeTheme.gradient}`}
                        />
                    )}
                </AnimatePresence>

                {/* Cyber Grid for Neon Theme */}
                {activeTheme.grid && (
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(236,72,153,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(236,72,153,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
                )}
            </div>

            {/* Decorative Sparkles */}
            {activeTheme.sparkles && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <motion.div
                        animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.1, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute top-10 left-10 text-yellow-300/30"
                    >
                        <Sparkles size={40} />
                    </motion.div>
                    <motion.div
                        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
                        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                        className="absolute bottom-10 right-10 text-white/30"
                    >
                        <Sparkles size={60} />
                    </motion.div>
                </div>
            )}

            {/* Content Layer */}
            <div className="absolute inset-0 z-10 flex items-center justify-center p-8 md:p-12">
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`relative w-full h-full max-w-4xl p-10 flex flex-col items-center justify-center text-center rounded-[2rem] border transition-all duration-700 ${activeTheme.glass}`}
                >
                    {/* Corner Decoration */}
                    <div className={`absolute top-6 left-6 ${activeTheme.iconColor} opacity-40 group-hover:opacity-100 transition-opacity`}>
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div className={`absolute bottom-6 right-6 ${activeTheme.iconColor} opacity-40 group-hover:opacity-100 transition-opacity`}>
                        <Sparkles className="w-6 h-6" />
                    </div>

                    <div className="flex-1 flex items-center justify-center overflow-auto scrollbar-hide">
                        <motion.p
                            key={text + displayThemeKey + customFont}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`text-xl md:text-2xl lg:text-3xl font-bold leading-relaxed whitespace-pre-wrap ${fontFamilies[customFont] || 'font-sans'} ${activeTheme.textColor}`}
                            style={{ color: customColor || undefined }}
                        >
                            {text}
                        </motion.p>
                    </div>

                    {/* Logo/Branding Stamp */}
                    <div className="mt-6 flex items-center space-x-2 text-[10px] uppercase tracking-[0.3em] font-bold text-white/20">
                        <Wand2 className="w-3 h-3" />
                        <span>WishAI Magic</span>
                    </div>
                </motion.div>
            </div>

            {/* Floating Action Buttons */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-4 z-20">
                <button
                    onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                    className="flex items-center space-x-2 px-8 py-3.5 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/20 backdrop-blur-2xl text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-xl group/btn overflow-hidden relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    <AnimatePresence mode="wait">
                        {copied ? (
                            <motion.span key="check" initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: -20 }} className="flex items-center space-x-2">
                                <Check className="w-5 h-5 text-green-400" />
                                <span className="text-sm">Copied!</span>
                            </motion.span>
                        ) : (
                            <motion.span key="copy" initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: -20 }} className="flex items-center space-x-2">
                                <Copy className="w-5 h-5 text-purple-300" />
                                <span className="text-sm">Copy Wish</span>
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>

                <button
                    onClick={handleShare}
                    className="p-3.5 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/20 backdrop-blur-2xl text-white transition-all hover:scale-105 active:scale-95 shadow-xl"
                >
                    <Share2 className="w-5 h-5 text-blue-300" />
                </button>
            </div>

            {/* Shine Sweep Animation */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    animate={{ x: ['100%', '-100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg]"
                />
            </div>
        </div>
    );
};

export default GreetingCard;
