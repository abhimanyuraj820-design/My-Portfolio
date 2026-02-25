import React, { useEffect, useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import API_BASE_URL from "../../config";


import { Check, Trash2, X, Menu, Pencil, Star } from "lucide-react";

const ManageTestimonials = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingReview, setEditingReview] = useState(null);
    const [editForm, setEditForm] = useState({ name: "", message: "", rating: 5, approved: false });

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
                    // rating: editForm.rating, // rating missing from schema, ignoring for now or update schema later
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
        <div className="flex bg-primary min-h-screen">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 md:ml-64 min-h-screen">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center gap-4 p-4 bg-tertiary sticky top-0 z-30">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                    <h1 className="text-white text-lg font-bold">Manage Testimonials</h1>
                </div>

                {/* Content Area */}
                <div className="p-4 md:p-10 text-white">
                    {/* Desktop Title */}
                    <h1 className="hidden md:block text-4xl font-bold mb-8">Manage Testimonials</h1>

                    {loading ? (
                        <p>Loading...</p>
                    ) : reviews.length === 0 ? (
                        <p className="text-secondary text-center mt-10">No reviews found.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {reviews.map((review) => (
                                <div
                                    key={review.id}
                                    className="bg-black-100 rounded-2xl p-4 md:p-5 flex flex-col"
                                >
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-bold text-base md:text-lg">{review.name}</h3>
                                            {renderStars(review.rating)}
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${review.isApproved ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                            {review.isApproved ? "Approved" : "Pending"}
                                        </span>
                                    </div>

                                    {/* Message */}
                                    <p className="text-secondary text-sm flex-1 mb-4 line-clamp-4">
                                        "{review.message}"
                                    </p>

                                    {/* Actions */}
                                    <div className="flex gap-2 mt-auto">
                                        <button
                                            onClick={() => startEdit(review)}
                                            className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 py-2 px-3 rounded-lg transition-colors text-sm"
                                        >
                                            <Pencil size={14} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleApprove(review.id, review.isApproved)}
                                            className={`p-2 rounded-lg transition-colors ${review.isApproved ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'}`}
                                            title={review.isApproved ? "Unapprove" : "Approve"}
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(review.id)}
                                            className="p-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
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
                    <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 bg-tertiary rounded-2xl p-5 md:p-6 md:w-full md:max-w-lg flex flex-col max-h-[calc(100vh-32px)] overflow-y-auto">
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
