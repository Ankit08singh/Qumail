import React from 'react';
import { Download, Zap, Shield, Headphones } from 'lucide-react';

interface CTASectionProps {
  onStartFreeTrial: () => void;
}

const CTASection: React.FC<CTASectionProps> = ({ onStartFreeTrial }) => {
  return (
    <section className="relative py-20 sm:py-32 bg-gradient-to-br from-purple-900 via-blue-900 to-slate-900 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative max-w-6xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 sm:mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-lg border border-purple-500/30 rounded-full px-4 py-2 mb-6">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-white/90 font-medium">GET STARTED</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
              Ready to Secure Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Communication?
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Join thousands of organizations already using Qubits for quantum-secured email communication.
          </p>
        </div>
        
        {/* CTA Button */}
        <button
          onClick={onStartFreeTrial}
          className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white px-8 sm:px-12 py-4 sm:py-6 rounded-2xl font-semibold text-lg sm:text-xl hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1"
        >
          <span className="relative z-10 flex items-center space-x-3">
            <Download className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Start Free Trial</span>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full"></div>
        </button>
        
        {/* Trust Indicators */}
        <div className="mt-16 sm:mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="group">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-2">256-bit</div>
            <div className="text-blue-400 text-sm font-medium">Quantum Encryption</div>
          </div>
          <div className="group">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-2">99.9%</div>
            <div className="text-blue-400 text-sm font-medium">Uptime Guarantee</div>
          </div>
          <div className="group">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Headphones className="w-8 h-8 text-white" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-2">24/7</div>
            <div className="text-blue-400 text-sm font-medium">Expert Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;