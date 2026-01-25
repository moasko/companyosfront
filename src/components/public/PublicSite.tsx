import React, { useState, useEffect } from 'react';
import { Menu, X, Lock, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { SiteContent } from '@/types';
import { HeroSection } from './sections/HeroSection';
import { AboutSection } from './sections/AboutSection';
import { StatsSection } from './sections/StatsSection';
import { ServicesSection } from './sections/ServicesSection';
import { GallerySection } from './sections/GallerySection';
import { LocationsSection } from './sections/LocationsSection';
import { CareersSection } from './sections/CareersSection';
import { ContactSection } from './sections/ContactSection';

interface PublicSiteProps {
  content: SiteContent;
  onAdminClick: () => void;
}

export const PublicSite: React.FC<PublicSiteProps> = ({ content, onAdminClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll listener for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // SEO Management
  useEffect(() => {
    document.title = content.seo?.metaTitle || `${content.entityName} - Infrastructure`;

    const updateMeta = (name: string, contentStr: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', contentStr || '');
    };

    updateMeta('description', content.seo?.metaDescription);
    updateMeta('keywords', content.seo?.metaKeywords);
  }, [content]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const renderLogo = (isDark = false) => {
    const parts = content.entityName.split(' ');
    const firstPart = parts[0];
    const rest = parts.slice(1).join(' ');
    return (
      <span
        className={`text-2xl font-display font-black tracking-tighter ${isDark ? 'text-white' : 'text-corporate-900'}`}
      >
        {firstPart}
        <span className="text-enea-accent">{rest ? ` ${rest}` : ''}</span>
      </span>
    );
  };

  const navLinks = [
    { label: 'Société', id: 'societe' },
    { label: 'Domaines', id: 'services' },
    { label: 'Expertises', id: 'realisations' },
    { label: 'Réseau', id: 'presence' },
    { label: 'Talents', id: 'carrieres' },
  ];

  return (
    <div className="min-h-screen bg-corporate-50 font-sans text-corporate-900 selection:bg-enea-accent selection:text-white">
      {/* Modern Navbar */}
      <nav
        className={`fixed w-full z-50 transition-all duration-500 ${
          scrolled ? 'glass-card shadow-2xl shadow-corporate-900/5 py-4' : 'bg-transparent py-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div
              className="cursor-pointer group flex items-center gap-3"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="flex flex-col">
                {renderLogo(!scrolled)}
                <div
                  className={`text-[9px] font-black uppercase tracking-[0.4em] mt-0.5 transition-colors ${scrolled ? 'text-corporate-400' : 'text-white/60'}`}
                >
                  Group Infrastructure
                </div>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-10">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:text-enea-accent relative group/link ${
                    scrolled ? 'text-corporate-600' : 'text-white/90'
                  }`}
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-enea-accent transition-all group-hover/link:w-full"></span>
                </button>
              ))}

              <div className="pl-6 border-l border-white/10 flex items-center gap-6">
                <button
                  onClick={onAdminClick}
                  className={`p-2.5 transition-all ${
                    scrolled
                      ? 'bg-corporate-100 text-corporate-400 hover:text-corporate-900'
                      : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                  title="Système Interne"
                >
                  <Lock size={16} />
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="bg-enea-accent hover:bg-blue-600 text-white px-8 py-3 font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                >
                  Consultation
                </button>
              </div>
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-3 transition-colors ${scrolled ? 'bg-corporate-100 text-corporate-900' : 'bg-white/10 text-white'}`}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full glass-card border-b border-corporate-100 shadow-2xl animate-in fade-in slide-in-up">
            <div className="p-6 space-y-3">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="block w-full text-left px-5 py-4 text-xs font-black uppercase tracking-[0.2em] text-corporate-600 hover:bg-corporate-50 hover:text-enea-accent transition-all"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-6 mt-4 border-t border-corporate-100 flex flex-col gap-4">
                <button
                  onClick={() => {
                    scrollToSection('contact');
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-enea-accent text-white px-6 py-4 font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20"
                >
                  Nous Contacter
                </button>
                <button
                  onClick={() => {
                    onAdminClick();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-corporate-400 text-[10px] font-black uppercase tracking-widest text-center hover:text-corporate-900"
                >
                  Accès Système
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main>
        <HeroSection
          content={content}
          onCtaClick={() => scrollToSection('contact')}
          onSecondaryClick={() => scrollToSection('realisations')}
        />

        <AboutSection about={content.about} />

        <StatsSection stats={content.stats} />

        <ServicesSection services={content.services} />

        <GallerySection realizations={content.realizations} />

        <LocationsSection locations={content.locations} currentCountry={content.country} />

        <CareersSection careers={content.careers} />

        <ContactSection contact={content.contact} entityName={content.entityName} />
      </main>

      {/* Modern Footer */}
      <footer className="bg-corporate-950 text-corporate-400 py-24 border-t border-white/5 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-enea-accent/5 rounded-none blur-[120px] translate-x-1/2 translate-y-1/2 opacity-30"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-20 mb-24">
            <div className="lg:col-span-5 space-y-8">
              <div className="flex flex-col">
                {renderLogo(true)}
                <div className="text-[10px] font-black uppercase tracking-[0.5em] mt-1 text-corporate-500">
                  Engineering Future Infrastructure
                </div>
              </div>
              <p className="max-w-md leading-relaxed text-corporate-500 text-lg font-light">
                Leader panafricain spécialisé dans la conception, le déploiement et la maintenance
                d'infrastructures technologiques critiques.
              </p>
              <div className="flex gap-5 pt-4">
                <SocialLink icon={<Linkedin size={20} />} />
                <SocialLink icon={<Twitter size={20} />} />
                <SocialLink icon={<Facebook size={20} />} />
                <SocialLink icon={<Instagram size={20} />} />
              </div>
            </div>

            <div className="lg:col-span-3">
              <h4 className="text-white font-display font-bold uppercase tracking-[0.3em] mb-10 text-[11px]">
                Exploration
              </h4>
              <ul className="space-y-6">
                {navLinks.map((link) => (
                  <li key={link.id}>
                    <button
                      onClick={() => scrollToSection(link.id)}
                      className="text-corporate-500 hover:text-enea-accent transition-all text-sm font-medium"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-4">
              <h4 className="text-white font-display font-bold uppercase tracking-[0.3em] mb-10 text-[11px]">
                Conformité & Légal
              </h4>
              <ul className="space-y-6">
                <li>
                  <a
                    href="#"
                    className="text-corporate-500 hover:text-enea-accent transition-all text-sm font-medium"
                  >
                    Mentions Légales & Gouvernance
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-corporate-500 hover:text-enea-accent transition-all text-sm font-medium"
                  >
                    Confidentialité des Données (GDPR)
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-corporate-500 hover:text-enea-accent transition-all text-sm font-medium"
                  >
                    Éthique & Code de Conduite
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-corporate-500 hover:text-enea-accent transition-all text-sm font-medium"
                  >
                    Support Technique 24/7
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col md:flex-row items-center gap-4 text-xs font-medium text-corporate-600">
              <p>
                &copy; {new Date().getFullYear()} {content.entityName} Group. All assets secured.
              </p>
            </div>
            <div className="flex items-center gap-4 bg-white/5 px-6 py-2.5 border border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-none bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-corporate-300">
                  Systèmes Critiques: OK
                </span>
              </div>
              <div className="w-px h-4 bg-white/10 mx-2"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-corporate-500">
                v2.4.0-stable
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const SocialLink = ({ icon }: { icon: any }) => (
  <a
    href="#"
    className="w-10 h-10 bg-white/5 border border-white/5 flex items-center justify-center hover:bg-enea-accent hover:border-enea-accent hover:text-white transition-all duration-300"
  >
    {icon}
  </a>
);
