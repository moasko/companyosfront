import React from 'react';
import { Image, Plus, Trash2 } from 'lucide-react';
import { InputField, ImageUpload } from '@/components/admin/shared/AdminShared';
import { SiteContent } from '@/types';

interface PortfolioEditorProps {
  data: {
    works: string[];
    clients: string[];
    gallery: SiteContent['realizations']['gallery'];
  };
  onChange: (data: any) => void;
}

export const PortfolioEditor: React.FC<PortfolioEditorProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-sm border shadow-sm space-y-6">
        <h3 className="text-lg font-black text-slate-900 border-b pb-4 flex items-center gap-2">
          <Image size={20} className="text-sky-600" />
          GALERIE RÉALISATIONS
        </h3>
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">
            Projets / Réalisations (Liste de textes)
          </label>
          <textarea
            className="w-full px-4 py-3 rounded-sm border border-slate-200 text-sm font-semibold rows-3 focus:ring-1 focus:ring-sky-500 outline-none"
            value={data.works.join('\n')}
            onChange={(e) =>
              onChange({ ...data, works: e.target.value.split('\n').filter((w) => w) })
            }
            placeholder="Projet Alpha 2024&#10;Construction Siège BTP&#10;Consulting stratégie"
            rows={5}
          />
          <p className="text-[10px] text-slate-400 font-bold ml-1 italic">Un projet par ligne.</p>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">
            Ils nous font confiance (Clients / Partenaires)
          </label>
          <textarea
            className="w-full px-4 py-3 rounded-sm border border-slate-200 text-sm font-semibold rows-3 focus:ring-1 focus:ring-sky-500 outline-none"
            value={(data.clients || []).join('\n')}
            onChange={(e) =>
              onChange({ ...data, clients: e.target.value.split('\n').filter((w) => w) })
            }
            placeholder="ORANGE&#10;MOOV&#10;SOCIETE GENERALE"
            rows={4}
          />
          <p className="text-[10px] text-slate-400 font-bold ml-1 italic">Un client par ligne.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-black text-slate-800 flex items-center gap-2">IMAGES & PHOTOS</h4>
          <button
            onClick={() =>
              onChange({
                ...data,
                gallery: [...data.gallery, { caption: '', category: 'General', imageUrl: '' }],
              })
            }
            className="bg-slate-900 text-white px-4 py-2 rounded-sm text-xs font-black flex items-center gap-2"
          >
            <Plus size={14} /> Ajouter une photo
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {data.gallery.map((img, idx) => (
            <div
              key={idx}
              className="bg-white rounded-sm border shadow-sm overflow-hidden group p-4 space-y-4"
            >
              <div className="relative">
                <ImageUpload
                  value={img.imageUrl}
                  onChange={(v) => {
                    const newGallery = [...data.gallery];
                    newGallery[idx].imageUrl = v;
                    onChange({ ...data, gallery: newGallery });
                  }}
                  helper="Format JPG, PNG ou WEBP"
                />
                <button
                  onClick={() => {
                    const newGallery = [...data.gallery];
                    newGallery.splice(idx, 1);
                    onChange({ ...data, gallery: newGallery });
                  }}
                  className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="Catégorie"
                  value={img.category}
                  onChange={(v) => {
                    const newGallery = [...data.gallery];
                    newGallery[idx].category = v;
                    onChange({ ...data, gallery: newGallery });
                  }}
                  placeholder="ex: Maintenance"
                />
                <InputField
                  label="Légende"
                  value={img.caption}
                  onChange={(v) => {
                    const newGallery = [...data.gallery];
                    newGallery[idx].caption = v;
                    onChange({ ...data, gallery: newGallery });
                  }}
                  placeholder="ex: Site de Niamey"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
