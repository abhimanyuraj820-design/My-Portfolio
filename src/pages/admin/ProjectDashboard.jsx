import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Filter, LayoutGrid, Loader2, Menu } from 'lucide-react';
import ProjectCard from '../../components/admin/ProjectCard';
import ProjectModal from '../../components/admin/ProjectModal';
import Sidebar from '../../components/admin/Sidebar';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import API_BASE_URL from '../../config';

const CATEGORIES = ['All', 'Web', 'App', 'AI', 'Design'];
const SORTS = ['Newest', 'Oldest', 'Featured First'];

const ProjectDashboard = () => {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [activeSort, setActiveSort] = useState('Newest');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    // --- API Data Fetching ---
    const fetchProjects = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/projects`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch projects');
            const data = await res.json();
            setProjects(data);
        } catch (error) {
            console.error('Error fetching projects:', error);
            toast.error(error.message || 'Failed to load projects');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    // --- Filtering & Sorting Logic ---
    const filteredAndSortedProjects = useMemo(() => {
        let result = [...projects];

        // 1. Search Filter (Title or Tech Stack)
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(project =>
                project.title?.toLowerCase().includes(q) ||
                project.techStack?.some(tech => tech.toLowerCase().includes(q))
            );
        }

        // 2. Category Filter
        if (activeCategory !== 'All') {
            result = result.filter(project => project.category === activeCategory);
        }

        // 3. Sorting
        switch (activeSort) {
            case 'Oldest':
                result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                break;
            case 'Featured First':
                result.sort((a, b) => {
                    // Rank featured highest, then fallback to newest
                    if (a.isFeatured === b.isFeatured) {
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    }
                    return a.isFeatured ? -1 : 1;
                });
                break;
            case 'Newest':
            default:
                result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
        }

        return result;
    }, [projects, searchQuery, activeCategory, activeSort]);


    // --- Event Handlers ---
    const handleAddProject = () => {
        setEditingProject(null);
        setIsModalOpen(true);
    };

    const handleEditProject = (project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const handleDeleteProject = async (id) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Failed to delete project');
                setProjects(prev => prev.filter(p => p.id !== id));
                toast.success('Project deleted successfully');
            } catch (error) {
                console.error('Delete error:', error);
                toast.error(error.message);
            }
        }
    };

    const handleSaveProject = async (formData) => {
        try {
            const token = localStorage.getItem('token');
            const url = editingProject
                ? `${API_BASE_URL}/api/projects/${editingProject.id}`
                : `${API_BASE_URL}/api/projects`;

            const method = editingProject ? 'PUT' : 'POST';

            // Ensure priority is a number
            const submissionData = {
                ...formData,
                priorityOrder: parseInt(formData.priorityOrder) || 0
            };

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(submissionData)
            });

            if (!res.ok) throw new Error('Failed to save project');
            const savedProject = await res.json();

            if (editingProject) {
                setProjects(prev => prev.map(p => p.id === editingProject.id ? savedProject : p));
                toast.success('Project updated successfully');
            } else {
                setProjects(prev => [savedProject, ...prev]);
                toast.success('Project created successfully');
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Save error:', error);
            toast.error(error.message);
        }
    };


    return (
        <div className="flex min-h-screen bg-[#050505]">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 md:ml-64 min-h-screen relative overflow-hidden">
                <Helmet>
                    <title>Project Management | Admin</title>
                </Helmet>

                {/* Ambient Background Glows */}
                <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

                {/* Mobile Header */}
                <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#161822] border-b border-[#252836] sticky top-0 z-30">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 text-white/60 hover:text-white rounded-lg transition-colors">
                        <Menu size={20} />
                    </button>
                    <h1 className="text-white font-bold flex-1 text-lg">Project Dashboard</h1>
                </div>

                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-8">

                        {/* Header Section */}
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                                <LayoutGrid className="text-purple-500" size={32} />
                                Project Arsenal
                            </h1>
                            <p className="text-white/50 text-sm sm:text-base">
                                Manage your portfolio showcase. A high-performance command center for your best work.
                            </p>
                        </div>

                        {/* Command Bar (Sticky) */}
                        <div className="sticky top-4 z-40 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">

                            {/* Search Input */}
                            <div className="relative w-full md:max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search projects or tech stack (e.g., React)..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all shadow-inner"
                                />
                            </div>

                            {/* Filters & Actions Container */}
                            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4 sm:items-center">

                                {/* Category Pills */}
                                <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1 sm:pb-0">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setActiveCategory(cat)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${activeCategory === cat
                                                ? 'bg-white/10 text-white border-white/20 shadow-lg'
                                                : 'bg-transparent text-white/50 border-transparent hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>

                                {/* Sort Dropdown */}
                                <div className="relative group shrink-0">
                                    <select
                                        value={activeSort}
                                        onChange={(e) => setActiveSort(e.target.value)}
                                        className="bg-white/5 border border-white/10 rounded-full py-2 px-4 pr-8 text-white text-sm focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer"
                                    >
                                        {SORTS.map(sort => (
                                            <option key={sort} value={sort} className="bg-[#0f0f15]">{sort}</option>
                                        ))}
                                    </select>
                                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" size={14} />
                                </div>

                                {/* Add Action */}
                                <button
                                    onClick={handleAddProject}
                                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2.5 rounded-full font-semibold hover:opacity-90 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] border border-purple-400/30 shrink-0 w-full sm:w-auto mt-2 sm:mt-0"
                                >
                                    <Plus size={20} />
                                    <span>New Project</span>
                                </button>
                            </div>
                        </div>

                        {/* Project Grid */}
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 px-4 border border-white/5 rounded-3xl bg-white/[0.02]">
                                <Loader2 className="animate-spin text-purple-500 mb-4" size={40} />
                                <p className="text-white/50">Loading your arsenal...</p>
                            </div>
                        ) : filteredAndSortedProjects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredAndSortedProjects.map(project => (
                                    <ProjectCard
                                        key={project.id}
                                        project={project}
                                        onEdit={handleEditProject}
                                        onDelete={handleDeleteProject}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 px-4 border border-white/5 rounded-3xl bg-white/[0.02]">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                    <Search className="text-white/20" size={32} />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">No projects found</h3>
                                <p className="text-white/40 text-center max-w-sm mb-6">
                                    We couldn't find any projects matching your current search or filter criteria.
                                </p>
                                <button
                                    onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                                    className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors text-sm font-medium"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}

                    </div>
                </div>

                {/* Modal Integration */}
                <ProjectModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveProject}
                    project={editingProject}
                />
            </div>
        </div>
    );
};

export default ProjectDashboard;
