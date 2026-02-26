import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Code2, Globe, Cpu, Wrench, Loader2, Menu, X } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { m as motion } from 'framer-motion';
import TechModal from '../../components/admin/TechModal';
import Sidebar from '../../components/admin/Sidebar';
import API_BASE_URL from '../../config';

const CATEGORIES = ['All', 'Frontend', 'Backend', 'Tools', 'Language', 'Other'];

// Mapping categories to Lucide icons for card display
const CategoryIconMap = {
    Frontend: Globe,
    Backend: Cpu,
    Tools: Wrench,
    Language: Code2,
    Other: Code2
};

const TechStackDashboard = () => {
    const [skills, setSkills] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSkill, setEditingSkill] = useState(null);

    // --- API Data Fetching ---
    const fetchSkills = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/skills`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch skills');
            const data = await res.json();
            setSkills(data);
        } catch (error) {
            console.error('Error fetching skills:', error);
            toast.error(error.message || 'Failed to load skills');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSkills();
    }, []);

    // --- Filtering Logic ---
    const filteredSkills = useMemo(() => {
        let result = [...skills];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(skill =>
                skill.name?.toLowerCase().includes(q) ||
                skill.category?.toLowerCase().includes(q)
            );
        }

        if (activeCategory !== 'All') {
            result = result.filter(skill => skill.category === activeCategory);
        }

        return result;
    }, [skills, searchQuery, activeCategory]);

    // --- Event Handlers ---
    const handleAddSkill = () => {
        setEditingSkill(null);
        setIsModalOpen(true);
    };

    const handleEditSkill = (skill) => {
        setEditingSkill(skill);
        setIsModalOpen(true);
    };

    const handleDeleteSkill = async (e, id) => {
        e.stopPropagation(); // Prevent triggering edit
        if (window.confirm('Are you sure you want to delete this skill?')) {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_BASE_URL}/api/skills/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Failed to delete skill');
                setSkills(prev => prev.filter(s => s.id !== id));
                toast.success('Skill deleted successfully');
            } catch (error) {
                console.error('Delete error:', error);
                toast.error(error.message);
            }
        }
    };

    const handleSaveSkill = async (formData) => {
        try {
            const token = localStorage.getItem('token');
            const url = editingSkill
                ? `${API_BASE_URL}/api/skills/${editingSkill.id}`
                : `${API_BASE_URL}/api/skills`;

            const method = editingSkill ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Failed to save skill');
            const savedSkill = await res.json();

            if (editingSkill) {
                setSkills(prev => prev.map(s => s.id === editingSkill.id ? savedSkill : s));
                toast.success('Skill updated successfully');
            } else {
                setSkills(prev => [savedSkill, ...prev]);
                toast.success('Skill created successfully');
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
                    <title>Tech Stack | Admin</title>
                </Helmet>

                {/* Ambient Background Glows */}
                <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

                {/* Mobile Header */}
                <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#161822] border-b border-[#252836] sticky top-0 z-30">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 text-white/60 hover:text-white rounded-lg transition-colors">
                        <Menu size={20} />
                    </button>
                    <h1 className="text-white font-bold flex-1 text-lg">Tech Stack Dashboard</h1>
                </div>

                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-8 relative z-10">

                        {/* Header Section */}
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                                <Code2 className="text-cyan-400" size={32} />
                                Tech Stack Core
                            </h1>
                            <p className="text-white/50 text-sm sm:text-base">
                                Manage your technological proficiencies and languages.
                            </p>
                        </div>

                        {/* Command Bar (Sticky) */}
                        <div className="sticky top-4 z-40 bg-[#0f0f15]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">

                            {/* Search Input */}
                            <div className="relative w-full md:max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search technologies..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-full py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:bg-white/5 transition-all shadow-inner"
                                />
                            </div>

                            {/* Filters & Actions Container */}
                            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4 sm:items-center">

                                {/* Category Pills */}
                                <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1 sm:pb-0 hide-scrollbar">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setActiveCategory(cat)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${activeCategory === cat
                                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                                                : 'bg-transparent text-white/50 border-transparent hover:text-white hover:bg-white/5 hover:border-white/10'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>

                                {/* Add Action */}
                                <button
                                    onClick={handleAddSkill}
                                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white px-6 py-2.5 rounded-full font-semibold hover:opacity-90 transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] shrink-0 w-full sm:w-auto mt-2 sm:mt-0"
                                >
                                    <Plus size={20} />
                                    <span>Add Tech</span>
                                </button>
                            </div>
                        </div>

                        {/* Grid */}
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 px-4 border border-white/5 rounded-3xl bg-white/[0.02] backdrop-blur-sm">
                                <Loader2 className="animate-spin text-cyan-500 mb-4" size={40} />
                                <p className="text-white/50">Synchronizing database...</p>
                            </div>
                        ) : filteredSkills.length > 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                            >
                                {filteredSkills.map((skill, index) => {
                                    const IconComponent = CategoryIconMap[skill.category] || Code2;
                                    return (
                                        <motion.div
                                            key={skill.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ y: -5, scale: 1.02 }}
                                            onClick={() => handleEditSkill(skill)}
                                            className="group relative bg-[#13111c]/60 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-cyan-500/50 hover:bg-[#1a1726]/80 transition-all duration-300 cursor-pointer overflow-hidden shadow-lg"
                                        >
                                            {/* Hover Glow Effect */}
                                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-indigo-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                                            <button
                                                onClick={(e) => handleDeleteSkill(e, skill.id)}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500/20 text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                                            >
                                                <X size={14} />
                                            </button>

                                            <div className="flex flex-col items-center text-center gap-3">
                                                <div 
                                                    className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-colors shadow-inner overflow-hidden p-2"
                                                    style={{ 
                                                        borderColor: skill.color ? `${skill.color}40` : 'rgba(255,255,255,0.1)',
                                                        boxShadow: skill.color ? `inset 0 0 20px ${skill.color}20` : 'none'
                                                    }}
                                                >
                                                    {skill.iconUrl && (skill.iconUrl.startsWith('http') || skill.iconUrl.startsWith('data:image') || skill.iconUrl.startsWith('/')) ? (
                                                        <img
                                                            src={skill.iconUrl}
                                                            alt={skill.name}
                                                            className="w-full h-full object-contain filter drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = ''; // Clear src to stop showing broken image
                                                                // Force re-render of fallback if needed or just handle via state
                                                            }}
                                                        />
                                                    ) : (
                                                        <IconComponent size={28} style={{ color: skill.color || 'rgba(255,255,255,0.7)' }} />
                                                    )}
                                                </div>

                                                <div>
                                                    <h3 className="text-white font-semibold truncate max-w-full text-center">{skill.name}</h3>
                                                    <p className="text-xs text-white/40 uppercase tracking-widest mt-0.5 text-center">{skill.category}</p>
                                                </div>

                                                <div className="w-full mt-2">
                                                    <div className="flex justify-between text-[10px] text-white/50 mb-1">
                                                        <span>Level</span>
                                                        <span style={{ color: skill.color || '#22d3ee' }} className="font-bold">{skill.proficiency}%</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
                                                        <div
                                                            className="h-full rounded-full"
                                                            style={{ 
                                                                width: `${skill.proficiency}%`,
                                                                backgroundColor: skill.color || '#22d3ee',
                                                                boxShadow: skill.color ? `0 0 10px ${skill.color}` : 'none'
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                {skill.isFeatured && (
                                                    <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" title="Featured" />
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center py-20 px-4 border border-white/5 rounded-3xl bg-white/[0.02] backdrop-blur-md"
                            >
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                    <Code2 className="text-white/20" size={32} />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">No skills discovered</h3>
                                <p className="text-white/40 text-center max-w-sm mb-6">
                                    Begin building your tech arsenal by clicking the Add Tech button above.
                                </p>
                            </motion.div>
                        )}

                    </div>
                </div>

                {/* Modal Integration */}
                <TechModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveSkill}
                    skill={editingSkill}
                />
            </div>
        </div>
    );
};

export default TechStackDashboard;
