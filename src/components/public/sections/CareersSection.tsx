import React from 'react';
import { MapPin, Clock, ArrowRight } from 'lucide-react';
import { SiteContent } from '@/types';

interface CareersSectionProps {
  careers: SiteContent['careers'];
}

export const CareersSection: React.FC<CareersSectionProps> = ({ careers }) => {
  return (
    <section
      id="carrieres"
      className="py-32 bg-white relative overflow-hidden flex flex-col items-center"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-px bg-enea-accent"></div>
            <h2 className="text-[10px] font-black text-enea-accent tracking-[0.4em] uppercase">
              Capital Humain & Talents
            </h2>
          </div>
          <h3 className="text-5xl md:text-7xl font-display font-black text-corporate-900 mb-8 leading-none uppercase tracking-tighter">
            {careers.title}
          </h3>
          <p className="text-xl text-corporate-500 max-w-2xl mx-auto leading-relaxed font-light">
            {careers.description}
          </p>
        </div>

        <div className="grid gap-8">
          {careers.openings.map((job) => (
            <div
              key={job.id}
              className="group bg-corporate-50 p-10 lg:p-12 border border-corporate-100 hover:border-enea-accent/30 hover:bg-white hover:shadow-[0_40px_80px_rgba(37,99,235,0.05)] transition-all duration-500 flex flex-col lg:flex-row items-center justify-between gap-12"
            >
              <div className="flex-1 w-full">
                <div className="flex flex-wrap gap-4 mb-6">
                  <span className="flex items-center gap-2 bg-white px-5 py-2 text-[10px] font-black uppercase tracking-widest text-corporate-400 border border-corporate-100 shadow-sm">
                    <MapPin size={12} className="text-enea-accent" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-2 bg-white px-5 py-2 text-[10px] font-black uppercase tracking-widest text-corporate-400 border border-corporate-100 shadow-sm">
                    <Clock size={12} className="text-enea-accent" />
                    {job.type}
                  </span>
                </div>
                <h4 className="font-display font-black text-3xl md:text-4xl text-corporate-900 mb-6 uppercase tracking-tight group-hover:text-enea-accent transition-colors">
                  {job.title}
                </h4>
                <p className="text-corporate-500 text-lg font-light leading-relaxed max-w-3xl">
                  {job.description}
                </p>
              </div>

              <a
                href={`mailto:${careers.contactEmail}?subject=Candidature: ${job.title}`}
                className="w-full lg:w-auto flex items-center justify-center gap-4 px-12 py-6 bg-corporate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-enea-accent transition-all duration-300 shadow-xl shadow-corporate-900/10 active:scale-95"
              >
                Postuler
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </a>
            </div>
          ))}

          {careers.openings.length === 0 && (
            <div className="text-center p-24 bg-corporate-50 border-2 border-dashed border-corporate-200">
              <p className="text-corporate-900 font-display font-black text-3xl mb-4 uppercase tracking-tight">
                Opportunités à Venir
              </p>
              <p className="text-corporate-500 font-light max-w-md mx-auto text-lg leading-relaxed">
                Notre équipe s'agrandit constamment. Envoyez-nous votre candidature spontanée pour
                nos futurs projets.
              </p>
            </div>
          )}
        </div>

        <div className="mt-24 p-12 md:p-16 bg-corporate-900 text-center text-white relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-enea-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <p className="text-corporate-500 font-black uppercase tracking-[0.5em] text-[10px] mb-6 relative z-10">
            Rejoindre l'aventure
          </p>
          <p className="text-3xl md:text-4xl font-display font-bold relative z-10 leading-tight">
            Expertise spécifique ? <br className="hidden md:block" />
            Envoyez votre dossier à{' '}
            <a
              href={`mailto:${careers.contactEmail}`}
              className="text-enea-accent font-black hover:text-white transition-colors underline-offset-8 decoration-2 decoration-enea-accent/30 hover:decoration-enea-accent"
            >
              {careers.contactEmail}
            </a>
          </p>
        </div>
      </div>

      {/* Background decorative element */}
      <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-blue-50/50 blur-[120px] translate-y-1/2 translate-x-1/2 -z-10"></div>
    </section>
  );
};
