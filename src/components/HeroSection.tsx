import React from 'react';

interface HeroSectionProps {
  onTryNow: () => void;
  onLearnMore: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onTryNow, onLearnMore }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-blue-900/90 to-indigo-900/90">
        <div className="absolute inset-0 opacity-50">
          <div className="absolute inset-0" style={{ 
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-6">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-white/90 font-medium">GLOBAL NETWORK</span>
          </div>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-8">
          Worldwide Quantum
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Infrastructure
          </span>
        </h1>

        <p className="text-xl sm:text-2xl text-white/80 leading-relaxed mb-12 max-w-3xl mx-auto">
          Access our global quantum key distribution network ensuring secure
          <br />
          communications across continents with ultra-low latency.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <button
            onClick={onTryNow}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-700 px-8 py-4 text-lg font-bold uppercase text-white transition-all duration-300 hover:from-blue-700 hover:to-purple-800 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
          >
            <span className="relative z-10">Try Qubits Now</span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"></div>
          </button>
          
          <button 
            onClick={onLearnMore}
            className="px-8 py-4 border-2 border-white/30 rounded-xl text-white font-bold text-lg backdrop-blur-sm hover:bg-white/10 hover:border-white/50 transition-all duration-300"
          >
            Learn More
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-white/30 rounded-full"></div>
          <div className="w-2 h-2 bg-white/30 rounded-full"></div>
          <div className="w-2 h-2 bg-white/30 rounded-full"></div>
          <div className="w-2 h-2 bg-white/30 rounded-full"></div>
          <div className="w-8 h-2 bg-blue-500 rounded-full"></div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  );
};

export default HeroSection;