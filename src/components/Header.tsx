import React, { useState, useEffect } from 'react';
import { Shield, Menu, X, Zap, Lock, Globe } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  onGetStarted: () => void;
}

const Header: React.FC<HeaderProps> = ({ onGetStarted }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-slate-900/98 backdrop-blur-2xl border-b border-purple-500/20 shadow-2xl shadow-purple-500/10' : 'bg-slate-900/90 backdrop-blur-xl border-b border-slate-700/30'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Enhanced Logo */}
          <div className="flex items-center space-x-3 group">
            <div className="relative w-12 h-12 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-xl flex items-center justify-center transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-purple-500/25">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <Shield className="w-6 h-6 text-white relative z-10" />
            </div>
            <div className="group">
              <h1 className="text-2xl font-black bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-cyan-300 transition-all duration-300">
                Qumail
              </h1>
              <p className="text-xs text-purple-400/80 font-medium tracking-wider uppercase">Quantum Secured</p>
            </div>
          </div>

          {/* Enhanced Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {[
              { href: '#features', label: 'Features', icon: Zap },
              { href: '#security', label: 'Security', icon: Lock },
              { href: '#pricing', label: 'Pricing', icon: Globe },
              { href: '#about', label: 'About', icon: null },
              { href: '#contact', label: 'Contact', icon: null }
            ].map((item, index) => (
              <a
                key={item.href}
                href={item.href}
                className="group relative px-4 py-2 text-slate-300 hover:text-white transition-all duration-300 font-medium hover:bg-white/10 rounded-lg"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {item.icon && <item.icon className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />}
                  {item.label}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </a>
            ))}
          </nav>

          {/* Enhanced Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden relative group flex items-center justify-center w-12 h-12 text-white hover:bg-white/10 rounded-xl transition-all duration-300 transform hover:scale-110"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"></div>
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 relative z-10 transition-transform duration-300 rotate-90" />
            ) : (
              <Menu className="w-6 h-6 relative z-10" />
            )}
          </button>

          {/* Enhanced Theme Toggle and CTA Button - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="p-1 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <ThemeToggle />
            </div>
            <button
              onClick={onGetStarted}
              className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white px-8 py-3 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/40"
            >
              <span className="relative z-10 flex items-center gap-2">
                Launch Portal
                <Zap className="w-4 h-4 group-hover:animate-pulse" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-purple-500/20 py-6 bg-slate-900/95 backdrop-blur-xl">
            <nav className="flex flex-col space-y-2 px-4">
              {[
                { href: '#features', label: 'Features', icon: Zap },
                { href: '#security', label: 'Security', icon: Lock },
                { href: '#pricing', label: 'Pricing', icon: Globe },
                { href: '#about', label: 'About', icon: null },
                { href: '#contact', label: 'Contact', icon: null }
              ].map((item, index) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-3 text-slate-300 hover:text-white transition-all duration-300 font-medium py-3 px-4 rounded-lg hover:bg-white/10"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {item.icon && (
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <item.icon className="w-4 h-4" />
                    </div>
                  )}
                  <span>{item.label}</span>
                </a>
              ))}
              <div className="flex items-center space-x-3 pt-4 border-t border-purple-500/20">
                <div className="p-1 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <ThemeToggle />
                </div>
                <button
                  onClick={onGetStarted}
                  className="flex-1 group relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-500 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/40"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Launch Portal
                    <Zap className="w-4 h-4 group-hover:animate-pulse" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;