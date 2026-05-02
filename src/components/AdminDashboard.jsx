import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart as BarChartIcon, PieChart as PieChartIcon, TrendingUp,
    ShieldCheck, Users, FileWarning, X,
    Eye, Search, DollarSign, Activity
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminDashboard = () => {
    const [policies, setPolicies] = useState([]);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('policies');
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [stats, setStats] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [pRes, cRes, sRes] = await Promise.all([
                api.get('/Policies'),
                api.get('/Claims/all'),
                api.get('/Analytics/dashboard')
            ]);

            setPolicies(Array.isArray(pRes.data) ? pRes.data : []);
            setClaims(Array.isArray(cRes.data) ? cRes.data : []);
            setStats(sRes.data);
        } catch {
            setPolicies([]);
            setClaims([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        setActionLoading(true);
        try {
            await api.put(`/Policies/${id}/status`, newStatus, {
                headers: { 'Content-Type': 'application/json' }
            });
            setSelectedItem(null);
            fetchAllData();
        } catch {
            alert("Erreur lors de la mise à jour du statut du contrat.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleClaimStatusChange = async (id, newStatus) => {
        setActionLoading(true);
        try {
            await api.put(`/Claims/${id}/status`, newStatus, {
                headers: { 'Content-Type': 'application/json' }
            });
            setSelectedItem(null);
            fetchAllData();
        } catch {
            alert("Erreur lors de la mise à jour du sinistre.");
        } finally {
            setActionLoading(false);
        }
    };

    const filteredPolicies = policies.filter(p =>
        p.policyNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredClaims = claims.filter(c =>
        c.id?.toString().includes(searchTerm) ||
        c.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const byCategory    = stats?.byCategory    ?? [];
    const monthlyGrowth = stats?.monthlyGrowth ?? [];

    const kpis = [
        {
            label: 'Revenu Total',
            val: stats ? `${Number(stats.totalRevenue).toLocaleString('fr-TN')} TND` : '0 TND',
            icon: <DollarSign size={20} />,
            color: 'bg-indigo-500'
        },
        {
            label: 'Contrats Actifs',
            val: stats ? stats.activePoliciesCount : policies.length,
            icon: <ShieldCheck size={20} />,
            color: 'bg-emerald-500'
        },
        {
            label: 'Sinistres',
            val: stats ? stats.totalClaimsCount : claims.length,
            icon: <FileWarning size={20} />,
            color: 'bg-rose-500'
        },
        {
            label: 'Loss Ratio Moyen',
            val: stats ? `${stats.globalLossRatio}%` : '0%',
            icon: <Activity size={20} />,
            color: 'bg-amber-500'
        },
    ];

    const POLICY_STATUS = {
        0: { label: 'En attente', bg: 'bg-amber-100',   text: 'text-amber-700'   },
        1: { label: 'Approuvé',   bg: 'bg-emerald-100', text: 'text-emerald-700' },
        2: { label: 'Refusé',     bg: 'bg-red-100',     text: 'text-red-700'     },
        3: { label: 'Expiré',     bg: 'bg-slate-100',   text: 'text-slate-500'   },
    };

    const CLAIM_STATUS = {
        0: { label: 'Soumis',   bg: 'bg-blue-100',    text: 'text-blue-700'    },
        1: { label: 'En cours', bg: 'bg-amber-100',   text: 'text-amber-700'   },
        2: { label: 'Approuvé', bg: 'bg-emerald-100', text: 'text-emerald-700' },
        3: { label: 'Refusé',   bg: 'bg-red-100',     text: 'text-red-700'     },
    };

    // ─── BUG FIX: previously the grid closed before including the Monthly Growth
    //             chart, leaving it orphaned outside the grid container.
    //             Both charts are now correctly inside the same grid div.
    const renderStats = () => (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5">
                        <div className={`${kpi.color} text-white p-4 rounded-2xl shadow-lg`}>{kpi.icon}</div>
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase">{kpi.label}</p>
                            <p className="text-2xl font-black">{kpi.val}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid — both charts inside the same grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Chart 1 — Volume par Catégorie */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
                    <h3 className="font-black text-lg mb-6 flex items-center gap-2">
                        <PieChartIcon size={20} className="text-indigo-500" /> Volume par Catégorie
                    </h3>

                    {byCategory.length > 0 ? (
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            {/* Pie Chart */}
                            <div style={{ height: 256, width: '100%', maxWidth: 250 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={byCategory}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {byCategory.map((_, index) => (
                                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            formatter={(val) => [val, 'Contrats']}
                                        />
                                        {/* BUG FIX: Legend was imported but missing from recharts import */}
                                        <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Dynamic Analysis Section */}
                            <div className="flex-1 space-y-4">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Analyse des données</p>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        La catégorie{' '}
                                        <span className="font-bold text-indigo-600">
                                            {byCategory.reduce((prev, current) => (prev.value > current.value ? prev : current)).name}
                                        </span>{' '}
                                        est actuellement dominante, représentant une part majeure de votre portefeuille d'assurances.
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="text-center flex-1">
                                        <p className="text-2xl font-black text-slate-800">{byCategory.length}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Types</p>
                                    </div>
                                    <div className="w-px bg-slate-200 h-10 self-center"></div>
                                    <div className="text-center flex-1">
                                        <p className="text-2xl font-black text-indigo-600">
                                            {byCategory.reduce((sum, item) => sum + item.value, 0)}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Total</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <EmptyState />
                    )}
                </div>

                {/* Chart 2 — Croissance Mensuelle */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <h3 className="font-black text-lg mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-emerald-500" /> Croissance Mensuelle
                    </h3>
                    {monthlyGrowth.length > 0 ? (
                        <div style={{ height: 256 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyGrowth}>
                                    <defs>
                                        <linearGradient id="colorContrats" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="contrats" stroke="#6366f1" strokeWidth={3} fill="url(#colorContrats)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <EmptyState />
                    )}
                </div>

            </div>{/* ← end charts grid */}
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-100 p-8 hidden lg:flex flex-col sticky top-0 h-screen">
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <ShieldCheck className="text-white" size={22} />
                    </div>
                    <span className="text-xl font-black tracking-tighter uppercase">Assurix Admin</span>
                </div>
                <nav className="space-y-2 flex-1">
                    <TabButton active={activeTab === 'policies'} onClick={() => setActiveTab('policies')} icon={<Users size={18} />} label="Contrats" />
                    <TabButton active={activeTab === 'claims'}   onClick={() => setActiveTab('claims')}   icon={<FileWarning size={18} />} label="Sinistres" />
                    <div className="my-6 border-t border-slate-50"></div>
                    <TabButton active={activeTab === 'stats'}    onClick={() => setActiveTab('stats')}    icon={<BarChartIcon size={18} />} label="Statistiques" isPrimary />
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 lg:p-12 overflow-auto">
                <header className="mb-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Tableau de bord</h1>
                        <p className="text-slate-500 font-medium">Gestion et analyse en temps réel</p>
                    </div>
                    {activeTab !== 'stats' && (
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                className="pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl w-80 shadow-sm outline-none focus:ring-2 ring-indigo-500/20 transition-all"
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    )}
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-indigo-500">
                        <Activity className="animate-spin mb-4" size={40} />
                        <p className="font-black text-xs uppercase tracking-widest">Chargement...</p>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {activeTab === 'stats' ? (
                            renderStats()
                        ) : (
                            <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50 border-b border-slate-100">
                                        <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                            <th className="p-6">Détails</th>
                                            <th className="p-6">Client / Date</th>
                                            <th className="p-6">Statut</th>
                                            <th className="p-6 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(activeTab === 'policies' ? filteredPolicies : filteredClaims).map(item => {
                                            const statusMap = activeTab === 'policies' ? POLICY_STATUS : CLAIM_STATUS;
                                            const s = statusMap[item.status] ?? { label: 'Inconnu', bg: 'bg-slate-100', text: 'text-slate-500' };
                                            return (
                                                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                    <td className="p-6">
                                                        <p className="font-black text-slate-800">{item.policyNumber || `Sinistre #${item.id}`}</p>
                                                        <p className="text-xs text-slate-400 font-bold uppercase">{item.insuranceType?.name || 'Standard'}</p>
                                                    </td>
                                                    <td className="p-6">
                                                        <p className="font-bold text-slate-700">{item.clientName || item.client?.fullName || 'Client Assurix'}</p>
                                                        <p className="text-xs text-slate-400">{new Date(item.createdAt || item.dateOfIncident).toLocaleDateString('fr-TN')}</p>
                                                    </td>
                                                    <td className="p-6">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${s.bg} ${s.text}`}>
                                                            {s.label}
                                                        </span>
                                                    </td>
                                                    <td className="p-6 text-right">
                                                        <button
                                                            onClick={() => setSelectedItem({ ...item, _type: activeTab })}
                                                            className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </main>

            {/* Details Modal */}
            {selectedItem && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] max-w-lg w-full shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="bg-indigo-600 px-10 py-8 flex justify-between items-start text-white">
                            <div>
                                <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">
                                    {selectedItem._type === 'policies' ? 'Contrat' : 'Sinistre'}
                                </p>
                                <h2 className="text-2xl font-black">{selectedItem.policyNumber || `#${selectedItem.id}`}</h2>
                            </div>
                            <button onClick={() => setSelectedItem(null)} className="text-indigo-200 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="px-10 py-6 space-y-3">
                            {selectedItem._type === 'policies' ? (
                                <>
                                    <Row label="Type"    val={selectedItem.insuranceType?.name || '—'} />
                                    <Row label="Prime"   val={`${selectedItem.premiumAmount} TND`} />
                                    <Row label="Payé"    val={selectedItem.isPaid ? 'Oui' : 'Non'} />
                                    <Row label="Créé le" val={new Date(selectedItem.createdAt).toLocaleDateString('fr-TN')} />
                                </>
                            ) : (
                                <>
                                    <Row label="Description" val={selectedItem.description || '—'} />
                                    <Row label="Lieu"        val={selectedItem.location || '—'} />
                                    <Row label="Estimation"  val={`${selectedItem.estimatedAmount} TND`} />
                                    {selectedItem.photos?.length > 0 && (
                                        <div className="mt-4">
                                            <p className="font-bold mb-2 text-xs text-slate-400 uppercase">Preuves Photos</p>
                                            <div className="grid grid-cols-3 gap-2">
                                                {selectedItem.photos.map((p, i) => (
                                                    <img
                                                        key={i}
                                                        src={`https://localhost:7110${p.photoUrl}`}
                                                        className="w-full h-20 object-cover rounded-xl border"
                                                        alt="Sinistre"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* BUG FIX: added key prop to AnimatePresence child (motion.div table wrapper) */}
                        {selectedItem.status === 0 && (
                            <div className="px-10 pb-8 flex gap-3">
                                <button
                                    disabled={actionLoading}
                                    onClick={() =>
                                        selectedItem._type === 'policies'
                                            ? handleStatusChange(selectedItem.id, 1)
                                            : handleClaimStatusChange(selectedItem.id, 2)
                                    }
                                    className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black hover:bg-emerald-600 transition-all disabled:opacity-50"
                                >
                                    Approuver
                                </button>
                                <button
                                    disabled={actionLoading}
                                    onClick={() =>
                                        selectedItem._type === 'policies'
                                            ? handleStatusChange(selectedItem.id, 2)
                                            : handleClaimStatusChange(selectedItem.id, 3)
                                    }
                                    className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-black hover:bg-red-100 transition-all disabled:opacity-50"
                                >
                                    Refuser
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const TabButton = ({ active, onClick, icon, label, isPrimary }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${
            active
                ? isPrimary
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                    : 'bg-indigo-50 text-indigo-600'
                : 'text-slate-400 hover:bg-slate-50'
        }`}
    >
        {icon} {label}
    </button>
);

const Row = ({ label, val }) => (
    <div className="flex justify-between items-center py-3 border-b border-slate-50">
        <span className="text-sm text-slate-400 font-bold">{label}</span>
        <span className="text-sm font-black text-slate-700">{val}</span>
    </div>
);

const EmptyState = () => (
    <div className="h-64 flex items-center justify-center text-slate-300 font-bold">
        Aucune donnée disponible
    </div>
);

export default AdminDashboard;