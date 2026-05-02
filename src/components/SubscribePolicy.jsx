import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldPlus, CreditCard, AlertTriangle, Upload, FileText, CheckCircle2 } from 'lucide-react';

const SubscribePolicy = ({ onPolicyCreated }) => {
    const [insuranceTypes, setInsuranceTypes] = useState([]);
    const [formData, setFormData] = useState({
        insuranceTypeId: '',
        durationInMonths: 12,
        extraData: {
            numPieces: 1,
            age: 25,
            puissanceFiscale: 4,
            licensePlate: ''
        }
    });
    
    // ✅ État pour les fichiers
    const [files, setFiles] = useState({
        carteGrise: null,
        permisConduire: null
    });

    const [status, setStatus] = useState('idle');
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        api.get('/InsuranceTypes').then(res => setInsuranceTypes(res.data));
    }, []);

    const selectedType = insuranceTypes.find(t => t.id === parseInt(formData.insuranceTypeId))?.name;

    const calculatePremium = () => {
        if (!selectedType) return 0;
        let base = 0;
        switch (selectedType) {
            case 'Automobile':
                const cv = parseInt(formData.extraData.puissanceFiscale) || 4;
                base = 400 + (cv * 50);
                break;
            case 'Habitation':
                const pieces = parseInt(formData.extraData.numPieces) || 1;
                base = 200 * Math.pow(1.1, pieces - 1);
                break;
            case 'Santé':
                const age = parseInt(formData.extraData.age) || 20;
                base = age < 30 ? 300 : age < 50 ? 500 : 800;
                break;
            default: base = 300;
        }
        return Math.round(base);
    };

    const validateForm = () => {
        if (!formData.insuranceTypeId) return "Veuillez choisir un type d'assurance.";
        if (selectedType === 'Automobile') {
            if (!formData.extraData.licensePlate) return "L'immatriculation est obligatoire.";
            if (!files.carteGrise || !files.permisConduire) return "Veuillez uploader la carte grise et le permis.";
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const error = validateForm();
        if (error) { setValidationError(error); return; }

        setValidationError('');
        setStatus('submitting');

        try {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(startDate.getMonth() + parseInt(formData.durationInMonths));

            // ✅ Utilisation de FormData pour envoyer les fichiers
            const data = new FormData();
            data.append('PolicyNumber', `POL-${selectedType?.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`);
            data.append('StartDate', startDate.toISOString());
            data.append('EndDate', endDate.toISOString());
            data.append('PremiumAmount', calculatePremium());
            data.append('InsuranceTypeId', formData.insuranceTypeId);
            data.append('Description', JSON.stringify(formData.extraData));
            data.append('Status', "0"); // Pending_Approval

            // ✅ Ajout des fichiers au FormData
            if (files.carteGrise) data.append('CarteGriseFile', files.carteGrise);
            if (files.permisConduire) data.append('PermisConduireFile', files.permisConduire);

            const response = await api.post('/Policies', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.status === 201 || response.status === 200) {
                setStatus('success');
                setTimeout(() => {
                    onPolicyCreated();
                    setStatus('idle');
                }, 2000);
            }
        } catch (err) {
            const serverMsg = err.response?.data?.title || err.response?.data || "Erreur serveur.";
            setValidationError(serverMsg);
            setStatus('idle');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100">
            <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                <ShieldPlus className="text-indigo-600" /> Nouvelle Souscription
            </h2>

            {validationError && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-3 text-sm font-bold">
                    <AlertTriangle size={20} /> {validationError}
                </div>
            )}

            <div className="space-y-6">
                {/* Sélection Type */}
                <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Garantie souhaitée</label>
                    <select 
                        className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none ring-2 ring-transparent focus:ring-indigo-500/10 transition-all"
                        onChange={(e) => setFormData({...formData, insuranceTypeId: e.target.value})}
                        required
                    >
                        <option value="">Sélectionner...</option>
                        {insuranceTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>

                {/* Section Automobile avec Uploads */}
                {selectedType === 'Automobile' && (
                    <div className="space-y-4 animate-in fade-in duration-500">
                        <div className="grid grid-cols-2 gap-4 p-5 bg-slate-50 rounded-3xl border border-slate-100">
                            <input 
                                placeholder="Immatriculation (ex: 218 TUN 1234)" 
                                className="p-4 rounded-xl border-none font-bold text-sm bg-white"
                                onChange={(e) => setFormData({...formData, extraData: {...formData.extraData, licensePlate: e.target.value}})}
                                required
                            />
                            <select 
                                className="p-4 rounded-xl border-none font-bold text-sm bg-white"
                                onChange={(e) => setFormData({...formData, extraData: {...formData.extraData, puissanceFiscale: e.target.value}})}
                            >
                                <option value="4">4 CV</option>
                                <option value="7">7 CV</option>
                                <option value="10">10+ CV</option>
                            </select>
                        </div>

                        {/* ✅ Zone d'upload pour documents officiels */}
                        <div className="grid grid-cols-2 gap-4">
                            <label className={`relative flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-2xl transition-all cursor-pointer ${files.carteGrise ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-indigo-400'}`}>
                                <Upload size={20} className={files.carteGrise ? 'text-emerald-500' : 'text-slate-400'} />
                                <span className="text-[10px] font-black uppercase mt-2 text-center">
                                    {files.carteGrise ? 'Carte Grise OK' : 'Carte Grise'}
                                </span>
                                <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => setFiles({...files, carteGrise: e.target.files[0]})} />
                            </label>

                            <label className={`relative flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-2xl transition-all cursor-pointer ${files.permisConduire ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-indigo-400'}`}>
                                <Upload size={20} className={files.permisConduire ? 'text-emerald-500' : 'text-slate-400'} />
                                <span className="text-[10px] font-black uppercase mt-2 text-center">
                                    {files.permisConduire ? 'Permis OK' : 'Permis de Conduire'}
                                </span>
                                <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => setFiles({...files, permisConduire: e.target.files[0]})} />
                            </label>
                        </div>
                    </div>
                )}

                {/* Autres types d'assurance... (Habitation, Santé) */}
                {/* Garde ton code existant pour Habitation et Santé ici */}

                {/* Résumé et Bouton */}
                <div className="bg-slate-900 p-6 rounded-[2rem] text-white flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-bold uppercase opacity-50">Prime Estimée</p>
                        <p className="text-3xl font-black">{calculatePremium()} TND</p>
                    </div>
                    <CheckCircle2 size={32} className={status === 'success' ? 'text-emerald-400' : 'opacity-20'} />
                </div>

                <button 
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg disabled:opacity-50"
                >
                    {status === 'submitting' ? 'Envoi du dossier...' : 'Envoyer pour approbation'}
                </button>
            </div>
        </form>
    );
};

export default SubscribePolicy;