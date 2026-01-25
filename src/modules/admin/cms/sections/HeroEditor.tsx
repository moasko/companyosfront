import React, { useState } from 'react';
import { LayoutDashboard, Save } from 'lucide-react';
import { InputField, ImageUpload, Badge } from '@/components/admin/shared/AdminShared';
import { SiteContent } from '@/types';

interface HeroEditorProps {
  data: SiteContent['hero'];
  onChange: (data: SiteContent['hero']) => void;
}

export const HeroEditor: React.FC<HeroEditorProps> = ({ data, onChange }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-8 rounded-sm border shadow-sm space-y-6">
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <LayoutDashboard size={20} className="text-sky-600" />
          CONTENU PRINCIPAL
        </h3>
        <InputField
          label="Titre d'Accueil"
          value={data.title}
          onChange={(v) => onChange({ ...data, title: v })}
          placeholder="Ex: Bienvenue chez ENEA Group"
        />
        <InputField
          type="textarea"
          label="Sous-titre descriptif"
          value={data.subtitle}
          onChange={(v) => onChange({ ...data, subtitle: v })}
          rows={4}
          placeholder="Décrivez votre activité principale..."
        />
        <InputField
          label="Slogan / Tagline"
          value={data.tagline}
          onChange={(v) => onChange({ ...data, tagline: v })}
          placeholder="Ex: L'excellence à votre service"
        />
        <ImageUpload
          label="Image de fond Hero"
          value={data.imageUrl}
          onChange={(v) => onChange({ ...data, imageUrl: v })}
          helper="Image haute résolution recommandée (1920x1080)"
        />
      </div>

      <div className="space-y-4">
        <h4 className="font-bold text-slate-500 text-xs uppercase tracking-wider">
          Aperçu Simplifié
        </h4>
        <div className="bg-slate-900 rounded-sm p-0 text-white flex flex-col justify-center relative overflow-hidden h-[400px]">
          {data.imageUrl && (
            <img
              src={data.imageUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
          )}
          <div className="relative z-10 p-8 space-y-4 max-w-md">
            <Badge color="blue">{data.tagline || 'Slogan'}</Badge>
            <h1 className="text-4xl font-black leading-tight">
              {data.title || 'Titre de votre site'}
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              {data.subtitle || 'Votre texte de présentation apparaîtra ici pour vos visiteurs.'}
            </p>
            <div className="pt-4">
              <button className="bg-sky-600 px-6 py-2 rounded-sm font-bold text-sm">
                Découvrir nos services
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
