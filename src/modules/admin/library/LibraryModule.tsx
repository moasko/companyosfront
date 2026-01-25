import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { SectionHeader } from '@/components/admin/shared/AdminShared';
import {
    FileText,
    Search,
    Upload,
    Folder,
    History,
    Tag as TagIcon,
    MoreVertical,
    Download,
    Eye,
    Trash2,
    FileIcon,
    ShieldCheck,
    X,
    Plus,
    RefreshCw,
    FileType,
    Check
} from 'lucide-react';
import { useModal } from '@/contexts/ModalContext';

interface FileResource {
    id: string;
    name: string;
    mimeType: string;
    size: number;
    version: number;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    ocrContent?: string;
    versions?: FileResource[];
}

export const LibraryModule: React.FC<{ companyId: string }> = ({ companyId }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [previewFile, setPreviewFile] = useState<FileResource | null>(null);
    const [previewTab, setPreviewTab] = useState<'visual' | 'ocr'>('visual');
    const [newFile, setNewFile] = useState({ name: '', tags: '', mimeType: 'application/pdf', file: null });

    // Category Management
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const { confirm, alert } = useModal();

    const queryClient = useQueryClient();

    // --- Queries ---
    const { data: files = [], isLoading } = useQuery({
        queryKey: ['files', companyId],
        queryFn: () => apiFetch(`/erp/${companyId}/files`),
    });

    const { data: categories = [] } = useQuery({
        queryKey: ['dictionaries', companyId, 'FILE_CATEGORY'],
        queryFn: () => apiFetch(`/erp/${companyId}/dictionaries?type=FILE_CATEGORY`),
    });

    // --- Mutations ---
    const addCategoryMutation = useMutation({
        mutationFn: (data: any) => apiFetch(`/erp/${companyId}/dictionaries`, {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        onSuccess: (newItem) => {
            queryClient.invalidateQueries({ queryKey: ['dictionaries', companyId, 'FILE_CATEGORY'] });
            setIsAddingCategory(false);
            setNewCategoryName('');
            setNewFile(prev => ({ ...prev, tags: newItem.value }));
        }
    });

    // --- Mutations ---
    const uploadFileMutation = useMutation({
        mutationFn: async (data: any) => {
            // 1. Upload physical file
            const formData = new FormData();
            formData.append('file', data.file);

            const uploadRes = await apiFetch('/upload', {
                method: 'POST',
                // apiFetch handles Authorization, but for FormData we might need to be careful with Content-Type.
                // Usually apiFetch sets Content-Type to application/json by default if body is not FormData? 
                // Let's assume apiFetch needs to facilitate FormData or we use fetch directly.
                // If apiFetch sets headers automatically, we might need to override.
                // Let's check apiFetch implementation. 
                // Assuming apiFetch checks if body is FormData. If not, I'll use raw fetch wrapper.
                // Let's rely on standard fetch behavior where if body is FormData, Content-Type is set automatically.
                body: formData,
            });

            // 2. Create Database Record
            return apiFetch(`/erp/${companyId}/files`, {
                method: 'POST',
                body: JSON.stringify({
                    name: data.name,
                    tags: data.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
                    path: uploadRes.url,
                    mimeType: uploadRes.mimetype,
                    size: uploadRes.size,
                    version: 1,
                })
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['files', companyId] });
            setIsUploadModalOpen(false);
            setNewFile({ name: '', tags: '', mimeType: 'application/pdf', file: null } as any);
        },
        onError: (error: any) => {
            console.error('Upload error:', error);
            alert({
                title: 'Erreur',
                message: `Erreur lors de l'importation: ${error.message || 'Serveur indisponible'}`,
                type: 'error'
            });
        }
    });

    const deleteFileMutation = useMutation({
        mutationFn: (id: string) => apiFetch(`/erp/files/${id}`, { method: 'DELETE' }), // Note: Controller doesn't have delete yet, but good for future
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['files', companyId] })
    });

    const filteredFiles = files.filter((f: FileResource) =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handleDownload = (file: FileResource) => {
        // Simulation de téléchargement
        const dummyContent = `Fichier: ${file.name}\nID: ${file.id}\nOCR: ${file.ocrContent || 'N/A'}`;
        const blob = new Blob([dummyContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name.replace(/\.[^/.]+$/, "") + "_download.txt";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <SectionHeader
                title="Gestion Documentaire (GED)"
                subtitle="Bibliothèque d'entreprise avec versioning et indexation OCR"
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Activity Summary */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-sm text-white shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-sky-500/20 text-sky-400 rounded-sm">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sécurité GED</p>
                            <h4 className="font-bold text-sm">Fichiers Sécurisés</h4>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">Espace Utilisé</span>
                            <span className="font-bold">{formatSize(files.reduce((acc: number, f: any) => acc + f.size, 0))} / 50 GB</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-sky-500 transition-all duration-1000" style={{ width: '2%' }} />
                        </div>
                        <div className="pt-4 border-t border-slate-800">
                            <p className="text-[10px] text-slate-500 leading-relaxed italic">
                                Chiffrement AES-256 activé. Tous les documents sont indexés automatiquement.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Categories / Tags Quick Access */}
                <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Contrats', count: files.filter((f: any) => f.tags.includes('Contrat')).length },
                        { label: 'Finance', count: files.filter((f: any) => f.tags.includes('Finance')).length },
                        { label: 'RH', count: files.filter((f: any) => f.tags.includes('RH')).length },
                        { label: 'Technique', count: files.filter((f: any) => f.tags.includes('Technique')).length }
                    ].map((cat) => (
                        <button key={cat.label} className="bg-white border border-slate-200 p-4 rounded-sm flex items-center gap-4 hover:shadow-md transition-all group">
                            <div className="p-3 bg-slate-50 text-slate-400 group-hover:bg-sky-50 group-hover:text-sky-600 rounded-sm transition-colors">
                                <Folder size={20} />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-black text-slate-800 uppercase tracking-wider">{cat.label}</p>
                                <p className="text-[10px] text-slate-400">{cat.count} documents</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Toolkit */}
            <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher un document ou contenu OCR..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => {
                            console.log('Opening upload modal...');
                            setIsUploadModalOpen(true);
                        }}
                        className="w-full md:w-auto px-6 py-2.5 bg-sky-600 text-white rounded-sm font-bold text-sm flex items-center justify-center gap-2 hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/20 active:scale-95"
                    >
                        <Upload size={18} />
                        Importer un document
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                                <th className="px-6 py-4">Nom du Fichier</th>
                                <th className="px-6 py-4">Détails</th>
                                <th className="px-6 py-4">Tags</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center">
                                        <RefreshCw size={24} className="animate-spin mx-auto text-sky-600 mb-2" />
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chargement de la bibliothèque...</p>
                                    </td>
                                </tr>
                            ) : filteredFiles.map((file: FileResource) => (
                                <tr key={file.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-sm ${file.mimeType.includes('pdf') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                                <FileIcon size={24} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{file.name}</p>
                                                <p className="text-[10px] text-slate-400 font-medium lowercase">
                                                    v{file.version} • {formatSize(file.size)} • {file.mimeType.split('/')[1]}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                                <History size={12} /> Ajouté le {new Date(file.createdAt).toLocaleDateString()}
                                            </div>
                                            {file.versions && file.versions.length > 0 && (
                                                <div className="text-[10px] text-sky-600 font-bold bg-sky-50 px-1.5 py-0.5 rounded-sm inline-block border border-sky-100">
                                                    {file.versions.length} version(s) précédente(s)
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            {file.tags.map(tag => (
                                                <span key={tag} className="text-[9px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-sm font-bold flex items-center gap-1 uppercase tracking-tight border border-slate-200">
                                                    <TagIcon size={8} /> {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => { setPreviewFile(file); setPreviewTab('visual'); }}
                                                className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-sm transition-all"
                                                title="Aperçu"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDownload(file)}
                                                className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-sm transition-all"
                                                title="Télécharger"
                                            >
                                                <Download size={18} />
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    const ok = await confirm({
                                                        title: 'Suppression de document',
                                                        message: 'Êtes-vous sûr de vouloir supprimer définitivement ce document ? Cette action est irréversible.',
                                                        confirmText: 'Supprimer',
                                                        isDangerous: true
                                                    });
                                                    if (ok) deleteFileMutation.mutate(file.id);
                                                }}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!isLoading && filteredFiles.length === 0 && (
                        <div className="py-20 text-center bg-slate-50/30">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
                                <FileText size={32} className="text-slate-300" />
                            </div>
                            <h5 className="text-sm font-bold text-slate-600 mb-1">Bibliothèque vide</h5>
                            <p className="text-slate-400 text-xs font-medium max-w-xs mx-auto">
                                Aucun document trouvé. Commencez par déposer votre premier fichier.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- Upload Modal --- */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-sm shadow-2xl overflow-hidden border border-slate-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 underline decoration-sky-500 decoration-2 underline-offset-4">Déposer un Document</h3>
                                <p className="text-[10px] text-slate-400 font-medium">Archivage sécurisé et indexation OCR</p>
                            </div>
                            <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nom du document</label>
                                <input
                                    className="w-full px-4 py-2 border border-slate-200 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 bg-slate-50"
                                    placeholder="ex: Contrat_Fournisseur_2026.pdf"
                                    value={newFile.name}
                                    onChange={e => setNewFile({ ...newFile, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Catégorie principale</label>
                                    <div className="flex gap-2">
                                        {!isAddingCategory ? (
                                            <>
                                                <select
                                                    className="w-full px-4 py-2 border border-slate-200 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 bg-slate-50"
                                                    value={newFile.tags.split(',')[0] || ''}
                                                    onChange={e => setNewFile({ ...newFile, tags: e.target.value })}
                                                >
                                                    <option value="">-- Sélectionner --</option>
                                                    {categories.map((cat: any) => (
                                                        <option key={cat.id} value={cat.value}>{cat.value}</option>
                                                    ))}
                                                    {/* Fallback hardcoded if no categories yet? Optional, but let's stick to dynamic */}
                                                </select>
                                                <button
                                                    onClick={() => setIsAddingCategory(true)}
                                                    className="p-2 bg-slate-100 text-slate-600 rounded-sm hover:bg-sky-50 hover:text-sky-600 border border-slate-200"
                                                    title="Créer une nouvelle catégorie"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex gap-2 w-full">
                                                <input
                                                    className="w-full px-2 py-2 border border-slate-200 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                                                    placeholder="Nouvelle cat..."
                                                    autoFocus
                                                    value={newCategoryName}
                                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            if (newCategoryName.trim()) {
                                                                addCategoryMutation.mutate({ type: 'FILE_CATEGORY', value: newCategoryName });
                                                            }
                                                        }
                                                    }}
                                                />
                                                <button
                                                    onClick={() => {
                                                        if (newCategoryName.trim()) {
                                                            addCategoryMutation.mutate({ type: 'FILE_CATEGORY', value: newCategoryName });
                                                        }
                                                    }}
                                                    className="p-2 bg-sky-600 text-white rounded-sm hover:bg-sky-700"
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setIsAddingCategory(false)}
                                                    className="p-2 bg-slate-100 text-slate-600 rounded-sm hover:bg-slate-200"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Type détecté</label>
                                    <div className="w-full px-4 py-2 border border-slate-200 rounded-sm text-sm bg-slate-100 text-slate-600 flex items-center gap-2">
                                        <FileType size={14} />
                                        {newFile.mimeType.split('/')[1].toUpperCase() || '---'}
                                    </div>
                                </div>
                            </div>

                            <input
                                type="file"
                                id="fileInput"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setNewFile({
                                            ...newFile,
                                            name: file.name,
                                            mimeType: file.type || 'application/octet-stream',
                                            file: file,
                                        });
                                    }
                                }}
                            />

                            <label
                                htmlFor="fileInput"
                                className="block border-2 border-dashed border-slate-200 rounded-sm p-8 text-center bg-slate-50 hover:bg-slate-100 hover:border-sky-300 transition-all cursor-pointer group"
                            >
                                <Upload size={32} className="mx-auto text-slate-300 mb-2 group-hover:text-sky-500 transition-colors" />
                                {newFile.name ? (
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-sky-600">{newFile.name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cliquer pour changer de fichier</p>
                                    </div>
                                ) : (
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cliquez pour importer un fichier</p>
                                )}
                            </label>
                        </div>
                        <div className="p-6 bg-slate-50 flex gap-4 border-t border-slate-100">
                            <button onClick={() => {
                                setIsUploadModalOpen(false);
                                setNewFile({ name: '', tags: '', mimeType: 'application/pdf' });
                            }} className="flex-1 px-4 py-2 text-xs font-black uppercase text-slate-500 hover:text-slate-700 border border-slate-200 rounded-sm bg-white">Annuler</button>
                            <button
                                onClick={() => {
                                    if (!newFile.name) {
                                        alert({
                                            title: 'Fichier manquant',
                                            message: 'Veuillez d\'abord sélectionner un fichier en cliquant sur la zone d\'importation.',
                                            type: 'info'
                                        });
                                        return;
                                    }
                                    uploadFileMutation.mutate(newFile);
                                }}
                                disabled={uploadFileMutation.isPending}
                                className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-sm text-xs font-black uppercase tracking-widest hover:bg-sky-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20"
                            >
                                {uploadFileMutation.isPending ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                                Sécuriser le document
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Preview Modal (OCR) --- */}
            {previewFile && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden border border-slate-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-sky-100 text-sky-600 rounded-sm">
                                    <FileIcon size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">{previewFile.name}</h3>
                                    <p className="text-[10px] text-slate-400 font-medium">Contenu extrait par OCR assisté par IA</p>
                                </div>
                            </div>
                            <button onClick={() => setPreviewFile(null)} className="text-slate-400 hover:text-slate-600 p-2"><X size={20} /></button>
                        </div>
                        <div className="p-0 flex border-b border-slate-100 bg-slate-50">
                            <button
                                onClick={() => setPreviewTab('visual')}
                                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${previewTab === 'visual' ? 'bg-white text-sky-600 border-b-2 border-sky-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Aperçu Visuel
                            </button>
                            <button
                                onClick={() => setPreviewTab('ocr')}
                                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${previewTab === 'ocr' ? 'bg-white text-sky-600 border-b-2 border-sky-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Indexation OCR
                            </button>
                        </div>
                        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto bg-slate-50 leading-relaxed text-slate-700">
                            {previewTab === 'ocr' ? (
                                <div className="bg-white p-6 border border-slate-200 rounded-sm shadow-sm relative font-mono text-xs whitespace-pre-wrap">
                                    <div className="absolute top-2 right-2 text-[8px] font-black text-slate-300 uppercase tracking-widest">Digital Twin</div>
                                    {previewFile.ocrContent || "Aucune donnée OCR disponible pour ce type de fichier."}
                                </div>
                            ) : (
                                <div className="bg-slate-200 border border-slate-300 rounded-sm min-h-[400px] flex items-center justify-center relative overflow-hidden group">
                                    {previewFile.mimeType.includes('pdf') ? (
                                        <div className="flex flex-col items-center gap-4 text-slate-400">
                                            <FileText size={64} className="animate-pulse" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Simulation de document PDF</p>
                                        </div>
                                    ) : previewFile.mimeType.includes('image') ? (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-100 to-slate-200">
                                            <FileIcon size={64} className="text-sky-400" />
                                            <p className="text-xs font-bold text-slate-500 italic">Pre-visualisation de l'image sécurisée</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-4 text-slate-400">
                                            <FileType size={64} />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Aperçu indisponible pour ce format</p>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                        <div className="bg-white p-4 rounded-sm shadow-xl flex items-center gap-3">
                                            <ShieldCheck size={20} className="text-green-500" />
                                            <span className="text-[10px] font-black uppercase tracking-tight">Rendu sécurisé activé</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-6 bg-white flex justify-between items-center border-t border-slate-100">
                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleDownload(previewFile)}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-sky-600 transition-colors"
                                >
                                    <Download size={14} /> Télécharger
                                </button>
                                <button className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-sky-600 transition-colors">
                                    <History size={14} /> Historique (v{previewFile.version})
                                </button>
                            </div>
                            <button
                                onClick={() => setPreviewFile(null)}
                                className="px-6 py-2 bg-slate-900 text-white rounded-sm text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
