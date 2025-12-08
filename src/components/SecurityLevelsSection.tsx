import React, { useState } from 'react';
import { Shield, Zap, Lock, Wifi } from 'lucide-react';

const SecurityLevelsSection: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const securityLevels = [
    {
      id: 'quantum-secure',
      name: 'Quantum Secure',
      icon: Shield,
      description: 'One-Time Pad encryption using QKD keys for unbreakable security',
      keyRequirement: '1024 bytes',
      color: 'from-red-600 to-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
    {
      id: 'quantum-aided',
      name: 'Quantum-Aided AES',
      icon: Zap,
      description: 'AES encryption seeded with quantum-distributed keys',
      keyRequirement: '32 bytes',
      color: 'from-blue-600 to-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      id: 'post-quantum',
      name: 'Post-Quantum',
      icon: Lock,
      description: 'Quantum-resistant algorithms for future-proof security',
      keyRequirement: '64 bytes',
      color: 'from-green-600 to-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      id: 'standard',
      name: 'Standard',
      icon: Wifi,
      description: 'Traditional encryption methods for compatibility',
      keyRequirement: 'None',
      color: 'from-gray-600 to-gray-500',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600',
    },
  ];

  return (
    <section id="security" className="relative py-20 sm:py-32 bg-slate-900 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-32 right-10 w-72 h-72 bg-[#042956] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-32 left-10 w-72 h-72 bg-cyan-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-3000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center space-x-2 bg-[#042956]/10 backdrop-blur-lg border border-[#042956]/30 rounded-full px-4 py-2 mb-6">
            <div className="w-2 h-2 bg-[#042956] rounded-full animate-pulse"></div>
            <span className="text-sm text-white/90 font-medium">SECURITY LEVELS</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6">
            <span className="text-white">
              Choose Your
            </span>
            <br />
            <span className="text-[#042956]">
              Security Level
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-white/70 max-w-4xl mx-auto leading-relaxed">
            Select the perfect balance of security and performance for your communication needs.
          </p>
        </div>
        {/* Security Levels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-0">
          {securityLevels.map((level) => {
            const IconComponent = level.icon;
            const isSelected = selectedLevel === level.id;
            
            return (
              <div
                key={level.id}
                className={`group relative bg-white/5 backdrop-blur-xl border ${isSelected ? 'border-[#042956]/50' : 'border-white/10'} rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 hover:border-[#042956]/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer`}
                onClick={() => setSelectedLevel(level.id)}
              >
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-[#042956] rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
                
                {/* Icon Container */}
                <div className={`w-16 h-16 ${level.id === 'quantum-secure' ? 'bg-red-600' : level.id === 'quantum-aided' ? 'bg-blue-600' : level.id === 'post-quantum' ? 'bg-green-600' : 'bg-gray-600'} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                
                {/* Security Level Badge */}
                <div className="inline-block text-xs text-[#042956] font-mono bg-[#042956]/10 px-2 py-1 rounded-full mb-3">
                  {level.keyRequirement}
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-[#EC710A] transition-colors duration-300">
                  {level.name}
                </h3>
                
                {/* Description */}
                <p className="text-sm text-white/60 leading-relaxed mb-6">
                  {level.description}
                </p>
                
                {/* Key Requirement */}
                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/40 font-medium uppercase tracking-wider">Key Requirement</span>
                    <span className="text-sm font-bold text-[#042956]">{level.keyRequirement}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Info */}
        <div className="text-center mt-16 sm:mt-20">
          <div className="inline-flex items-center space-x-2 text-white/60">
            <div className="w-2 h-2 bg-[#042956] rounded-full animate-pulse"></div>
            <span className="text-sm">Click to select your preferred security level</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecurityLevelsSection;