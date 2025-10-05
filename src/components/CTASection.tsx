import React from 'react';
import { Download } from 'lucide-react';

interface CTASectionProps {
  onStartFreeTrial: () => void;
}

const CTASection: React.FC<CTASectionProps> = ({ onStartFreeTrial }) => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-4xl mx-auto text-center px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Secure Your
          <br />
          Communication?
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          Join thousands of organizations already using Qubits for quantum-secured email communication.
        </p>
        
        <button
          onClick={onStartFreeTrial}
          className="inline-flex items-center space-x-3 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-xl"
        >
          <Download className="w-5 h-5" />
          <span>Start Free Trial</span>
        </button>
        
        {/* Trust Indicators */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-white mb-2">256-bit</div>
            <div className="text-blue-200 text-sm">Quantum Encryption</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-2">99.9%</div>
            <div className="text-blue-200 text-sm">Uptime Guarantee</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-2">24/7</div>
            <div className="text-blue-200 text-sm">Expert Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;