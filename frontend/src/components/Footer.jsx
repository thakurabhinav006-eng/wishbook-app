'use client';
import { Star, Heart, Github, Twitter, Linkedin } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="border-t border-white/5 bg-[#050510]/80 backdrop-blur-lg pt-16 pb-8 relative z-10">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center space-x-2 mb-4">
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                                Wishes AI
                            </span>
                        </Link>
                        <p className="text-gray-400 leading-relaxed max-w-sm">
                            Crafting perfect moments through the power of AI. We help you express what matters most, when it matters most.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Product</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><Link href="#features" className="hover:text-purple-400 transition-colors">Features</Link></li>
                            <li><Link href="#pricing" className="hover:text-purple-400 transition-colors">Pricing</Link></li>
                            <li><Link href="/login" className="hover:text-purple-400 transition-colors">Login</Link></li>
                            <li><Link href="/signup" className="hover:text-purple-400 transition-colors">Sign Up</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Legal</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><Link href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-purple-400 transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-purple-400 transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-500 text-sm font-medium mb-4 md:mb-0">
                        &copy; {new Date().getFullYear()} Wishes AI. Crafted with <Heart className="w-4 h-4 inline text-red-500 mx-1 fill-current" /> by the Future.
                    </p>

                    <div className="flex space-x-6 text-gray-400">
                        <a href="#" className="hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
                        <a href="#" className="hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
                        <a href="#" className="hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
