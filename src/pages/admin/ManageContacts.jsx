import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../../components/admin/Sidebar";
import API_BASE_URL from "../../config";
import {
    Trash2, Mail, X, Menu, MessageCircle, Phone,
    Briefcase, IndianRupee, FileText, Search,
    ChevronDown, ArrowUpDown, StickyNote, DollarSign,
    Loader, Clock, CheckCircle, XCircle, AlertCircle,
    Filter, MoreHorizontal
} from "lucide-react";

/* ── Status config ── */
const STATUS_OPTIONS = [
    { value: "pending", label: "Pending", dot: "#F59E0B", badge: "rgba(245,158,11,0.12)", badgeText: "#FCD34D", border: "rgba(245,158,11,0.25)", Icon: Clock },
    { value: "in_progress", label: "In Progress", dot: "#3B82F6", badge: "rgba(59,130,246,0.12)", badgeText: "#93C5FD", border: "rgba(59,130,246,0.25)", Icon: Loader },
    { value: "completed", label: "Completed", dot: "#10B981", badge: "rgba(16,185,129,0.12)", badgeText: "#6EE7B7", border: "rgba(16,185,129,0.25)", Icon: CheckCircle },
    { value: "rejected", label: "Rejected", dot: "#EF4444", badge: "rgba(239,68,68,0.12)", badgeText: "#FCA5A5", border: "rgba(239,68,68,0.25)", Icon: XCircle },
];
const PRIORITY_OPTIONS = [
    { value: "low", label: "Low", leftBorder: "#64748B" },
    { value: "medium", label: "Medium", leftBorder: "#F59E0B" },
    { value: "high", label: "High", leftBorder: "#F97316" },
    { value: "urgent", label: "Urgent", leftBorder: "#EF4444" },
];
const PAYMENT_OPTIONS = [
    { value: "unpaid", label: "Unpaid" },
    { value: "partial", label: "Partial" },
    { value: "paid", label: "Paid" },
];
const SORT_OPTIONS = [
    { value: "date_desc", label: "Newest First" },
    { value: "date_asc", label: "Oldest First" },
    { value: "budget_desc", label: "Budget: High → Low" },
    { value: "budget_asc", label: "Budget: Low → High" },
];

/* ── Avatar gradient pool ── */
const AVATAR_GRADS = [
    ["#6366F1", "#818CF8"], ["#0D9488", "#2DD4BF"], ["#8B5CF6", "#A78BFA"],
    ["#0EA5E9", "#38BDF8"], ["#F59E0B", "#FBBF24"], ["#EC4899", "#F472B6"],
];
const getAvatar = (name) => AVATAR_GRADS[name.charCodeAt(0) % AVATAR_GRADS.length];

/* ── Sub-components ── */
const StatusBadge = ({ status }) => {
    const c = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide"
            style={{ background: c.badge, color: c.badgeText, border: `1px solid ${c.border}` }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
            {c.label}
        </span>
    );
};

const Avatar = ({ name, size = "md" }) => {
    const [c1, c2] = getAvatar(name);
    const dim = size === "lg" ? "w-14 h-14 text-2xl" : "w-10 h-10 text-base";
    return (
        <div className={`${dim} rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0`}
            style={{ background: `linear-gradient(135deg,${c1},${c2})` }}>
            {name.charAt(0).toUpperCase()}
        </div>
    );
};

/* Glassmorphism card base styles */
const glassCard = {
    background: "rgba(255,255,255,0.04)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.09)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.3)",
};
const glassInput = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
};

/* ── Main Component ── */
const ManageContacts = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [sortBy, setSortBy] = useState("date_desc");
    const [showSort, setShowSort] = useState(false);

    const hdrs = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" });

    const fetchMessages = useCallback(async () => {
        try {
            const p = new URLSearchParams();
            if (filter !== "all") p.set("status", filter);
            if (search) p.set("search", search);
            const [sf, so] = sortBy.split("_");
            if (sf === "date") { p.set("sort", "date"); p.set("order", so); }
            if (sf === "budget") { p.set("sort", "budget"); p.set("order", so); }
            const res = await fetch(`${API_BASE_URL}/api/contacts?${p}`, { headers: hdrs() });
            if (res.ok) setMessages(await res.json());
        } catch (e) { console.error(e); }
        setLoading(false);
    }, [filter, search, sortBy]);

    useEffect(() => { setLoading(true); fetchMessages(); }, [fetchMessages]);

    const updateContact = async (id, updates) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/contacts/${id}`, { method: "PUT", headers: hdrs(), body: JSON.stringify(updates) });
            if (res.ok) {
                const updated = await res.json();
                setMessages(p => p.map(m => m.id === id ? updated : m));
                if (selected?.id === id) setSelected(updated);
            }
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Permanently delete this message?")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/contacts/${id}`, { method: "DELETE", headers: hdrs() });
            if (res.ok) { setMessages(p => p.filter(m => m.id !== id)); setSelected(null); }
        } catch (e) { console.error(e); }
    };

    const fmtDate = (d) => new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const timeAgo = (d) => { const ms = Date.now() - new Date(d), m = Math.floor(ms / 60000), h = Math.floor(ms / 3600000), dy = Math.floor(ms / 86400000); if (m < 1) return "Just now"; if (m < 60) return `${m}m ago`; if (h < 24) return `${h}h ago`; if (dy < 7) return `${dy}d ago`; return fmtDate(d); };
    const openWA = (mob) => { let p = mob.replace(/[^\d+]/g, ""); if (!p.startsWith("+")) p = "+91" + p; window.open(`https://wa.me/${p.replace("+", "")}`, "_blank"); };
    const openEmail = (e, n) => window.open(`mailto:${e}?subject=${encodeURIComponent("Re: Portfolio Inquiry")}&body=${encodeURIComponent(`Hi ${n},\n\n`)}`, "_blank");

    const sc = (s) => STATUS_OPTIONS.find(x => x.value === s) || STATUS_OPTIONS[0];
    const pr = (p) => PRIORITY_OPTIONS.find(x => x.value === p) || PRIORITY_OPTIONS[1];
    const statusCounts = messages.reduce((a, m) => { a[m.status] = (a[m.status] || 0) + 1; return a; }, {});
    const unread = messages.filter(m => !m.isRead).length;

    /* bg: mesh gradient */
    const pageBg = {
        background: "radial-gradient(ellipse at 20% 20%, rgba(99,102,241,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(13,148,136,0.07) 0%, transparent 50%), #0B0F19",
        minHeight: "100vh",
        fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
    };

    return (
        <div className="flex" style={pageBg}>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 md:ml-64 overflow-x-hidden">
                {/* Mobile bar */}
                <div className="md:hidden flex items-center gap-3 px-5 py-4 sticky top-0 z-30"
                    style={{ background: "rgba(11,15,25,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg transition-colors" style={{ color: "#9CA3AF" }}><Menu size={20} /></button>
                    <h1 className="font-bold text-white flex-1">Messages</h1>
                    {unread > 0 && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(99,102,241,0.2)", color: "#A5B4FC", border: "1px solid rgba(99,102,241,0.3)" }}>
                            {unread} new
                        </span>
                    )}
                </div>

                <div className="p-6 md:p-8 xl:p-10">
                    {/* Header */}
                    <div className="hidden md:flex items-end justify-between mb-10">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: "#6366F1" }}>Client Management</p>
                            <h1 className="text-3xl font-extrabold text-white leading-none">Contact Messages</h1>
                            <p className="mt-2 text-sm" style={{ color: "#9CA3AF" }}>
                                {messages.length} total &mdash; <span style={{ color: "#A5B4FC" }}>{unread} unread</span>
                            </p>
                        </div>

                        {/* Status counters */}
                        <div className="flex gap-3">
                            {STATUS_OPTIONS.map(s => (
                                <button key={s.value} onClick={() => setFilter(filter === s.value ? "all" : s.value)}
                                    className="px-5 py-3 rounded-xl transition-all text-left"
                                    style={{
                                        ...glassCard,
                                        border: filter === s.value ? `1px solid ${s.border}` : "1px solid rgba(255,255,255,0.09)",
                                        boxShadow: filter === s.value ? `0 0 0 1px ${s.border}, inset 0 1px 0 rgba(255,255,255,0.06)` : glassCard.boxShadow,
                                    }}>
                                    <p className="text-2xl font-black text-white leading-none">{statusCounts[s.value] || 0}</p>
                                    <p className="text-[10px] font-semibold uppercase tracking-widest mt-1" style={{ color: "#9CA3AF" }}>{s.label}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search + Sort */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-5">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#4B5563" }} />
                            <input type="text" placeholder="Search by name, email, or service…"
                                value={search} onChange={e => setSearch(e.target.value)}
                                className="w-full text-sm py-3 pl-11 pr-4 rounded-xl text-white placeholder-gray-600 outline-none transition-all"
                                style={{ ...glassInput, fontFamily: "inherit" }}
                                onFocus={e => { e.target.style.borderColor = "rgba(99,102,241,0.5)"; e.target.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.2), 0 0 0 1px rgba(99,102,241,0.2)"; }}
                                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.2)"; }} />
                        </div>
                        <div className="relative">
                            <button onClick={() => setShowSort(!showSort)}
                                className="flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
                                style={{ ...glassCard, color: "#9CA3AF", fontFamily: "inherit" }}>
                                <ArrowUpDown size={14} style={{ color: "#6B7280" }} />
                                {SORT_OPTIONS.find(s => s.value === sortBy)?.label}
                                <ChevronDown size={14} style={{ color: "#6B7280" }} />
                            </button>
                            {showSort && (
                                <>
                                    <div className="fixed inset-0 z-30" onClick={() => setShowSort(false)} />
                                    <div className="absolute right-0 top-full mt-2 w-52 z-40 rounded-xl py-1.5 overflow-hidden"
                                        style={{ background: "#131722", border: "1px solid rgba(255,255,255,0.10)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
                                        {SORT_OPTIONS.map(o => (
                                            <button key={o.value} onClick={() => { setSortBy(o.value); setShowSort(false); }}
                                                className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                                                style={{ color: sortBy === o.value ? "#C7D2FE" : "#9CA3AF", background: sortBy === o.value ? "rgba(99,102,241,0.1)" : "transparent", fontFamily: "inherit" }}>
                                                {o.value === sortBy && <span className="mr-2 text-indigo-400">✓</span>}{o.label}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex overflow-x-auto gap-2 mb-8 pb-1">
                        {[{ value: "all", label: "All Messages", count: messages.length }, ...STATUS_OPTIONS.map(s => ({ ...s, count: statusCounts[s.value] || 0 }))].map(tab => {
                            const isActive = filter === tab.value;
                            const st = STATUS_OPTIONS.find(s => s.value === tab.value);
                            return (
                                <button key={tab.value} onClick={() => setFilter(tab.value)}
                                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                                    style={{
                                        color: isActive ? (st ? st.badgeText : "#C7D2FE") : "#6B7280",
                                        background: isActive ? (st ? st.badge : "rgba(99,102,241,0.12)") : "transparent",
                                        border: `1px solid ${isActive ? (st ? st.border : "rgba(99,102,241,0.3)") : "transparent"}`,
                                        fontFamily: "inherit",
                                    }}>
                                    {st && <span className="w-2 h-2 rounded-full" style={{ background: st.dot }} />}
                                    {tab.label}
                                    <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: "rgba(255,255,255,0.07)", color: isActive ? (st ? st.badgeText : "#A5B4FC") : "#4B5563" }}>
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-4">
                            <Loader size={28} className="animate-spin" style={{ color: "#6366F1" }} />
                            <p className="text-sm" style={{ color: "#4B5563" }}>Loading messages…</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-32 flex flex-col items-center gap-4">
                            <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={glassCard}>
                                <Mail size={32} style={{ color: "#374151" }} />
                            </div>
                            <p className="text-lg font-semibold" style={{ color: "#6B7280" }}>
                                {search || filter !== "all" ? "No results found" : "No messages yet"}
                            </p>
                            <p className="text-sm" style={{ color: "#374151" }}>
                                {search ? `No messages match "${search}"` : "Client inquiries will appear here"}
                            </p>
                        </div>
                    ) : (
                        /* ── Card Grid ── */
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {messages.map(msg => {
                                const st = sc(msg.status);
                                const priority = pr(msg.priority);
                                return (
                                    <div key={msg.id}
                                        onClick={() => { setSelected(msg); if (!msg.isRead) updateContact(msg.id, { isRead: true }); }}
                                        className="cursor-pointer rounded-2xl transition-all duration-200 hover:-translate-y-1 group"
                                        style={{
                                            ...glassCard,
                                            border: msg.isRead ? "1px solid rgba(255,255,255,0.07)" : `1px solid ${st.border}`,
                                            boxShadow: msg.isRead ? glassCard.boxShadow : `${glassCard.boxShadow}, 0 0 0 1px ${st.border}`,
                                        }}>

                                        {/* Colored top stripe */}
                                        <div className="h-[2px] w-full rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${st.dot}, transparent)` }} />

                                        <div className="p-5">
                                            {/* Row 1: Avatar + Name + Time */}
                                            <div className="flex items-start justify-between gap-3 mb-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar name={msg.name} />
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-bold text-white text-sm truncate">{msg.name}</h3>
                                                            {!msg.isRead && (
                                                                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#818CF8" }} />
                                                            )}
                                                        </div>
                                                        <p className="text-xs truncate mt-0.5" style={{ color: "#9CA3AF" }}>{msg.email}</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs flex-shrink-0 mt-1" style={{ color: "#4B5563" }}>{timeAgo(msg.created_at)}</span>
                                            </div>

                                            {/* Row 2: Status + Priority */}
                                            <div className="flex items-center justify-between mb-4">
                                                <StatusBadge status={msg.status} />
                                                <span className="text-xs font-semibold" style={{ color: priority.leftBorder }}>{priority.label}</span>
                                            </div>

                                            {/* Row 3: Service tag */}
                                            {msg.subject && (
                                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-3"
                                                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                                    <Briefcase size={11} style={{ color: "#6B7280" }} />
                                                    <span className="text-xs font-medium truncate" style={{ color: "#D1D5DB" }}>{msg.subject}</span>
                                                </div>
                                            )}

                                            {/* Row 4: Message preview */}
                                            <p className="text-xs leading-relaxed line-clamp-2 mb-4" style={{ color: "#6B7280" }}>{msg.message}</p>

                                            {/* Row 5: Footer */}
                                            <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                                                <div className="flex items-center gap-1.5">
                                                    {msg.mobile && (<>
                                                        <button onClick={e => { e.stopPropagation(); openWA(msg.mobile); }}
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                                                            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#6EE7B7" }}
                                                            title="WhatsApp">
                                                            <MessageCircle size={13} />
                                                        </button>
                                                        <button onClick={e => { e.stopPropagation(); window.location.href = `tel:${msg.mobile}`; }}
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                                                            style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#93C5FD" }}
                                                            title="Call">
                                                            <Phone size={13} />
                                                        </button>
                                                    </>)}
                                                    <button onClick={e => { e.stopPropagation(); openEmail(msg.email, msg.name); }}
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                                                        style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#A5B4FC" }}
                                                        title="Email">
                                                        <Mail size={13} />
                                                    </button>
                                                </div>
                                                {msg.budget && msg.budget !== "Not Specified" && (
                                                    <span className="text-xs font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg"
                                                        style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#6EE7B7" }}>
                                                        <IndianRupee size={10} />{msg.budget}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ══════════ MODAL ══════════ */}
            {selected && (
                <>
                    <div className="fixed inset-0 z-50" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }} onClick={() => setSelected(null)} />
                    <div className="fixed inset-3 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 md:w-full md:max-w-xl flex flex-col max-h-[calc(100vh-24px)] overflow-hidden rounded-2xl"
                        style={{
                            background: "linear-gradient(160deg,#131722 0%,#0d1119 100%)",
                            border: "1px solid rgba(255,255,255,0.10)",
                            boxShadow: "0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.07)",
                            fontFamily: "inherit",
                        }}>

                        {/* Accent line */}
                        <div className="h-[2px] w-full rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${sc(selected.status).dot}, transparent)` }} />

                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                            <div className="flex items-center gap-4">
                                <Avatar name={selected.name} size="lg" />
                                <div>
                                    <h2 className="text-xl font-bold text-white leading-none">{selected.name}</h2>
                                    <p className="text-sm mt-1.5" style={{ color: "#9CA3AF" }}>{fmtDate(selected.created_at)}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelected(null)}
                                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/5"
                                style={{ border: "1px solid rgba(255,255,255,0.08)", color: "#6B7280" }}>
                                <X size={16} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5" data-lenis-prevent>
                            {/* Status / Priority / Payment */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: "Status", key: "status", opts: STATUS_OPTIONS, cur: selected.status || "pending" },
                                    { label: "Priority", key: "priority", opts: PRIORITY_OPTIONS, cur: selected.priority || "medium" },
                                    { label: "Payment", key: "paymentStatus", opts: PAYMENT_OPTIONS, cur: selected.paymentStatus || "unpaid" },
                                ].map(({ label, key, opts, cur }) => {
                                    const priorityCfg = key === "priority" ? PRIORITY_OPTIONS.find(p => p.value === cur) : null;
                                    return (
                                        <div key={key}>
                                            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "#6B7280" }}>{label}</p>
                                            <select value={cur}
                                                onChange={e => updateContact(selected.id, { [key]: e.target.value })}
                                                className="w-full text-xs py-2.5 px-3 rounded-lg outline-none cursor-pointer appearance-none text-white transition-all"
                                                style={{
                                                    ...glassInput,
                                                    fontFamily: "inherit",
                                                    borderLeft: priorityCfg ? `2px solid ${priorityCfg.leftBorder}` : undefined,
                                                }}>
                                                {opts.map(o => <option key={o.value} value={o.value} style={{ background: "#131722" }}>{o.label}</option>)}
                                            </select>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Contact info */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { icon: Mail, label: "Email", value: selected.email, color: "#D1D5DB" },
                                    { icon: Phone, label: "Phone", value: selected.mobile || "—", color: "#D1D5DB" },
                                    selected.subject && { icon: Briefcase, label: "Service", value: selected.subject, color: "#7DD3FC" },
                                    selected.budget && selected.budget !== "Not Specified" && { icon: IndianRupee, label: "Budget", value: selected.budget, color: "#6EE7B7" },
                                ].filter(Boolean).map(item => (
                                    <div key={item.label} className="p-4 rounded-xl" style={glassCard}>
                                        <p className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 mb-2" style={{ color: "#6B7280" }}>
                                            <item.icon size={10} />{item.label}
                                        </p>
                                        <p className="text-sm font-semibold break-all" style={{ color: item.color }}>{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Payment tracking */}
                            <div className="p-4 rounded-xl" style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.12)" }}>
                                <p className="text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: "#9CA3AF" }}>
                                    <DollarSign size={12} /> Payment Tracking
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    {[{ label: "Quoted Price (₹)", key: "quotedPrice" }, { label: "Paid Amount (₹)", key: "paidAmount" }].map(({ label, key }) => (
                                        <div key={key}>
                                            <label className="text-[10px] font-bold uppercase block mb-2" style={{ color: "#6B7280" }}>{label}</label>
                                            <input type="text" value={selected[key] || ""}
                                                onChange={e => setSelected(p => ({ ...p, [key]: e.target.value }))}
                                                onBlur={e => updateContact(selected.id, { [key]: e.target.value })}
                                                placeholder="0"
                                                className="w-full text-sm py-2.5 px-3 rounded-lg outline-none text-white placeholder-gray-700 transition-all"
                                                style={{ ...glassInput, borderLeft: "2px solid rgba(16,185,129,0.4)", fontFamily: "inherit" }} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Message */}
                            <div className="p-4 rounded-xl" style={glassCard}>
                                <p className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: "#6B7280" }}>
                                    <FileText size={11} /> Message
                                </p>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#D1D5DB" }}>{selected.message}</p>
                            </div>

                            {/* Admin Notes */}
                            <div className="p-4 rounded-xl" style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.1)" }}>
                                <p className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: "#9CA3AF" }}>
                                    <StickyNote size={11} /> Admin Notes
                                </p>
                                <textarea value={selected.notes || ""}
                                    onChange={e => setSelected(p => ({ ...p, notes: e.target.value }))}
                                    onBlur={e => updateContact(selected.id, { notes: e.target.value })}
                                    placeholder="Add private notes about this client…"
                                    rows={3}
                                    className="w-full text-sm py-2.5 px-3 rounded-lg outline-none resize-none transition-all text-white placeholder-gray-700"
                                    style={{ ...glassInput, borderLeft: "2px solid rgba(245,158,11,0.35)", fontFamily: "inherit" }} />
                            </div>

                            {/* Quick actions */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {selected.mobile && (<>
                                    <button onClick={() => openWA(selected.mobile)}
                                        className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
                                        style={{ background: "linear-gradient(135deg,#059669,#10b981)", boxShadow: "0 4px 16px rgba(16,185,129,0.2)", fontFamily: "inherit" }}>
                                        <MessageCircle size={15} /> WhatsApp
                                    </button>
                                    <button onClick={() => window.location.href = `tel:${selected.mobile}`}
                                        className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
                                        style={{ background: "linear-gradient(135deg,#2563eb,#06b6d4)", boxShadow: "0 4px 16px rgba(14,165,233,0.2)", fontFamily: "inherit" }}>
                                        <Phone size={15} /> Call
                                    </button>
                                </>)}
                                <button onClick={() => openEmail(selected.email, selected.name)}
                                    className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 col-span-2 sm:col-span-1"
                                    style={{ background: "linear-gradient(135deg,#0d9488,#06b6d4)", boxShadow: "0 4px 16px rgba(6,182,212,0.2)", fontFamily: "inherit" }}>
                                    <Mail size={15} /> Send Email
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 px-6 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                            <button onClick={() => updateContact(selected.id, { isRead: !selected.isRead })}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-white/5"
                                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#9CA3AF", fontFamily: "inherit" }}>
                                {selected.isRead ? "Mark as Unread" : "Mark as Read"}
                            </button>
                            <button onClick={() => handleDelete(selected.id)}
                                className="flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold transition-all hover:bg-red-500/20"
                                style={{ background: "transparent", border: "1px solid rgba(239,68,68,0.35)", color: "#FCA5A5", fontFamily: "inherit" }}>
                                <Trash2 size={14} /> Delete
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ManageContacts;
