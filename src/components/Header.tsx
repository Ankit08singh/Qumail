import React from 'react';
import { Shield } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  onGetStarted: () => void;
}

const Header: React.FC<HeaderProps> = ({ onGetStarted }) => {
  return (
    <header className="relative z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Qubits</h1>
              <p className="text-xs text-gray-400">Quantum Secured Email</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors font-medium">
              Features
            </a>
            <a href="#security" className="text-gray-300 hover:text-white transition-colors font-medium">
              Security
            </a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors font-medium">
              Pricing
            </a>
            <a href="#about" className="text-gray-300 hover:text-white transition-colors font-medium">
              About
            </a>
            <a href="#contact" className="text-gray-300 hover:text-white transition-colors font-medium">
              Contact
            </a>
          </nav>

          {/* Theme Toggle and CTA Button */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Get Started →
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;