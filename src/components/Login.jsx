import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { ShieldCheck, Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
        const userData = await login(credentials.email, credentials.password);
        
        // --- AJOUTE CES LIGNES ICI ---
        localStorage.setItem('token', userData.token); 
        localStorage.setItem('user', JSON.stringify(userData));
        // -----------------------------

        const userRole = userData.role || userData.Role; 
        if (userRole === 'Admin') {
            navigate('/admindashboard', { replace: true });
        } else {
            navigate('/ClientDashboard', { replace: true });
        }
    } catch {
        setError("Email ou mot de passe incorrect.");
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                
                {/* Header avec Logo/Icône */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 shadow-lg shadow-blue-200">
                        <ShieldCheck className="text-white w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Bienvenue sur Assurix</h2>
                    <p className="text-slate-500 mt-2">Gérez vos contrats en toute sécurité</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 flex items-center text-red-700 text-sm">
                        <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Input Email */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Adresse Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input 
                                type="email" 
                                required
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="exemple@assurance.tn"
                                onChange={(e) => setCredentials({...credentials, email: e.target.value})} 
                            />
                        </div>
                    </div>

                    {/* Input Password */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Mot de passe</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input 
                                type="password" 
                                required
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                                onChange={(e) => setCredentials({...credentials, password: e.target.value})} 
                            />
                        </div>
                    </div>

                    {/* Bouton Connexion */}
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md shadow-blue-100 transition-all transform active:scale-[0.98] disabled:opacity-70"
                    >
                        {loading ? "Connexion en cours..." : "Accéder à mon espace"}
                    </button>
                </form>

                <div className="mt-8 text-center border-t pt-6 border-slate-100">
                    <p className="text-sm text-slate-500 italic">
                        Besoin d'aide ? <span className="text-blue-600 cursor-pointer font-medium hover:underline">Contactez votre conseiller</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;