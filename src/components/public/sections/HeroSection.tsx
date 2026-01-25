import React from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { SiteContent } from '@/types';

interface HeroSectionProps {
  content: SiteContent;
  onCtaClick: () => void;
  onSecondaryClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  content,
  onCtaClick,
  onSecondaryClick,
}) => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-corporate-950">
      {/* Background Image & Effects */}
      <img
        src={
          content.hero.imageUrl ||
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80'
        }
        alt="Industrial Architecture"
        className="absolute inset-0 w-full h-full object-cover transform scale-105 animate-slow-zoom opacity-80"
      />

      {/* Professional Gradients for Text Legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-corporate-950 via-corporate-950/60 to-transparent z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-corporate-950 via-transparent to-transparent z-10"></div>

      {/* Subtle Grid Accent */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-20">
        <div className="absolute top-0 right-1/4 w-px h-full bg-white/20"></div>
        <div className="absolute top-1/2 left-0 w-full h-px bg-white/20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full py-20">
        <div className="max-w-4xl space-y-10 animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center bg-white/5 border-l-4 border-enea-accent px-4 py-2 backdrop-blur-sm">
            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-corporate-200">
              Pionnier de l'Infrastructure • {content.country}
            </span>
          </div>

          {/* Industrial Headline - Taille corrigée */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl lg:text-8xl font-display font-black text-white leading-[1.1] tracking-tighter uppercase">
              {content.hero.title.split(' ').map((word, i) => (
                <span key={i} className="block group overflow-hidden">
                  <span className="inline-block transition-transform duration-700 group-hover:translate-x-3">
                    {word === 'Infrastructures' || word === 'Avenir' ? (
                      <span className="text-enea-accent">{word}</span>
                    ) : (
                      word
                    )}
                  </span>
                </span>
              ))}
            </h1>

            <div className="flex items-start gap-6 max-w-2xl">
              <div className="w-1.5 h-20 bg-enea-accent shrink-0 hidden md:block"></div>
              <p className="text-lg md:text-xl text-corporate-300 font-light leading-relaxed">
                {content.hero.subtitle}
              </p>
            </div>
          </div>

          {/* Actions - Hauteur corrigée */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 pt-4">
            <button
              onClick={onCtaClick}
              className="group relative h-16 md:h-20 px-10 bg-enea-accent text-white overflow-hidden transition-all duration-500 hover:bg-blue-700 flex items-center justify-center gap-4"
            >
              <span className="text-base md:text-lg font-black uppercase tracking-widest relative z-10">
                Démarrer Projet
              </span>
              <ArrowRight
                size={22}
                className="relative z-10 group-hover:translate-x-2 transition-transform"
              />
            </button>

            <button
              onClick={onSecondaryClick}
              className="group h-16 md:h-20 px-10 bg-white/5 border border-white/10 text-white hover:bg-white hover:text-corporate-950 transition-all duration-500 flex items-center justify-center gap-4"
            >
              <span className="text-base md:text-lg font-black uppercase tracking-widest">
                Expertises
              </span>
              <ChevronDown size={20} className="group-hover:translate-y-1 transition-transform" />
            </button>
          </div>

          {/* Stats - Taille de police ajustée */}
          <div className="pt-16 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: 'Projets Déployés', value: '500+' },
              { label: 'Partenaires', value: '25+' },
              { label: 'Expansion', value: '10 Pays' },
              { label: 'Expertise', value: 'Tier III' },
            ].map((stat, i) => (
              <div key={i} className="relative pl-6 border-l border-white/10 group cursor-default">
                <div className="absolute top-0 left-0 w-1 h-0 bg-enea-accent group-hover:h-full transition-all duration-500"></div>
                <div className="text-2xl md:text-3xl font-display font-black text-white mb-1 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-[9px] uppercase tracking-widest font-bold text-corporate-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 right-0 z-20 hidden lg:flex items-center gap-8 origin-bottom rotate-[-90deg] translate-y-[-50%]">
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 whitespace-nowrap">
          SCROLL TO EXPLORE
        </span>
        <div className="w-24 h-[1px] bg-white/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-full bg-enea-accent -translate-x-full animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};
