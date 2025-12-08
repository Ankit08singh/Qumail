import React from 'react';
import { Shield, Mail, Phone, MapPin, Github, Twitter, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-slate-950 text-white py-16 sm:py-20 overflow-hidden border-t border-slate-800">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-20 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-5 animate-pulse"></div>
        <div className="absolute bottom-10 left-20 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-5 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-blue-400">Qubits</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              The world's first quantum-secured email client for ultimate communication security.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/10 hover:border-blue-500/40 transition-all duration-300 group">
                <Twitter className="w-5 h-5 text-white/70 group-hover:text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/10 hover:border-blue-500/40 transition-all duration-300 group">
                <Github className="w-5 h-5 text-white/70 group-hover:text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/10 hover:border-blue-500/40 transition-all duration-300 group">
                <Linkedin className="w-5 h-5 text-white/70 group-hover:text-white" />
              </a>
            </div>
          </div>
          
          {/* Product */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-white">Product</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#features" className="text-white/60 hover:text-blue-400 transition-colors duration-300">Features</a></li>
              <li><a href="#security" className="text-white/60 hover:text-blue-400 transition-colors duration-300">Security</a></li>
              <li><a href="#pricing" className="text-white/60 hover:text-blue-400 transition-colors duration-300">Pricing</a></li>
              <li><a href="#demo" className="text-white/60 hover:text-blue-400 transition-colors duration-300">Demo</a></li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-white">Company</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#about" className="text-white/60 hover:text-blue-400 transition-colors duration-300">About</a></li>
              <li><a href="#contact" className="text-white/60 hover:text-blue-400 transition-colors duration-300">Contact</a></li>
              <li><a href="#careers" className="text-white/60 hover:text-blue-400 transition-colors duration-300">Careers</a></li>
              <li><a href="#press" className="text-white/60 hover:text-blue-400 transition-colors duration-300">Press</a></li>
            </ul>
          </div>
          
          {/* Support & Contact */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-white">Support</h3>
            <ul className="space-y-3 text-sm mb-6">
              <li><a href="#help" className="text-white/60 hover:text-blue-400 transition-colors duration-300">Help Center</a></li>
              <li><a href="#community" className="text-white/60 hover:text-blue-400 transition-colors duration-300">Community</a></li>
              <li><a href="#status" className="text-white/60 hover:text-blue-400 transition-colors duration-300">Status</a></li>
            </ul>
            
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
          <p className="text-white/40 text-sm">
            © 2025 QuMail. All rights reserved. Powered by quantum encryption
          </p>
          <div className="flex flex-wrap items-center space-x-6">
            <a href="#privacy" className="text-white/40 hover:text-blue-400 text-sm transition-colors duration-300">
              Privacy Policy
            </a>
            <a href="#terms" className="text-white/40 hover:text-blue-400 text-sm transition-colors duration-300">
              Terms of Service
            </a>
            <a href="#cookies" className="text-white/40 hover:text-blue-400 text-sm transition-colors duration-300">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;