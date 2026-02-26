import React, { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import API_BASE_URL from "../../config";
import { Users, Mail, Plus, Download, Search, Menu, CheckCircle2, XCircle } from "lucide-react";

const AudienceManager = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const getHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    const fetchSubscribers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/subscribers`, { headers: getHeaders() });
            if (res.ok) {
                setSubscribers(await res.json());
            }
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const handleAddSubscriber = async (e) => {
        e.preventDefault();
        if (!newEmail.trim()) return;
        setIsAdding(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/subscribers`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({ email: newEmail.trim() })
            });
            if (res.ok) {
                setNewEmail("");
                fetchSubscribers();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to add subscriber");
            }
        } catch (err) {
            alert("Error adding subscriber: " + err.message);
        }
        setIsAdding(false);
    };

    const toggleStatus = async (sub) => {
        const newStatus = sub.status === "Active" ? "Unsubscribed" : "Active";
        try {
            const res = await fetch(`${API_BASE_URL}/api/subscribers/${sub.id}`, {
                method: "PUT",
                headers: getHeaders(),
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setSubscribers(prev => prev.map(s => s.id === sub.id ? { ...s, status: newStatus } : s));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleExportCSV = () => {
        if (subscribers.length === 0) return;

        const headers = ["ID", "Email", "Status", "Subscribed At"];
        const csvRows = [];
        csvRows.push(headers.join(","));

        for (const sub of subscribers) {
            const row = [
                sub.id,
                sub.email,
                sub.status,
                new Date(sub.subscribedAt).toISOString()
            ];
            csvRows.push(row.join(","));
        }

        const csvString = csvRows.join("\n");
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `subscribers_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const filteredSubscribers = subscribers.filter(sub =>
        sub.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeCount = subscribers.filter(s => s.status === 'Active').length;

    return (
        <div className="flex min-h-screen bg-[#0f1117]">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 md:ml-64 min-h-screen">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center gap-4 p-4 bg-[#161822] border-b border-[#252836] sticky top-0 z-30">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                    <h1 className="text-white text-lg font-bold flex-1">Audience Manager</h1>
                </div>

                <div className="p-4 md:p-6 xl:p-8 text-white max-w-6xl mx-auto">
                    {/* Desktop Header */}
                    <div className="hidden md:flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white/90">Audience</h1>
                            <p className="text-white/40 text-sm mt-1">{subscribers.length} total subscribers · {activeCount} active</p>
                        </div>
                        <button
                            onClick={handleExportCSV}
                            disabled={subscribers.length === 0}
                            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed py-2 px-4 rounded-xl font-medium text-sm transition-all"
                        >
                            <Download size={16} /> Export CSV
                        </button>
                    </div>

                    {/* Mobile Export Button */}
                    <div className="md:hidden flex mb-6">
                        <button
                            onClick={handleExportCSV}
                            disabled={subscribers.length === 0}
                            className="flex items-center justify-center gap-2 w-full bg-white/5 border border-white/10 text-white disabled:opacity-50 py-3 rounded-xl font-medium text-sm transition-all"
                        >
                            <Download size={16} /> Export CSV
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Sub List */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Search */}
                            <div className="relative">
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                <input
                                    type="text"
                                    placeholder="Search emails..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#1a1d2e] text-white py-3 pl-12 pr-4 rounded-xl border border-[#252836] focus:border-blue-500/50 outline-none placeholder:text-white/25 transition-all"
                                />
                            </div>

                            {/* Table */}
                            <div className="bg-[#1a1d2e] border border-[#252836] rounded-xl overflow-hidden shadow-xl">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-[#161822]">
                                        <tr>
                                            <th className="py-4 px-6 text-xs font-semibold text-white/40 uppercase tracking-wider">Email</th>
                                            <th className="py-4 px-6 text-xs font-semibold text-white/40 uppercase tracking-wider text-center">Status</th>
                                            <th className="py-4 px-6 text-xs font-semibold text-white/40 uppercase tracking-wider text-right">Subscribed</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#252836]">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="3" className="py-12 text-center">
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                                                </td>
                                            </tr>
                                        ) : filteredSubscribers.length > 0 ? (
                                            filteredSubscribers.map((sub, i) => (
                                                <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${sub.status === 'Active' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                                                {sub.email.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="text-sm font-medium text-white/90">{sub.email}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 text-center">
                                                        <button
                                                            onClick={() => toggleStatus(sub)}
                                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${sub.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}
                                                            title="Click to toggle status"
                                                        >
                                                            {sub.status === 'Active' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                            {sub.status}
                                                        </button>
                                                    </td>
                                                    <td className="py-4 px-6 text-sm text-white/40 text-right">
                                                        {new Date(sub.subscribedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="py-12 text-center text-white/40">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <Mail size={32} className="mb-3 text-white/20" />
                                                        <p>No subscribers found</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Sidebar Action / Stats */}
                        <div className="space-y-6">
                            {/* Manual Add Form */}
                            <div className="bg-[#1a1d2e] border border-[#252836] rounded-xl p-6">
                                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                    <Plus size={18} className="text-blue-400" /> Manual Add
                                </h3>
                                <p className="text-sm text-white/40 mb-4">Add a subscriber manually to your list.</p>
                                <form onSubmit={handleAddSubscriber} className="space-y-4">
                                    <div>
                                        <input
                                            type="email"
                                            required
                                            placeholder="hello@example.com"
                                            value={newEmail}
                                            onChange={(e) => setNewEmail(e.target.value)}
                                            className="w-full bg-[#0f1117] text-white py-2.5 px-4 rounded-lg border border-[#252836] focus:border-blue-500/50 outline-none placeholder:text-white/25 transition-all text-sm"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isAdding || !newEmail}
                                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-semibold text-sm transition-colors"
                                    >
                                        {isAdding ? 'Adding...' : 'Add Subscriber'}
                                    </button>
                                </form>
                            </div>

                            {/* Mini Stats Card */}
                            <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-500/20 rounded-xl p-6">
                                <h3 className="text-sm font-medium text-blue-300/80 mb-1">Growth</h3>
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-500/20 p-2 rounded-lg">
                                        <Users className="text-blue-400" size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-bold text-white">{activeCount}</h4>
                                        <p className="text-xs text-white/40">Active Readers</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AudienceManager;
