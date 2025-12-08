import React, { useState } from 'react';
import { Shield, Layers, Globe, Users, Zap, Lock, Network, Eye } from 'lucide-react';

const FeaturesSection: React.FC = () => {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: Shield,
      title: 'Quantum Key Distribution',
      description: 'Leverage quantum mechanics to distribute encryption keys with absolute security',
      tech: 'QKD-256 Protocol'
    },
    {
      icon: Layers,
      title: 'Multi-Level Encryption',
      description: 'Choose from quantum-secure, quantum-aided, or post-quantum encryption modes',
      tech: 'AES-256 + Quantum'
    },
    {
      icon: Globe,
      title: 'Universal Compatibility',
      description: 'Works with Gmail, Outlook, and all standard email providers seamlessly',
      tech: 'API-First Design'
    },
    {
      icon: Users,
      title: 'Easy Collaboration',
      description: 'Share quantum-secured emails and attachments with your team effortlessly',
      tech: 'Real-time Sync'
    }
  ];

  return (
    <section id="features" className="relative py-20 sm:py-32 bg-slate-900 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 backdrop-blur-lg border border-blue-500/30 rounded-full px-4 py-2 mb-6">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-white/90 font-medium">QUANTUM FEATURES</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6">
            <span className="text-white">
              Revolutionary
            </span>
            <br />
            <span className="text-blue-400">
              Security Features
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-white/70 max-w-4xl mx-auto leading-relaxed">
            Experience the next generation of email security with quantum-powered encryption
            <span className="block text-blue-400 font-medium mt-2">
              and seamless integration with your existing workflow.
            </span>
          </p>
        </div>
        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-0">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 hover:border-blue-500/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                {/* Glow Effect on Hover */}
                
                <div className="relative z-10">
                  {/* Icon Container */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                    <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                  
                  {/* Tech Badge */}
                  <div className="inline-block text-xs text-blue-400 font-mono bg-blue-500/10 px-2 py-1 rounded-full mb-3">
                    {feature.tech}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-white/60 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 sm:mt-20">
          <div className="inline-flex items-center space-x-2 text-white/60">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">All features powered by quantum encryption</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;