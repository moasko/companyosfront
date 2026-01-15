
import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, X, CheckCircle2, AlertCircle } from 'lucide-react';


interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
    helper?: string;
    className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, label, helper, className = "" }) => {
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setStatus('idle');

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Using raw fetch for multipart/form-data as our apiFetch might expect JSON
            // We need to pass the Bearer token manually if apiFetch doesn't handle FormData well
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            const fullUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${data.url}`;
            onChange(fullUrl);
            setStatus('success');
            setTimeout(() => setStatus('idle'), 3000);
        } catch (error) {
            console.error("Upload error", error);
            setStatus('error');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
        onChange('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {label && <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>}

            <div className={`relative group border-2 border-dashed rounded-sm transition-all h-40 flex flex-col items-center justify-center overflow-hidden bg-slate-50/50 ${value ? 'border-sky-200' : 'border-slate-200 hover:border-sky-300 hover:bg-white'}`}>
                {value ? (
                    <>
                        <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 bg-white rounded-full text-sky-600 hover:scale-110 transition-transform"
                                title="Changer l'image"
                            >
                                <Upload size={18} />
                            </button>
                            <button
                                onClick={removeImage}
                                className="p-2 bg-white rounded-full text-red-500 hover:scale-110 transition-transform"
                                title="Supprimer"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </>
                ) : (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-sky-600 transition-colors"
                    >
                        {uploading ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" />
                        ) : (
                            <ImageIcon size={32} />
                        )}
                        <span className="text-xs font-bold uppercase tracking-wide">{uploading ? 'Téléchargement...' : 'Cliquer pour uploader'}</span>
                    </button>
                )}

                {status === 'success' && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-lg animate-bounce">
                        <CheckCircle2 size={14} />
                    </div>
                )}

                {status === 'error' && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-lg">
                        <AlertCircle size={14} />
                    </div>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />

            {helper && <p className="text-[10px] text-slate-400 font-medium ml-1">{helper}</p>}
        </div>
    );
};
