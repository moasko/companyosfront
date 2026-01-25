import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, Trash2, Info, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';

export const NotificationCenter: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle size={16} className="text-amber-500" />;
            case 'error': return <AlertCircle size={16} className="text-red-500" />;
            case 'success': return <CheckCircle size={16} className="text-emerald-500" />;
            default: return <Info size={16} className="text-blue-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-sky-600 transition-colors rounded-full hover:bg-slate-100"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white border border-slate-200 rounded-sm shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1 h-3 bg-sky-600 rounded-full"></div>
                            Notifications
                        </h3>
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => markAllAsRead()}
                                    className="text-[10px] font-bold text-sky-600 hover:underline"
                                >
                                    Tout lire
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={() => clearAll()}
                                    className="text-[10px] font-bold text-slate-400 hover:text-red-500"
                                >
                                    Effacer tout
                                </button>
                            )}
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="py-12 text-center">
                                <Bell size={32} className="mx-auto text-slate-200 mb-3" />
                                <p className="text-xs font-bold text-slate-400">Aucune notification pour le moment</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`px-4 py-3 border-b border-slate-50 flex gap-3 group transition-colors ${notif.read ? 'opacity-60' : 'bg-sky-50/30'}`}
                                >
                                    <div className="mt-0.5 shrink-0">
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <p className={`text-xs font-bold leading-tight ${notif.read ? 'text-slate-600' : 'text-slate-900'}`}>
                                                {notif.title}
                                            </p>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeNotification(notif.id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                                            {notif.message}
                                        </p>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">
                                                {formatDistanceToNow(new Date(notif.date), { addSuffix: true, locale: fr })}
                                            </span>
                                            {!notif.read && (
                                                <button
                                                    onClick={() => markAsRead(notif.id)}
                                                    className="flex items-center gap-1 text-[9px] font-black text-sky-600 uppercase tracking-tighter"
                                                >
                                                    <Check size={10} /> Marquer lu
                                                </button>
                                            )}
                                        </div>
                                        {notif.link && (
                                            <Link
                                                to={notif.link}
                                                onClick={() => {
                                                    markAsRead(notif.id);
                                                    setIsOpen(false);
                                                }}
                                                className="mt-2 block w-full py-1 text-center bg-slate-50 hover:bg-slate-100 rounded-sm text-[9px] font-black uppercase text-slate-500 tracking-widest border border-slate-200 transition-all"
                                            >
                                                Ouvrir l'action
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
