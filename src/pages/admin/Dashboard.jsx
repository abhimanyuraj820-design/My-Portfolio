import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";
import API_BASE_URL from "../../config";

import {
    Menu, FileText, MessageSquare, Mail, Star,
    Clock, CheckCircle, X, XCircle,
    RefreshCw, Users, Loader, AlertCircle,
    DollarSign, BarChart3,
    Layers, Target, Award, Sparkles,
    ChevronRight, IndianRupee, Briefcase,
    MessageCircle, Phone, Eye, PieChart, Zap, TrendingUp
} from "lucide-react";

const STATUS_CFG = {
    pending: { label: "Pending", bg: "bg-amber-500", light: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    in_progress: { label: "In Progress", bg: "bg-blue-500", light: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
    completed: { label: "Completed", bg: "bg-emerald-500", light: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    rejected: { label: "Rejected", bg: "bg-red-500", light: "bg-red-500/15 text-red-400 border-red-500/30" },
};

const StatusBadge = ({ status }) => {
    const c = STATUS_CFG[status] || STATUS_CFG.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${c.light}`}>
            <span className={`w-2 h-2 rounded-full ${c.bg}`} />
            {c.label}
        </span>
    );
};

const Dashboard = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [selectedContact, setSelectedContact] = useState(null);
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    const fetchStats = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true); else setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/dashboard/stats`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) { setStats(await res.json()); setLastUpdated(new Date()); }
        } catch (e) { console.error(e); }
        setLoading(false); setRefreshing(false);
    }, []);

    useEffect(() => { fetchStats(); const t = setInterval(() => fetchStats(true), 30000); return () => clearInterval(t); }, [fetchStats]);

    const timeAgo = (d) => { const ms = Date.now() - new Date(d); const m = Math.floor(ms / 60000), h = Math.floor(ms / 3600000), dy = Math.floor(ms / 86400000); if (m < 1) return 'Now'; if (m < 60) return `${m}m`; if (h < 24) return `${h}h`; return `${dy}d`; };
    const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const fmtCurrency = (n) => { if (!n) return '₹0'; if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L'; if (n >= 1000) return '₹' + (n / 1000).toFixed(1) + 'K'; return '₹' + Number(n).toLocaleString('en-IN'); };
    const openWhatsApp = (m) => { let p = m.replace(/[^\d+]/g, ''); if (!p.startsWith('+')) p = '+91' + p; window.open(`https://wa.me/${p.replace('+', '')}`, '_blank'); };
    const openEmail = (e, n) => window.open(`mailto:${e}?subject=${encodeURIComponent('Re: Portfolio Inquiry')}&body=${encodeURIComponent(`Hi ${n},\n\n`)}`, '_blank');

    return (
        <div className="flex min-h-screen bg-[#0f1117]">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 md:ml-64 min-h-screen overflow-x-hidden">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#161822] border-b border-[#252836] sticky top-0 z-30">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 text-white/60 hover:text-white rounded-lg transition-colors"><Menu size={20} /></button>
                    <h1 className="text-white font-bold flex-1 text-lg">Dashboard</h1>
                    <button onClick={() => fetchStats(true)} className={`p-2 text-white/40 hover:text-white rounded-lg ${refreshing ? 'animate-spin' : ''}`}><RefreshCw size={16} /></button>
                </div>

                <div className="p-4 md:p-6 xl:p-8 relative">
                    {/* Ambient Background Glows */}
                    <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
                    <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
                    {/* Desktop Header */}
                    <div className="hidden md:flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-extrabold text-white">Dashboard</h1>
                            <p className="text-white/40 text-sm mt-1">Real-time overview of your business</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/25">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-emerald-400 text-xs font-bold">LIVE</span>
                            </div>
                            <button onClick={() => fetchStats(true)} disabled={refreshing}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#252836] hover:bg-[#2d3044] text-white/70 text-sm font-medium border border-[#353849] transition-all">
                                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 bg-[#1a1d2e] p-1.5 rounded-xl mb-6 w-full md:w-fit overflow-x-auto custom-scrollbar flex-nowrap border border-[#252836]">
                        {[
                            { id: 'overview', label: 'Overview', icon: Layers },
                            { id: 'clients', label: 'Clients', icon: Users },
                            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 min-w-[120px] md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25'
                                    : 'text-white/40 hover:text-white/70'}`}>
                                <tab.icon size={14} /> {tab.label}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-4">
                            <Loader size={28} className="animate-spin text-purple-500" />
                            <p className="text-white/30 text-sm">Loading dashboard...</p>
                        </div>
                    ) : stats ? (
                        <>
                            {/* ═══════ OVERVIEW ═══════ */}
                            {activeTab === 'overview' && (
                                <div className="space-y-5">
                                    {/* Stat Cards - Gradient Style */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        {/* Blogs */}
                                        <div onClick={() => navigate('/x7k9m2p4q/blogs')} className="cursor-pointer group rounded-2xl p-5 bg-gradient-to-br from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all hover:scale-[1.02]">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                                                    <FileText size={20} className="text-white" />
                                                </div>
                                                <ChevronRight size={16} className="text-white/40 group-hover:text-white/80 transition-colors" />
                                            </div>
                                            <p className="text-4xl font-black text-white mb-1">{stats.blogs.total}</p>
                                            <p className="text-white/60 text-sm font-medium">Total Blogs</p>
                                            <div className="flex gap-3 mt-3 pt-3 border-t border-white/15">
                                                <span className="text-white/50 text-xs">{stats.blogs.published} published</span>
                                                <span className="text-white/50 text-xs">{stats.blogs.draft} draft</span>
                                            </div>
                                        </div>

                                        {/* Testimonials */}
                                        <div onClick={() => navigate('/x7k9m2p4q/testimonials')} className="cursor-pointer group rounded-2xl p-5 bg-gradient-to-br from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all hover:scale-[1.02]">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                                                    <MessageSquare size={20} className="text-white" />
                                                </div>
                                                <ChevronRight size={16} className="text-white/40 group-hover:text-white/80 transition-colors" />
                                            </div>
                                            <p className="text-4xl font-black text-white mb-1">{stats.testimonials.total}</p>
                                            <p className="text-white/60 text-sm font-medium">Testimonials</p>
                                            <div className="flex gap-3 mt-3 pt-3 border-t border-white/15">
                                                <span className="text-white/50 text-xs">{stats.testimonials.approved} approved</span>
                                                <span className="text-white/50 text-xs">{stats.testimonials.pending} pending</span>
                                            </div>
                                        </div>

                                        {/* Client Inquiries */}
                                        <div onClick={() => navigate('/x7k9m2p4q/contacts')} className="cursor-pointer group rounded-2xl p-5 bg-gradient-to-br from-orange-500 to-pink-600 hover:from-orange-400 hover:to-pink-500 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all hover:scale-[1.02]">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                                                    <Users size={20} className="text-white" />
                                                </div>
                                                <ChevronRight size={16} className="text-white/40 group-hover:text-white/80 transition-colors" />
                                            </div>
                                            <p className="text-4xl font-black text-white mb-1">{stats.contacts.total}</p>
                                            <p className="text-white/60 text-sm font-medium">Client Inquiries</p>
                                            <div className="flex gap-3 mt-3 pt-3 border-t border-white/15">
                                                <span className="text-white/50 text-xs">{stats.contacts.unread} unread</span>
                                                <span className="text-white/50 text-xs">{stats.contacts.read} read</span>
                                            </div>
                                        </div>

                                        {/* Avg Rating */}
                                        <div onClick={() => navigate('/x7k9m2p4q/testimonials')} className="cursor-pointer group rounded-2xl p-5 bg-gradient-to-br from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all hover:scale-[1.02]">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                                                    <Star size={20} className="text-white" />
                                                </div>
                                                <ChevronRight size={16} className="text-white/40 group-hover:text-white/80 transition-colors" />
                                            </div>
                                            <div className="flex items-baseline gap-1 mb-1">
                                                <p className="text-4xl font-black text-white">{stats.testimonials.avgRating}</p>
                                                <span className="text-white/50 text-lg">/5</span>
                                            </div>
                                            <p className="text-white/60 text-sm font-medium">Avg Rating</p>
                                            <div className="flex gap-0.5 mt-3 pt-3 border-t border-white/15">
                                                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} className={s <= Math.round(stats.testimonials.avgRating) ? "text-white fill-white" : "text-white/25"} />)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Revenue + Pipeline + Payments */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                        {/* Revenue */}
                                        <div className="bg-[#1a1d2e] rounded-2xl p-6 border border-[#252836]">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
                                                    <IndianRupee size={18} className="text-white" />
                                                </div>
                                                <h3 className="text-white font-bold text-lg">Revenue</h3>
                                            </div>
                                            <div className="space-y-5">
                                                <div>
                                                    <p className="text-white/30 text-xs uppercase tracking-widest font-bold mb-1">Total Quoted</p>
                                                    <p className="text-2xl font-extrabold text-white">{fmtCurrency(stats.contacts.totalQuoted)}</p>
                                                </div>
                                                <div className="h-px bg-[#252836]" />
                                                <div>
                                                    <p className="text-white/30 text-xs uppercase tracking-widest font-bold mb-1">Received</p>
                                                    <p className="text-2xl font-extrabold text-emerald-400">{fmtCurrency(stats.contacts.totalPaid)}</p>
                                                </div>
                                                <div className="h-px bg-[#252836]" />
                                                <div>
                                                    <p className="text-white/30 text-xs uppercase tracking-widest font-bold mb-1">Outstanding</p>
                                                    <p className="text-2xl font-extrabold text-amber-400">{fmtCurrency(stats.contacts.totalQuoted - stats.contacts.totalPaid)}</p>
                                                </div>
                                                {stats.contacts.totalQuoted > 0 && (
                                                    <div className="pt-2">
                                                        <div className="flex justify-between text-xs mb-2">
                                                            <span className="text-white/30 font-medium">Collection</span>
                                                            <span className="text-emerald-400 font-bold">{Math.round((stats.contacts.totalPaid / stats.contacts.totalQuoted) * 100)}%</span>
                                                        </div>
                                                        <div className="h-3 bg-[#252836] rounded-full overflow-hidden">
                                                            <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all" style={{ width: `${Math.min(100, Math.round((stats.contacts.totalPaid / stats.contacts.totalQuoted) * 100))}%` }} />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Pipeline */}
                                        <div className="bg-[#1a1d2e] rounded-2xl p-6 border border-[#252836]">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/20">
                                                    <Target size={18} className="text-white" />
                                                </div>
                                                <h3 className="text-white font-bold text-lg">Pipeline</h3>
                                            </div>
                                            <div className="space-y-4">
                                                {[
                                                    { key: 'pending', label: 'Pending', gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-500' },
                                                    { key: 'in_progress', label: 'In Progress', gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500' },
                                                    { key: 'completed', label: 'Completed', gradient: 'from-emerald-500 to-green-500', bg: 'bg-emerald-500' },
                                                    { key: 'rejected', label: 'Rejected', gradient: 'from-red-500 to-pink-500', bg: 'bg-red-500' },
                                                ].map(({ key, label, gradient, bg }) => {
                                                    const count = stats.contacts.statusBreakdown[key] || 0;
                                                    const pct = stats.contacts.total ? Math.round((count / stats.contacts.total) * 100) : 0;
                                                    return (
                                                        <div key={key}>
                                                            <div className="flex justify-between items-center mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`w-3 h-3 rounded-md ${bg}`} />
                                                                    <span className="text-white/70 text-sm font-medium">{label}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-white font-bold text-sm">{count}</span>
                                                                    <span className="text-white/25 text-xs">{pct}%</span>
                                                                </div>
                                                            </div>
                                                            <div className="h-2.5 bg-[#252836] rounded-full overflow-hidden">
                                                                <div className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Payments */}
                                        <div className="bg-[#1a1d2e] rounded-2xl p-6 border border-[#252836]">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
                                                    <DollarSign size={18} className="text-white" />
                                                </div>
                                                <h3 className="text-white font-bold text-lg">Payments</h3>
                                            </div>
                                            <div className="space-y-4">
                                                {[
                                                    { key: 'paid', label: 'Paid', gradient: 'from-emerald-500 to-green-500', bg: 'bg-emerald-500' },
                                                    { key: 'partial', label: 'Partial', gradient: 'from-amber-500 to-yellow-500', bg: 'bg-amber-500' },
                                                    { key: 'unpaid', label: 'Unpaid', gradient: 'from-red-500 to-rose-500', bg: 'bg-red-500' },
                                                ].map(({ key, label, gradient, bg }) => {
                                                    const count = stats.contacts.paymentBreakdown[key] || 0;
                                                    const pct = stats.contacts.total ? Math.round((count / stats.contacts.total) * 100) : 0;
                                                    return (
                                                        <div key={key}>
                                                            <div className="flex justify-between items-center mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`w-3 h-3 rounded-md ${bg}`} />
                                                                    <span className="text-white/70 text-sm font-medium">{label}</span>
                                                                </div>
                                                                <span className="text-white font-bold text-sm">{count}</span>
                                                            </div>
                                                            <div className="h-2.5 bg-[#252836] rounded-full overflow-hidden">
                                                                <div className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="mt-6 pt-4 border-t border-[#252836] grid grid-cols-3 gap-3">
                                                {[
                                                    { label: 'Published', value: stats.blogs.published, color: 'text-purple-400' },
                                                    { label: 'Approved', value: stats.testimonials.approved, color: 'text-cyan-400' },
                                                    { label: 'Featured', value: stats.blogs.featured, color: 'text-amber-400' },
                                                ].map(({ label, value, color }) => (
                                                    <div key={label} className="text-center bg-[#252836] rounded-xl p-3">
                                                        <p className={`text-xl font-black ${color}`}>{value}</p>
                                                        <p className="text-white/30 text-[10px] font-bold uppercase mt-0.5">{label}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Services + Recent */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {/* Services */}
                                        <div className="bg-[#1a1d2e] rounded-2xl p-6 border border-[#252836]">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-md shadow-pink-500/20">
                                                    <Briefcase size={18} className="text-white" />
                                                </div>
                                                <h3 className="text-white font-bold text-lg">Services</h3>
                                            </div>
                                            {Object.keys(stats.contacts.serviceBreakdown).length > 0 ? (
                                                <div className="space-y-4">
                                                    {Object.entries(stats.contacts.serviceBreakdown).sort(([, a], [, b]) => b - a).map(([svc, count], i) => {
                                                        const pct = Math.round((count / stats.contacts.total) * 100);
                                                        const grads = ['from-purple-500 to-blue-500', 'from-cyan-500 to-teal-500', 'from-orange-500 to-pink-500', 'from-emerald-500 to-green-500', 'from-amber-500 to-yellow-500'];
                                                        const colors = ['text-purple-400', 'text-cyan-400', 'text-orange-400', 'text-emerald-400', 'text-amber-400'];
                                                        return (
                                                            <div key={svc}>
                                                                <div className="flex justify-between text-sm mb-2">
                                                                    <span className="text-white/60 font-medium truncate">{svc}</span>
                                                                    <span className={`font-bold ${colors[i % colors.length]}`}>{count} <span className="text-white/20">({pct}%)</span></span>
                                                                </div>
                                                                <div className="h-2.5 bg-[#252836] rounded-full overflow-hidden">
                                                                    <div className={`h-full bg-gradient-to-r ${grads[i % grads.length]} rounded-full`} style={{ width: `${pct}%` }} />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : <p className="text-white/20 text-center py-8">No data yet</p>}
                                        </div>

                                        {/* Recent */}
                                        <div className="bg-[#1a1d2e] rounded-2xl border border-[#252836] overflow-hidden">
                                            <div className="flex items-center justify-between p-6 pb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/20">
                                                        <Mail size={18} className="text-white" />
                                                    </div>
                                                    <h3 className="text-white font-bold text-lg">Recent Inquiries</h3>
                                                </div>
                                                <button onClick={() => navigate('/x7k9m2p4q/contacts')}
                                                    className="text-purple-400 text-xs font-bold hover:text-purple-300 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-all">
                                                    View All
                                                </button>
                                            </div>
                                            {stats.contacts.recent.length > 0 ? (
                                                <div>
                                                    {stats.contacts.recent.map((c, i) => (
                                                        <div key={c.id} onClick={() => setSelectedContact(c)}
                                                            className={`flex items-center gap-3 px-6 py-3.5 cursor-pointer hover:bg-[#252836]/50 transition-all ${i !== stats.contacts.recent.length - 1 ? 'border-b border-[#252836]' : ''}`}>
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${!c.isRead ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white' : 'bg-[#252836] text-white/40'}`}>
                                                                {c.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-0.5">
                                                                    <p className="text-white font-semibold text-sm truncate">{c.name}</p>
                                                                    {!c.isRead && <span className="w-2 h-2 rounded-full bg-purple-500" />}
                                                                </div>
                                                                <p className="text-white/30 text-xs truncate">{c.subject || 'General Inquiry'}</p>
                                                            </div>
                                                            <StatusBadge status={c.status} />
                                                            <span className="text-white/25 text-xs hidden md:block">{timeAgo(c.created_at)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : <p className="text-white/20 text-center py-12">No inquiries yet</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ═══════ CLIENTS ═══════ */}
                            {activeTab === 'clients' && (
                                <div className="space-y-5">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { key: 'pending', label: 'Pending', gradient: 'from-amber-500 to-orange-600' },
                                            { key: 'in_progress', label: 'In Progress', gradient: 'from-blue-500 to-cyan-600' },
                                            { key: 'completed', label: 'Completed', gradient: 'from-emerald-500 to-green-600' },
                                            { key: 'rejected', label: 'Rejected', gradient: 'from-red-500 to-pink-600' },
                                        ].map(({ key, label, gradient }) => (
                                            <div key={key} className={`rounded-2xl p-5 bg-gradient-to-br ${gradient} shadow-lg text-center`}>
                                                <p className="text-4xl font-black text-white">{stats.contacts.statusBreakdown[key] || 0}</p>
                                                <p className="text-white/70 text-sm font-medium mt-1">{label}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-[#1a1d2e] rounded-2xl border border-[#252836] overflow-hidden">
                                        <div className="px-6 py-4 border-b border-[#252836] flex items-center justify-between">
                                            <h3 className="text-white font-bold">All Clients</h3>
                                            <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-3 py-1 rounded-full font-bold">{stats.contacts.total}</span>
                                        </div>
                                        {stats.contacts.recent.map((c, i) => (
                                            <div key={c.id} onClick={() => setSelectedContact(c)}
                                                className={`flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-[#252836]/50 transition-all ${i !== stats.contacts.recent.length - 1 ? 'border-b border-[#252836]' : ''}`}>
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${!c.isRead ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white' : 'bg-[#252836] text-white/40'}`}>
                                                    {c.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white font-semibold text-sm truncate">{c.name}</p>
                                                    <p className="text-white/30 text-xs truncate">{c.email}</p>
                                                </div>
                                                <StatusBadge status={c.status} />
                                                <span className="text-white/25 text-xs hidden md:block">{timeAgo(c.created_at)}</span>
                                            </div>
                                        ))}
                                        <div className="px-6 py-3 border-t border-[#252836]">
                                            <button onClick={() => navigate('/x7k9m2p4q/contacts')} className="w-full text-center text-purple-400 text-sm font-bold hover:text-purple-300 transition-colors">View All Clients →</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ═══════ ANALYTICS ═══════ */}
                            {activeTab === 'analytics' && (
                                <div className="space-y-5">
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                        {[
                                            { label: 'Blogs', value: stats.blogs.total, gradient: 'from-purple-600 to-indigo-600' },
                                            { label: 'Published', value: stats.blogs.published, gradient: 'from-emerald-500 to-green-600' },
                                            { label: 'Featured', value: stats.blogs.featured, gradient: 'from-amber-500 to-yellow-600' },
                                            { label: 'Reviews', value: stats.testimonials.total, gradient: 'from-cyan-500 to-teal-600' },
                                            { label: 'Approved', value: stats.testimonials.approved, gradient: 'from-green-500 to-emerald-600' },
                                            { label: 'Pending', value: stats.testimonials.pending, gradient: 'from-orange-500 to-red-500' },
                                        ].map(({ label, value, gradient }) => (
                                            <div key={label} className={`rounded-2xl p-4 bg-gradient-to-br ${gradient} shadow-lg`}>
                                                <p className="text-2xl font-black text-white">{value}</p>
                                                <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold mt-1">{label}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div className="bg-[#1a1d2e] rounded-2xl p-6 border border-[#252836]">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-md">
                                                    <BarChart3 size={18} className="text-white" />
                                                </div>
                                                <h3 className="text-white font-bold text-lg">Service Demand</h3>
                                            </div>
                                            {Object.keys(stats.contacts.serviceBreakdown).length > 0 ? (
                                                <div className="space-y-4">
                                                    {Object.entries(stats.contacts.serviceBreakdown).sort(([, a], [, b]) => b - a).map(([svc, count], i) => {
                                                        const pct = Math.round((count / stats.contacts.total) * 100);
                                                        const grads = ['from-purple-500 to-blue-500', 'from-cyan-500 to-teal-500', 'from-orange-500 to-pink-500', 'from-emerald-500 to-green-500'];
                                                        const colors = ['text-purple-400', 'text-cyan-400', 'text-orange-400', 'text-emerald-400'];
                                                        return (
                                                            <div key={svc}>
                                                                <div className="flex justify-between text-sm mb-2">
                                                                    <span className="text-white/50 truncate">{svc}</span>
                                                                    <span className={`font-bold ${colors[i % colors.length]}`}>{count}</span>
                                                                </div>
                                                                <div className="h-3 bg-[#252836] rounded-full overflow-hidden">
                                                                    <div className={`h-full bg-gradient-to-r ${grads[i % grads.length]} rounded-full`} style={{ width: `${pct}%` }} />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : <p className="text-white/20 text-center py-8">No data</p>}
                                        </div>

                                        <div className="bg-[#1a1d2e] rounded-2xl p-6 border border-[#252836]">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                                                    <PieChart size={18} className="text-white" />
                                                </div>
                                                <h3 className="text-white font-bold text-lg">Revenue</h3>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="relative w-28 h-28 flex-shrink-0">
                                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                                        <circle cx="18" cy="18" r="14" fill="none" stroke="#252836" strokeWidth="4" />
                                                        <circle cx="18" cy="18" r="14" fill="none" strokeWidth="4" strokeLinecap="round"
                                                            stroke="url(#grad1)"
                                                            strokeDasharray={`${stats.contacts.totalQuoted > 0 ? Math.round((stats.contacts.totalPaid / stats.contacts.totalQuoted) * 88) : 0} 88`} />
                                                        <defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#34d399" /></linearGradient></defs>
                                                    </svg>
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                        <span className="text-lg font-black text-emerald-400">{stats.contacts.totalQuoted > 0 ? Math.round((stats.contacts.totalPaid / stats.contacts.totalQuoted) * 100) : 0}%</span>
                                                        <span className="text-[8px] text-white/30 uppercase font-bold tracking-wider">Collected</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-3 flex-1">
                                                    <div className="flex justify-between"><span className="text-white/30 text-sm">Quoted</span><span className="text-white font-bold">{fmtCurrency(stats.contacts.totalQuoted)}</span></div>
                                                    <div className="flex justify-between"><span className="text-white/30 text-sm">Collected</span><span className="text-emerald-400 font-bold">{fmtCurrency(stats.contacts.totalPaid)}</span></div>
                                                    <div className="flex justify-between"><span className="text-white/30 text-sm">Remaining</span><span className="text-amber-400 font-bold">{fmtCurrency(stats.contacts.totalQuoted - stats.contacts.totalPaid)}</span></div>
                                                </div>
                                            </div>
                                            <div className="mt-6 pt-4 border-t border-[#252836] grid grid-cols-3 gap-3">
                                                {[
                                                    { label: 'Paid', v: stats.contacts.paymentBreakdown.paid || 0, gradient: 'from-emerald-500 to-green-600' },
                                                    { label: 'Partial', v: stats.contacts.paymentBreakdown.partial || 0, gradient: 'from-amber-500 to-yellow-500' },
                                                    { label: 'Unpaid', v: stats.contacts.paymentBreakdown.unpaid || 0, gradient: 'from-red-500 to-pink-500' },
                                                ].map(({ label, v, gradient }) => (
                                                    <div key={label} className={`text-center rounded-xl p-3 bg-gradient-to-br ${gradient}`}>
                                                        <p className="text-xl font-black text-white">{v}</p>
                                                        <p className="text-white/60 text-[9px] uppercase font-bold">{label}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-24">
                            <AlertCircle size={32} className="mx-auto text-red-400/50 mb-3" />
                            <p className="text-white/30 text-sm mb-4">Failed to load dashboard</p>
                            <button onClick={fetchStats} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/20 transition-all">Retry</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {selectedContact && (
                <>
                    <div className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" onClick={() => setSelectedContact(null)} />
                    <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 bg-[#1a1d2e] rounded-2xl md:w-full md:max-w-md flex flex-col max-h-[calc(100vh-32px)] overflow-hidden border border-[#252836] shadow-2xl">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-[#252836]">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">{selectedContact.name.charAt(0).toUpperCase()}</div>
                                <div>
                                    <h2 className="text-white font-bold">{selectedContact.name}</h2>
                                    <StatusBadge status={selectedContact.status} />
                                </div>
                            </div>
                            <button onClick={() => setSelectedContact(null)} className="p-2 text-white/30 hover:text-white hover:bg-[#252836] rounded-lg transition-all"><X size={16} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-3" data-lenis-prevent>
                            <div className="grid grid-cols-2 gap-3">
                                {[{ l: 'Email', v: selectedContact.email }, { l: 'Phone', v: selectedContact.mobile || 'N/A' }, selectedContact.subject && { l: 'Service', v: selectedContact.subject }, selectedContact.budget && { l: 'Budget', v: selectedContact.budget }].filter(Boolean).map(x => (
                                    <div key={x.l} className="bg-[#252836] rounded-xl p-3">
                                        <p className="text-white/30 text-[9px] uppercase tracking-widest font-bold mb-1">{x.l}</p>
                                        <p className="text-white/80 text-sm font-medium break-all">{x.v}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-[#252836] rounded-xl p-4">
                                <p className="text-white/30 text-[9px] uppercase tracking-widest font-bold mb-2">Message</p>
                                <p className="text-white/60 text-sm leading-relaxed">{selectedContact.message}</p>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {selectedContact.mobile && (<>
                                    <button onClick={() => openWhatsApp(selectedContact.mobile)} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"><MessageCircle size={14} /> WhatsApp</button>
                                    <button onClick={() => window.location.href = `tel:${selectedContact.mobile}`} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"><Phone size={14} /> Call</button>
                                </>)}
                                <button onClick={() => openEmail(selectedContact.email, selectedContact.name)} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-bold shadow-md shadow-purple-500/20 hover:shadow-purple-500/30 transition-all col-span-2 sm:col-span-1"><Mail size={14} /> Email</button>
                            </div>
                        </div>
                        <div className="p-4 border-t border-[#252836]">
                            <button onClick={() => { setSelectedContact(null); navigate('/x7k9m2p4q/contacts'); }}
                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all">
                                View Full Details →
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
