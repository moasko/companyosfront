import React from 'react';
import { SiteContent } from '@/types';

interface LocationsSectionProps {
  locations: SiteContent['locations'];
  currentCountry: string;
}

export const LocationsSection: React.FC<LocationsSectionProps> = ({
  locations,
  currentCountry,
}) => {
  return (
    <section id="presence" className="py-32 bg-corporate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center mb-20">
          <div className="inline-block px-4 py-2 bg-blue-100/50 rounded-none mb-6">
            <h2 className="text-xs font-black text-enea-accent tracking-[0.3em] uppercase">
              Expansion Panafricaine
            </h2>
          </div>
          <h3 className="text-5xl md:text-6xl font-display font-black text-corporate-900 leading-tight">
            Une Présence <span className="text-gradient">Stratégique</span>
          </h3>
          <p className="mt-6 text-corporate-500 text-lg font-light max-w-2xl">
            Notre réseau s'étend sur les hubs les plus dynamiques du continent pour assurer une
            connectivité sans faille.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {locations.map((loc, idx) => {
            const isActive = loc.country === currentCountry;
            return (
              <div
                key={idx}
                className={`
                                    relative p-10 border transition-all duration-500 group overflow-hidden
                                    ${
                                      isActive
                                        ? 'bg-corporate-900 border-white/5 text-white shadow-[0_40px_80px_rgba(15,23,42,0.3)] transform lg:-translate-y-4'
                                        : 'bg-white border-corporate-100 text-corporate-600 hover:border-enea-accent/30 hover:shadow-2xl hover:shadow-corporate-900/5'
                                    }
                                `}
              >
                {/* Decorative background elements */}
                {isActive && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-enea-accent/10 rounded-none blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                )}

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-8">
                    <div className="text-5xl transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 drop-shadow-sm">
                      {loc.flag}
                    </div>
                    <div
                      className={`px-3 py-1 rounded-none text-[10px] font-black uppercase tracking-widest ${
                        isActive
                          ? 'bg-enea-accent text-white'
                          : 'bg-corporate-50 text-corporate-400'
                      }`}
                    >
                      Active
                    </div>
                  </div>

                  <div>
                    <h4
                      className={`text-2xl font-display font-bold mb-2 ${isActive ? 'text-white' : 'text-corporate-900'}`}
                    >
                      {loc.country}
                    </h4>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 ${isActive ? 'bg-green-400' : 'bg-green-600'}`}
                      ></div>
                      <p
                        className={`text-[11px] uppercase tracking-widest font-black ${isActive ? 'text-corporate-400' : 'text-corporate-500'}`}
                      >
                        {loc.status}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`mt-10 pt-6 border-t ${isActive ? 'border-white/10' : 'border-corporate-100'}`}
                  >
                    <p
                      className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-corporate-500' : 'text-corporate-400'}`}
                    >
                      Opérationnel depuis {loc.year}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
