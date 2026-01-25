import React from 'react';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const BaseModal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-sm rounded-sm shadow-2xl overflow-hidden border border-slate-200 z-[10000]">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={18} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDangerous?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirmer",
    cancelText = "Annuler",
    isDangerous = false
}) => {
    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="p-6 text-center space-y-4">
                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${isDangerous ? 'bg-red-50 text-red-500' : 'bg-sky-50 text-sky-500'}`}>
                    {isDangerous ? <AlertTriangle size={24} /> : <Info size={24} />}
                </div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    {message}
                </p>
            </div>
            <div className="p-4 bg-slate-50 flex gap-3 border-t border-slate-100">
                <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 bg-white text-slate-600 text-xs font-bold uppercase tracking-wider border border-slate-200 rounded-sm hover:bg-slate-50 transition-all"
                >
                    {cancelText}
                </button>
                <button
                    onClick={() => {
                        onConfirm();
                        onClose();
                    }}
                    className={`flex-1 px-4 py-2 text-white text-xs font-bold uppercase tracking-wider rounded-sm shadow-md transition-all ${isDangerous
                        ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                        : 'bg-sky-500 hover:bg-sky-600 shadow-sky-500/20'
                        }`}
                >
                    {confirmText}
                </button>
            </div>
        </BaseModal>
    );
};

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'info';
}

export const AlertModal: React.FC<AlertModalProps> = ({
    isOpen,
    onClose,
    title,
    message,
    type = 'info'
}) => {
    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle size={24} />;
            case 'error': return <AlertTriangle size={24} />;
            default: return <Info size={24} />;
        }
    };

    const getColorClass = () => {
        switch (type) {
            case 'success': return 'bg-green-50 text-green-500';
            case 'error': return 'bg-red-50 text-red-500';
            default: return 'bg-sky-50 text-sky-500';
        }
    };

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="p-6 text-center space-y-4">
                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${getColorClass()}`}>
                    {getIcon()}
                </div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    {message}
                </p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100">
                <button
                    onClick={onClose}
                    className="w-full px-4 py-2 bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-slate-900 transition-all shadow-lg"
                >
                    Compris
                </button>
            </div>
        </BaseModal>
    );
};
