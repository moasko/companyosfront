import React, { useState, useEffect } from 'react';
import { Card } from '@/components/admin/shared/AdminShared';
import { Printer, Layers, Monitor, Save } from 'lucide-react';
import { InputField } from '@/components/admin/shared/AdminShared';
import { useSettings } from '@/hooks/useSettings';

interface PrintingSettingsProps {
  companyId: string;
}

export const PrintingSettings: React.FC<PrintingSettingsProps> = ({ companyId }) => {
  const {
    fetchPrinterSettings,
    savePrinterSettings: savePrinterSettingsApi,
    discoverPrinters,
  } = useSettings(companyId);

  const [printerSettings, setPrinterSettings] = useState({
    documentPrinter: '',
    barcodePrinter: '',
    labelWidth: 50,
    labelHeight: 30,
  });

  const [discoveredPrinters, setDiscoveredPrinters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPrinterSettings()
      .then((data: any) => {
        if (data) {
          setPrinterSettings({
            documentPrinter: data.documentPrinter || '',
            barcodePrinter: data.barcodePrinter || '',
            labelWidth: data.labelWidth || 50,
            labelHeight: data.labelHeight || 30,
          });
        }
      })
      .catch(console.error);
  }, [companyId]);

  const handleSavePrinterSettings = async () => {
    try {
      await savePrinterSettingsApi(printerSettings);
      alert("Paramètres d'impression sauvegardés (Serveur)");
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la sauvegarde des paramètres d'impression");
    }
  };

  const handleDiscoverPrinters = async () => {
    setIsLoading(true);
    try {
      const printers = await discoverPrinters();
      setDiscoveredPrinters(printers || []);
      if (!printers || printers.length === 0) {
        alert('Aucune imprimante détectée par le serveur.');
      }
    } catch (e) {
      console.error(e);
      alert('Erreur lors de la recherche des imprimantes.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card
        title="Configuration des Imprimantes"
        subtitle="Gérez les imprimantes serveur et les formats d'étiquettes"
      >
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-slate-500">
            Configurez les imprimantes connectées au serveur pour l'impression automatique des
            factures et étiquettes.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDiscoverPrinters}
              disabled={isLoading}
              className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-sm text-sm font-bold hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              {isLoading ? <span className="animate-spin">⏳</span> : <Layers size={16} />}
              Rechercher
            </button>
            <button
              onClick={handleSavePrinterSettings}
              className="bg-sky-600 text-white px-6 py-2 rounded-sm text-sm font-bold hover:bg-sky-700 transition-colors flex items-center gap-2"
            >
              <Save size={16} /> Sauvegarder
            </button>
          </div>
        </div>

        {discoveredPrinters.length > 0 && (
          <div className="mb-6 bg-emerald-50 border border-emerald-100 p-4 rounded-sm animate-in fade-in slide-in-from-top-2">
            <h4 className="text-sm font-bold text-emerald-800 mb-2">
              Imprimantes détectées sur le réseau :
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {discoveredPrinters.map((p: any) => (
                <button
                  key={p.name}
                  onClick={() => {
                    if (
                      confirm(
                        `Utiliser "${p.name}" comme imprimante par défaut pour les documents ?\n(Annuler pour définir comme imprimante étiquettes)`,
                      )
                    ) {
                      setPrinterSettings((prev) => ({ ...prev, documentPrinter: p.name }));
                    } else {
                      setPrinterSettings((prev) => ({ ...prev, barcodePrinter: p.name }));
                    }
                  }}
                  className="text-left px-3 py-2 bg-white border border-emerald-200 rounded-sm hover:border-emerald-400 hover:shadow-sm transition-all flex justify-between items-center group w-full"
                >
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-xs text-emerald-900 truncate">{p.name}</span>
                      <span
                        className={`text-[9px] px-1 rounded-full font-bold uppercase ${p.type === 'INSTALLED' ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-600'}`}
                      >
                        {p.type === 'INSTALLED' ? 'Local' : 'Réseau'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{p.details || 'Prêt'}</div>
                  </div>
                  <span className="opacity-0 group-hover:opacity-100 text-[10px] bg-emerald-200 text-emerald-800 font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
                    Choisir
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Monitor size={18} className="text-slate-400" />
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                Documents Standards
              </h4>
            </div>
            <div className="space-y-4">
              <InputField
                label="Imprimante A4 (Devis, Factures...)"
                value={printerSettings.documentPrinter}
                onChange={(v) => setPrinterSettings({ ...printerSettings, documentPrinter: v })}
                placeholder="Nom exact de l'imprimante..."
              />
              <p className="text-xs text-slate-400 italic">
                Si laissé vide, l'imprimante par défaut du système hôte sera utilisée.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Printer size={18} className="text-slate-400" />
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                Code-Barres & Étiquettes
              </h4>
            </div>
            <div className="space-y-4">
              <InputField
                label="Imprimante Thermique"
                value={printerSettings.barcodePrinter}
                onChange={(v) => setPrinterSettings({ ...printerSettings, barcodePrinter: v })}
                placeholder="Nom exact de l'imprimante..."
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  type="number"
                  label="Largeur (mm)"
                  value={printerSettings.labelWidth}
                  onChange={(v) =>
                    setPrinterSettings({ ...printerSettings, labelWidth: Number(v) })
                  }
                />
                <InputField
                  type="number"
                  label="Hauteur (mm)"
                  value={printerSettings.labelHeight}
                  onChange={(v) =>
                    setPrinterSettings({ ...printerSettings, labelHeight: Number(v) })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
