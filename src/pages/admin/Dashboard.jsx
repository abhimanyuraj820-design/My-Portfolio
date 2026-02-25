import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";
import API_BASE_URL from "../../config";


import {
    Menu, FileText, MessageSquare, Mail, Star,
    TrendingUp, Clock, CheckCircle, X,
    Calendar, IndianRupee, Briefcase, ChevronRight, Phone, MessageCircle
} from "lucide-react";

const Dashboard = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedContact, setSelectedContact] = useState(null);
    const [stats, setStats] = useState({
        totalBlogs: 0,
        publishedBlogs: 0,
        draftBlogs: 0,
        featuredBlogs: 0,
        totalTestimonials: 0,
        approvedTestimonials: 0,
        pendingTestimonials: 0,
        avgRating: 0,
        totalContacts: 0,
        unreadContacts: 0,
        readContacts: 0,
        recentContacts: [],
        recentBlogs: [],
        serviceBreakdown: {},
        budgetBreakdown: {}
    });

    const fetchAllStats = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [blogsRes, testimonialsRes, contactsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/blogs`, { headers }),
                fetch(`${API_BASE_URL}/api/testimonials`, { headers }),
                fetch(`${API_BASE_URL}/api/contacts`, { headers })
            ]);

            const blogs = blogsRes.ok ? await blogsRes.json() : [];
            const testimonials = testimonialsRes.ok ? await testimonialsRes.json() : [];
            let contacts = contactsRes.ok ? await contactsRes.json() : [];

            const blogStats = {
                total: blogs?.length || 0,
                published: blogs?.filter(b => true).length || 0, // Assuming all blogs are published since there's no status in schema yet
                draft: 0,
                featured: 0
            };

            const testimonialStats = {
                total: testimonials?.length || 0,
                approved: testimonials?.filter(t => t.isApproved).length || 0,
                pending: testimonials?.filter(t => !t.isApproved).length || 0,
                avgRating: 5 // Optional: handle rating calculation if added to schema
            };

            const contactStats = {
                total: contacts?.length || 0,
                unread: contacts?.filter(c => !c.isRead).length || 0,
                read: contacts?.filter(c => c.isRead).length || 0
            };

            const serviceBreakdown = {};
            contacts?.forEach(c => {
                const service = c.subject || 'Other';
                serviceBreakdown[service] = (serviceBreakdown[service] || 0) + 1;
            });

            const budgetBreakdown = {};
            contacts?.forEach(c => {
                const budget = c.budget || 'Not Specified';
                budgetBreakdown[budget] = (budgetBreakdown[budget] || 0) + 1;
            });

            setStats({
                totalBlogs: blogStats.total,
                publishedBlogs: blogStats.published,
                draftBlogs: blogStats.draft,
                featuredBlogs: blogStats.featured,
                totalTestimonials: testimonialStats.total,
                approvedTestimonials: testimonialStats.approved,
                pendingTestimonials: testimonialStats.pending,
                avgRating: testimonialStats.avgRating,
                totalContacts: contactStats.total,
                unreadContacts: contactStats.unread,
                readContacts: contactStats.read,
                recentContacts: contacts?.slice(0, 5) || [],
                recentBlogs: blogs?.slice(0, 3) || [],
                serviceBreakdown,
                budgetBreakdown
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAllStats();
    }, []);

    const formatTimeAgo = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
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

    const openWhatsApp = (mobile) => {
        let phone = mobile.replace(/[^\d+]/g, '');
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

    const StatCard = ({ title, value, icon: Icon, color, subStats, onClick }) => (
        <div
            onClick={onClick}
            className={`bg-black-100 p-5 md:p-6 rounded-2xl transition-all ${onClick ? 'cursor-pointer hover:bg-black-200 hover:scale-[1.02]' : ''}`}
        >
            <div className="flex items-start justify-between mb-3">
                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon size={22} className="text-white" />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-3xl md:text-4xl font-bold text-white">{value}</span>
                    {onClick && <ChevronRight size={20} className="text-secondary" />}
                </div>
            </div>
            <h3 className="text-secondary text-sm md:text-base font-medium">{title}</h3>
            {subStats && (
                <div className="flex gap-3 mt-3 pt-3 border-t border-gray-800">
                    {subStats.map((sub, i) => (
                        <div key={i} className="flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${sub.color}`}></span>
                            <span className="text-xs text-secondary">{sub.value} {sub.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

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
                    <h1 className="text-white text-xl font-bold">Dashboard</h1>
                </div>

                {/* Content Area */}
                <div className="p-4 md:p-10 text-white">
                    {/* Desktop Title */}
                    <div className="hidden md:flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-bold">Dashboard</h1>
                            <p className="text-secondary mt-1">Welcome back! Here's your portfolio overview.</p>
                        </div>
                        <div className="flex items-center gap-2 text-secondary text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            Real-time updates
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-500"></div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Main Stats Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard
                                    title="Total Blogs"
                                    value={stats.totalBlogs}
                                    icon={FileText}
                                    color="bg-violet-600"
                                    onClick={() => navigate('/x7k9m2p4q/blogs')}
                                    subStats={[
                                        { value: stats.publishedBlogs, label: 'Published', color: 'bg-green-500' },
                                        { value: stats.draftBlogs, label: 'Draft', color: 'bg-yellow-500' }
                                    ]}
                                />
                                <StatCard
                                    title="Testimonials"
                                    value={stats.totalTestimonials}
                                    icon={MessageSquare}
                                    color="bg-blue-600"
                                    onClick={() => navigate('/x7k9m2p4q/testimonials')}
                                    subStats={[
                                        { value: stats.approvedTestimonials, label: 'Approved', color: 'bg-green-500' },
                                        { value: stats.pendingTestimonials, label: 'Pending', color: 'bg-yellow-500' }
                                    ]}
                                />
                                <StatCard
                                    title="Contact Messages"
                                    value={stats.totalContacts}
                                    icon={Mail}
                                    color="bg-green-600"
                                    onClick={() => navigate('/x7k9m2p4q/contacts')}
                                    subStats={[
                                        { value: stats.unreadContacts, label: 'Unread', color: 'bg-violet-500' },
                                        { value: stats.readContacts, label: 'Read', color: 'bg-gray-500' }
                                    ]}
                                />
                                <StatCard
                                    title="Avg Rating"
                                    value={stats.avgRating}
                                    icon={Star}
                                    color="bg-yellow-600"
                                    onClick={() => navigate('/x7k9m2p4q/testimonials')}
                                />
                            </div>

                            {/* Analytics Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Service Breakdown */}
                                <div className="bg-black-100 p-5 md:p-6 rounded-2xl">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Briefcase size={18} className="text-violet-500" />
                                        <h3 className="text-lg font-bold">Services Requested</h3>
                                    </div>
                                    {Object.keys(stats.serviceBreakdown).length > 0 ? (
                                        <div className="space-y-3">
                                            {Object.entries(stats.serviceBreakdown).map(([service, count]) => {
                                                const percentage = Math.round((count / stats.totalContacts) * 100);
                                                return (
                                                    <div key={service}>
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <span className="text-secondary">{service}</span>
                                                            <span className="text-white font-medium">{count} ({percentage}%)</span>
                                                        </div>
                                                        <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-violet-600 to-blue-600 rounded-full transition-all duration-500"
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-secondary text-center py-8">No data yet</p>
                                    )}
                                </div>

                                {/* Budget Distribution */}
                                <div className="bg-black-100 p-5 md:p-6 rounded-2xl">
                                    <div className="flex items-center gap-2 mb-4">
                                        <IndianRupee size={18} className="text-green-500" />
                                        <h3 className="text-lg font-bold">Budget Distribution</h3>
                                    </div>
                                    {Object.keys(stats.budgetBreakdown).length > 0 ? (
                                        <div className="space-y-3">
                                            {Object.entries(stats.budgetBreakdown).map(([budget, count]) => {
                                                const percentage = Math.round((count / stats.totalContacts) * 100);
                                                return (
                                                    <div key={budget}>
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <span className="text-secondary">{budget}</span>
                                                            <span className="text-white font-medium">{count} ({percentage}%)</span>
                                                        </div>
                                                        <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-green-600 to-emerald-500 rounded-full transition-all duration-500"
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-secondary text-center py-8">No data yet</p>
                                    )}
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Recent Contacts */}
                                <div className="bg-black-100 p-5 md:p-6 rounded-2xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Mail size={18} className="text-green-500" />
                                            <h3 className="text-lg font-bold">Recent Inquiries</h3>
                                        </div>
                                        <button
                                            onClick={() => navigate('/x7k9m2p4q/contacts')}
                                            className="text-violet-400 text-sm hover:text-violet-300 flex items-center gap-1"
                                        >
                                            View All <ChevronRight size={16} />
                                        </button>
                                    </div>
                                    {stats.recentContacts.length > 0 ? (
                                        <div className="space-y-2">
                                            {stats.recentContacts.map((contact) => (
                                                <div
                                                    key={contact.id}
                                                    onClick={() => setSelectedContact(contact)}
                                                    className="flex items-center gap-3 p-3 bg-tertiary/50 rounded-xl cursor-pointer hover:bg-tertiary transition-colors"
                                                >
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${!contact.is_read ? 'bg-violet-600' : 'bg-gray-700'}`}>
                                                        <span className="text-white font-bold text-sm">
                                                            {contact.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium truncate">{contact.name}</p>
                                                        <p className="text-secondary text-xs truncate">{contact.service || 'General Inquiry'}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <span className="text-secondary text-xs">{formatTimeAgo(contact.created_at)}</span>
                                                        <ChevronRight size={16} className="text-secondary" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-secondary text-center py-8">No inquiries yet</p>
                                    )}
                                </div>

                                {/* Quick Stats */}
                                <div className="bg-black-100 p-5 md:p-6 rounded-2xl">
                                    <div className="flex items-center gap-2 mb-4">
                                        <TrendingUp size={18} className="text-violet-500" />
                                        <h3 className="text-lg font-bold">Quick Stats</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div
                                            onClick={() => navigate('/x7k9m2p4q/blogs')}
                                            className="bg-tertiary/50 p-4 rounded-xl text-center cursor-pointer hover:bg-tertiary transition-colors"
                                        >
                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                <CheckCircle size={16} className="text-green-500" />
                                                <span className="text-2xl font-bold">{stats.publishedBlogs}</span>
                                            </div>
                                            <p className="text-secondary text-xs">Published Blogs</p>
                                        </div>
                                        <div
                                            onClick={() => navigate('/x7k9m2p4q/blogs')}
                                            className="bg-tertiary/50 p-4 rounded-xl text-center cursor-pointer hover:bg-tertiary transition-colors"
                                        >
                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                <Star size={16} className="text-yellow-500" />
                                                <span className="text-2xl font-bold">{stats.featuredBlogs}</span>
                                            </div>
                                            <p className="text-secondary text-xs">Featured Blogs</p>
                                        </div>
                                        <div
                                            onClick={() => navigate('/x7k9m2p4q/testimonials')}
                                            className="bg-tertiary/50 p-4 rounded-xl text-center cursor-pointer hover:bg-tertiary transition-colors"
                                        >
                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                <CheckCircle size={16} className="text-green-500" />
                                                <span className="text-2xl font-bold">{stats.approvedTestimonials}</span>
                                            </div>
                                            <p className="text-secondary text-xs">Approved Reviews</p>
                                        </div>
                                        <div
                                            onClick={() => navigate('/x7k9m2p4q/testimonials')}
                                            className="bg-tertiary/50 p-4 rounded-xl text-center cursor-pointer hover:bg-tertiary transition-colors"
                                        >
                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                <Clock size={16} className="text-yellow-500" />
                                                <span className="text-2xl font-bold">{stats.pendingTestimonials}</span>
                                            </div>
                                            <p className="text-secondary text-xs">Pending Reviews</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Contact Quick View Modal */}
            {selectedContact && (
                <>
                    <div
                        className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
                        onClick={() => setSelectedContact(null)}
                    />
                    <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 bg-tertiary rounded-2xl md:w-full md:max-w-lg flex flex-col max-h-[calc(100vh-32px)] overflow-hidden shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-700 bg-black-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">
                                        {selectedContact.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{selectedContact.name}</h2>
                                    <p className="text-secondary text-sm">{formatDate(selectedContact.created_at)}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedContact(null)}
                                className="p-2 text-secondary hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="bg-black-100 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 text-secondary text-sm mb-1">
                                        <Mail size={14} />
                                        <span>Email</span>
                                    </div>
                                    <p className="text-white font-medium break-all text-sm">{selectedContact.email}</p>
                                </div>
                                <div className="bg-black-100 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 text-secondary text-sm mb-1">
                                        <Phone size={14} />
                                        <span>Phone</span>
                                    </div>
                                    <p className="text-white font-medium">{selectedContact.mobile || 'Not provided'}</p>
                                </div>
                                {selectedContact.service && (
                                    <div className="bg-black-100 p-4 rounded-xl">
                                        <div className="flex items-center gap-2 text-secondary text-sm mb-1">
                                            <Briefcase size={14} />
                                            <span>Service</span>
                                        </div>
                                        <p className="text-white font-medium">{selectedContact.service}</p>
                                    </div>
                                )}
                                {selectedContact.budget && selectedContact.budget !== 'Not Specified' && (
                                    <div className="bg-black-100 p-4 rounded-xl">
                                        <div className="flex items-center gap-2 text-secondary text-sm mb-1">
                                            <IndianRupee size={14} />
                                            <span>Budget</span>
                                        </div>
                                        <p className="text-green-400 font-bold">{selectedContact.budget}</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-black-100 p-4 rounded-xl">
                                <p className="text-secondary text-sm mb-2">Message</p>
                                <p className="text-white whitespace-pre-wrap">{selectedContact.message}</p>
                            </div>

                            {/* Quick Reply */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                {selectedContact.mobile && (
                                    <button
                                        onClick={() => openWhatsApp(selectedContact.mobile)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 py-3 px-4 rounded-xl font-bold transition-all"
                                    >
                                        <MessageCircle size={20} />
                                        WhatsApp
                                    </button>
                                )}
                                <button
                                    onClick={() => openEmail(selectedContact.email, selectedContact.name)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 py-3 px-4 rounded-xl font-bold transition-all"
                                >
                                    <Mail size={20} />
                                    Email Reply
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-700 bg-black-100">
                            <button
                                onClick={() => {
                                    setSelectedContact(null);
                                    navigate('/x7k9m2p4q/contacts');
                                }}
                                className="w-full py-3 bg-tertiary hover:bg-tertiary/80 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                View All Messages <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
