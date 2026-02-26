import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../../components/admin/Sidebar";
import { m as motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../../context/AuthContext";
import API_BASE_URL from "../../config";
import RichTextEditor from "../../components/admin/RichTextEditor";

import { uploadToCloudinary } from "../../lib/cloudinary/service";
import { Pencil, Trash2, Eye, EyeOff, Star, Plus, X, ChevronDown, ChevronUp, Menu, ArrowLeft, Search, ArrowUpDown, RefreshCw, Globe } from "lucide-react";

const ManageBlogs = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [view, setView] = useState('list');
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingBlog, setEditingBlog] = useState(null);
    const [expandedBlog, setExpandedBlog] = useState(null);
    const [blogSearch, setBlogSearch] = useState('');
    const [blogFilter, setBlogFilter] = useState('all');
    const [blogSort, setBlogSort] = useState('newest');
    const [showBlogSort, setShowBlogSort] = useState(false);

    const filteredBlogs = useMemo(() => {
        let result = [...blogs];
        if (blogSearch) {
            const q = blogSearch.toLowerCase();
            result = result.filter(b => b.title.toLowerCase().includes(q) || b.category?.toLowerCase().includes(q) || b.tags?.some(t => t.toLowerCase().includes(q)));
        }
        if (blogFilter === 'published') result = result.filter(b => b.published);
        else if (blogFilter === 'draft') result = result.filter(b => !b.published);
        else if (blogFilter === 'featured') result = result.filter(b => b.featured);
        if (blogSort === 'newest') result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        else if (blogSort === 'oldest') result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        else if (blogSort === 'title_az') result.sort((a, b) => a.title.localeCompare(b.title));
        else if (blogSort === 'title_za') result.sort((a, b) => b.title.localeCompare(a.title));
        return result;
    }, [blogs, blogSearch, blogFilter, blogSort]);

    const [form, setForm] = useState({
        title: '',
        excerpt: '',
        content: '',
        cover_image: '',
        category: '',
        tags: [],
        reading_time: 5,
        featured: false,
        published: false
    });
    const [tagInput, setTagInput] = useState('');
    const [coverUploading, setCoverUploading] = useState(false);

    const categories = [
        'Technology', 'Web Development', 'App Development',
        'UI/UX Design', 'SEO', 'Digital Marketing',
        'Programming', 'Tutorial', 'News', 'Personal', 'Other'
    ];

    useEffect(() => {
        fetchBlogs();
    }, []);

    const getHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/blogs`, { headers: getHeaders() });
            if (res.ok) {
                const data = await res.json();
                setBlogs(data || []);
            }
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const resetForm = () => {
        setForm({
            title: '',
            excerpt: '',
            content: '',
            cover_image: '',
            category: '',
            tags: [],
            reading_time: 5,
            featured: false,
            published: false
        });
        setTagInput('');
        setEditingBlog(null);
    };

    const handleCreateNew = () => {
        resetForm();
        setView('create');
    };

    const handleEdit = (blog) => {
        setForm({
            title: blog.title || '',
            excerpt: blog.excerpt || '',
            content: blog.content || '',
            cover_image: blog.cover_image || '',
            category: blog.category || '',
            tags: blog.tags || [],
            reading_time: blog.reading_time || 5,
            featured: blog.featured || false,
            published: blog.published || false
        });
        setEditingBlog(blog);
        setView('edit');
    };

    const handleCancel = () => {
        resetForm();
        setView('list');
    };

    const handleCoverUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setCoverUploading(true);
        try {
            const url = await uploadToCloudinary(file);
            setForm({ ...form, cover_image: url });
        } catch (err) {
            alert('Cover image upload failed: ' + err.message);
        }
        setCoverUploading(false);
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
            setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setForm({ ...form, tags: form.tags.filter(tag => tag !== tagToRemove) });
    };

    const handleSave = async () => {
        if (!form.title || !form.content) {
            alert("Please fill in Title and Content");
            return;
        }

        setSaving(true);
        const slug = form.title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

        const blogData = {
            title: form.title,
            slug: slug,
            excerpt: form.excerpt,
            content: form.content,
            cover_image: form.cover_image,
            category: form.category,
            tags: form.tags,
            reading_time: form.reading_time,
            featured: form.featured,
            published: form.published,
            /* updated_at is handled by DB automatically usually, but passing is fine if schema allows */
        };

        try {
            let res;
            if (editingBlog) {
                res = await fetch(`${API_BASE_URL}/api/blogs/${editingBlog.id}`, {
                    method: 'PUT',
                    headers: getHeaders(),
                    body: JSON.stringify(blogData)
                });
            } else {
                res = await fetch(`${API_BASE_URL}/api/blogs`, {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify(blogData)
                });
            }

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Unknown error');
            }

            alert(editingBlog ? "Blog updated!" : "Blog created!");
            resetForm();
            setView('list');
            fetchBlogs();
        } catch (error) {
            alert("Error saving blog: " + error.message);
        }
        setSaving(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this blog?")) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/blogs/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });

            if (res.ok) {
                fetchBlogs();
            } else {
                const errData = await res.json();
                alert("Error deleting: " + (errData.error || 'Unknown error'));
            }
        } catch (err) {
            alert("Error deleting: " + err.message);
        }
    };

    const togglePublish = async (blog) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/blogs/${blog.id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ published: !blog.published })
            });

            if (res.ok) fetchBlogs();
        } catch (err) {
            console.error(err);
        }
    };

    const toggleFeatured = async (blog) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/blogs/${blog.id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ featured: !blog.featured })
            });

            if (res.ok) fetchBlogs();
        } catch (err) {
            console.error(err);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const calculateReadingTime = (text) => {
        const words = text.replace(/<[^>]*>/g, '').split(/\s+/).length;
        return Math.max(1, Math.ceil(words / 200));
    };

    const handleContentChange = (newContent) => {
        const readingTime = calculateReadingTime(newContent);
        setForm({ ...form, content: newContent, reading_time: readingTime });
    };

    const getPageTitle = () => {
        if (view === 'list') return 'Manage Blogs';
        if (view === 'create') return 'Create Blog';
        return 'Edit Blog';
    };

    return (
        <div className="flex min-h-screen bg-[#0f1117]">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 md:ml-64 min-h-screen overflow-x-hidden">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center gap-4 p-4 bg-[#161822] border-b border-[#252836] sticky top-0 z-30">
                    {view === 'list' ? (
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                    ) : (
                        <button
                            onClick={handleCancel}
                            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </button>
                    )}
                    <h1 className="text-white text-lg font-bold flex-1">{getPageTitle()}</h1>
                    {view === 'list' && (
                        <button
                            onClick={handleCreateNew}
                            className="p-2 bg-green-600 rounded-lg"
                        >
                            <Plus size={20} />
                        </button>
                    )}
                </div>

                {/* Content Area */}
                <div className="p-4 md:p-6 xl:p-8 text-white relative">
                    {/* Ambient Background Glows */}
                    <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
                    <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

                    {/* Desktop Header */}
                    <div className="hidden md:flex justify-between items-center mb-6 relative z-10">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-white/90">{getPageTitle()}</h1>
                            {view === 'list' && <p className="text-white/30 text-xs mt-0.5">{blogs.length} total · {blogs.filter(b => b.published).length} published</p>}
                        </div>
                        {view === 'list' ? (
                            <button onClick={handleCreateNew}
                                className="flex items-center gap-2 bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/25 text-violet-300 py-2.5 px-5 rounded-xl font-semibold text-sm transition-all">
                                <Plus size={16} /> New Blog
                            </button>
                        ) : (
                            <button onClick={handleCancel}
                                className="flex items-center gap-2 bg-white/5 hover:bg-white/8 border border-white/10 text-white/50 py-2.5 px-5 rounded-xl font-semibold text-sm transition-all">
                                <X size={16} /> Cancel
                            </button>
                        )}
                    </div>

                    {/* LIST VIEW */}
                    {view === 'list' && (
                        <div className="space-y-4">
                            {/* Search + Sort */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                    <input type="text" placeholder="Search by title, category, tags..." value={blogSearch} onChange={(e) => setBlogSearch(e.target.value)}
                                        className="w-full bg-[#1a1d2e] text-white text-sm py-3 pl-11 pr-4 rounded-xl border border-[#252836] focus:border-purple-500/50 outline-none placeholder:text-white/25 transition-all" />
                                </div>
                                <div className="relative">
                                    <button onClick={() => setShowBlogSort(!showBlogSort)}
                                        className="flex items-center gap-2 bg-[#1a1d2e] border border-[#252836] px-4 py-3 rounded-xl text-sm text-white/50 hover:text-white/80 hover:border-[#353849] transition-all whitespace-nowrap">
                                        <ArrowUpDown size={14} />
                                        {{ newest: 'Newest', oldest: 'Oldest', title_az: 'A→Z', title_za: 'Z→A' }[blogSort]}
                                        <ChevronDown size={14} />
                                    </button>
                                    {showBlogSort && (
                                        <>
                                            <div className="fixed inset-0 z-30" onClick={() => setShowBlogSort(false)} />
                                            <div className="absolute right-0 top-full mt-2 w-44 bg-[#1a1d2e] border border-[#252836] rounded-xl shadow-2xl z-40 py-2">
                                                {[{ v: 'newest', l: 'Newest First' }, { v: 'oldest', l: 'Oldest First' }, { v: 'title_az', l: 'Title A→Z' }, { v: 'title_za', l: 'Title Z→A' }].map(o => (
                                                    <button key={o.v} onClick={() => { setBlogSort(o.v); setShowBlogSort(false); }}
                                                        className={`w-full text-left px-4 py-2.5 text-sm ${blogSort === o.v ? 'text-purple-400 bg-purple-500/10 font-bold' : 'text-white/50 hover:text-white hover:bg-[#252836]'}`}>{o.l}</button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {[{ v: 'all', l: 'All', c: blogs.length }, { v: 'published', l: 'Published', c: blogs.filter(b => b.published).length }, { v: 'draft', l: 'Draft', c: blogs.filter(b => !b.published).length }, { v: 'featured', l: 'Featured', c: blogs.filter(b => b.featured).length }].map(f => (
                                    <button key={f.v} onClick={() => setBlogFilter(f.v)}
                                        className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${blogFilter === f.v ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20' : 'bg-[#1a1d2e] text-white/40 border border-[#252836] hover:text-white/70'}`}>
                                        {f.l} <span className="ml-1 opacity-60">({f.c})</span>
                                    </button>
                                ))}
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div></div>
                            ) : filteredBlogs.length === 0 ? (
                                <div className="text-center py-10 md:py-20 text-secondary">
                                    <p className="text-lg md:text-xl mb-4">{blogSearch || blogFilter !== 'all' ? 'No matching blogs found' : 'No blogs yet!'}</p>
                                    {blogFilter === 'all' && !blogSearch && <button onClick={handleCreateNew} className="bg-violet-600 hover:bg-violet-700 py-3 px-6 rounded-lg font-bold">Create Your First Blog</button>}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <AnimatePresence mode="popLayout">
                                        {filteredBlogs.map((blog, index) => (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                                key={blog.id}
                                                className={`group relative rounded-3xl overflow-hidden transition-all duration-500 border backdrop-blur-xl ${expandedBlog === blog.id
                                                    ? 'bg-white/[0.04] border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-1 ring-white/10'
                                                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10 shadow-lg'
                                                    }`}
                                            >
                                                {/* Premium Glow Effect for Selected */}
                                                {expandedBlog === blog.id && (
                                                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-pink-600/10 pointer-events-none" />
                                                )}

                                                {/* Blog Header */}
                                                <div
                                                    className="relative p-5 md:p-8 cursor-pointer select-none"
                                                    onClick={() => setExpandedBlog(expandedBlog === blog.id ? null : blog.id)}
                                                >
                                                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                                                        {/* Cover Image with Glass Frame */}
                                                        {blog.cover_image && (
                                                            <div className="relative shrink-0 group-hover:scale-105 transition-transform duration-500">
                                                                <img
                                                                    src={blog.cover_image}
                                                                    alt=""
                                                                    className="w-20 h-20 md:w-28 md:h-28 object-cover rounded-2xl shadow-2xl border border-white/10"
                                                                />
                                                                {!blog.published && (
                                                                    <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center backdrop-blur-[2px]">
                                                                        <span className="text-[10px] font-bold text-white uppercase tracking-tighter bg-red-500/80 px-2 py-0.5 rounded shadow-lg">Draft</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className="flex-1 min-w-0 space-y-2">
                                                            <div className="flex items-center gap-3 flex-wrap">
                                                                <h3 className="text-lg md:text-2xl font-black text-white tracking-tight leading-tight flex items-center gap-2">
                                                                    <span className="line-clamp-2">{blog.title}</span>
                                                                </h3>
                                                                {blog.featured && (
                                                                    <div className="bg-yellow-500/10 p-1.5 rounded-full border border-yellow-500/30">
                                                                        <Star className="text-yellow-500" size={14} fill="currentColor" />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs md:text-sm">
                                                                {blog.category && (
                                                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 font-bold uppercase tracking-widest text-[10px]">
                                                                        {blog.category}
                                                                    </span>
                                                                )}
                                                                <span className="text-white/40 flex items-center gap-1.5 font-medium">
                                                                    <RefreshCw size={12} className="opacity-50" />
                                                                    {formatDate(blog.created_at)}
                                                                </span>
                                                                <span className="text-white/40 flex items-center gap-1.5 font-medium">
                                                                    <Eye size={12} className="opacity-50" />
                                                                    {blog.reading_time || 5} min read
                                                                </span>
                                                            </div>

                                                            {blog.tags?.length > 0 && (
                                                                <div className="flex gap-2 pt-1">
                                                                    {blog.tags.slice(0, 3).map((tag, i) => (
                                                                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-white/60 font-medium lowercase">#{tag}</span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className={`shrink-0 p-3 rounded-2xl transition-all duration-300 ${expandedBlog === blog.id ? 'bg-white/10 rotate-180' : 'bg-transparent group-hover:bg-white/5'}`}>
                                                            <ChevronDown size={24} className={expandedBlog === blog.id ? 'text-white' : 'text-white/20'} />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Expanded Actions with Motion */}
                                                <AnimatePresence>
                                                    {expandedBlog === blog.id && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3, ease: "circOut" }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="px-5 md:px-8 pb-8 pt-2 space-y-6">
                                                                <div className="h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent w-full" />

                                                                {blog.excerpt && (
                                                                    <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                                                                        <p className="text-white/60 text-sm leading-relaxed italic">
                                                                            &ldquo;{blog.excerpt}&rdquo;
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                <div className="flex flex-wrap items-center gap-3">
                                                                    <button
                                                                        onClick={() => handleEdit(blog)}
                                                                        className="group/btn flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-xl"
                                                                    >
                                                                        <Pencil size={18} /> Edit Story
                                                                    </button>

                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() => togglePublish(blog)}
                                                                            className={`p-2.5 rounded-xl transition-all border ${blog.published
                                                                                ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20'
                                                                                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'}`}
                                                                            title={blog.published ? 'Take Offline' : 'Go Live'}
                                                                        >
                                                                            {blog.published ? <EyeOff size={20} /> : <Eye size={20} />}
                                                                        </button>

                                                                        <button
                                                                            onClick={() => toggleFeatured(blog)}
                                                                            className={`p-2.5 rounded-xl transition-all border ${blog.featured
                                                                                ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20'
                                                                                : 'bg-gray-500/10 border-white/10 text-white/30 hover:bg-white/10'}`}
                                                                            title={blog.featured ? 'Unmark Hero' : 'Mark as Hero'}
                                                                        >
                                                                            <Star size={20} fill={blog.featured ? "currentColor" : "none"} />
                                                                        </button>
                                                                    </div>

                                                                    <div className="ml-auto flex gap-2">
                                                                        <a
                                                                            href={`/blog/${blog.slug}`}
                                                                            target="_blank"
                                                                            className="flex items-center justify-center w-11 h-11 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                                                                        >
                                                                            <Globe size={18} className="text-white/60" />
                                                                        </a>
                                                                        <button
                                                                            onClick={() => handleDelete(blog.id)}
                                                                            className="flex items-center justify-center w-11 h-11 bg-red-500/10 hover:bg-red-500 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-white rounded-xl transition-all"
                                                                        >
                                                                            <Trash2 size={18} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    )}

                    {/* CREATE/EDIT VIEW */}
                    {(view === 'create' || view === 'edit') && (
                        <div className="max-w-5xl space-y-4 md:space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-secondary mb-2 text-sm md:text-base">Title *</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="Enter blog title..."
                                    className="w-full bg-tertiary py-3 md:py-4 px-4 md:px-6 rounded-lg text-white text-base md:text-xl outline-none font-bold"
                                />
                            </div>

                            {/* Cover Image */}
                            <div>
                                <label className="block text-secondary mb-2 text-sm md:text-base">Cover Image</label>
                                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 sm:items-center">
                                    {form.cover_image && (
                                        <img src={form.cover_image} alt="Cover" className="w-full sm:w-32 h-32 sm:h-20 object-cover rounded-lg" />
                                    )}
                                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleCoverUpload}
                                            className="hidden"
                                            id="cover-upload"
                                        />
                                        <label
                                            htmlFor="cover-upload"
                                            className="bg-tertiary hover:bg-[#1f1b3c] py-3 px-6 rounded-lg cursor-pointer transition-colors text-center"
                                        >
                                            {coverUploading ? 'Uploading...' : 'Upload'}
                                        </label>
                                        <span className="text-secondary text-center">or</span>
                                        <input
                                            type="text"
                                            value={form.cover_image}
                                            onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
                                            placeholder="Paste image URL..."
                                            className="flex-1 bg-tertiary py-3 px-4 rounded-lg text-white outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Category & Reading Time */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                <div>
                                    <label className="block text-secondary mb-2 text-sm md:text-base">Category</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="w-full bg-tertiary py-3 px-4 rounded-lg text-white outline-none"
                                    >
                                        <option value="" className="bg-[#1a1d2e]">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat} className="bg-[#1a1d2e]">{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-secondary mb-2 text-sm md:text-base">Reading Time (min)</label>
                                    <input
                                        type="number"
                                        value={form.reading_time}
                                        onChange={(e) => setForm({ ...form, reading_time: parseInt(e.target.value) || 1 })}
                                        min="1"
                                        className="w-full bg-tertiary py-3 px-4 rounded-lg text-white outline-none"
                                    />
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-secondary mb-2 text-sm md:text-base">Tags</label>
                                <div className="flex gap-2 flex-wrap mb-2">
                                    {form.tags.map((tag, i) => (
                                        <span key={i} className="bg-violet-500/20 text-violet-400 px-3 py-1 rounded-full flex items-center gap-1 text-sm">
                                            {tag}
                                            <X size={14} className="cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                        placeholder="Add a tag..."
                                        className="flex-1 bg-tertiary py-3 px-4 rounded-lg text-white outline-none"
                                    />
                                    <button
                                        onClick={handleAddTag}
                                        className="bg-violet-600 hover:bg-violet-700 px-4 rounded-lg"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            {/* Excerpt */}
                            <div>
                                <label className="block text-secondary mb-2 text-sm md:text-base">Excerpt / Short Description</label>
                                <textarea
                                    value={form.excerpt}
                                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                                    placeholder="Brief description of the blog..."
                                    rows={3}
                                    className="w-full bg-tertiary py-3 px-4 rounded-lg text-white outline-none resize-none"
                                />
                            </div>

                            {/* Content */}
                            <div>
                                <label className="block text-secondary mb-2 text-sm md:text-base">Content *</label>
                                <div className="rounded-lg overflow-hidden">
                                    <RichTextEditor
                                        value={form.content}
                                        onEditorChange={handleContentChange}
                                    />
                                </div>
                            </div>

                            {/* Options */}
                            <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.published}
                                        onChange={(e) => setForm({ ...form, published: e.target.checked })}
                                        className="w-5 h-5 rounded"
                                    />
                                    <span>Publish Immediately</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.featured}
                                        onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                                        className="w-5 h-5 rounded"
                                    />
                                    <span>Featured Blog</span>
                                </label>
                            </div>

                            {/* Save Button */}
                            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-green-600 hover:bg-green-700 py-3 px-8 rounded-lg font-bold transition-colors w-full sm:w-auto"
                                >
                                    {saving ? 'Saving...' : (editingBlog ? 'Update Blog' : 'Create Blog')}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="bg-gray-600 hover:bg-gray-700 py-3 px-8 rounded-lg font-bold transition-colors w-full sm:w-auto"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageBlogs;
