import React, { useState, useEffect } from 'react';
import { Plus, Briefcase, Calendar, Edit2, Trash2, GripVertical, Loader2, Menu, X } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { m as motion, Reorder } from 'framer-motion';
import Sidebar from '../../components/admin/Sidebar';
import ExperienceModal from '../../components/admin/ExperienceModal';
import API_BASE_URL from '../../config';

const ExperienceDashboard = () => {
    const [experiences, setExperiences] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExperience, setEditingExperience] = useState(null);

    const fetchExperiences = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/experience`);
            if (!res.ok) throw new Error('Failed to fetch experiences');
            const data = await res.json();
            setExperiences(data);
        } catch (error) {
            console.error('Error fetching experiences:', error);
            toast.error(error.message || 'Failed to load experiences');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchExperiences();
    }, []);

    const handleAddExperience = () => {
        setEditingExperience(null);
        setIsModalOpen(true);
    };

    const handleEditExperience = (experience) => {
        setEditingExperience(experience);
        setIsModalOpen(true);
    };

    const handleDeleteExperience = async (id) => {
        if (window.confirm('Are you sure you want to delete this experience?')) {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_BASE_URL}/api/experience/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Failed to delete experience');
                setExperiences(prev => prev.filter(e => e.id !== id));
                toast.success('Experience deleted successfully');
            } catch (error) {
                console.error('Delete error:', error);
                toast.error(error.message);
            }
        }
    };

    const handleSaveExperience = async (formData) => {
        try {
            const token = localStorage.getItem('token');
            const url = editingExperience
                ? `${API_BASE_URL}/api/experience/${editingExperience.id}`
                : `${API_BASE_URL}/api/experience`;

            const method = editingExperience ? 'PUT' : 'POST';

            // If it's a new item, set its order to be at the end
            if (!editingExperience) {
                formData.order = experiences.length;
            }

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Failed to save experience');
            const savedExperience = await res.json();

            if (editingExperience) {
                setExperiences(prev => prev.map(e => e.id === editingExperience.id ? savedExperience : e));
                toast.success('Experience updated successfully');
            } else {
                setExperiences(prev => [...prev, savedExperience]);
                toast.success('Experience added successfully');
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Save error:', error);
            toast.error(error.message);
        }
    };

    const handleReorder = async (newOrder) => {
        setExperiences(newOrder);
        
        try {
            const token = localStorage.getItem('token');
            const items = newOrder.map((item, index) => ({ id: item.id, order: index }));
            
            const res = await fetch(`${API_BASE_URL}/api/experience/reorder/bulk`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ items })
            });

            if (!res.ok) throw new Error('Failed to save new order');
            toast.success('Order updated successfully');
        } catch (error) {
            console.error('Reorder error:', error);
            toast.error('Failed to save new order. Refreshing...');
            fetchExperiences(); // Revert on failure
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    return (
        <div className="flex min-h-screen bg-[#050505]">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 md:ml-64 min-h-screen relative overflow-hidden">
                <Helmet>
                    <title>Experience Timeline | Admin</title>
                </Helmet>

                {/* Ambient Background Glows */}
                <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

                {/* Mobile Header */}
                <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#161822] border-b border-[#252836] sticky top-0 z-30">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 text-white/60 hover:text-white rounded-lg transition-colors">
                        <Menu size={20} />
                    </button>
                    <h1 className="text-white font-bold flex-1 text-lg">Experience Timeline</h1>
                </div>

                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="max-w-4xl mx-auto space-y-8 relative z-10">

                        {/* Header Section */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                                    <Briefcase className="text-indigo-400" size={32} />
                                    Experience Timeline
                                </h1>
                                <p className="text-white/50 text-sm sm:text-base">
                                    Manage your professional journey. Drag to reorder.
                                </p>
                            </div>
                            <button
                                onClick={handleAddExperience}
                                className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white px-6 py-2.5 rounded-full font-semibold hover:opacity-90 transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] shrink-0 w-full sm:w-auto"
                            >
                                <Plus size={20} />
                                <span>Add Role</span>
                            </button>
                        </div>

                        {/* Timeline List */}
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 px-4 border border-white/5 rounded-3xl bg-white/[0.02] backdrop-blur-sm">
                                <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
                                <p className="text-white/50">Loading timeline...</p>
                            </div>
                        ) : experiences.length > 0 ? (
                            <div className="relative">
                                {/* Vertical Line */}
                                <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-white/10 hidden sm:block" />
                                
                                <Reorder.Group axis="y" values={experiences} onReorder={handleReorder} className="space-y-4">
                                    {experiences.map((exp) => (
                                        <Reorder.Item key={exp.id} value={exp} className="relative z-10">
                                            <div className="group bg-[#13111c]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-indigo-500/50 transition-all duration-300 flex flex-col sm:flex-row gap-5 items-start sm:items-center shadow-lg">
                                                
                                                {/* Drag Handle */}
                                                <div className="cursor-grab active:cursor-grabbing p-2 text-white/20 hover:text-white/60 transition-colors hidden sm:block">
                                                    <GripVertical size={20} />
                                                </div>

                                                {/* Logo/Icon */}
                                                <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden p-2">
                                                    {exp.logoUrl ? (
                                                        <img src={exp.logoUrl} alt={exp.company} className="w-full h-full object-contain" />
                                                    ) : (
                                                        <Briefcase size={24} className="text-white/40" />
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-xl font-bold text-white truncate">{exp.role}</h3>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1 text-sm">
                                                        <span className="text-indigo-400 font-medium">{exp.company}</span>
                                                        <span className="text-white/20 hidden sm:inline">•</span>
                                                        <div className="flex items-center gap-1.5 text-white/50">
                                                            <Calendar size={14} />
                                                            <span>
                                                                {formatDate(exp.startDate)} - {exp.currentJob ? 'Present' : formatDate(exp.endDate)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-4 sm:mt-0 pt-4 sm:pt-0 border-t border-white/5 sm:border-0">
                                                    <button
                                                        onClick={() => handleEditExperience(exp)}
                                                        className="p-2 bg-white/5 hover:bg-indigo-500/20 text-white/60 hover:text-indigo-400 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteExperience(exp.id)}
                                                        className="p-2 bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 px-4 border border-white/5 rounded-3xl bg-white/[0.02] backdrop-blur-md">
                                <Briefcase className="text-white/20 mb-4" size={48} />
                                <h3 className="text-xl font-semibold text-white mb-2">No Experience Added</h3>
                                <p className="text-white/50 text-center max-w-md mb-6">
                                    Your timeline is empty. Add your work history to showcase your professional journey.
                                </p>
                                <button
                                    onClick={handleAddExperience}
                                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors border border-white/10"
                                >
                                    Add First Role
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ExperienceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveExperience}
                experience={editingExperience}
            />
        </div>
    );
};

export default ExperienceDashboard;
