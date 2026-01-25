import React, { useState } from 'react';
import { Download, ChevronDown, FileText, Table } from 'lucide-react';
import { exportToExcel, exportToCSV, flattenData } from '@/utils/exportUtils';

interface ExportButtonProps {
  data: any[];
  fileName: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  fileName,
  label = 'Exporter',
  variant = 'outline',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const baseStyles =
    'relative flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-bold transition-all focus:outline-none';
  const variants = {
    primary: 'bg-sky-600 text-white hover:bg-sky-700 shadow-lg shadow-sky-900/10',
    secondary: 'bg-slate-800 text-white hover:bg-slate-900',
    outline:
      'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm',
  };

  const handleExport = (type: 'excel' | 'csv') => {
    const processedData = flattenData(data);
    const name = `${fileName}_${new Date().toISOString().split('T')[0]}`;

    if (type === 'excel') {
      exportToExcel(processedData, name);
    } else {
      exportToCSV(processedData, name);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button onClick={() => setIsOpen(!isOpen)} className={`${baseStyles} ${variants[variant]}`}>
        <Download size={16} />
        <span>{label}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-sm shadow-xl z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
              Format d'export
            </div>
            <button
              onClick={() => handleExport('excel')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
            >
              <Table size={16} className="text-emerald-600" />
              <div className="flex flex-col">
                <span className="font-bold">Excel (.xlsx)</span>
                <span className="text-[10px] text-slate-400">Recommandé pour MSI</span>
              </div>
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left border-t border-slate-50"
            >
              <FileText size={16} className="text-sky-600" />
              <div className="flex flex-col">
                <span className="font-bold">CSV (.csv)</span>
                <span className="text-[10px] text-slate-400">Pour import/export simple</span>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
