
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api-client';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = (location.state as any)?.from?.pathname || "/admin";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const data = await apiFetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });
            login(data.access_token, data.user);
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
            <div className="max-w-md w-full bg-white rounded-sm shadow-2xl p-8">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-2">ENEA <span className="text-sky-600">ADMIN</span></h1>
                    <p className="text-slate-500">Connectez-vous à votre espace</p>
                </div>

                {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-sm text-sm border border-red-100">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 rounded-sm border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all outline-none"
                            placeholder="votre@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Mot de passe</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-sm border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all outline-none"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-sm shadow-lg shadow-sky-200 transition-all transform active:scale-[0.98]"
                    >
                        Se connecter
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                    <p className="text-sm text-slate-500">
                        Admin par défaut: <code className="bg-slate-50 px-1 rounded">admin@enea.com</code> / <code className="bg-slate-50 px-1 rounded">admin123</code>
                    </p>
                </div>
            </div>
        </div>
    );
};
