'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { getApiUrl } from '@/lib/utils';
import WordListGenerator from '@/components/WordListGenerator';
import ContactsList from '@/components/ContactsList';
import CreateWishWizard from '@/components/dashboard/CreateWishWizard';
import GreetingCard from '@/components/GreetingCard';
import WishGallery from '@/components/dashboard/WishGallery';
import CustomizationControls from '@/components/dashboard/CustomizationControls';
import CalendarView from '@/components/dashboard/CalendarView';
import ProfilePage from '@/components/dashboard/ProfilePage';
import DashboardStats from '@/components/dashboard/DashboardStats';
import UpcomingEventsTimeline from '@/components/dashboard/UpcomingEventsTimeline';
import RecentActivity from '@/components/dashboard/RecentActivity';
import {
    Wand2,
    LayoutDashboard,
    Sparkles,
    ArrowRight,
    History,
    RefreshCw,
    Check
} from 'lucide-react';
import Link from 'next/link';

const DashboardContent = () => {
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'overview';
    
    // State for specific tabs
    const [wish, setWish] = useState(null); // Fix: Add missing state
    const [cardTheme, setCardTheme] = useState('modern');
    const [customFont, setCustomFont] = useState('modern');
    const [customColor, setCustomColor] = useState(null);
    const [activeTemplate, setActiveTemplate] = useState(null);
    const [customImageTexture, setCustomImageTexture] = useState(null);
    const [isGeneratingBg, setIsGeneratingBg] = useState(false);
    const [wordResults, setWordResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const { token, user, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !token) {
            router.push('/login');
        }
    }, [authLoading, token, router]);

    if (authLoading || !token) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 rounded-full"></div>
                        <Wand2 className="w-10 h-10 text-purple-400 animate-pulse" />
                    </div>
                    <span className="text-gray-400 font-medium tracking-wide">Summoning dashboard...</span>
                </div>
            </div>
        );
    }

    const handleGenerateWish = async (formData) => {
        setLoading(true);
        try {
            const apiEndpoint = formData.scheduled_time
                ? getApiUrl('/api/schedule')
                : getApiUrl('/api/generate-user-wish');

            const payload = formData.scheduled_time ? {
                ...formData,
                scheduled_time: new Date(formData.scheduled_time).toISOString(),
            } : formData;

            const res = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (res.ok) {
                if (data.wish) {
                     setWish(data.wish);
                     // Reset customization
                     setActiveTemplate(null);
                     setCustomFont('modern');
                     setCustomColor(null);
                     setCustomImageTexture(null);
                }
                else if (data.message) alert(`Success: ${data.message} (ID: ${data.id})`);
            } else {
                alert('Error: ' + JSON.stringify(data));
            }
        } catch (error) {
            alert("Failed to generate wish");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateMagicBg = async () => {
        if (!wish) return; // Need a wish first
        setIsGeneratingBg(true);
        try {
            const res = await fetch(getApiUrl('/api/generate-image-prompt'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ wish: wish }) // endpoint expects { wish: str }
            });

            const data = await res.json();
             // The new endpoint returns { prompt, url } directly, NOT wrapped in global response "data" field based on my implementation
            if (res.ok) {
                setCustomImageTexture(data.url);
                if (!activeTemplate) setActiveTemplate('modern');
            }
        } catch (err) {
            console.error("AI BG Failed:", err);
        } finally {
             setIsGeneratingBg(false);
        }
    };

    const handleWordGenerate = async (words, mode) => {
        setLoading(true);
        try {
            const res = await fetch(getApiUrl('/api/wish-from-words'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ words, mode }),
            });
            const data = await res.json();
            if (data.results) setWordResults(data.results);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    return (
        <div>
             {/* Header Title */}
             <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-10"
            >
                <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">
                    {activeTab === 'overview' && `Welcome back, ${user?.email?.split('@')[0]}!`}
                    {activeTab === 'basic' && 'Create a Wish'}
                    {activeTab === 'words' && 'Word Magic'}
                    {activeTab === 'contacts' && 'Manage Contacts'}
                    {activeTab === 'gallery' && 'My Wish Gallery'}
                    {activeTab === 'calendar' && 'Calendar'}
                    {activeTab === 'profile' && 'User Profile'}
                </h2>
                <p className="text-gray-400 text-lg font-light">
                    {activeTab === 'overview' && 'Ready to spread some magic today?'}
                    {activeTab === 'basic' && 'Let AI craft the perfect message for any occasion.'}
                    {activeTab === 'words' && 'Turn a list of random words into a coherent, beautiful wish.'}
                    {activeTab === 'contacts' && 'Keep track of your friends and family.'}
                    {activeTab === 'gallery' && 'Your history of magical generations.'}
                    {activeTab === 'calendar' && 'Manage your scheduled wishes and events.'}
                    {activeTab === 'profile' && 'Manage your account settings and preferences.'}
                </p>
            </motion.div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <DashboardStats />
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Col - Actions */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-white/10 rounded-3xl p-10 flex flex-col items-start justify-center relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse-slow"></div>
                                        <div className="relative z-10">
                                            <h3 className="text-3xl font-bold text-white mb-4">Start a New Wish</h3>
                                            <p className="text-gray-300 max-w-md mb-8">Choose our advanced AI wizard to craft the perfect heartfelt message.</p>
                                            <Link href="/dashboard?tab=basic" className="px-6 py-3 bg-white text-purple-900 font-bold rounded-xl hover:scale-105 transition-transform flex items-center space-x-2">
                                                <span>Open Wizard</span>
                                                <ArrowRight className="w-5 h-5" />
                                            </Link>
                                        </div>
                                        <Wand2 className="absolute right-10 bottom-10 w-40 h-40 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                                    </div>
                                </div>
                                
                                {/* Right Col - Timeline */}
                                <div className="lg:col-span-1 space-y-6">
                                    <UpcomingEventsTimeline />
                                    <RecentActivity />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'basic' && (
                        <div className="max-w-4xl mx-auto">
                            {!wish ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                >
                                    <CreateWishWizard onGenerate={handleGenerateWish} loading={loading} />
                                </motion.div>
                            ) : (
                                    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl items-start">
                                        
                                        {/* Left: The Card */}
                                        <div className="flex-1 w-full flex justify-center sticky top-20">
                                            <div className="w-full max-w-xl aspect-[1.6]">
                                                <GreetingCard 
                                                    text={wish} 
                                                    theme={cardTheme} 
                                                    customFont={customFont} 
                                                    customColor={customColor} 
                                                    activeTemplate={activeTemplate || cardTheme} 
                                                    customImageTexture={customImageTexture}
                                                />
                                            </div>
                                        </div>

                                        {/* Right: Customization Panel */}
                                        <CustomizationControls
                                            activeTemplate={activeTemplate || cardTheme}
                                            setActiveTemplate={setActiveTemplate}
                                            customFont={customFont}
                                            setCustomFont={setCustomFont}
                                            customColor={customColor}
                                            setCustomColor={setCustomColor}
                                            onGenerateMagicBg={handleGenerateMagicBg}
                                            isGeneratingBg={isGeneratingBg}
                                        />
                                    </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'words' && (
                        <div className="glass-card rounded-3xl p-8 border border-white/10 max-w-4xl relative overflow-hidden">
                             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-orange-500"></div>
                            <WordListGenerator
                                onGenerate={handleWordGenerate}
                                results={wordResults}
                                loading={loading}
                            />
                        </div>
                    )}

                    {activeTab === 'contacts' && (
                        <div className="glass-card rounded-3xl overflow-hidden border border-white/10 max-w-5xl">
                            <ContactsList />
                        </div>
                    )}
                                        {activeTab === 'gallery' && (
                          <div className="animate-in fade-in duration-500">
                              <WishGallery />
                          </div>
                     )}

                     {activeTab === 'calendar' && (
                         <div className="h-[calc(100vh-140px)] animate-in zoom-in-95 duration-500 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                             <CalendarView />
                         </div>
                     )}

                    {activeTab === 'profile' && (
                        <div className="animate-in fade-in duration-500">
                            <ProfilePage />
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

const Dashboard = () => {
  return (
    <React.Suspense fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
             <Wand2 className="w-10 h-10 text-purple-400 animate-pulse" />
        </div>
    }>
      <DashboardContent />
    </React.Suspense>
  );
};

export default Dashboard;
