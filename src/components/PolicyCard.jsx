import { Shield, AlertTriangle, CreditCard, XCircle } from 'lucide-react';

const PolicyCard = ({ policy, onClaimClick, onPayClick }) => {
    const isPaid = policy.isPaid;
    const isApproved = policy.status === 1;
    const isRejected = policy.status === 2;
    const isCanceled = policy.status === 5;

    // Récupère le nom du type ou la valeur brute si l'objet n'est pas inclut
    const insuranceType = policy.insuranceType?.name || policy.insuranceType || "Assurance";

    // Gestion dynamique des styles et libellés de statut
    const getStatusConfig = () => {
        if (isApproved && isPaid) return { label: 'Protégé', classes: 'bg-emerald-100 text-emerald-700', iconClass: 'bg-emerald-50 text-emerald-600' };
        if (isApproved && !isPaid) return { label: 'Paiement requis', classes: 'bg-indigo-100 text-indigo-700', iconClass: 'bg-indigo-50 text-indigo-600' };
        if (isRejected) return { label: 'Rejeté', classes: 'bg-red-100 text-red-700', iconClass: 'bg-red-50 text-red-600' };
        if (isCanceled) return { label: 'Annulé', classes: 'bg-slate-200 text-slate-600', iconClass: 'bg-slate-100 text-slate-400' };
        return { label: 'En attente d\'approbation', classes: 'bg-amber-100 text-amber-700', iconClass: 'bg-amber-50 text-amber-600' };
    };

    const statusConfig = getStatusConfig();

    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 hover:shadow-md transition-all mb-4">
            <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${statusConfig.iconClass}`}>
                        {isRejected || isCanceled ? <XCircle size={28} /> : <Shield size={28} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex flex-col">
                                <h3 className="font-black text-slate-800 text-lg leading-tight">
                                    {insuranceType}
                                </h3>
                                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                                    Contrat {insuranceType}
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusConfig.classes}`}>
                                {statusConfig.label}
                            </span>
                        </div>
                        <p className="text-sm text-slate-400 font-medium mt-1">N° {policy.policyNumber}</p>
                        {policy.startDate && (
                            <p className="text-xs text-slate-300 font-medium">
                                Du {new Date(policy.startDate).toLocaleDateString('fr-TN')} 
                                {policy.endDate && ` au ${new Date(policy.endDate).toLocaleDateString('fr-TN')}`}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right mr-4">
                        <p className="text-xs font-bold text-slate-400 uppercase">Prime</p>
                        <p className={`text-xl font-black ${isCanceled || isRejected ? 'text-slate-400 line-through' : 'text-indigo-600'}`}>
                            {policy.premiumAmount} TND
                        </p>
                    </div>

                    {/* Logique des boutons d'action */}
                    {isApproved && !isPaid ? (
                        <button
                            onClick={() => onPayClick(policy)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all"
                        >
                            <CreditCard size={18} /> Payer
                        </button>
                    ) : isApproved && isPaid ? (
                        <button
                            onClick={() => onClaimClick(policy)}
                            className="p-3 bg-slate-900 text-white hover:bg-rose-600 rounded-2xl transition-all shadow-lg"
                            title="Déclarer un sinistre"
                        >
                            <AlertTriangle size={20} />
                        </button>
                    ) : isRejected ? (
                        <div className="px-5 py-3 bg-red-50 text-red-500 rounded-2xl font-bold text-sm border border-red-100">
                            Dossier refusé
                        </div>
                    ) : (
                        <div className="px-5 py-3 bg-slate-50 text-slate-400 rounded-2xl font-bold text-sm">
                            {isCanceled ? 'Contrat clos' : 'En attente'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PolicyCard;