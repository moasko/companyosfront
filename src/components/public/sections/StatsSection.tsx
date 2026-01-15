import React from 'react';
import { SiteContent } from '@/types';

interface StatsSectionProps {
    stats: SiteContent['stats'];
}

export const StatsSection: React.FC<StatsSectionProps> = ({ stats }) => {
    return (
        <section className="relative py-16 bg-enea-accent overflow-hidden">
            {/* Subtle Texture Overlay */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-0">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="flex flex-col items-center justify-center text-center lg:border-r last:border-0 border-white/20 px-8 group">
                            <div className="text-6xl md:text-8xl font-display font-black text-white tracking-tighter mb-4 group-hover:scale-105 transition-transform duration-500">
                                {stat.value}
                            </div>
                            <div className="text-xs font-black uppercase tracking-[0.4em] text-white/50 group-hover:text-white transition-colors">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
