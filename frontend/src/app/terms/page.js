'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, CheckCircle, FileText, Lock } from 'lucide-react';

const TermsAndConditions = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-gray-900/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2 group">
                        <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                        <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">Back to Home</span>
                    </Link>
                    <div className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                        Wishes AI
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    
                    {/* Title Section */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center justify-center p-3 bg-purple-500/10 rounded-2xl mb-6">
                            <FileText className="w-8 h-8 text-purple-400" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Terms & Conditions</h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Please read these terms carefully before using our AI-powered wishing platform.
                        </p>
                    </div>

                    {/* Content Blocks */}
                    <div className="space-y-8">
                        {/* Section 1 */}
                        <section className="bg-white/5 rounded-3xl p-8 border border-white/10 hover:border-purple-500/30 transition-colors">
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                                <span className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-3">1</span>
                                Acceptance of Terms
                            </h2>
                            <p className="text-gray-400 leading-relaxed">
                                By accessing and using Wishes AI ("the Service"), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use our Service. These terms apply to all visitors, users, and others who access the Service.
                            </p>
                        </section>

                        {/* Section 2 */}
                        <section className="bg-white/5 rounded-3xl p-8 border border-white/10 hover:border-purple-500/30 transition-colors">
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                                <span className="bg-purple-500/20 text-purple-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-3">2</span>
                                AI-Generated Content
                            </h2>
                            <p className="text-gray-400 leading-relaxed mb-4">
                                Our Service utilizes Artificial Intelligence to generate wishes, messages, and imagery. By using this feature, you acknowledge that:
                            </p>
                            <ul className="space-y-3 text-gray-400">
                                <li className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                                    <span>AI generations may vary in accuracy and relevance.</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                                    <span>You are responsible for reviewing content before sending or sharing.</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                                    <span>We verify generated content against strict safety guidelines, but cannot guarantee 100% filtering of inappropriate content.</span>
                                </li>
                            </ul>
                        </section>

                         {/* Section 3 */}
                         <section className="bg-white/5 rounded-3xl p-8 border border-white/10 hover:border-purple-500/30 transition-colors">
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                                <span className="bg-pink-500/20 text-pink-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-3">3</span>
                                User Accounts
                            </h2>
                            <p className="text-gray-400 leading-relaxed">
                                When you create an account with us, you must provide information that is accurate, complete, and current. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account. You are responsible for safeguarding the password that you use to access the Service.
                            </p>
                        </section>

                        {/* Section 4 */}
                        <section className="bg-white/5 rounded-3xl p-8 border border-white/10 hover:border-purple-500/30 transition-colors">
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                                <span className="bg-amber-500/20 text-amber-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-3">4</span>
                                Privacy & Data
                            </h2>
                            <div className="flex items-start bg-black/20 rounded-xl p-4 mb-4">
                                <Lock className="w-6 h-6 text-gray-400 mr-3 mt-1" />
                                <div className="text-sm text-gray-400">
                                    We value your privacy. Your personal data and generated content are encrypted and stored securely. We do not sell your personal data to third parties.
                                </div>
                            </div>
                            <p className="text-gray-400 leading-relaxed">
                                For more detailed information about how we collect, use, and share your personal data, please review our <Link href="/privacy" className="text-purple-400 hover:text-purple-300 underline">Privacy Policy</Link>.
                            </p>
                        </section>

                         {/* Section 5 */}
                         <section className="bg-white/5 rounded-3xl p-8 border border-white/10 hover:border-purple-500/30 transition-colors">
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                                <span className="bg-red-500/20 text-red-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-3">5</span>
                                Termination
                            </h2>
                            <p className="text-gray-400 leading-relaxed">
                                We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. All provisions of the Terms which by their nature should survive termination shall survive termination.
                            </p>
                        </section>
                    </div>

                    {/* Footer */}
                    <div className="mt-16 pt-8 border-t border-white/10 text-center text-gray-500 text-sm">
                        <p>&copy; {new Date().getFullYear()} Wishes AI. All rights reserved.</p>
                        <p className="mt-2">Last updated: January 2026</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TermsAndConditions;
