'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Sparkles, Wand2, PartyPopper, Heart, Briefcase, ArrowRight, Quote, Zap, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useMotionValue, useTransform, animate, useSpring } from 'framer-motion';
import Footer from '../components/Footer';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

const cards = [
    {
        id: 1,
        theme: "Neon Vibes",
        title: "Happy Birthday, Sarah! 🎂",
        message: "\"May your day be as bright and electrifying as you are! Keep shining like the star you were born to be.\"",
        style: "bg-gradient-to-br from-indigo-900 via-purple-900 to-black border-white/10",
        overlay: "bg-purple-500",
        textGradient: "from-cyan-400 to-purple-400",
        textColor: "text-gray-300",
        iconColor: "text-purple-400",
        shadow: "shadow-purple-500/20"
    },
    {
        id: 2,
        theme: "Anniversary",
        title: "To My Love",
        message: "\"Five years of laughter, love, and magic. Here's to a lifetime more of our beautiful journey together.\"",
        style: "bg-gradient-to-br from-orange-400 via-red-500 to-pink-600",
        overlay: "bg-yellow-300",
        textGradient: "text-white", 
        textColor: "text-white",
        iconColor: "text-white/80",
        shadow: "shadow-orange-500/20",
        isSerif: true
    },
    {
        id: 3,
        theme: "Senior Promotion",
        title: "Congratulations, Michael!",
        message: "\"Your hard work and dedication have truly paid off. Wishing you incredible success in your new leadership role.\"",
        style: "bg-white",
        overlay: "bg-blue-500",
        textGradient: "text-gray-900",
        textColor: "text-gray-600",
        iconColor: "text-blue-600",
        shadow: "shadow-blue-500/20",
        isMinimal: true
    },
    {
        id: 4,
        theme: "Thank You",
        title: "Forever Grateful",
        message: "\"Your kindness has touched my heart in ways words cannot express. Thank you for being there when I needed it most.\"",
        style: "bg-gradient-to-br from-emerald-500 to-teal-700",
        overlay: "bg-emerald-300",
        textGradient: "text-white",
        textColor: "text-emerald-50",
        iconColor: "text-emerald-200",
        shadow: "shadow-emerald-500/20"
    },
    {
        id: 5,
        theme: "New Baby",
        title: "Welcome, Little One! 👶",
        message: "\"A brand new miracle to love and cherish. Wishing your growing family endless joy and sleepless nights worth every second.\"",
        style: "bg-gradient-to-br from-pink-100 to-blue-100",
        overlay: "bg-yellow-400",
        textGradient: "text-gray-800",
        textColor: "text-gray-600",
        iconColor: "text-pink-400",
        shadow: "shadow-purple-200/50",
        isMinimal: true
    },
    {
        id: 6,
        theme: "Graduation",
        title: "Class of 2024 🎓",
        message: "\"The world is yours to conquer. Go forth and set the world on fire with your dreams. We are so proud of you!\"",
        style: "bg-gradient-to-br from-gray-900 via-gray-800 to-black border-yellow-500/30",
        overlay: "bg-yellow-500",
        textGradient: "text-yellow-400",
        textColor: "text-gray-300",
        iconColor: "text-yellow-500",
        shadow: "shadow-yellow-500/20"
    },
    {
        id: 7,
        theme: "Wedding Day",
        title: "Happily Ever After 💍",
        message: "\"Two hearts, one soul, and a lifetime of adventure. May your love story be the most beautiful one ever told.\"",
        style: "bg-gradient-to-br from-rose-50 via-white to-rose-100",
        overlay: "bg-rose-400",
        textGradient: "text-rose-900",
        textColor: "text-rose-700",
        iconColor: "text-rose-500",
        shadow: "shadow-rose-500/20",
        isSerif: true
    },
    {
        id: 8,
        theme: "Get Well Soon",
        title: "Thinking of You 🌿",
        message: "\"Sending you healing vibes and warm hugs. Take all the time you need to rest and recharge. We miss you!\"",
        style: "bg-gradient-to-br from-teal-50 to-green-100",
        overlay: "bg-green-400",
        textGradient: "text-teal-800",
        textColor: "text-teal-600",
        iconColor: "text-green-500",
        shadow: "shadow-green-500/20",
        isMinimal: true
    }
];

// Carousel Constants
const CARD_WIDTH = 320; // Approx width
const RADIUS = 450; // Radius of the circle

function CircularCarousel() {
    const rotation = useMotionValue(0);
    const [isDragging, setIsDragging] = useState(false);
    
    // Auto-rotation
    useEffect(() => {
        if (isDragging) return;
        const controls = animate(rotation, rotation.get() - 360, {
            ease: "linear",
            duration: 60, // Slow continuous rotation
            repeat: Infinity,
            repeatType: "loop"
        });
        return () => controls.stop();
    }, [isDragging, rotation]);

    const handleDragStart = () => setIsDragging(true);
    const handleDragEnd = () => setIsDragging(false);

    // Calculate rotation for drag
    const onUpdate = (latest) => {
       // Keep value normalized if needed, but linear is fine for infinite spin
    };

    return (
        <div className="relative h-[600px] w-full flex items-center justify-center overflow-hidden perspective-1000">
             {/* Center Glow */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <motion.div
                className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing z-10"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }} // Infinite drag simulation via transform? No, let's use valid motion value
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                style={{ x: 0 }} // Dummy to enable drag
                onDrag={(event, info) => {
                    // Manually update rotation based on drag delta
                    rotation.set(rotation.get() + info.delta.x * 0.5);
                }}
            >
                {cards.map((card, index) => {
                    return (
                        <CarouselItem 
                            key={card.id} 
                            card={card} 
                            index={index} 
                            total={cards.length} 
                            rotation={rotation} 
                        />
                    );
                })}
            </motion.div>
        </div>
    );
}

function CarouselItem({ card, index, total, rotation }) {
    const angleStep = 360 / total;
    const baseAngle = index * angleStep;

    // Transform rotation value to this card's specific angle
    const angle = useTransform(rotation, (latest) => {
        return (baseAngle + latest) * (Math.PI / 180);
    });

    const x = useTransform(angle, (a) => Math.sin(a) * RADIUS);
    const z = useTransform(angle, (a) => Math.cos(a) * RADIUS);
    const scale = useTransform(angle, (a) => {
        const cos = Math.cos(a);
        // Scale from 0.6 (back) to 1.1 (front)
        return 0.6 + (cos + 1) / 2 * 0.5;
    });
    const zIndex = useTransform(angle, (a) => Math.round(Math.cos(a) * 100));
    
    // 900x Enhancements: Depth of Field & Lighting
    const filter = useTransform(angle, (a) => {
        const cos = Math.cos(a);
        const blurAmount = (1 - cos) * 8; // Blur back items
        const brightnessAmount = 0.4 + (cos + 1) / 2 * 0.6; // Darken back items
        return `blur(${blurAmount}px) brightness(${brightnessAmount})`;
    });

    // 3D Rotation to feel tangible
    const rotateY = useTransform(angle, (a) => Math.sin(a) * -25);

    return (
        <motion.div
            style={{
                x,
                z,
                scale,
                zIndex,
                rotateY,
                filter,
                position: 'absolute',
                transformStyle: 'preserve-3d',
            }}
            className="w-[320px] md:w-[380px] aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl origin-center"
        >
             {/* Reflection Effect */}
             <div className="absolute top-full left-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent opacity-30 transform scale-y-[-1] blur-sm pointer-events-none mask-image-b"></div>

             <div className={`w-full h-full relative p-8 flex flex-col justify-between border ${card.style} ${card.shadow}`}>
                {/* Visual Effects based on ID */}
                {card.id === 1 && (
                    <>
                        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
                        <div className={`absolute top-10 left-10 w-20 h-20 ${card.overlay} rounded-full blur-[50px] opacity-60`}></div>
                    </>
                )}
                 {/* ... (Reuse internal card logic) ... */}
                 {/* Simplified Card Content for conciseness in 3D view */}
                <div className="relative z-10">
                    <div className="inline-block px-3 py-1 rounded-full bg-black/10 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-4 border border-black/5 opacity-70">
                        {card.theme}
                    </div>
                    <h3 className={`text-2xl font-bold mb-2 ${card.textGradient} ${card.isSerif ? 'font-serif italic' : ''}`}>
                        {card.title}
                    </h3>
                    {card.isMinimal && <div className="h-1 w-12 bg-blue-500 rounded-full mb-4"></div>}
                </div>
                
                <p className={`relative z-10 text-sm md:text-base leading-relaxed ${card.textColor} ${card.isSerif ? 'font-serif italic' : 'font-normal'}`}>
                    {card.message}
                </p>
                
                <div className="relative z-10 flex items-center justify-between mt-4">
                     <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-white/30 border border-white/50 backdrop-blur-sm"></div>)}
                     </div>
                     <Heart className={`w-5 h-5 ${card.iconColor} fill-current`} />
                </div>
            </div>
        </motion.div>
    );
}


function MagneticButton({ children, className }) {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
    const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

    function handleMouseMove(e) {
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        
        const distanceX = clientX - centerX;
        const distanceY = clientY - centerY;

        x.set(distanceX * 0.4); // Magnetic pull strength
        y.set(distanceY * 0.4);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
    }

    return (
        <motion.button
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: springX, y: springY }}
            className={className}
        >
            {children}
        </motion.button>
    );
}

function TiltCard({ children, className, spotlightColor = "rgba(255,255,255,0.15)" }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [15, -15]); // Increased tilt range
    const rotateY = useTransform(x, [-100, 100], [-15, 15]);

    function handleMouseMove(event) {
        const rect = event.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set(event.clientX - centerX);
        y.set(event.clientY - centerY);
    }

    function handleMouseLeave() {
        animate(x, 0, { duration: 0.5, ease: "easeOut" });
        animate(y, 0, { duration: 0.5, ease: "easeOut" });
    }

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className={`relative perspective-1000 ${className}`}
        >
            {/* Parallax Content Container */}
            <div style={{ transform: "translateZ(50px)" }} className="relative z-10">
                {children}
            </div>

            {/* Dynamic Colored Spotlight */}
            <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
                style={{
                    background: useTransform(
                        [x, y],
                        ([latestX, latestY]) => `radial-gradient(circle at ${latestX + 50}% ${latestY + 50}%, ${spotlightColor} 0%, transparent 60%)`
                    )
                }}
            />
             {/* Glass Reflection Sheen */}
            <div 
            />
        </motion.div>
    );
}

// Particle Component for the "Magic" step
function MagicParticles() {
    return (
        <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-1 h-1 bg-purple-300 rounded-full"
                    initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                    animate={{ 
                        scale: [0, 1, 0], 
                        x: Math.sin(i * 123) * 50, 
                        y: Math.cos(i * 321) * 50,
                        opacity: [1, 0]
                    }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
            ))}
        </div>
    );
}

function LivingPipeline() {
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % 3);
        }, 2500); // Cycle every 2.5 seconds per step
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative">
             {/* Creating the connecting line layer - Absolute centered */}
            <div className="absolute top-[3.5rem] left-0 w-full hidden md:block z-0 px-[16%]">
                <div className="w-full h-1 bg-white/5 rounded-full relative overflow-hidden">
                    {/* Background track */}
                    
                    {/* Traveling Beam */}
                    <motion.div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-purple-500 to-transparent w-1/3 blur-[2px]"
                        animate={{ 
                            left: activeStep === 0 ? "0%" : activeStep === 1 ? "33%" : "66%",
                            opacity: [0, 1, 0] // Fade in/out during travel could be cool, but sliding is better.
                        }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                    />
                     {/* Persistent Progress Bar */}
                     <motion.div 
                        className="h-full bg-gradient-to-r from-purple-600 to-pink-500 origin-left"
                        animate={{ scaleX: (activeStep + 0.5) / 3 }}
                        transition={{ duration: 0.5, ease: "circOut" }}
                     />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto relative z-10 px-4">
                {[
                    { step: "1", icon: Zap, title: "Input Details", desc: "Tell us who it's for and the occasion.", action: "charge" },
                    { step: "2", icon: Wand2, title: "AI Magic", desc: "Our engine crafts the perfect message instantly.", action: "wave" },
                    { step: "3", icon: Share2, title: "Share & Wow", desc: "Send it via Email or Socials.", action: "launch" }
                ].map((item, idx) => {
                    const isActive = activeStep === idx;
                    
                    return (
                        <motion.div 
                            key={idx}
                            className="relative flex flex-col items-center text-center group cursor-pointer"
                            onMouseEnter={() => setActiveStep(idx)} // User override
                        >
                            {/* Glass Node */}
                            <motion.div 
                                animate={isActive ? { scale: 1.15, borderColor: "rgba(168,85,247,0.5)" } : { scale: 1, borderColor: "rgba(255,255,255,0.1)" }}
                                transition={{ duration: 0.5 }}
                                className={`w-28 h-28 rounded-full glass-card border flex items-center justify-center mb-8 relative z-10 transition-colors duration-500 ${isActive ? 'shadow-[0_0_60px_rgba(168,85,247,0.4)] bg-purple-500/10' : 'shadow-none'}`}
                            >
                                    {/* Pulse Rings for Active State */}
                                    {isActive && (
                                        <>
                                            <motion.div 
                                                className="absolute inset-0 rounded-full border border-purple-500/50"
                                                initial={{ scale: 1, opacity: 1 }}
                                                animate={{ scale: 1.5, opacity: 0 }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            />
                                            <motion.div 
                                                className="absolute inset-0 rounded-full border border-purple-400/30"
                                                initial={{ scale: 1, opacity: 1 }}
                                                animate={{ scale: 2, opacity: 0 }}
                                                transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                                            />
                                        </>
                                    )}

                                {/* Magical Particles for Step 2 */}
                                {isActive && idx === 1 && <MagicParticles />}

                                <motion.div
                                    animate={
                                        isActive && item.action === "charge" ? { scale: [1, 1.2, 1], filter: ["brightness(1)", "brightness(2)", "brightness(1)"] } :
                                        isActive && item.action === "wave" ? { rotate: [0, -25, 25, 0], x: [0, -3, 3, 0] } :
                                        isActive && item.action === "launch" ? { y: [0, -15, 0], filter: "brightness(1.5)" } : {}
                                    }
                                    transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
                                >
                                    <item.icon className={`w-10 h-10 transition-colors duration-300 ${isActive ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'text-gray-400'}`} />
                                </motion.div>

                                    {/* Step Badge */}
                                <motion.div 
                                    animate={isActive ? { scale: 1.2, backgroundColor: "#9333ea" } : { scale: 1, backgroundColor: "#4b5563" }}
                                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border border-white/20 shadow-lg text-white"
                                >
                                    {item.step}
                                </motion.div>
                            </motion.div>

                            <h3 className={`text-2xl font-bold mb-3 transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-500'}`}>{item.title}</h3>
                            <p className="text-gray-400 max-w-xs leading-relaxed">{item.desc}</p>
                            
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}


// Cinematic Text Reveal - Simplified for Reliability
function SplitText({ children, className, delay = 0 }) {
    const text = typeof children === 'string' ? children : '';
    const words = text.split(" ");

    return (
        <span className={className}>
            {words.map((word, i) => (
                <span key={i} className="inline-block whitespace-nowrap mr-[0.2em]">
                    {word.split("").map((char, j) => (
                        <motion.span
                            key={j}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.5,
                                ease: "easeOut",
                                delay: delay + i * 0.1 + j * 0.02
                            }}
                            className="inline-block"
                        >
                            {char}
                        </motion.span>
                    ))}
                </span>
            ))}
        </span>
    );
}

// Global Atmospheric Particles
function Stardust() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        
        // Resize canvas
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        // Particle System
        const particles = Array.from({ length: 100 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5
        }));

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach((p) => {
                p.x += p.speedX;
                p.y += p.speedY;

                // Wrap around
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                ctx.fill();
            });
            
            animationFrameId = requestAnimationFrame(render);
        };
        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen" />;
}

function WarpGrid() {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
            <motion.div 
                className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_800px_at_50%_-30%,rgba(120,60,255,0.15),transparent)]"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 5, repeat: Infinity }}
            />
        </div>
    );
}

function QuantumCard({ children, className, spotlightColor = "rgba(255,255,255,0.15)", delay = 0 }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [15, -15]);
    const rotateY = useTransform(x, [-100, 100], [-15, 15]);
    const [isHovered, setIsHovered] = useState(false);

    function handleMouseMove(event) {
        const rect = event.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set(event.clientX - centerX);
        y.set(event.clientY - centerY);
    }

    function handleMouseLeave() {
        animate(x, 0, { duration: 0.5, ease: "easeOut" });
        animate(y, 0, { duration: 0.5, ease: "easeOut" });
        setIsHovered(false);
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.8 }}
            onMouseMove={(e) => { handleMouseMove(e); setIsHovered(true); }}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className={`relative perspective-1000 group ${className}`}
        >
             {/* Quantum RGB Split Effect layers */}
             <div className={`absolute inset-0 translate-z-[10px] opacity-0 group-hover:opacity-60 transition-opacity duration-100 mix-blend-screen pointer-events-none select-none text-red-500 overflow-hidden ${isHovered ? 'animate-pulse-fast' : ''}`} style={{ transform: 'translateX(-2px)' }}>
                {children}
             </div>
             <div className={`absolute inset-0 translate-z-[10px] opacity-0 group-hover:opacity-60 transition-opacity duration-100 mix-blend-screen pointer-events-none select-none text-blue-500 overflow-hidden ${isHovered ? 'animate-pulse-fast' : ''}`} style={{ transform: 'translateX(2px)' }}>
                 {children}
             </div>

            {/* Main Content */}
            <div style={{ transform: "translateZ(50px)" }} className="relative z-10 bg-black/60 backdrop-blur-xl rounded-3xl p-8 border border-white/10 h-full flex flex-col justify-between overflow-hidden">
                 {/* Internal Gradient Stream */}
                 <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:animate-scanline"></div>
                 
                {children}
            </div>

            {/* Spotlight */}
            <motion.div
                className="absolute inset-0 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
                style={{
                    background: useTransform(
                        [x, y],
                        ([latestX, latestY]) => `radial-gradient(circle at ${latestX + 50}% ${latestY + 50}%, ${spotlightColor} 0%, transparent 60%)`
                    )
                }}
            />
        </motion.div>
    );
}

export default function LandingPage() {
    return (
        <div className="min-h-screen font-sans selection:bg-purple-500 selection:text-white overflow-hidden relative bg-black">
            {/* Global Atmosphere */}
            <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-purple-950 -z-20" />
            <Stardust />
            
            {/* Mesh Gradient Overlay */}
            <div className="fixed inset-0 bg-mesh opacity-30 z-[-1]" />

            {/* Navbar */}
            <nav className="glass-header fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center transition-all duration-300">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-purple-600 blur opacity-50 rounded-full group-hover:opacity-80 transition-opacity"></div>
                            <Sparkles className="w-8 h-8 text-purple-400 relative z-10 animate-pulse-slow" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                            Wishes AI
                        </span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors relative group">
                            Sign In
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all group-hover:w-full"></span>
                        </Link>
                        <Link
                            href="/signup"
                            className="px-6 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm text-sm font-medium transition-all hover:scale-105 active:scale-95 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/20"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="pt-24 relative z-10">
                <div className="container mx-auto px-6 md:px-12">
                     {/* Hero Section - 700x Enhanced */}
                    <div className="flex flex-col md:flex-row items-center justify-between min-h-[85vh] py-12 relative">
                         {/* Text Content */}
                        <div className="w-full md:w-1/2 space-y-8 relative z-20">
                             {/* Floating decorative elements */}
                             <motion.div 
                                className="absolute -top-20 -left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-[80px]" 
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 5, repeat: Infinity }}
                            />

                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10"
                            >
                                <Sparkles className="w-4 h-4 text-yellow-400" />
                                <span className="text-sm font-medium text-purple-200">Powered by Gemini 2.0</span>
                            </motion.div>
                            
                            <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight">
                                <motion.span 
                                    initial={{ opacity: 1, y: 0 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="block mb-2 bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-gray-400"
                                >
                                    Magic in Every Wish
                                </motion.span>
                                <motion.span 
                                    initial={{ opacity: 1, y: 0 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                                    className="block bg-clip-text text-transparent bg-gradient-to-br from-purple-400 via-pink-400 to-red-400"
                                >
                                    Thoughtfulness in Every Word
                                </motion.span>
                            </h1>

                            <motion.p 
                                initial={{ opacity: 1, y: 0 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="text-xl text-gray-400 max-w-lg leading-relaxed"
                            >
                                Transform simple thoughts into heartwarming, professional, or magical messages instantly.
                            </motion.p>
                            
                            <motion.div 
                                initial={{ opacity: 1, y: 0 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                className="flex items-center space-x-4"
                            >
                                <Link href="/dashboard?tab=basic">
                                    <MagneticButton className="px-8 py-4 rounded-full bg-white text-purple-900 font-bold hover:bg-purple-50 transition-colors shadow-lg shadow-purple-500/25 flex items-center space-x-2">
                                        <span>Create Wish</span>
                                        <Wand2 className="w-5 h-5" />
                                    </MagneticButton>
                                </Link>
                                
                                <Link href="/dashboard?tab=gallery">
                                    <MagneticButton className="px-8 py-4 rounded-full bg-transparent border border-white/20 text-white font-medium hover:bg-white/5 transition-colors backdrop-blur-sm">
                                        <span>Explore Themes</span>
                                    </MagneticButton>
                                </Link>
                            </motion.div>
                        </div>

                         {/* Hero Visual - Animated Orbs & Glass Cards */}
                        <div className="w-full md:w-1/2 relative h-[600px] flex items-center justify-center perspective-1000">
                             {/* Ambient Light */}
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px]"></div>
                             
                             {/* Main Rotating Card */}
                            <motion.div
                                animate={{ rotateY: [0, 10, 0, -10, 0], rotateX: [5, 0, -5, 0, 5], y: [0, -20, 0] }}
                                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                                className="relative z-10 w-[350px] aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border border-white/20 glass-card backdrop-blur-xl"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                                <div className="p-8 flex flex-col h-full relative z-20">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-auto shadow-lg">
                                        <PartyPopper className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-4">Happy<br/>Birthday!</h3>
                                    <p className="text-gray-200 text-lg leading-relaxed bg-black/20 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                                        &quot;Wishing you a day filled with laughter, love, and all your favorite things!&quot;
                                    </p>
                                </div>
                                {/* Shimmer Effect */}
                                <motion.div 
                                    className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent skew-x-12"
                                    animate={{ x: ["-100%", "200%"] }}
                                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                                />
                            </motion.div>

                            {/* Floating Elements */}
                            <motion.div 
                                className="absolute top-20 right-10 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-xl"
                                animate={{ y: [0, 20, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            >
                                <Heart className="w-8 h-8 text-pink-500 fill-current" />
                            </motion.div>
                            <motion.div 
                                className="absolute bottom-40 left-10 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-xl"
                                animate={{ y: [0, -25, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Zap className="w-8 h-8 text-yellow-400 fill-current" />
                            </motion.div>
                        </div>
                    </div>
{/* Card Showcase - 3D Circular Carousel Section */}
                    <div className="py-12 relative z-10 overflow-hidden">
                        <div className="text-center mb-0 relative z-20">
                            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200 mb-4">
                                Stunning Designs, Instantly
                            </h2>
                            <p className="text-gray-400 text-lg">Swipe to explore our premium collection.</p>
                        </div>

                       <div className="relative w-full overflow-visible">
                            <CircularCarousel />
                       </div>
                    </div>

                    {/* Features Section 1350x - Quantum Capabilities */}
                    <div className="py-32 relative z-10">
                        <WarpGrid />
                        
                        <div className="text-center mb-24 relative z-10">
                             <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                className="inline-block mb-4 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-semibold tracking-wider uppercase backdrop-blur-md"
                            >
                                Beyond Intelligence
                            </motion.div>
                            <h2 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500 mb-6 tracking-tight">
                                Quantum Capabilities
                            </h2>
                            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                                Features so advanced, they feel like magic from another dimension.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-6 relative z-10 group/grid">
                            {[
                                { title: "Smart Synthesis", desc: "Analyzes relationship dynamics to craft context-perfect messages.", icon: Sparkles, color: "text-amber-400", gradient: "from-amber-400 to-orange-500", spotlight: "rgba(251, 191, 36, 0.4)" },
                                { title: "Empathic Resonance", desc: "Infuses genuine emotion that resonates with the human soul.", icon: Heart, color: "text-rose-400", gradient: "from-rose-400 to-pink-600", spotlight: "rgba(251, 113, 133, 0.4)" },
                                { title: "Corporate Polish", desc: "Navigates professional boundaries with absolute precision.", icon: Briefcase, color: "text-cyan-400", gradient: "from-cyan-400 to-blue-600", spotlight: "rgba(34, 211, 238, 0.4)" }
                            ].map((feature, idx) => (
                                <QuantumCard 
                                    key={idx} 
                                    delay={idx * 0.2}
                                    spotlightColor={feature.spotlight}
                                    className="transition-all duration-500 group-hover/grid:scale-95 group-hover/grid:opacity-40 hover:!opacity-100 hover:!scale-105 z-0 hover:z-10"
                                >
                                    <div className="relative z-20">
                                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-8 shadow-lg shadow-${feature.color}/20 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
                                            <feature.icon className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">{feature.title}</h3>
                                        <p className="text-gray-400 text-lg leading-relaxed border-l-2 border-white/10 pl-4 group-hover:border-white/50 transition-colors">
                                            {feature.desc}
                                        </p>
                                    </div>
                                    
                                    {/* Tech Deco Elements */}
                                    <div className="absolute top-4 right-4 flex space-x-1 opacity-20 group-hover:opacity-100 transition-opacity">
                                        <div className="w-1 h-1 bg-white rounded-full"></div>
                                        <div className="w-1 h-1 bg-white rounded-full"></div>
                                        <div className="w-1 h-1 bg-white rounded-full"></div>
                                    </div>
                                    <div className="absolute bottom-4 right-4 text-[10px] font-mono text-white/20 group-hover:text-white/60 transition-colors">
                                        SYS.0{idx + 1}
                                    </div>
                                </QuantumCard>
                            ))}
                        </div>
                    </div>

                    {/* How It Works Section - Interactive Pipeline */}
                    <div id="how-it-works" className="py-24 relative overflow-hidden">
                        
                        <div className="text-center mb-20 relative z-10">
                            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200 mb-4">
                                Magic in Three Steps
                            </h2>
                            <p className="text-gray-400 text-lg">From thought to masterpiece in seconds.</p>
                        </div>
                        
                        <LivingPipeline />
                    </div>


                    {/* Final CTA - Portal to Magic */}
                    <div className="relative py-32 overflow-hidden flex flex-col items-center justify-center text-center">
                        {/* Warp Background */}
                         <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-black to-black z-0"></div>
                            <motion.div 
                                className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"
                                animate={{ scale: [1, 1.5, 1], rotate: [0, 90, 0] }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            />
                            {/* Moving Orbs */}
                             <motion.div 
                                className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 mix-blend-screen"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 4, repeat: Infinity }}
                             />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <motion.h2 
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-purple-400 tracking-tighter drop-shadow-2xl"
                            >
                                READY TO<br/>CREATE MAGIC?
                            </motion.h2>
                            
                            <motion.p 
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-xl text-gray-400 max-w-2xl mx-auto"
                            >
                                Join the revolution of thoughtful gifting.
                            </motion.p>
                            
                            <motion.div
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
                            >
                                <MagneticButton className="px-12 py-6 rounded-full bg-white text-purple-900 font-bold text-xl hover:bg-purple-50 transition-colors shadow-[0_0_50px_rgba(255,255,255,0.4)] hover:shadow-[0_0_80px_rgba(255,255,255,0.6)]">
                                    Start Wishing Now <ArrowRight className="inline-block ml-2 w-6 h-6" />
                                </MagneticButton>
                            </motion.div>
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};
