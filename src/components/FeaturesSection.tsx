import React from 'react';
import { Shield, Layers, Globe, Users } from 'lucide-react';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Shield,
      title: 'Quantum Key Distribution',
      description: 'Leverage quantum mechanics to distribute encryption keys with absolute security',
    },
    {
      icon: Layers,
      title: 'Multi-Level Encryption',
      description: 'Choose from quantum-secure, quantum-aided, or post-quantum encryption modes',
    },
    {
      icon: Globe,
      title: 'Universal Compatibility',
      description: 'Works with Gmail, Outlook, and all standard email providers seamlessly',
    },
    {
      icon: Users,
      title: 'Easy Collaboration',
      description: 'Share quantum-secured emails and attachments with your team effortlessly',
    },
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-blue-600">
            Revolutionary Security Features
          </h2>
          <p className="text-xl max-w-3xl mx-auto text-blue-800/70">
            Experience the next generation of email security with quantum-powered encryption
            and seamless integration with your existing workflow.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-t-4 border-blue-600"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;