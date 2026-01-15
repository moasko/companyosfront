import React from 'react';
import { Target, Eye, Heart } from 'lucide-react';
import { SiteContent } from '@/types';

interface AboutSectionProps {
    about: SiteContent['about'];
}

export const AboutSection: React.FC<AboutSectionProps> = ({ about }) => {
    return (
        <section id="societe" className="py-32 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    {/* Left: Atmospheric Image with Industrial vibe */}
                    <div className="relative group">
                        <div className="relative aspect-[4/5] overflow-hidden shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1541888941259-79273946023d?auto=format&fit=crop&w=800&q=80"
                                alt="Industrial Excellence"
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-corporate-900/80 via-transparent to-transparent"></div>

                            {/* Floating Achievement Box */}
                            <div className="absolute bottom-10 left-10 right-10 p-8 glass-dark border-white/10 animate-fade-in">
                                <p className="text-enea-accent font-black uppercase tracking-[0.3em] text-[10px] mb-2">Engagement Qualité</p>
                                <p className="text-white text-lg font-medium leading-tight">
                                    "L'excellence n'est pas un acte, mais une habitude dans chaque mètre carré que nous construisons."
                                </p>
                            </div>
                        </div>

                        {/* Decorative Background Element */}
                        <div className="absolute -z-10 -top-10 -left-10 w-64 h-64 bg-blue-50 transform -rotate-12"></div>
                    </div>

                    {/* Right: Bold Industrial Typography */}
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-3">
                                <div className="w-12 h-px bg-enea-accent"></div>
                                <span className="text-xs font-black text-enea-accent uppercase tracking-[0.4em]">À Propos de Nous</span>
                            </div>
                            <h3 className="text-5xl md:text-7xl font-display font-black text-corporate-900 leading-[0.95] uppercase tracking-tighter">
                                Excellence en <br /> <span className="text-enea-accent">Infrastructure</span>
                            </h3>
                            <p className="text-xl text-corporate-500 font-light leading-relaxed max-w-xl">
                                {about.description}
                            </p>
                        </div>

                        {/* Pillars Grid */}
                        <div className="grid sm:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="w-12 h-12 bg-corporate-900 rounded-none flex items-center justify-center text-white">
                                    <Eye size={24} />
                                </div>
                                <h4 className="text-xl font-display font-bold text-corporate-900">Notre Vision</h4>
                                <p className="text-sm text-corporate-500 font-light leading-relaxed">
                                    {about.vision}
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="w-12 h-12 bg-enea-accent rounded-none flex items-center justify-center text-white">
                                    <Target size={24} />
                                </div>
                                <h4 className="text-xl font-display font-bold text-corporate-900">Notre Mission</h4>
                                <p className="text-sm text-corporate-500 font-light leading-relaxed">
                                    {about.mission}
                                </p>
                            </div>
                        </div>

                        {/* Special Value Box */}
                        <div className="p-10 bg-corporate-50 border border-corporate-100 group hover:border-enea-accent/30 transition-all duration-500">
                            <div className="flex items-center gap-6 mb-4">
                                <div className="p-3 bg-white rounded-none shadow-sm text-enea-accent">
                                    <Heart size={24} />
                                </div>
                                <h4 className="text-2xl font-display font-bold text-corporate-900">Nos Valeurs</h4>
                            </div>
                            <p className="text-corporate-600 font-light leading-relaxed">
                                {about.values}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
