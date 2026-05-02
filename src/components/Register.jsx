import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { UserPlus, Mail, Lock, ShieldCheck, AlertCircle, User } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '', // Nouveau champ
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Client' // Valeur par défaut
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError("Les mots de passe ne correspondent pas.");
        }

        setLoading(true);
        try {
            // Correspondance exacte avec ton schéma API
            await api.post('/Account/register', {
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                role: formData.role
            });
            
            alert("Compte créé avec succès !");
            navigate('/login');
        } catch (err) {
            setError(err.response?.data || "Erreur lors de l'inscription.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-full mb-4 shadow-lg shadow-emerald-200">
                        <UserPlus className="text-white w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Créer un compte</h2>
                    <p className="text-slate-500 mt-2">Rejoignez Assurix aujourd'hui</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 flex items-center text-red-700 text-sm">
        <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
        <div>
            {/* Si c'est une liste d'erreurs .NET Identity (un tableau) */}
            {Array.isArray(error) ? (
                <ul className="list-disc ml-4">
                    {error.map((err, index) => (
                        <li key={index}>{err.description || err}</li>
                    ))}
                </ul>
            ) : (
                /* Si c'est un message simple ou un objet avec une description */
                typeof error === 'object' ? (error.description || "Données invalides") : error
            )}
        </div>
    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nom Complet */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Nom Complet</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input 
                                type="text" 
                                required
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                placeholder="Intissar Massaoud"
                                onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input 
                                type="email" 
                                required
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                placeholder="votre@email.com"
                                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                            />
                        </div>
                    </div>

                    {/* Sélection du Rôle */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Type de compte</label>
                        <select 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium text-slate-700"
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                        >
                            <option value="Client">Client (Assuré)</option>
                            <option value="Admin">Administrateur</option>
                        </select>
                    </div>

                    {/* Mot de passe */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Mot de passe</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-4" />
                                <input 
                                    type="password" 
                                    required
                                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                                    placeholder="••••••••"
                                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Confirmation</label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-4" />
                                <input 
                                    type="password" 
                                    required
                                    className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                                    placeholder="••••••••"
                                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-4 rounded-xl shadow-lg shadow-emerald-100 transition-all active:scale-[0.98] disabled:opacity-70 mt-4 uppercase tracking-widest text-xs"
                    >
                        {loading ? "Création en cours..." : "S'inscrire sur Assurix"}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-slate-600 border-t pt-6 border-slate-50">
                    Déjà membre ? <Link to="/login" className="text-emerald-600 font-bold hover:underline">Se connecter ici</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;