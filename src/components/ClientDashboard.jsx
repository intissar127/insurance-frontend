import React, { useEffect, useState } from 'react';
import api from '../services/api';
import PolicyCard from '../components/PolicyCard';
import SubscribePolicy from './SubscribePolicy';
import ClaimForm from './ClaimForm';
import {
    LayoutDashboard, Shield, FileText, Plus, CreditCard, X,
    AlertTriangle, ChevronRight, Settings, LogOut, User, Lock, Calendar,
    Pencil, Save, XCircle
} from 'lucide-react';

const STATUS_LABELS = {
    0: '⏳ En attente',
    1: '📋 Déclaré',
    2: '✅ Approuvé',
    3: '❌ Refusé',
};

// Normalise l'URL photo : évite le double slash si photoUrl commence déjà par /
const photoUrl = (raw) => {
    if (!raw) return '';

    if (raw.startsWith('http')) return raw;

    if (raw.includes('/uploads/')) {
        return `https://localhost:7110${raw.startsWith('/') ? '' : '/'}${raw}`;
    }

    return `https://localhost:7110/uploads/${raw}`;
};

const ClientDashboard = () => {
    const [myPolicies, setMyPolicies] = useState([]);
    const [myClaims, setMyClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showSubscribe, setShowSubscribe] = useState(false);
    const [showClaimForm, setShowClaimForm] = useState(false);
    const [selectedPolicyForPayment, setSelectedPolicyForPayment] = useState(null);
    const [paying, setPaying] = useState(false);

    // ── Sinistre modal state ──
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({});

    const [cardData, setCardData] = useState({
        cardHolder: '', cardNumber: '', expiry: '', cvv: ''
    });

    useEffect(() => { fetchClientData(); }, []);

    const fetchClientData = async () => {
        setLoading(true);
        try {
            const [policiesRes, claimsRes] = await Promise.all([
                api.get('/Policies/my-policies'),
                api.get('/Claims/my-claims')
            ]);
            setMyPolicies(Array.isArray(policiesRes.data) ? policiesRes.data : []);
            setMyClaims(Array.isArray(claimsRes.data) ? claimsRes.data : []);
            setError(null);
        } catch {
            setError("Erreur de connexion au serveur.");
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        if (!cardData.cardHolder || !cardData.cardNumber || !cardData.expiry || !cardData.cvv) {
            alert("Veuillez remplir tous les champs de paiement.");
            return;
        }
        setPaying(true);
        try {
            await api.post(`/Payments/simulate/${selectedPolicyForPayment.id}`);
            setSelectedPolicyForPayment(null);
            setCardData({ cardHolder: '', cardNumber: '', expiry: '', cvv: '' });
            fetchClientData();
        } catch {
            alert("Erreur lors du paiement. Veuillez réessayer.");
        } finally {
            setPaying(false);
        }
    };

    const formatCardNumber = (val) =>
        val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

    const formatExpiry = (val) => {
        const clean = val.replace(/\D/g, '').slice(0, 4);
        return clean.length >= 3 ? clean.slice(0, 2) + '/' + clean.slice(2) : clean;
    };

    const approvedPolicies = myPolicies.filter(p => p.status === 1 && p.isPaid);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    // ── Ouvrir le modal sinistre ──
    const openClaim = (claim) => {
        setSelectedClaim(claim);
        setEditMode(false);
        setForm({});
    };

    // ── Fermer le modal sinistre ──
    const closeClaim = () => {
        setSelectedClaim(null);
        setEditMode(false);
        setForm({});
    };

    // ── Passer en mode édition ──
    const startEdit = () => {
    setForm({
        description: selectedClaim.description || '',
        dateOfIncident: (selectedClaim.dateOfIncident || '').split('T')[0],
        estimatedAmount: selectedClaim.estimatedAmount || 0,
        location: selectedClaim.location || '',

        newFiles: [],
        deletedPhotoIds: [],
    });

    setEditMode(true);
};

    // ── Sauvegarder les modifications ──
    const handleSave = async () => {
    setSaving(true);

    try {
        const formData = new FormData();

        formData.append("Description", form.description);
        formData.append(
            "DateOfIncident",
            new Date(form.dateOfIncident).toISOString()
        );
        formData.append("EstimatedAmount", form.estimatedAmount);
        formData.append("Location", form.location || '');

        form.deletedPhotoIds.forEach(id => {
            formData.append("DeletedPhotoIds", id);
        });

        form.newFiles.forEach(file => {
            formData.append("NewFiles", file);
        });

        await api.put(`/Claims/${selectedClaim.id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });

        closeClaim();
        fetchClientData();

    } catch {
        alert("Erreur lors de la mise à jour du sinistre.");
    } finally {
        setSaving(false);
    }
};

    // Le client peut modifier uniquement si status === 0 (Pending) ou 1 (Submitted/Déclaré)
    const canEdit = selectedClaim && (selectedClaim.status === 0 || selectedClaim.status === 1);
console.log("Selected Claim:", selectedClaim);
console.log("Photos:", selectedClaim?.photos);
    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row font-sans">
            {/* ── Sidebar ── */}
            <aside className="w-full lg:w-72 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-200">
                            <Shield size={24} />
                        </div>
                        <span className="text-2xl font-black text-slate-800 tracking-tighter">Assurix</span>
                    </div>
                    <nav className="space-y-2">
                        <button className="w-full flex items-center gap-4 px-4 py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-bold transition-all">
                            <LayoutDashboard size={20} /> Tableau de bord
                        </button>
                        <button className="w-full flex items-center gap-4 px-4 py-4 text-slate-400 hover:bg-slate-50 rounded-2xl font-bold transition-all">
                            <FileText size={20} /> Mes Documents
                        </button>
                        <button className="w-full flex items-center gap-4 px-4 py-4 text-slate-400 hover:bg-slate-50 rounded-2xl font-bold transition-all">
                            <Settings size={20} /> Paramètres
                        </button>
                    </nav>
                </div>
                <div className="mt-auto p-8 border-t border-slate-100">
                    <button onClick={handleLogout} className="flex items-center gap-3 text-red-500 font-bold hover:translate-x-1 transition-transform">
                        <LogOut size={20} /> Déconnexion
                    </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <main className="flex-1 p-6 lg:p-12 overflow-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 mb-2">Mon Espace</h1>
                        <p className="text-slate-500 font-medium">Gérez vos contrats et déclarez vos sinistres en quelques clics.</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-3xl shadow-sm border border-slate-100">
                        <div className="bg-slate-100 p-3 rounded-2xl text-slate-600"><User size={20} /></div>
                        <div className="pr-4"><p className="text-sm font-black text-slate-800">Client Privilège</p></div>
                    </div>
                </header>

                {error && (
                    <div className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl font-bold mb-8 border border-red-100">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black text-slate-800">Mes Contrats</h2>
                            <button
                                onClick={() => setShowSubscribe(true)}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-100"
                            >
                                <Plus size={20} /> Nouveau Contrat
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-100">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                                <p className="text-slate-400 font-bold">Chargement de vos garanties...</p>
                            </div>
                        ) : myPolicies.length > 0 ? (
                            <div className="grid gap-6">
                                {myPolicies.map(policy => (
                                    <PolicyCard
                                        key={policy.id}
                                        policy={policy}
                                        onPayClick={() => setSelectedPolicyForPayment(policy)}
                                        onClaimClick={() => setShowClaimForm(true)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white p-16 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center">
                                <p className="text-slate-400 font-bold text-lg">Aucun contrat actif pour le moment.</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-8">
                        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200">
                            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                                <AlertTriangle className="text-orange-400" size={24} /> Urgence
                            </h3>
                            <p className="text-slate-400 text-sm mb-6 font-medium">Un accident ? Déclarez votre sinistre immédiatement pour une prise en charge rapide.</p>
                            <button
                                onClick={() => setShowClaimForm(true)}
                                disabled={approvedPolicies.length === 0}
                                className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all ${
                                    approvedPolicies.length > 0
                                    ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-900/20"
                                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                                }`}
                            >
                                Déclarer un sinistre
                            </button>
                            {approvedPolicies.length === 0 && (
                                <p className="text-[10px] text-orange-400/60 mt-3 text-center font-bold uppercase tracking-wider">
                                    Nécessite un contrat approuvé et payé
                                </p>
                            )}
                        </div>

                        {/* ── Liste des sinistres récents ── */}
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                            <h2 className="text-xl font-black text-slate-800 mb-6 tracking-tight">Dernières Activités</h2>
                            <div className="space-y-6">
                                {myClaims.length > 0 ? myClaims.slice(0, 4).map((claim, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => openClaim(claim)}
                                        className="flex items-center gap-4 group cursor-pointer hover:bg-slate-50 p-3 rounded-xl transition"
                                    >
                                        <div className="bg-slate-50 text-slate-400 p-3 rounded-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                            <FileText size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-black text-slate-700">Sinistre #{claim.id}</p>
                                            <p className="text-xs text-slate-400 font-bold">
                                                {new Date(claim.dateOfIncident || claim.createdAt).toLocaleDateString('fr-TN')}
                                            </p>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
                                    </div>
                                )) : (
                                    <p className="text-slate-400 text-sm font-bold">Aucune activité récente.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* ══════════════════════════════════════════
                Modal — Détails & Édition du Sinistre
            ══════════════════════════════════════════ */}
            {selectedClaim && (
                <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">

                        {/* Bouton fermer */}
                        <button onClick={closeClaim} className="absolute top-4 right-4 text-slate-400 hover:text-black">
                            <X size={24} />
                        </button>

                        {/* En-tête avec bouton Modifier */}
                        <div className="flex items-center justify-between mb-6 pr-8">
                            <h2 className="text-2xl font-black">Sinistre #{selectedClaim.id}</h2>
                            {/* Bouton Modifier visible seulement si statut 0 ou 1 ET pas déjà en mode édition */}
                            {canEdit && !editMode && (
                                <button
                                    onClick={startEdit}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-100 transition"
                                >
                                    <Pencil size={15} /> Modifier
                                </button>
                            )}
                        </div>

                        {/* ── Mode lecture ── */}
                        {!editMode ? (
                            <div className="space-y-3 text-sm">
                                <InfoRow label="📅 Date"        val={new Date(selectedClaim.dateOfIncident).toLocaleDateString('fr-TN')} />
                                <InfoRow label="💰 Montant Estimé"     val={`${selectedClaim.estimatedAmount} TND`} />
                                <InfoRow label="📝 Description" val={selectedClaim.description} block />
                                {selectedClaim.location &&
                                    <InfoRow label="📍 Localisation" val={selectedClaim.location} />}
                                <InfoRow label="📌 Statut"      val={STATUS_LABELS[selectedClaim.status] ?? selectedClaim.status} />
                            </div>
                        ) : (
                            /* ── Mode édition ── */
                            <div className="space-y-4 text-sm">
                                <Field label="📅 Date de l'incident">
                                    <input
                                        type="date"
                                        value={form.dateOfIncident}
                                        onChange={e => setForm(f => ({ ...f, dateOfIncident: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 ring-indigo-400"
                                    />
                                </Field>

                                <Field label="💰 Montant estimé (TND)">
                                    <input
                                        type="number"
                                        value={form.estimatedAmount}
                                        onChange={e => setForm(f => ({ ...f, estimatedAmount: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 ring-indigo-400"
                                    />
                                </Field>

                                <Field label="📝 Description">
                                    <textarea
                                        rows={3}
                                        value={form.description}
                                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 ring-indigo-400 resize-none"
                                    />
                                </Field>

                                <Field label="📍 Localisation">
                                    <input
                                        type="text"
                                        value={form.location}
                                        onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 ring-indigo-400"
                                    />
                                </Field>

                                {/* Boutons Enregistrer / Annuler */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition disabled:opacity-50"
                                    >
                                        <Save size={16} />
                                        {saving ? 'Enregistrement…' : 'Enregistrer'}
                                    </button>
                                    <button
                                        onClick={() => setEditMode(false)}
                                        disabled={saving}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition"
                                    >
                                        <XCircle size={16} /> Annuler
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── Photos — toujours affichées en lecture seule ── */}
                        {selectedClaim.photos && selectedClaim.photos.length > 0 && (
                            <div className="mt-6">
                                <p className="font-bold mb-3 text-xs text-slate-400 uppercase tracking-widest">
                                    Photos ({selectedClaim.photos.length})
                                </p>
                                <div className="grid grid-cols-3 gap-2">
                                    {selectedClaim.photos.map((photo, i) => (
                                        <img
                                            key={i}
                                            src={photoUrl(photo.photoUrl)}
                                            alt={`Photo ${i + 1}`}
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                            className="w-full h-24 object-cover rounded-xl border border-slate-100"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ══════════════════════════════
                Modal — Paiement
            ══════════════════════════════ */}
            {selectedPolicyForPayment && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] max-w-lg w-full shadow-2xl overflow-hidden">
                        <div className="bg-indigo-600 px-10 py-8 flex justify-between items-start">
                            <div>
                                <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Paiement sécurisé</p>
                                <h2 className="text-2xl font-black text-white">{selectedPolicyForPayment.insuranceType?.name || 'Assurance'}</h2>
                                <p className="text-indigo-200 text-sm mt-1">N° {selectedPolicyForPayment.policyNumber}</p>
                            </div>
                            <button onClick={() => setSelectedPolicyForPayment(null)} className="text-indigo-200 hover:text-white p-1 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="bg-indigo-50 px-10 py-5 flex justify-between items-center border-b border-indigo-100">
                            <span className="text-slate-500 font-bold text-sm">Montant à régler</span>
                            <span className="text-3xl font-black text-indigo-600">{selectedPolicyForPayment.premiumAmount} <span className="text-lg">TND</span></span>
                        </div>
                        <form onSubmit={handlePaymentSubmit} className="px-10 py-8 space-y-5">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nom sur la carte</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input
                                        type="text"
                                        placeholder="PRÉNOM NOM"
                                        value={cardData.cardHolder}
                                        onChange={e => setCardData({...cardData, cardHolder: e.target.value.toUpperCase()})}
                                        className="w-full pl-10 pr-4 py-4 rounded-2xl border border-slate-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-slate-50 tracking-widest placeholder:tracking-normal placeholder:font-normal"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Numéro de carte</label>
                                <div className="relative">
                                    <CreditCard size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input
                                        type="text"
                                        placeholder="0000 0000 0000 0000"
                                        value={cardData.cardNumber}
                                        onChange={e => setCardData({...cardData, cardNumber: formatCardNumber(e.target.value)})}
                                        className="w-full pl-10 pr-4 py-4 rounded-2xl border border-slate-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-slate-50 tracking-widest placeholder:tracking-normal placeholder:font-normal"
                                        maxLength={19}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Expiration</label>
                                    <div className="relative">
                                        <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input
                                            type="text"
                                            placeholder="MM/AA"
                                            value={cardData.expiry}
                                            onChange={e => setCardData({...cardData, expiry: formatExpiry(e.target.value)})}
                                            className="w-full pl-10 pr-4 py-4 rounded-2xl border border-slate-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-slate-50"
                                            maxLength={5}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">CVV</label>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input
                                            type="password"
                                            placeholder="•••"
                                            value={cardData.cvv}
                                            onChange={e => setCardData({...cardData, cvv: e.target.value.replace(/\D/g,'').slice(0,4)})}
                                            className="w-full pl-10 pr-4 py-4 rounded-2xl border border-slate-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-slate-50"
                                            maxLength={4}
                                        />
                                    </div>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={paying}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-5 rounded-[1.5rem] font-black shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 mt-2"
                            >
                                {paying ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Traitement en cours...
                                    </>
                                ) : (
                                    <>
                                        <Lock size={18} /> Payer {selectedPolicyForPayment.premiumAmount} TND
                                    </>
                                )}
                            </button>
                            <p className="text-center text-xs text-slate-300 font-bold flex items-center justify-center gap-1">
                                <Lock size={11} /> Paiement simulé — aucune donnée réelle transmise
                            </p>
                        </form>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════
                Modal — Souscription
            ══════════════════════════════ */}
            {showSubscribe && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-10 shadow-2xl relative">
                        <button className="absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-full transition-colors" onClick={() => setShowSubscribe(false)}>
                            <X size={28} />
                        </button>
                        <SubscribePolicy onSuccess={() => { setShowSubscribe(false); fetchClientData(); }} />
                    </div>
                </div>
            )}

            {/* ══════════════════════════════
                Modal — Formulaire sinistre
            ══════════════════════════════ */}
            {showClaimForm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-10 shadow-2xl relative">
                        <button className="absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-full transition-colors" onClick={() => setShowClaimForm(false)}>
                            <X size={28} />
                        </button>
                        <h2 className="text-3xl font-black text-slate-900 mb-8">Déclarer un incident</h2>
                        <ClaimForm
                            approvedPolicies={approvedPolicies}
                            onSuccess={() => { setShowClaimForm(false); fetchClientData(); }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Composants utilitaires locaux ───────────────────────────────────────────

const InfoRow = ({ label, val, block }) => (
    <div className={block ? 'space-y-1' : 'flex justify-between items-start gap-4'}>
        <span className="font-bold text-slate-600 whitespace-nowrap">{label} :</span>
        <span className={`text-slate-800 ${block ? '' : 'text-right'}`}>{val}</span>
    </div>
);

const Field = ({ label, children }) => (
    <div className="space-y-1">
        <label className="font-bold text-slate-500 text-xs uppercase tracking-widest">{label}</label>
        {children}
    </div>
);

export default ClientDashboard;