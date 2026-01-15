import React, { useState } from 'react';
import { Maximize2, X } from 'lucide-react';
import { SiteContent, GalleryItem } from '@/types';

interface GallerySectionProps {
    realizations: SiteContent['realizations'];
}

export const GallerySection: React.FC<GallerySectionProps> = ({ realizations }) => {
    const [activeFilter, setActiveFilter] = useState('Tous');
    const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

    const categories = ['Tous', ...Array.from(new Set(realizations.gallery.map(img => img.category)))];
    const filteredGallery = activeFilter === 'Tous'
        ? realizations.gallery
        : realizations.gallery.filter(item => item.category === activeFilter);

    return (
        <section id="realisations" className="py-32 bg-white text-corporate-900 overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-10">
                    <div className="max-w-xl">
                        <div className="inline-block px-4 py-2 bg-blue-50 rounded-none mb-6">
                            <h2 className="text-xs font-black text-enea-accent tracking-[0.3em] uppercase">
                                Réalisations Clés
                            </h2>
                        </div>
                        <h3 className="text-5xl md:text-6xl font-display font-black text-corporate-900 leading-[1.1]">
                            Excellence en <span className="text-gradient">Action</span>
                        </h3>
                    </div>

                    <div className="flex flex-wrap gap-0 bg-corporate-50 p-0 border border-corporate-100">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveFilter(cat)}
                                className={`px-8 py-4 text-xs font-black tracking-widest uppercase transition-all duration-500 ${activeFilter === cat
                                    ? 'bg-enea-accent text-white'
                                    : 'text-corporate-500 hover:text-corporate-900 hover:bg-white'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-[350px]">
                    {filteredGallery.map((item, idx) => (
                        <div
                            key={idx}
                            className={`group relative overflow-hidden cursor-pointer shadow-2xl shadow-corporate-900/5 bg-corporate-100 transition-all duration-700 ${idx % 5 === 0 ? 'lg:col-span-2' : ''
                                }`}
                            onClick={() => setSelectedImage(item)}
                        >
                            <img
                                src={item.imageUrl || `https://images.unsplash.com/photo-1544197150-b99a580bbc7c?auto=format&fit=crop&w=800&q=80`}
                                alt={item.caption}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-corporate-950 via-corporate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-10 translate-y-4 group-hover:translate-y-0 text-left">
                                <span className="inline-block px-4 py-1.5 bg-enea-accent text-white text-[10px] font-black uppercase tracking-widest mb-4 w-fit shadow-lg shadow-blue-500/20">
                                    {item.category}
                                </span>
                                <h4 className="text-white text-3xl font-display font-bold leading-tight uppercase tracking-tighter">
                                    {item.caption}
                                </h4>

                                <div className="absolute top-8 right-8 w-12 h-12 glass-dark flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all delay-150 transform scale-75 group-hover:scale-100 text-white">
                                    <Maximize2 size={20} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Clients Section */}
                <div className="mt-32 p-12 lg:p-20 bg-corporate-950 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-enea-accent/10 rounded-none blur-[100px]"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <p className="text-corporate-400 font-black uppercase tracking-[0.4em] text-[10px] mb-12 text-center">
                            Partenaires Stratégiques &op; Clients
                        </p>
                        <div className="flex flex-wrap justify-center gap-10 md:gap-20 items-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                            {['ORANGE', 'MTN', 'MOOV', 'HUAWEI', 'ERICSSON', 'NOKIA'].map(client => (
                                <span key={client} className="text-2xl md:text-3xl font-display font-black tracking-tighter text-corporate-200">
                                    {client}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            {selectedImage && (
                <div className="fixed inset-0 z-[100] bg-corporate-950/95 backdrop-blur-2xl flex items-center justify-center p-6 lg:p-12 animate-in fade-in duration-500 transition-all" onClick={() => setSelectedImage(null)}>
                    <button
                        className="absolute top-10 right-10 text-white/50 hover:text-white transition-all bg-white/5 p-4 hover:bg-white/10 group"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X size={28} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>

                    <div className="max-w-5xl w-full flex flex-col items-center animate-in zoom-in duration-500 ease-out" onClick={e => e.stopPropagation()}>
                        <div className="relative w-full aspect-video overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] border border-white/5 bg-corporate-900">
                            <img
                                src={selectedImage.imageUrl || `https://images.unsplash.com/photo-1544197150-b99a580bbc7c?auto=format&fit=crop&w=1200&q=80`}
                                alt={selectedImage.caption}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="mt-10 flex flex-col items-center max-w-2xl">
                            <span className="text-enea-accent font-black uppercase tracking-[0.3em] text-[10px] mb-4 bg-blue-500/10 px-4 py-1.5">{selectedImage.category}</span>
                            <h3 className="text-3xl md:text-4xl font-display font-bold text-white text-center leading-tight uppercase tracking-tight">{selectedImage.caption}</h3>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};
