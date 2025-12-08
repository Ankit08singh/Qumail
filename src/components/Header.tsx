import React, { useState, useEffect } from 'react';
import { Menu, X, Zap, Lock, Globe } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';

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
          <Logo className="h-8 sm:h-10 w-auto" priority />

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
              </a>
            ))}
          </nav>

          {/* Enhanced Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden relative group flex items-center justify-center w-12 h-12 text-white hover:bg-white/10 rounded-xl transition-all duration-300 transform hover:scale-110"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 relative z-10 transition-transform duration-300 rotate-90" />
            ) : (
              <Menu className="w-6 h-6 relative z-10" />
            )}
          </button>

          {/* Enhanced Theme Toggle and CTA Button - Desktop */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
            <div className="p-1 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <ThemeToggle />
            </div>
            <button
              onClick={onGetStarted}
              className="group relative overflow-hidden bg-blue-600 hover:bg-blue-500 text-white px-4 lg:px-8 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl font-bold text-xs lg:text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-xl"
            >
              <span className="relative z-10 flex items-center gap-1.5 lg:gap-2">
                Launch Portal
                <Zap className="w-3.5 h-3.5 lg:w-4 lg:h-4 group-hover:animate-pulse" />
              </span>
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
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
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
                  className="flex-1 group relative overflow-hidden bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-lg"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Launch Portal
                    <Zap className="w-4 h-4 group-hover:animate-pulse" />
                  </span>
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