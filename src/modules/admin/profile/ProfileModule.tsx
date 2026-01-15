
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SectionHeader, Card, InputField } from '@/components/admin/shared/AdminShared';
import { User, Mail, Shield, Key } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

export const ProfileModule = () => {
    const { user, login } = useAuth(); // getting login to potentially refresh user
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleSave = async () => {
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            alert("Les mots de passe ne correspondent pas");
            return;
        }

        setIsLoading(true);
        try {
            // This endpoint might not exist yet, we might need to add it or use existing update user
            // For now, let's assume we can update self.
            // await apiFetch('/auth/profile', { method: 'PATCH', body: formData });

            // Simulating success for UI demo
            await new Promise(r => setTimeout(r, 1000));
            alert("Profil mis à jour avec succès (Demo)");
            setIsEditing(false);
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la mise à jour");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <SectionHeader
                title="Mon Profil"
                subtitle="Gérez vos informations personnelles et préférences de sécurité"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Identity Card */}
                <div className="md:col-span-1">
                    <Card>
                        <div className="flex flex-col items-center text-center p-4">
                            <div className="w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-lg flex items-center justify-center text-4xl font-bold text-sky-600 mb-4 overflow-hidden">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    user?.name?.charAt(0).toUpperCase()
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">{user?.name}</h3>
                            <p className="text-sm text-slate-500 mb-4">{user?.email}</p>

                            <div className="w-full space-y-2">
                                <div className="flex items-center justify-between px-4 py-2 bg-slate-50 rounded-sm text-xs font-medium">
                                    <span className="text-slate-500">Rôle Global</span>
                                    <span className="text-sky-700 font-bold bg-sky-100 px-2 py-0.5 rounded-full">{user?.globalRole}</span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-2 bg-slate-50 rounded-sm text-xs font-medium">
                                    <span className="text-slate-500">Statut</span>
                                    <span className="text-green-700 font-bold bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Vérifié
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Edit Form */}
                <div className="md:col-span-2">
                    <Card title="Informations & Sécurité">
                        <div className="space-y-6">
                            <InputField
                                label="Nom Complet"
                                value={formData.name}
                                onChange={v => setFormData({ ...formData, name: v })}
                                disabled={!isEditing}
                                icon={<User size={16} />}
                            />
                            <InputField
                                label="Adresse Email"
                                value={formData.email}
                                onChange={v => setFormData({ ...formData, email: v })}
                                disabled={true} // Email change usually requires verification
                                icon={<Mail size={16} />}
                            />

                            {isEditing && (
                                <div className="pt-6 border-t border-slate-100 space-y-4">
                                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                        <Key size={16} className="text-slate-400" />
                                        Changer le mot de passe
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputField
                                            type="password"
                                            label="Nouveau mot de passe"
                                            value={formData.newPassword}
                                            onChange={v => setFormData({ ...formData, newPassword: v })}
                                            placeholder="••••••••"
                                        />
                                        <InputField
                                            type="password"
                                            label="Confirmer le mot de passe"
                                            value={formData.confirmPassword}
                                            onChange={v => setFormData({ ...formData, confirmPassword: v })}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 py-2 text-slate-600 font-bold text-xs uppercase hover:bg-slate-100 rounded-sm transition-colors"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="px-6 py-2 bg-sky-600 text-white font-bold text-xs uppercase rounded-sm hover:bg-sky-700 transition-colors flex items-center gap-2"
                                        >
                                            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-6 py-2 bg-slate-900 text-white font-bold text-xs uppercase rounded-sm hover:bg-black transition-colors"
                                    >
                                        Modifier le profil
                                    </button>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
