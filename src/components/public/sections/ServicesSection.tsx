import React from 'react';
import { DynamicIcon } from '@/components/admin/shared/Icons';
import { CheckCircle2 } from 'lucide-react';
import { SiteContent } from '@/types';

interface ServicesSectionProps {
  services: SiteContent['services'];
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ services }) => {
  return (
    <section id="services" className="py-32 bg-corporate-950 relative overflow-hidden">
      {/* Professional Background Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-enea-accent/5 blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-50"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center mb-24">
          <div className="inline-block px-4 py-2 bg-enea-accent/10 border border-enea-accent/20 rounded-none mb-6">
            <h2 className="text-xs font-black text-enea-accent tracking-[0.4em] uppercase">
              Notre Expertise Solutions
            </h2>
          </div>
          <h3 className="text-5xl md:text-[60px] font-display font-black text-white leading-tight uppercase tracking-tight">
            SOLUTIONS COMPLETES <br className="hidden md:block" /> POUR VOTRE{' '}
            <span className="text-enea-accent">INFRASTRUCTURE</span>
          </h3>
          <div className="w-24 h-1.5 bg-enea-accent mt-10 rounded-none"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <div
              key={service.id}
              className="group relative bg-white/[0.03] p-12 border border-white/5 hover:border-enea-accent/30 hover:bg-white/[0.05] transition-all duration-500 hover:-translate-y-3 overflow-hidden"
            >
              {/* Animated Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-enea-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-corporate-900 border border-white/10 flex items-center justify-center mb-8 group-hover:bg-enea-accent transition-all duration-500 shadow-xl group-hover:shadow-blue-500/20">
                  <DynamicIcon
                    name={service.iconName}
                    className="text-enea-accent group-hover:text-white transition-colors"
                    size={28}
                  />
                </div>

                <h4 className="text-2xl font-display font-bold mb-4 text-white uppercase tracking-tight group-hover:text-enea-accent transition-colors">
                  {service.title}
                </h4>

                <p className="text-corporate-400 mb-8 leading-relaxed font-light text-base">
                  {service.description}
                </p>

                <ul className="space-y-4 pt-8 border-t border-white/5">
                  {service.features.map((feature, fIdx) => (
                    <li
                      key={fIdx}
                      className="flex items-center text-xs font-black uppercase tracking-widest text-corporate-500 group-hover:text-corporate-300 transition-colors"
                    >
                      <div className="w-1.5 h-1.5 bg-enea-accent mr-3"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
