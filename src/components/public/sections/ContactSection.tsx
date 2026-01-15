import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { SiteContent } from '@/types';

interface ContactSectionProps {
    contact: SiteContent['contact'];
    entityName: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ contact, entityName }) => {
    return (
        <section id="contact" className="py-32 bg-corporate-950 text-white relative overflow-hidden">
            {/* Professional Background Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1541888941259-79273946023d?auto=format&fit=crop&w=1920&q=50"
                    className="w-full h-full object-cover opacity-10 grayscale"
                    alt="Industrial Background"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-corporate-950 via-corporate-950/80 to-corporate-950"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                <div className="mb-20 space-y-6">
                    <p className="text-enea-accent font-black uppercase tracking-[0.5em] text-[11px]">Contact & Support</p>
                    <h3 className="text-6xl md:text-8xl font-display font-black text-white leading-tight uppercase tracking-tighter">
                        VAMOS <span className="text-enea-accent">COMEÇAR?</span>
                    </h3>
                    <p className="text-corporate-400 text-xl font-light max-w-2xl mx-auto leading-relaxed">
                        Transformez vos projets d'infrastructure en réalités tangibles avec l'expertise d'Enea Group.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-10 mb-20">
                    <div className="group bg-white/[0.03] p-12 border border-white/5 hover:border-enea-accent/30 transition-all duration-500">
                        <div className="w-16 h-16 bg-enea-accent flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-500/20">
                            <Phone size={28} className="text-white" />
                        </div>
                        <p className="text-white font-display font-black text-4xl mb-4 tracking-tighter">{contact.phone}</p>
                        <p className="text-corporate-500 font-black uppercase tracking-widest text-xs">Appel Direct</p>
                        <a href={`tel:${contact.phone}`} className="mt-8 inline-flex px-8 py-3 bg-enea-accent transition-all hover:bg-white hover:text-enea-accent text-[10px] font-black uppercase tracking-widest">
                            Appeler Maintenant
                        </a>
                    </div>

                    <div className="group bg-white/[0.03] p-12 border border-white/5 hover:border-enea-accent/30 transition-all duration-500">
                        <div className="w-16 h-16 bg-corporate-900 border border-white/10 flex items-center justify-center mx-auto mb-8">
                            <Mail size={28} className="text-corporate-300" />
                        </div>
                        <p className="text-white font-display font-black text-4xl mb-4 tracking-tighter">{contact.email}</p>
                        <p className="text-corporate-500 font-black uppercase tracking-widest text-xs">Requête Email</p>
                        <a href={`mailto:${contact.email}`} className="mt-8 inline-flex px-8 py-3 bg-white/10 hover:bg-white hover:text-corporate-950 transition-all text-[10px] font-black uppercase tracking-widest">
                            Envoyer un Message
                        </a>
                    </div>
                </div>

                {/* Form Toggle or Direct Grid */}
                <div className="max-w-4xl mx-auto">
                    <div className="glass-dark border border-white/5 p-10 lg:p-14 shadow-[0_0_80px_rgba(0,0,0,0.4)] text-left">
                        <form className="grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={(e) => e.preventDefault()}>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-corporate-500">Nom Complet</label>
                                <input type="text" className="w-full bg-white/[0.03] border border-white/10 px-6 py-4 text-white focus:outline-none focus:ring-1 focus:ring-enea-accent transition-all placeholder:text-corporate-700" placeholder="Ex: Jean Dupont" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-corporate-500">Email Professionnel</label>
                                <input type="email" className="w-full bg-white/[0.03] border border-white/10 px-6 py-4 text-white focus:outline-none focus:ring-1 focus:ring-enea-accent transition-all placeholder:text-corporate-700" placeholder="Ex: jean@entreprise.com" />
                            </div>
                            <div className="md:col-span-2 space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-corporate-500">Votre Message</label>
                                <textarea rows={4} className="w-full bg-white/[0.03] border border-white/10 px-6 py-4 text-white focus:outline-none focus:ring-1 focus:ring-enea-accent transition-all resize-none placeholder:text-corporate-700" placeholder="Comment pouvons-nous vous aider ?"></textarea>
                            </div>
                            <div className="md:col-span-2">
                                <button className="w-full bg-enea-accent hover:bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] py-6 shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                                    Confirmer l'envoi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};
