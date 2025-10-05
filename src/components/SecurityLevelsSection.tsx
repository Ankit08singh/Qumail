import React from 'react';
import { Shield, Zap, Lock, Wifi } from 'lucide-react';

const SecurityLevelsSection: React.FC = () => {
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
    <section id="security" className="py-20 bg-blue-50/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-blue-600">
            Choose Your Security Level
          </h2>
          <p className="text-xl max-w-3xl mx-auto text-blue-800/70">
            Select the perfect balance of security and performance for your communication needs.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {securityLevels.map((level) => {
            const IconComponent = level.icon;
            return (
              <div
                key={level.id}
                className={`group ${level.bgColor} rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border-t-4 border-blue-600`}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${level.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                
                <h3 className={`text-xl font-bold ${level.textColor} mb-4`}>
                  {level.name}
                </h3>
                
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {level.description}
                </p>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 font-medium">Key Requirement:</span>
                    <span className={`text-sm font-bold ${level.textColor}`}>{level.keyRequirement}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SecurityLevelsSection;