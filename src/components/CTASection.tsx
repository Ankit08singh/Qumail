import React from 'react';
import { Download, Zap, Shield, Headphones } from 'lucide-react';

interface CTASectionProps {
  onStartFreeTrial: () => void;
}

const CTASection: React.FC<CTASectionProps> = ({ onStartFreeTrial }) => {
  return (
    <section className="relative py-20 sm:py-32 bg-slate-900 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-[#EC710A] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#042956] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative max-w-6xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 sm:mb-12">
          <div className="inline-flex items-center space-x-2 bg-[#EC710A]/10 backdrop-blur-lg border border-[#EC710A]/30 rounded-full px-4 py-2 mb-6">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-white/90 font-medium">GET STARTED</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6">
            <span className="text-white">
              Ready to Secure Your
            </span>
            <br />
            <span className="text-[#EC710A]">
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
          className="group relative overflow-hidden bg-[#EC710A] hover:bg-[#042956] text-white px-8 sm:px-12 py-4 sm:py-6 rounded-2xl font-bold text-lg sm:text-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <span className="relative z-10 flex items-center space-x-3">
            <Download className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Start Free Trial</span>
          </span>
        </button>
        
        {/* Trust Indicators */}
        <div className="mt-12 sm:mt-16 lg:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-0 text-center">
          <div className="group">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#EC710A] rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-105 transition-transform">
              <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">256-bit</div>
            <div className="text-[#EC710A] text-xs sm:text-sm font-medium">Quantum Encryption</div>
          </div>
          <div className="group">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-cyan-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-105 transition-transform">
              <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">99.9%</div>
            <div className="text-[#EC710A] text-xs sm:text-sm font-medium">Uptime Guarantee</div>
          </div>
          <div className="group">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#042956] rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-105 transition-transform">
              <Headphones className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">24/7</div>
            <div className="text-[#EC710A] text-xs sm:text-sm font-medium">Expert Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;