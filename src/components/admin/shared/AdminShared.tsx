
import React from 'react';
import { X } from 'lucide-react';
export { ImageUpload } from './ImageUpload';

// --- Header de Section ---
export const SectionHeader: React.FC<{ title: string; subtitle?: string; actions?: React.ReactNode; badge?: string }> = ({ title, subtitle, actions, badge }) => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-6 rounded-sm shadow-sm border border-slate-200 gap-4">
        <div>
            <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
                {badge && <span className="bg-sky-100 text-sky-800 text-xs font-bold px-2 py-0.5 rounded border border-sky-200">{badge}</span>}
            </div>
            {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
    </div>
);

// --- Champ de Saisie Standard ---
export const InputField: React.FC<{
    label: string;
    value: string | number;
    onChange: (val: string) => void;
    helper?: string;
    placeholder?: string;
    type?: 'text' | 'textarea' | 'email' | 'number' | 'date' | 'select';
    options?: { value: string, label: string }[];
    rows?: number;
    className?: string;
    disabled?: boolean;
    icon?: React.ReactNode;
}> = ({ label, value, onChange, helper, placeholder, type = 'text', rows = 4, options, className = "", disabled = false, icon }) => (
    <div className={`space-y-1.5 ${className}`}>
        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>

        <div className="relative group">
            {icon && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-600 transition-colors">
                    {icon}
                </div>
            )}

            {type === 'textarea' ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full border-slate-200 rounded-sm shadow-inner bg-slate-50/50 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 sm:text-sm p-3 border disabled:bg-slate-100 transition-all outline-none ${icon ? 'pl-11' : ''}`}
                    rows={rows}
                    placeholder={placeholder}
                    disabled={disabled}
                />
            ) : type === 'select' ? (
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full border-slate-200 rounded-sm shadow-inner bg-slate-50/50 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 sm:text-sm p-2.5 border disabled:bg-slate-100 transition-all outline-none ${icon ? 'pl-11' : ''}`}
                    disabled={disabled}
                >
                    <option value="">Sélectionner...</option>
                    {options?.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full border-slate-200 rounded-sm shadow-inner bg-slate-50/50 focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 sm:text-sm p-2.5 border disabled:bg-slate-100 transition-all outline-none ${icon ? 'pl-11' : ''}`}
                    placeholder={placeholder}
                    disabled={disabled}
                />
            )}
        </div>
        {helper && <p className="text-[10px] text-slate-400 font-medium ml-1">{helper}</p>}
    </div>
);

// --- Modal (Fenêtre contextuelle) ---
export const Modal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'md' | 'lg' | 'xl' | 'full';
}> = ({ isOpen, onClose, title, children, footer, size = 'lg' }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        md: 'max-w-md',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-[95vw] h-[90vh]'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className={`bg-white rounded-sm shadow-2xl w-full ${sizeClasses[size]} flex flex-col max-h-full animate-in fade-in zoom-in duration-200`}>
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
                    <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end gap-3 shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export const Badge: React.FC<{
    children: React.ReactNode;
    color?: 'green' | 'blue' | 'red' | 'amber' | 'slate' | 'purple' | 'sky';
    variant?: 'solid' | 'flat' | 'outline';
    className?: string;
}> = ({ children, color = 'slate', variant = 'flat', className = "" }) => {
    const variants = {
        flat: {
            green: 'bg-green-100 text-green-700',
            blue: 'bg-blue-100 text-blue-700',
            red: 'bg-red-100 text-red-700',
            amber: 'bg-amber-100 text-amber-700',
            slate: 'bg-slate-100 text-slate-700',
            purple: 'bg-purple-100 text-purple-700',
            sky: 'bg-sky-100 text-sky-700'
        },
        solid: {
            green: 'bg-green-600 text-white',
            blue: 'bg-blue-600 text-white',
            red: 'bg-red-600 text-white',
            amber: 'bg-amber-600 text-white',
            slate: 'bg-slate-600 text-white',
            purple: 'bg-purple-600 text-white',
            sky: 'bg-sky-600 text-white'
        },
        outline: {
            green: 'border border-green-200 text-green-700',
            blue: 'border border-blue-200 text-blue-700',
            red: 'border border-red-200 text-red-700',
            amber: 'border border-amber-200 text-amber-700',
            slate: 'border border-slate-200 text-slate-700',
            purple: 'border border-purple-200 text-purple-700',
            sky: 'border border-sky-200 text-sky-700'
        }
    };
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${variants[variant][color]} ${className}`}>{children}</span>;
};

// --- Card (Conteneur avec titre) ---
export const Card: React.FC<{
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    headerActions?: React.ReactNode;
    className?: string;
}> = ({ title, subtitle, children, headerActions, className = "" }) => (
    <div className={`bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden ${className}`}>
        {(title || headerActions) && (
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                    {title && <h3 className="font-bold text-slate-800 text-lg">{title}</h3>}
                    {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
                </div>
                {headerActions && <div>{headerActions}</div>}
            </div>
        )}
        <div className="p-6">{children}</div>
    </div>
);
