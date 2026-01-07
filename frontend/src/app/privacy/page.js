'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Eye, Database, Globe, Lock } from 'lucide-react';

const PrivacyPolicy = () => {
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
                        <div className="inline-flex items-center justify-center p-3 bg-pink-500/10 rounded-2xl mb-6">
                            <Shield className="w-8 h-8 text-pink-400" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Privacy Policy</h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            We are committed to protecting your privacy and ensuring your data is secure.
                        </p>
                    </div>

                    {/* Content Blocks */}
                    <div className="space-y-8">
                        {/* Section 1 */}
                        <section className="bg-white/5 rounded-3xl p-8 border border-white/10 hover:border-pink-500/30 transition-colors">
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                                <span className="bg-purple-500/20 text-purple-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-3">1</span>
                                Information We Collect
                            </h2>
                            <p className="text-gray-400 leading-relaxed mb-4">
                                We utilize various types of information to provide and improve our Service to you:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-black/20 p-4 rounded-xl">
                                    <div className="flex items-center mb-2">
                                        <Database className="w-5 h-5 text-blue-400 mr-2" />
                                        <h3 className="font-semibold text-white">Personal Data</h3>
                                    </div>
                                    <p className="text-sm text-gray-400">Email address, first name, and usage data required for account creation.</p>
                                </div>
                                <div className="bg-black/20 p-4 rounded-xl">
                                    <div className="flex items-center mb-2">
                                        <Globe className="w-5 h-5 text-green-400 mr-2" />
                                        <h3 className="font-semibold text-white">Usage Data</h3>
                                    </div>
                                    <p className="text-sm text-gray-400">Information on how the Service is accessed and used, including device info.</p>
                                </div>
                            </div>
                        </section>

                        {/* Section 2 */}
                        <section className="bg-white/5 rounded-3xl p-8 border border-white/10 hover:border-pink-500/30 transition-colors">
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                                <span className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-3">2</span>
                                How We Use Your Data
                            </h2>
                            <ul className="space-y-3 text-gray-400">
                                {[
                                    "To provide and maintain the Service",
                                    "To notify you about changes to our Service",
                                    "To allow you to participate in interactive features",
                                    "To provide customer support",
                                    "To monitor the usage of the Service"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 mr-3 flex-shrink-0"></div>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                         {/* Section 3 */}
                         <section className="bg-white/5 rounded-3xl p-8 border border-white/10 hover:border-pink-500/30 transition-colors">
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                                <span className="bg-green-500/20 text-green-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-3">3</span>
                                Data Security
                            </h2>
                            <p className="text-gray-400 leading-relaxed">
                                The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
                            </p>
                            <div className="mt-4 flex items-center space-x-2 text-green-400 bg-green-900/20 p-3 rounded-lg inline-flex">
                                <Lock className="w-4 h-4" />
                                <span className="text-sm font-medium">All sensitive data is encrypted at rest.</span>
                            </div>
                        </section>

                        {/* Section 4 */}
                        <section className="bg-white/5 rounded-3xl p-8 border border-white/10 hover:border-pink-500/30 transition-colors">
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                                <span className="bg-amber-500/20 text-amber-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-3">4</span>
                                Third-Party Services
                            </h2>
                            <p className="text-gray-400 leading-relaxed">
                                We may employ third party companies and individuals to facilitate our Service ("Service Providers"), to provide the Service on our behalf, to perform Service-related services or to assist us in analyzing how our Service is used. These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
                            </p>
                        </section>

                    </div>

                    {/* Footer */}
                    <div className="mt-16 pt-8 border-t border-white/10 text-center text-gray-500 text-sm">
                        <p className="mb-4">
                            Questions about this policy? <a href="mailto:support@wishesai.com" className="text-pink-400 hover:text-pink-300 transition-colors">Contact Support</a>
                        </p>
                        <p>&copy; {new Date().getFullYear()} Wishes AI. All rights reserved.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PrivacyPolicy;
