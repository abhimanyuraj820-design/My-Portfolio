import React, { useEffect, useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import API_BASE_URL from "../../config";


import { Trash2, Mail, X, Menu, MessageCircle, Phone, User, Calendar, Briefcase, IndianRupee, FileText, ExternalLink } from "lucide-react";

const ManageContacts = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);

    const getHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    const fetchMessages = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/contacts`, { headers: getHeaders() });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleMarkRead = async (id, currentStatus) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/contacts/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ isRead: !currentStatus })
            });

            if (res.ok) {
                fetchMessages();
                if (selectedMessage && selectedMessage.id === id) {
                    setSelectedMessage({ ...selectedMessage, isRead: !currentStatus });
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this message?")) {
            try {
                const res = await fetch(`${API_BASE_URL}/api/contacts/${id}`, {
                    method: 'DELETE',
                    headers: getHeaders()
                });

                if (res.ok) {
                    fetchMessages();
                    setSelectedMessage(null);
                }
            } catch (err) {
                console.error(err);
            }
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimeAgo = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return formatDate(dateString);
    };

    const openWhatsApp = (mobile) => {
        // Remove all non-numeric characters except +
        let phone = mobile.replace(/[^\d+]/g, '');
        // If doesn't start with +, assume Indian number
        if (!phone.startsWith('+')) {
            phone = '+91' + phone;
        }
        window.open(`https://wa.me/${phone.replace('+', '')}`, '_blank');
    };

    const openEmail = (email, name) => {
        const subject = encodeURIComponent(`Re: Your Portfolio Inquiry`);
        const body = encodeURIComponent(`Hi ${name},\n\nThank you for reaching out!\n\n`);
        window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
    };

    const openMessageDialog = (msg) => {
        setSelectedMessage(msg);
        // Mark as read when opened
        if (!msg.is_read) {
            handleMarkRead(msg.id, false);
        }
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
                    <h1 className="text-white text-lg font-bold">Contact Messages</h1>
                    {messages.filter(m => !m.is_read).length > 0 && (
                        <span className="bg-violet-600 text-white text-xs px-2 py-1 rounded-full">
                            {messages.filter(m => !m.is_read).length} new
                        </span>
                    )}
                </div>

                {/* Content Area */}
                <div className="p-4 md:p-10 text-white">
                    {/* Desktop Title */}
                    <div className="hidden md:flex items-center gap-4 mb-8">
                        <h1 className="text-4xl font-bold">Contact Messages</h1>
                        {messages.filter(m => !m.is_read).length > 0 && (
                            <span className="bg-violet-600 text-white text-sm px-3 py-1 rounded-full">
                                {messages.filter(m => !m.is_read).length} new
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-20">
                            <Mail className="mx-auto mb-4 text-secondary" size={48} />
                            <p className="text-secondary text-lg">No contact messages yet.</p>
                        </div>
                    ) : (
                        <div className="bg-black-100 rounded-2xl overflow-hidden">
                            {messages.map((msg, index) => (
                                <div
                                    key={msg.id}
                                    onClick={() => openMessageDialog(msg)}
                                    className={`
                                        flex items-center gap-4 p-4 md:p-5 cursor-pointer transition-all
                                        hover:bg-tertiary/50
                                        ${index !== messages.length - 1 ? 'border-b border-gray-800' : ''}
                                        ${!msg.is_read ? 'bg-violet-500/5' : ''}
                                    `}
                                >
                                    {/* Avatar */}
                                    <div className={`
                                        w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0
                                        ${!msg.is_read ? 'bg-violet-600' : 'bg-tertiary'}
                                    `}>
                                        <span className="text-white font-bold text-sm md:text-base">
                                            {msg.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className={`font-bold text-sm md:text-base truncate ${!msg.is_read ? 'text-white' : 'text-gray-300'}`}>
                                                {msg.name}
                                            </h3>
                                            {!msg.is_read && (
                                                <span className="w-2 h-2 bg-violet-500 rounded-full flex-shrink-0"></span>
                                            )}
                                        </div>
                                        <p className="text-secondary text-xs md:text-sm truncate">
                                            {msg.service || 'General Inquiry'}
                                        </p>
                                    </div>

                                    {/* Time */}
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-secondary text-xs md:text-sm">{getTimeAgo(msg.created_at)}</p>
                                        {msg.budget && msg.budget !== 'Not Specified' && (
                                            <span className="text-green-400 text-xs">₹{msg.budget}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Message Detail Dialog */}
            {selectedMessage && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
                        onClick={() => setSelectedMessage(null)}
                    />

                    {/* Modal */}
                    <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 bg-tertiary rounded-2xl md:w-full md:max-w-2xl flex flex-col max-h-[calc(100vh-32px)] overflow-hidden shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-700 bg-black-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">
                                        {selectedMessage.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{selectedMessage.name}</h2>
                                    <p className="text-secondary text-sm">{formatDate(selectedMessage.created_at)}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedMessage(null)}
                                className="p-2 text-secondary hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {/* Contact Info Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Email */}
                                <div className="bg-black-100 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 text-secondary text-sm mb-1">
                                        <Mail size={14} />
                                        <span>Email</span>
                                    </div>
                                    <p className="text-white font-medium break-all">{selectedMessage.email}</p>
                                </div>

                                {/* Phone */}
                                <div className="bg-black-100 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 text-secondary text-sm mb-1">
                                        <Phone size={14} />
                                        <span>Phone</span>
                                    </div>
                                    <p className="text-white font-medium">{selectedMessage.mobile || 'Not provided'}</p>
                                </div>

                                {/* Service */}
                                {selectedMessage.service && (
                                    <div className="bg-black-100 p-4 rounded-xl">
                                        <div className="flex items-center gap-2 text-secondary text-sm mb-1">
                                            <Briefcase size={14} />
                                            <span>Service Required</span>
                                        </div>
                                        <p className="text-white font-medium">{selectedMessage.service}</p>
                                    </div>
                                )}

                                {/* Budget */}
                                {selectedMessage.budget && selectedMessage.budget !== 'Not Specified' && (
                                    <div className="bg-black-100 p-4 rounded-xl">
                                        <div className="flex items-center gap-2 text-secondary text-sm mb-1">
                                            <IndianRupee size={14} />
                                            <span>Budget</span>
                                        </div>
                                        <p className="text-green-400 font-bold text-lg">{selectedMessage.budget}</p>
                                    </div>
                                )}
                            </div>

                            {/* Message */}
                            <div className="bg-black-100 p-4 rounded-xl">
                                <div className="flex items-center gap-2 text-secondary text-sm mb-3">
                                    <FileText size={14} />
                                    <span>Message</span>
                                </div>
                                <p className="text-white whitespace-pre-wrap leading-relaxed">{selectedMessage.message}</p>
                            </div>

                            {/* Quick Reply Section */}
                            <div className="bg-gradient-to-r from-violet-600/20 to-blue-600/20 p-4 rounded-xl border border-violet-500/30">
                                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                    <ExternalLink size={16} />
                                    Quick Reply
                                </h3>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {/* WhatsApp Button */}
                                    {selectedMessage.mobile && (
                                        <button
                                            onClick={() => openWhatsApp(selectedMessage.mobile)}
                                            className="flex-1 flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 py-4 px-6 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                                        >
                                            <MessageCircle size={22} />
                                            <div className="text-left">
                                                <span className="block text-base">WhatsApp</span>
                                                <span className="block text-xs opacity-80 font-normal">Open chat directly</span>
                                            </div>
                                        </button>
                                    )}

                                    {/* Email Button */}
                                    <button
                                        onClick={() => openEmail(selectedMessage.email, selectedMessage.name)}
                                        className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 py-4 px-6 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                                    >
                                        <Mail size={22} />
                                        <div className="text-left">
                                            <span className="block text-base">Email Reply</span>
                                            <span className="block text-xs opacity-80 font-normal">Compose in email app</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex gap-3 p-5 border-t border-gray-700 bg-black-100">
                            <button
                                onClick={() => handleMarkRead(selectedMessage.id, selectedMessage.is_read)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-colors font-medium ${selectedMessage.is_read ? 'bg-violet-600 hover:bg-violet-700' : 'bg-gray-600 hover:bg-gray-700'}`}
                            >
                                {selectedMessage.is_read ? 'Mark as Unread' : 'Mark as Read'}
                            </button>
                            <button
                                onClick={() => handleDelete(selectedMessage.id)}
                                className="flex items-center justify-center gap-2 py-3 px-6 bg-red-600 hover:bg-red-700 rounded-xl transition-colors font-medium"
                            >
                                <Trash2 size={18} />
                                Delete
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ManageContacts;
