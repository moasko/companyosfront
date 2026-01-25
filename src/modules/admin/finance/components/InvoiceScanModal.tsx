import React, { useState, useRef } from 'react';
import { Modal, InputField } from '@/components/admin/shared/AdminShared';
import { Upload, Scan, Loader2, CheckCircle, AlertCircle, Save, FileText, Receipt } from 'lucide-react';
import { scanInvoice } from '../api/finance.api';
import { Transaction } from '@/types';
import { apiFetch } from '@/lib/api-client';

interface InvoiceScanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: Transaction) => void;
    companyId: string;
}

export const InvoiceScanModal: React.FC<InvoiceScanModalProps> = ({
    isOpen,
    onClose,
    onSave,
    companyId,
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [extractedData, setExtractedData] = useState<Partial<Transaction> | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setExtractedData(null);
            setError(null);
        }
    };

    const startScan = async () => {
        if (!file) return;

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // 1. Upload file
            const uploadData = await apiFetch(`/upload`, {
                method: 'POST',
                body: formData,
            });
            const filePath = uploadData.url;

            // 2. Scan with AI
            setIsUploading(false);
            setIsScanning(true);

            const aiData = await scanInvoice(companyId, filePath);

            setExtractedData({
                date: aiData.date || new Date().toISOString().split('T')[0],
                ref: aiData.ref || '',
                label: aiData.label || '',
                category: aiData.category || 'ACHATS',
                amount: aiData.amount || 0,
                currency: aiData.currency || 'XOF',
                type: 'Debit',
                status: 'Validé',
            });
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Une erreur est survenue lors de l'analyse du document.");
        } finally {
            setIsUploading(false);
            setIsScanning(false);
        }
    };

    const handleFieldChange = (field: keyof Transaction, value: any) => {
        if (extractedData) {
            setExtractedData({ ...extractedData, [field]: value });
        }
    };

    const handleSave = () => {
        if (extractedData) {
            onSave(extractedData as Transaction);
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Scanner une Facture"
            size="xl"
            footer={
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-sm font-bold text-slate-500 hover:bg-slate-100 transition-all border border-slate-200"
                    >
                        Annuler
                    </button>
                    {extractedData && (
                        <button
                            onClick={handleSave}
                            className="bg-sky-600 text-white px-8 py-2.5 rounded-sm flex items-center gap-2 hover:bg-sky-700 transition-all shadow-lg shadow-sky-900/10 font-bold"
                        >
                            <Save size={18} /> Valider & Enregistrer
                        </button>
                    )}
                </div>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[400px]">
                {/* Left column: Upload and Preview */}
                <div className="space-y-4">
                    <div
                        className={`relative border-2 border-dashed rounded-sm transition-all h-[350px] flex flex-col items-center justify-center overflow-hidden bg-slate-50/50 ${file ? 'border-sky-200' : 'border-slate-200 hover:border-sky-300 hover:bg-white'}`}
                    >
                        {previewUrl ? (
                            file?.type === 'application/pdf' ? (
                                <div className="flex flex-col items-center gap-4 p-8 text-center text-slate-400">
                                    <FileText size={64} className="text-sky-600" />
                                    <p className="text-sm font-bold truncate max-w-full">{file.name}</p>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-xs text-sky-600 hover:underline font-bold"
                                    >
                                        Changer de fichier
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-4 bg-white rounded-full text-sky-600 hover:scale-110 transition-transform shadow-xl"
                                        >
                                            <Upload size={24} />
                                        </button>
                                    </div>
                                </>
                            )
                        ) : (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex flex-col items-center gap-4 text-slate-400 hover:text-sky-600 transition-colors p-8"
                            >
                                <div className="p-4 bg-sky-50 rounded-full">
                                    <Upload size={48} className="text-sky-400" />
                                </div>
                                <div className="space-y-1 text-center">
                                    <p className="text-sm font-bold uppercase tracking-wider">Cliquer pour uploader</p>
                                    <p className="text-[10px] text-slate-400 font-medium">JPG, PNG ou PDF (max 10MB)</p>
                                </div>
                            </button>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*,application/pdf"
                        />
                    </div>

                    {!extractedData && file && !isScanning && !isUploading && (
                        <button
                            onClick={startScan}
                            className="w-full bg-slate-800 text-white py-4 rounded-sm flex items-center justify-center gap-3 hover:bg-slate-900 transition-all shadow-xl font-bold"
                        >
                            <Scan size={20} /> Lancer l'analyse IA
                        </button>
                    )}

                    {(isScanning || isUploading) && (
                        <div className="bg-sky-50 border border-sky-100 p-8 rounded-sm text-center space-y-4 animate-in fade-in zoom-in">
                            <div className="flex justify-center">
                                <Loader2 className="animate-spin text-sky-600" size={48} />
                            </div>
                            <div className="space-y-2">
                                <p className="font-black text-sky-900 uppercase tracking-widest text-xs">
                                    {isUploading ? "Transfert du document..." : "Analyse par ENEA AI..."}
                                </p>
                                <p className="text-sky-600 text-[10px] font-medium animate-pulse">
                                    Veuillez patienter pendant l'extraction des données...
                                </p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-100 p-4 rounded-sm flex items-start gap-3 text-red-600 animate-in slide-in-from-top-2 shadow-sm">
                            <AlertCircle size={20} className="shrink-0" />
                            <p className="text-xs font-bold leading-relaxed">{error}</p>
                        </div>
                    )}
                </div>

                {/* Right column: Form */}
                <div className="flex flex-col h-full">
                    {extractedData ? (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                            {/* Status and Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-sm border border-green-100">
                                    <CheckCircle size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                        Scan Réussi
                                    </span>
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    ENEA AI Extraction
                                </div>
                            </div>

                            {/* Data Preview Card */}
                            <div className="bg-slate-900 rounded-sm p-5 text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Receipt size={64} />
                                </div>
                                <div className="relative z-10 space-y-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Libellé</p>
                                        <p className="text-sm font-black truncate">{extractedData.label || 'Sans libellé'}</p>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Montant</p>
                                            <p className="text-2xl font-black">
                                                {extractedData.amount?.toLocaleString()}{' '}
                                                <span className="text-sm font-normal text-slate-400">{extractedData.currency || 'XOF'}</span>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date</p>
                                            <p className="text-sm font-bold font-mono">{extractedData.date}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Editing Form */}
                            <div className="space-y-4 border border-slate-100 p-4 rounded-sm bg-slate-50/30">
                                <InputField
                                    label="Libellé de l'opération"
                                    value={extractedData.label || ''}
                                    onChange={(v) => handleFieldChange('label', v)}
                                    placeholder="Ex: Facture électricité Janvier"
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <InputField
                                        label="Référence"
                                        value={extractedData.ref || ''}
                                        onChange={(v) => handleFieldChange('ref', v)}
                                        placeholder="Numéro de facture"
                                    />
                                    <InputField
                                        label="Date de facture"
                                        type="date"
                                        value={extractedData.date || ''}
                                        onChange={(v) => handleFieldChange('date', v)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <InputField
                                        label="Montant Total"
                                        type="number"
                                        value={extractedData.amount || 0}
                                        onChange={(v) => handleFieldChange('amount', parseFloat(v))}
                                    />
                                    <InputField
                                        label="Catégorie"
                                        value={extractedData.category || ''}
                                        onChange={(v) => handleFieldChange('category', v)}
                                        placeholder="Ex: ACHATS"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <InputField
                                        label="Devise"
                                        type="select"
                                        value={extractedData.currency || 'XOF'}
                                        onChange={(v) => handleFieldChange('currency', v)}
                                        options={[
                                            { value: 'XOF', label: 'Franc CFA (XOF)' },
                                            { value: 'EUR', label: 'Euro (EUR)' },
                                            { value: 'USD', label: 'Dollar (USD)' },
                                        ]}
                                    />
                                    <InputField
                                        label="Flux"
                                        type="select"
                                        value={extractedData.type || 'Debit'}
                                        onChange={(v) => handleFieldChange('type', v)}
                                        options={[
                                            { value: 'Debit', label: 'Dépense (Sortant)' },
                                            { value: 'Credit', label: 'Recette (Entrant)' },
                                        ]}
                                    />
                                </div>
                            </div>

                            <div className="p-3 bg-amber-50 rounded-sm border border-amber-100 flex gap-3">
                                <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
                                    Veuillez vérifier les informations ci-dessus. L'IA peut parfois commettre des erreurs de lecture.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 border border-slate-200 border-dashed rounded-sm bg-slate-50/50 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-4">
                            <Scan size={64} className="opacity-10" />
                            <div className="space-y-2">
                                <p className="text-sm font-black uppercase tracking-widest text-slate-300">Extraction auto</p>
                                <p className="text-xs max-w-[250px] mx-auto text-slate-400">
                                    Uploadez une facture pour voir l'IA extraire automatiquement les informations clés.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};
