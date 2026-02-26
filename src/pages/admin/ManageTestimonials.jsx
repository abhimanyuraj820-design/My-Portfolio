import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "../../components/admin/Sidebar";
import { m as motion, AnimatePresence } from "framer-motion";
import API_BASE_URL from "../../config";

import { Check, Trash2, X, Menu, Pencil, Star, Search, ArrowUpDown, ChevronDown } from "lucide-react";

const ManageTestimonials = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingReview, setEditingReview] = useState(null);
    const [editForm, setEditForm] = useState({ name: "", message: "", rating: 5, approved: false });
    const [tSearch, setTSearch] = useState('');
    const [tFilter, setTFilter] = useState('all');
    const [tSort, setTSort] = useState('newest');
    const [showTSort, setShowTSort] = useState(false);

    const filteredReviews = useMemo(() => {
        let result = [...reviews];
        if (tSearch) {
            const q = tSearch.toLowerCase();
            result = result.filter(r => r.name.toLowerCase().includes(q) || r.company?.toLowerCase().includes(q) || r.message.toLowerCase().includes(q));
        }
        if (tFilter === 'approved') result = result.filter(r => r.isApproved);
        else if (tFilter === 'pending') result = result.filter(r => !r.isApproved);
        if (tSort === 'newest') result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        else if (tSort === 'oldest') result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        else if (tSort === 'rating_high') result.sort((a, b) => (b.rating || 5) - (a.rating || 5));
        else if (tSort === 'rating_low') result.sort((a, b) => (a.rating || 5) - (b.rating || 5));
        return result;
    }, [reviews, tSearch, tFilter, tSort]);

    const avgRating = useMemo(() => {
        if (reviews.length === 0) return '0.0';
        return (reviews.reduce((s, r) => s + (r.rating || 5), 0) / reviews.length).toFixed(1);
    }, [reviews]);

    const getHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    const fetchReviews = async () => {
        try {
            // Note: Since API currently serves public only (without auth), let's ensure we fetch all 
            // We'll use the headers anyway since this is admin
            const res = await fetch(`${API_BASE_URL}/api/testimonials`, { headers: getHeaders() });
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleApprove = async (id, currentStatus) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/testimonials/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ isApproved: !currentStatus })
            });
            if (res.ok) fetchReviews();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this review?")) {
            try {
                const res = await fetch(`${API_BASE_URL}/api/testimonials/${id}`, {
                    method: 'DELETE',
                    headers: getHeaders()
                });
                if (res.ok) fetchReviews();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const startEdit = (review) => {
        setEditingReview(review.id);
        setEditForm({
            name: review.name,
            message: review.message,
            rating: review.rating || 5,
            approved: review.isApproved
        });
    };

    const cancelEdit = () => {
        setEditingReview(null);
    };

    const saveEdit = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/testimonials/${editingReview}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({
                    name: editForm.name,
                    message: editForm.message,
                    rating: parseInt(editForm.rating, 10),
                    isApproved: editForm.approved
                })
            });

            if (res.ok) {
                setEditingReview(null);
                fetchReviews();
            } else {
                alert("Error updating review");
            }
        } catch (err) {
            console.error(err);
            alert("Error updating review");
        }
    };

    const renderStars = (rating) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={16}
                        className={star <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-600"}
                    />
                ))}
            </div>
        );
    };

    const renderRatingSelector = () => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setEditForm({ ...editForm, rating: star })}
                        className="p-1 hover:scale-110 transition-transform"
                    >
                        <Star
                            size={24}
                            className={star <= editForm.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-600"}
                        />
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="flex min-h-screen bg-[#0f1117]">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 md:ml-64 min-h-screen relative overflow-x-hidden">
                {/* Ambient Background Glows */}
                <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
                {/* Mobile Header */}
                <div className="md:hidden flex items-center gap-4 p-4 bg-[#161822] border-b border-[#252836] sticky top-0 z-30">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                    <h1 className="text-white text-lg font-bold">Manage Testimonials</h1>
                </div>

                {/* Content Area */}
                <div className="p-4 md:p-6 xl:p-8 text-white">
                    {/* Desktop Title */}
                    <div className="hidden md:flex items-center gap-4 mb-6">
                        <h1 className="text-3xl font-extrabold text-white">Testimonials</h1>
                        <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold shadow-md shadow-amber-500/20">
                            <Star size={12} fill="currentColor" /> {avgRating} avg
                        </span>
                    </div>

                    {/* Search + Sort Bar */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-5">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                            <input type="text" placeholder="Search by name, company..." value={tSearch} onChange={(e) => setTSearch(e.target.value)}
                                className="w-full bg-[#1a1d2e] text-white text-sm py-3 pl-11 pr-4 rounded-xl border border-[#252836] focus:border-purple-500/50 outline-none placeholder:text-white/25 transition-all" />
                        </div>
                        <div className="relative">
                            <button onClick={() => setShowTSort(!showTSort)}
                                className="flex items-center gap-2 bg-[#1a1d2e] border border-[#252836] px-4 py-3 rounded-xl text-sm text-white/50 hover:text-white/80 hover:border-[#353849] transition-all whitespace-nowrap">
                                <ArrowUpDown size={14} />
                                {{ newest: 'Newest', oldest: 'Oldest', rating_high: 'Rating ↓', rating_low: 'Rating ↑' }[tSort]}
                                <ChevronDown size={14} />
                            </button>
                            {showTSort && (
                                <>
                                    <div className="fixed inset-0 z-30" onClick={() => setShowTSort(false)} />
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1d2e] border border-[#252836] rounded-xl shadow-2xl z-40 py-2">
                                        {[{ v: 'newest', l: 'Newest First' }, { v: 'oldest', l: 'Oldest First' }, { v: 'rating_high', l: 'Rating High→Low' }, { v: 'rating_low', l: 'Rating Low→High' }].map(o => (
                                            <button key={o.v} onClick={() => { setTSort(o.v); setShowTSort(false); }}
                                                className={`w-full text-left px-4 py-2.5 text-sm ${tSort === o.v ? 'text-purple-400 bg-purple-500/10 font-bold' : 'text-white/50 hover:text-white hover:bg-[#252836]'}`}>{o.l}</button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
                        {[{ v: 'all', l: 'All', c: reviews.length }, { v: 'approved', l: 'Approved', c: reviews.filter(r => r.isApproved).length }, { v: 'pending', l: 'Pending', c: reviews.filter(r => !r.isApproved).length }].map(f => (
                            <button key={f.v} onClick={() => setTFilter(f.v)}
                                className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tFilter === f.v ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20' : 'bg-[#1a1d2e] text-white/40 border border-[#252836] hover:text-white/70'}`}>
                                {f.l} <span className="ml-1 opacity-60">({f.c})</span>
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div></div>
                    ) : filteredReviews.length === 0 ? (
                        <p className="text-secondary text-center mt-10">{tSearch || tFilter !== 'all' ? 'No matching reviews found' : 'No reviews found.'}</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence mode="popLayout">
                                {filteredReviews.map((review, index) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        key={review.id}
                                        className="group relative bg-white/[0.03] rounded-[2rem] p-6 md:p-8 flex flex-col border border-white/5 hover:border-white/20 transition-all duration-500 backdrop-blur-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
                                    >
                                        {/* Premium Backdrop Glow */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[2rem]" />

                                        {/* Header */}
                                        <div className="flex justify-between items-start mb-6 relative z-10">
                                            <div className="space-y-1">
                                                <h3 className="font-black text-lg md:text-xl text-white tracking-tight leading-none">{review.name}</h3>
                                                <div className="flex items-center gap-2">
                                                    {renderStars(review.rating)}
                                                </div>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${review.isApproved
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 group-hover:bg-emerald-500/20'
                                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20 group-hover:bg-amber-500/20'}`}>
                                                {review.isApproved ? "Approved" : "Pending"}
                                            </div>
                                        </div>

                                        {/* Message */}
                                        <div className="relative mb-8 flex-1 group-hover:translate-x-1 transition-transform duration-300">
                                            <div className="absolute -left-4 -top-2 text-4xl text-white/5 font-serif italic selection:bg-transparent">“</div>
                                            <p className="text-white/60 text-sm md:text-base leading-relaxed italic relative z-10">
                                                {review.message}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 relative z-10 pt-4 border-t border-white/5">
                                            <button
                                                onClick={() => startEdit(review)}
                                                className="flex-1 flex items-center justify-center gap-2 bg-white text-black hover:bg-white/90 py-3 px-4 rounded-2xl transition-all font-black text-xs uppercase tracking-wider"
                                            >
                                                <Pencil size={14} /> Edit
                                            </button>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleApprove(review.id, review.isApproved)}
                                                    className={`p-3 rounded-2xl transition-all border ${review.isApproved
                                                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20'
                                                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20'}`}
                                                    title={review.isApproved ? "Unapprove" : "Approve"}
                                                >
                                                    <Check size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(review.id)}
                                                    className="p-3 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:border-red-500 text-red-500 hover:text-white rounded-2xl transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Dialog Modal */}
            {editingReview && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm"
                        onClick={cancelEdit}
                    />

                    {/* Modal */}
                    <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 bg-tertiary rounded-2xl p-5 md:p-6 md:w-full md:max-w-lg flex flex-col max-h-[calc(100vh-32px)] overflow-y-auto" data-lenis-prevent>
                        {/* Modal Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl md:text-2xl font-bold text-white">Edit Testimonial</h2>
                            <button
                                onClick={cancelEdit}
                                className="p-2 text-secondary hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="space-y-4 flex-1">
                            {/* Name */}
                            <div>
                                <label className="block text-secondary mb-2 text-sm">Name</label>
                                <input
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full bg-black-100 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-violet-500"
                                    placeholder="Customer name"
                                />
                            </div>

                            {/* Rating */}
                            <div>
                                <label className="block text-secondary mb-2 text-sm">Rating</label>
                                {renderRatingSelector()}
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-secondary mb-2 text-sm">Review Message</label>
                                <textarea
                                    value={editForm.message}
                                    onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                                    className="w-full bg-black-100 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                                    rows={4}
                                    placeholder="Review message..."
                                />
                            </div>

                            {/* Status Toggle */}
                            <div>
                                <label className="block text-secondary mb-2 text-sm">Status</label>
                                <button
                                    type="button"
                                    onClick={() => setEditForm({ ...editForm, approved: !editForm.approved })}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${editForm.approved ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' : 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30'}`}
                                >
                                    {editForm.approved ? "✓ Approved" : "⏳ Pending"}
                                </button>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-700">
                            <button
                                onClick={saveEdit}
                                className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-lg font-bold transition-colors"
                            >
                                Save Changes
                            </button>
                            <button
                                onClick={cancelEdit}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 py-3 rounded-lg font-bold transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ManageTestimonials;
