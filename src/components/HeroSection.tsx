import React, { useState, useEffect,useRef} from 'react';

import { Shield, Zap, Lock, Globe, ArrowRight, Play } from 'lucide-react';

interface HeroSectionProps {
  onTryNow: () => void;
  onLearnMore: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onTryNow, onLearnMore }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Quantum particle animation
  useEffect(() => {
    if (isMobile || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }> = [];

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${particle.opacity})`;
        ctx.fill();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isMobile]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black pt-20 sm:pt-24">
      {/* Quantum Canvas Background */}
      {!isMobile && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: 0.6 }}
        />
      )}
      
      {/* Enhanced Animated Quantum Background */}
      <div className="absolute inset-0">
        {/* Main gradient background with parallax */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        >
          <div className="absolute inset-0 opacity-60">
            {/* Mobile-optimized background pattern */}
            <div className="absolute inset-0 md:hidden" style={{ 
              backgroundImage: `radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.12) 1px, transparent 1px), radial-gradient(circle at 70% 70%, rgba(59, 130, 246, 0.12) 1px, transparent 1px)`,
              backgroundSize: '40px 40px, 60px 60px',
              animation: 'float 15s ease-in-out infinite'
            }}></div>
            
            {/* Desktop background pattern */}
            <div className="absolute inset-0 hidden md:block" style={{ 
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.15) 2px, transparent 2px), radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.15) 2px, transparent 2px)`,
              backgroundSize: '80px 80px, 120px 120px',
              animation: 'float 20s ease-in-out infinite'
            }}></div>
          </div>
        </div>
        
        {/* Mobile-optimized floating quantum particles */}
        {isMobile && (
          <div className="absolute inset-0">
            {[...Array(6)].map((_, i) => (
              <div
                key={`mobile-${i}`}
                className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                  opacity: 0.2 + Math.random() * 0.3,
                  boxShadow: '0 0 8px rgba(139, 92, 246, 0.4)'
                }}
              />
            ))}
          </div>
        )}

        {/* Desktop floating quantum particles with enhanced animation */}
        {!isMobile && (
          <div className="absolute inset-0">
            {[...Array(12)].map((_, i) => (
              <div
                key={`desktop-${i}`}
                className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`,
                  opacity: 0.3 + Math.random() * 0.4,
                  boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)'
                }}
              />
            ))}
          </div>
        )}

        {/* Enhanced mouse-following quantum field */}
        {!isMobile && (
          <div 
            className="absolute w-96 h-96 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(4, 41, 86, 0.15) 0%, transparent 70%)',
              left: mousePosition.x - 192,
              top: mousePosition.y - 192,
              transition: 'all 0.2s ease-out',
              boxShadow: '0 0 60px rgba(4, 41, 86, 0.3)'
            }}
          />
        )}

        {/* Enhanced animated quantum rings with rotation */}
        {!isMobile && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="absolute w-96 h-96 border border-[#042956]/30 rounded-full animate-spin-slow" style={{ boxShadow: '0 0 20px rgba(4, 41, 86, 0.3)' }}></div>
            <div className="absolute w-80 h-80 border border-[#EC710A]/30 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse', boxShadow: '0 0 20px rgba(236, 113, 10, 0.3)' }}></div>
            <div className="absolute w-64 h-64 border border-[#EC710A]/20 rounded-full animate-spin-slow" style={{ boxShadow: '0 0 20px rgba(236, 113, 10, 0.2)' }}></div>
          </div>
        )}
      </div>

      {/* Enhanced Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Mobile-optimized floating feature cards */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none md:hidden">
          <div className="absolute top-8 left-4 w-12 h-12 bg-[#042956]/20 backdrop-blur-lg border border-[#042956]/30 rounded-xl flex items-center justify-center animate-float" style={{ animationDelay: '0s' }}>
            <Shield className="w-5 h-5 text-[#042956]" />
          </div>
          <div className="absolute top-8 right-4 w-12 h-12 bg-[#EC710A]/20 backdrop-blur-lg border border-[#EC710A]/30 rounded-xl flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
            <Zap className="w-5 h-5 text-[#EC710A]" />
          </div>
          {/* <div className="absolute bottom-32 left-4 w-12 h-12 bg-cyan-600/20 backdrop-blur-lg border border-cyan-500/30 rounded-xl flex items-center justify-center animate-float" style={{ animationDelay: '2s' }}>
            <Lock className="w-5 h-5 text-cyan-400" />
          </div> */}
        </div>

        {/* Desktop floating feature cards */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none hidden md:block">
          <div className="absolute top-10 left-10 w-20 h-20 bg-[#042956]/20 backdrop-blur-lg border border-[#042956]/30 rounded-2xl flex items-center justify-center animate-float" style={{ animationDelay: '0s' }}>
            <Shield className="w-8 h-8 text-[#042956]" />
          </div>
          <div className="absolute top-10 right-10 w-20 h-20 bg-[#EC710A]/20 backdrop-blur-lg border border-[#EC710A]/30 rounded-2xl flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
            <Zap className="w-8 h-8 text-[#EC710A]" />
          </div>
          {/* <div className="absolute bottom-20 left-20 w-20 h-20 bg-cyan-600/20 backdrop-blur-lg border border-cyan-500/30 rounded-2xl flex items-center justify-center animate-float" style={{ animationDelay: '2s' }}>
            <Lock className="w-8 h-8 text-cyan-400" />
          </div> */}
        </div>

        {/* Enhanced main heading with better mobile typography */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-tight mb-6 sm:mb-8 md:mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <span className="block mb-1 sm:mb-2 md:mb-4 text-white drop-shadow-2xl">
            Quantum
          </span>
          <span className="block text-[#EC710A] drop-shadow-2xl">
            Encrypted
          </span>
          <span className="block text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl mt-2 sm:mt-4 md:mt-6 text-white/80 font-light">
            Communications
          </span>
        </h1>

        {/* Enhanced description with better mobile spacing */}
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/70 leading-relaxed mb-8 sm:mb-12 md:mb-16 max-w-3xl md:max-w-4xl mx-auto animate-fade-in-up px-4" style={{ animationDelay: '0.4s' }}>
          Harness the power of quantum mechanics for unhackable encryption. 
          <span className="block mt-1 sm:mt-2 md:mt-3 text-lg sm:text-xl md:text-2xl lg:text-4xl text-[#EC710A] font-bold">
            Protect your data with quantum key distribution.
          </span>
        </p>

        {/* Enhanced CTA Buttons with better mobile design */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center items-stretch sm:items-center mb-12 sm:mb-16 md:mb-20 animate-fade-in-up px-4 w-full max-w-2xl mx-auto" style={{ animationDelay: '0.6s' }}>
          <button
            onClick={onTryNow}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative overflow-hidden rounded-xl bg-[#EC710A] hover:bg-[#042956] px-8 py-4 text-base sm:text-lg font-bold text-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#EC710A] w-full sm:w-auto"
          >
            <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
              <ArrowRight className="w-5 h-5" />
              <span>Launch Portal</span>
            </span>
          </button>
          
          <button 
            onClick={onLearnMore}
            className="group px-8 py-4 border-2 border-white/30 rounded-xl text-white font-semibold text-base sm:text-lg backdrop-blur-lg hover:bg-white/10 hover:border-white/50 transition-all duration-300 w-full sm:w-auto"
          >
            <span className="flex items-center justify-center gap-2 sm:gap-3">
              <Play className="w-5 h-5" />
              <span>Watch Demo</span>
            </span>
          </button>
        </div>

        {/* Enhanced security indicators with icons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-3xl sm:max-w-4xl mx-auto mb-12 sm:mb-16 md:mb-20 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <div className="group text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-cyan-600/20 backdrop-blur-lg border border-cyan-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-400 mb-1 sm:mb-2">256-bit</div>
            <div className="text-xs sm:text-sm md:text-base text-white/60 uppercase tracking-wider">Quantum Keys</div>
          </div>
          <div className="group text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-600/20 backdrop-blur-lg border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-400 mb-1 sm:mb-2">0.003s</div>
            <div className="text-xs sm:text-sm md:text-base text-white/60 uppercase tracking-wider">Latency</div>
          </div>
          <div className="group text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-600/20 backdrop-blur-lg border border-green-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
            </div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-400 mb-1 sm:mb-2">100%</div>
            <div className="text-xs sm:text-sm md:text-base text-white/60 uppercase tracking-wider">Secure</div>
          </div>
        </div>
      </div>

      {/* Enhanced Scroll indicator - mobile and desktop versions */}
      {isMobile ? (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center text-white/40">
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span className="text-xs uppercase tracking-wider">Swipe</span>
          </div>
        </div>
      ) : (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center text-white/40">
            <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span className="text-xs uppercase tracking-wider">Scroll</span>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;