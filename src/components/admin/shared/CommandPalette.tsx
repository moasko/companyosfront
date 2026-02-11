import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Command,
  ArrowRight,
  Package,
  Calculator,
  Users,
  Target,
  CheckSquare,
  Settings,
  Home,
  Globe,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAVIGATION_ITEMS = [
  { id: 'nav-home', label: "Vue d'ensemble", icon: <Home size={18} />, path: '/admin' },
  {
    id: 'nav-stock',
    label: 'Gestion des Stocks',
    icon: <Package size={18} />,
    path: '/admin/stock',
  },
  {
    id: 'nav-finance',
    label: 'Finance & Devis',
    icon: <Calculator size={18} />,
    path: '/admin/finance',
  },
  { id: 'nav-hr', label: 'Ressources Humaines', icon: <Users size={18} />, path: '/admin/hr' },
  { id: 'nav-crm', label: 'CRM & Commercial', icon: <Target size={18} />, path: '/admin/crm' },
  {
    id: 'nav-tasks',
    label: 'Tâches & Projets',
    icon: <CheckSquare size={18} />,
    path: '/admin/tasks',
  },
  {
    id: 'nav-settings',
    label: 'Paramètres',
    icon: <Settings size={18} />,
    path: '/admin/settings',
  },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredItems = NAVIGATION_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSelectedIndex(0);
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        // Handled in parent but good to have here too
      }

      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleNavigate(filteredItems[selectedIndex].path);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] transition-opacity"
        onClick={onClose}
      />
      <div className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white rounded-sm shadow-2xl z-[101] overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <Search className="text-slate-400" size={20} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Rechercher une page, un client ou une commande... (Try 'stock' or 'finance')"
            className="flex-1 bg-transparent border-none outline-none text-lg font-medium text-slate-800 placeholder:text-slate-300"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-sm text-[10px] font-black text-slate-400 uppercase tracking-widest">
            esc
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto py-2">
          {filteredItems.length > 0 ? (
            <div className="px-2">
              <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Navigation Rapide
              </div>
              {filteredItems.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-sm transition-all text-left group ${idx === selectedIndex ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'text-slate-600 hover:bg-slate-50'}`}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-sm ${idx === selectedIndex ? 'bg-white/20' : 'bg-slate-100'}`}
                    >
                      {item.icon}
                    </div>
                    <span className="font-bold">{item.label}</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 transition-transform duration-300 ${idx === selectedIndex ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}
                  >
                    <span className="text-[10px] font-black uppercase opacity-60">Aller à</span>
                    <ArrowRight size={14} />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-8 py-12 text-center text-slate-400">
              <Command size={32} className="mx-auto mb-4 opacity-10" />
              <p className="text-sm font-medium italic">Aucun résultat trouvé pour "{query}"</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white border border-slate-200 rounded shadow-sm">↵</kbd>{' '}
              Valider
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white border border-slate-200 rounded shadow-sm">↑↓</kbd>{' '}
              Naviguer
            </span>
          </div>
          <div>Tapez pour filtrer les résultats</div>
        </div>
      </div>
    </>
  );
};
