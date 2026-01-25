import React, { useState, useEffect, useRef } from 'react';
import Barcode from 'react-barcode';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { BarcodeLabelPDF } from './BarcodeLabelPDF';
import { StockItem } from '@/types';
import { Modal } from '@/components/admin/shared/AdminShared';
import { Download, Printer, ScanBarcode } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product: StockItem | null;
}

export const BarcodeModal: React.FC<Props> = ({ isOpen, onClose, product }) => {
  const [barcodeUrl, setBarcodeUrl] = useState<string>('');
  const barcodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && product && barcodeRef.current) {
      // Give time for react-barcode to render in the hidden div
      setTimeout(() => {
        const svg = barcodeRef.current?.querySelector('svg');
        if (svg) {
          const canvas = document.createElement('canvas');
          const svgData = new XMLSerializer().serializeToString(svg);
          const img = new Image();
          img.onload = () => {
            canvas.width = img.width * 2; // Highres
            canvas.height = img.height * 2;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = 'white';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.scale(2, 2);
              ctx.drawImage(img, 0, 0);
              setBarcodeUrl(canvas.toDataURL('image/png'));
            }
          };
          img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        }
      }, 100);
    }
  }, [isOpen, product]);

  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Générateur d'Étiquette Code-Barres" size="md">
      <div className="space-y-8 p-6">
        <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-200 border-dashed rounded-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
            Aperçu de l'étiquette (50x30mm)
          </p>

          {/* Visual Preview */}
          <div className="bg-white shadow-xl border border-slate-200 p-4 w-64 h-40 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-sky-500"></div>
            <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">
              {product.brand || 'ENEA TELECOM'}
            </p>
            <p className="text-xs font-black text-slate-800 mb-2 leading-tight">{product.name}</p>

            <div className="h-12 flex items-center justify-center bg-white">
              <Barcode
                value={product.barcode || product.ref}
                width={1.5}
                height={40}
                fontSize={10}
                margin={0}
                displayValue={false}
              />
            </div>
            <p className="font-mono text-[9px] text-slate-500 mt-1">
              {product.barcode || product.ref}
            </p>

            {product.sellingPrice && (
              <p className="text-sm font-black text-sky-600 mt-2">
                {product.sellingPrice.toLocaleString()} CFA
              </p>
            )}
          </div>
        </div>

        {/* Hidden div for image generation */}
        <div style={{ display: 'none' }} ref={barcodeRef}>
          <Barcode
            value={product.barcode || product.ref}
            width={2}
            height={60}
            displayValue={false}
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="bg-sky-50 p-4 rounded-sm border border-sky-100 mb-2">
            <div className="flex gap-3">
              <div className="bg-white p-2 rounded-sm text-sky-600 border border-sky-200 shadow-sm">
                <ScanBarcode size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-sky-900">Format Standard (Zèbre/Dymo)</p>
                <p className="text-xs text-sky-700/70">
                  Prêt pour impression sur imprimante thermique d'étiquettes.
                </p>
              </div>
            </div>
          </div>

          {barcodeUrl && (
            <PDFDownloadLink
              document={<BarcodeLabelPDF product={product} barcodeDataUrl={barcodeUrl} />}
              fileName={`LABEL_${product.ref}.pdf`}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-sky-600 text-white rounded-sm hover:bg-sky-700 font-bold transition-all shadow-lg shadow-sky-900/20"
            >
              {({ loading }) => (
                <>
                  <Printer size={20} />
                  {loading ? 'Génération...' : "Imprimer / Télécharger l'étiquette"}
                </>
              )}
            </PDFDownloadLink>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-sm transition-all text-sm"
          >
            Annuler
          </button>
        </div>
      </div>
    </Modal>
  );
};
