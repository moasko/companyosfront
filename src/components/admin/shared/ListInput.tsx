import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface ListInputProps {
    label?: string;
    items: string[];
    onChange: (items: string[]) => void;
    placeholder?: string;
    helper?: string;
}

export const ListInput: React.FC<ListInputProps> = ({ label, items, onChange, placeholder = "Ajouter un élément...", helper }) => {
    const [inputValue, setInputValue] = useState("");

    const handleAdd = () => {
        if (inputValue.trim()) {
            onChange([...items, inputValue.trim()]);
            setInputValue("");
        }
    };

    const handleRemove = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        onChange(newItems);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <div className="space-y-2">
            {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}

            <div className="flex gap-2">
                <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                />
                <button
                    type="button"
                    onClick={handleAdd}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                >
                    <Plus size={16} />
                </button>
            </div>

            {items.length > 0 && (
                <ul className="mt-3 grid grid-cols-1 gap-2">
                    {items.map((item, idx) => (
                        <li key={idx} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded border border-slate-200 text-sm">
                            <span className="text-slate-700 font-medium truncate">{item}</span>
                            <button
                                type="button"
                                onClick={() => handleRemove(idx)}
                                className="text-slate-400 hover:text-red-500 p-1 rounded-full hover:bg-white transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {/* Helper text */}
            {helper && <p className="text-xs text-slate-500 mt-1">{helper}</p>}
        </div>
    );
};
