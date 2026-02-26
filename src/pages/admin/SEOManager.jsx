import React, { useState, useEffect, useMemo } from 'react';
import { Search, ArrowUpDown, Globe, Twitter, Plus, X, Save, RefreshCw, Menu, ChevronLeft, Settings, LayoutTemplate, ChevronDown, FileText, Zap, ShieldCheck } from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { getSEORecords, saveSEORecord } from '../../services/SEOService';
import Sidebar from '../../components/admin/Sidebar';
import { logo } from '../../assets';

// Automatically detect all pages in the src/pages directory
const pageModules = import.meta.glob('/src/pages/*.jsx');

const generateRoutes = () => {
  const routes = new Set(['/']); // Always include home

  Object.keys(pageModules).forEach(path => {
    const name = path.split('/').pop().replace('.jsx', '');

    // Map specific file names to their actual routes
    if (name === 'Blogs') routes.add('/blog');
    else if (name === 'BlogDetails') routes.add('/blog/[slug]');
    else if (name === 'TestimonialsPage') routes.add('/testimonials');
    else {
      // Convert CamelCase to kebab-case for standard pages
      const kebabName = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
      routes.add('/' + kebabName);
    }
  });

  return Array.from(routes);
};

const COMMON_ROUTES = generateRoutes();

const SEOManager = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [previewMode, setPreviewMode] = useState('google'); // 'google', 'social'
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showMobileEditor, setShowMobileEditor] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    pageRoute: '',
    metaTitle: '',
    metaDescription: '',
    keywords: [],
    ogImage: '',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    canonicalUrl: '',
    author: '',
    robots: 'index, follow',
    structuredData: ''
  });
  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const data = await getSEORecords();

      const mergedRecords = [...data];
      COMMON_ROUTES.forEach(route => {
        if (!mergedRecords.find(r => r.pageRoute === route)) {
          mergedRecords.push({
            id: `new-${route}`,
            isNew: true,
            pageRoute: route,
            metaTitle: '',
            metaDescription: '',
            keywords: [],
            ogImage: '',
            ogType: 'website',
            twitterCard: 'summary_large_image',
            canonicalUrl: '',
            author: '',
            robots: 'index, follow',
            structuredData: null,
            lastUpdated: new Date().toISOString()
          });
        }
      });

      setRecords(mergedRecords);
      // Don't auto-select on mobile to show the list first
      if (mergedRecords.length > 0 && !selectedRecord && window.innerWidth >= 1024) {
        handleSelectRecord(mergedRecords[0]);
      }
    } catch (error) {
      toast.error('Failed to fetch SEO records');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRecord = (record) => {
    setSelectedRecord(record);
    setFormData({
      id: record.isNew ? 'new' : record.id,
      pageRoute: record.pageRoute || '',
      metaTitle: record.metaTitle || '',
      metaDescription: record.metaDescription || '',
      keywords: record.keywords || [],
      ogImage: record.ogImage || '',
      ogType: record.ogType || 'website',
      twitterCard: record.twitterCard || 'summary_large_image',
      canonicalUrl: record.canonicalUrl || '',
      author: record.author || '',
      robots: record.robots || 'index, follow',
      structuredData: record.structuredData ? JSON.stringify(record.structuredData, null, 2) : ''
    });
    setShowMobileEditor(true);
  };

  const handleCreateNew = () => {
    setSelectedRecord({ id: 'new' });
    setFormData({
      id: 'new',
      pageRoute: '/',
      metaTitle: '',
      metaDescription: '',
      keywords: [],
      ogImage: '',
      ogType: 'website',
      twitterCard: 'summary_large_image',
      canonicalUrl: '',
      author: '',
      robots: 'index, follow',
      structuredData: ''
    });
    setShowMobileEditor(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddKeyword = (e) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault();
      if (!formData.keywords.includes(keywordInput.trim())) {
        setFormData(prev => ({
          ...prev,
          keywords: [...prev.keywords, keywordInput.trim()]
        }));
      }
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keywordToRemove)
    }));
  };

  const handleSave = async () => {
    if (!formData.pageRoute) {
      toast.error('Page Route is required');
      return;
    }

    setIsSaving(true);
    try {
      let parsedStructuredData = null;
      if (formData.structuredData) {
        try {
          parsedStructuredData = JSON.parse(formData.structuredData);
        } catch (e) {
          toast.error('Invalid JSON in Structured Data');
          setIsSaving(false);
          return;
        }
      }

      const payload = {
        ...formData,
        structuredData: parsedStructuredData
      };

      const savedRecord = await saveSEORecord(payload);
      toast.success('SEO settings saved successfully');

      // Update selected record with the new ID
      setSelectedRecord(savedRecord);
      setFormData(prev => ({ ...prev, id: savedRecord.id }));

      fetchRecords();
    } catch (error) {
      toast.error(error.message || 'Failed to save SEO settings');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredRecords = records
    .filter(r => r.pageRoute.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const dateA = new Date(a.lastUpdated).getTime();
      const dateB = new Date(b.lastUpdated).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="h-screen bg-[#0f1115] text-gray-200 font-sans overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="md:ml-64 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-black/40 backdrop-blur-md border-b border-white/10 z-20">
          <h1 className="text-xl font-bold text-white">SEO Manager</h1>
          <button onClick={() => setSidebarOpen(true)} className="p-2 bg-white/5 rounded-lg text-white">
            <Menu size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto h-full flex flex-col">
            <div className="hidden md:flex justify-between items-center mb-8 shrink-0">
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Advanced SEO Manager</h1>
                <p className="text-gray-400 mt-1">Global controller for website search engine optimization</p>
              </div>
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
              >
                <Plus size={18} />
                <span>New Route</span>
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
              {/* Left Column: List (30%) */}
              <div className={`w-full lg:w-[30%] flex-col gap-4 ${showMobileEditor ? 'hidden lg:flex' : 'flex'} h-full`}>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col h-full">
                  <div className="flex justify-between items-center mb-4 md:hidden shrink-0">
                    <h2 className="text-lg font-semibold text-white">Routes</h2>
                    <button
                      onClick={handleCreateNew}
                      className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors text-sm"
                    >
                      <Plus size={16} /> New
                    </button>
                  </div>

                  <div className="relative mb-4 shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search routes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>

                  <div className="flex justify-between items-center mb-2 px-2 shrink-0">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Live Pages</span>
                    <button
                      onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <ArrowUpDown size={14} />
                    </button>
                  </div>

                  <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1" data-lenis-prevent>
                    <AnimatePresence mode="popLayout">
                      {isLoading ? (
                        <div className="flex justify-center py-12"><RefreshCw className="animate-spin text-indigo-500/50" size={32} /></div>
                      ) : filteredRecords.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-12 text-gray-500 text-sm italic"
                        >
                          No matching routes found
                        </motion.div>
                      ) : (
                        filteredRecords.map((record, index) => (
                          <motion.div
                            layout
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            key={record.id}
                            onClick={() => handleSelectRecord(record)}
                            className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-300 border backdrop-blur-md ${selectedRecord?.id === record.id
                              ? 'bg-indigo-500/15 border-indigo-500/40 shadow-[0_10px_30px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/20'
                              : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/20'
                              }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-1 p-2 rounded-xl transition-colors ${selectedRecord?.id === record.id ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-400 group-hover:text-white'}`}>
                                {record.pageRoute.includes('[') ? <Zap size={16} /> : <FileText size={16} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className={`font-bold text-sm tracking-tight truncate transition-colors ${selectedRecord?.id === record.id ? 'text-white' : 'text-gray-200'}`}>
                                  {record.pageRoute}
                                </div>
                                <div className="text-[11px] text-gray-400 mt-1 truncate group-hover:text-gray-300 transition-colors">
                                  {record.metaTitle || 'Untitled Route'}
                                </div>

                                <div className="flex items-center justify-between mt-3">
                                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${record.isNew
                                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                    : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                                    <div className={`w-1 h-1 rounded-full ${record.isNew ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                    {record.isNew ? 'Draft' : 'Optimized'}
                                  </div>
                                  <div className="text-[9px] text-gray-500 font-mono">
                                    {new Date(record.lastUpdated || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Selected Indicator Glow */}
                            {selectedRecord?.id === record.id && (
                              <motion.div
                                layoutId="activeGlow"
                                className="absolute inset-0 rounded-2xl bg-indigo-500/5 -z-10 blur-xl"
                              />
                            )}
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Right Column: Editor & Preview (70%) */}
              <div className={`w-full lg:w-[70%] flex-col gap-6 ${!showMobileEditor ? 'hidden lg:flex' : 'flex'} h-full overflow-y-auto custom-scrollbar pb-20 lg:pb-0`} data-lenis-prevent>
                {selectedRecord ? (
                  <>
                    {/* Mobile Back Button */}
                    <div className="lg:hidden flex items-center gap-2 mb-2 shrink-0">
                      <button
                        onClick={() => setShowMobileEditor(false)}
                        className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg"
                      >
                        <ChevronLeft size={18} /> Back to Routes
                      </button>
                    </div>

                    {/* Previews */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6 shadow-xl shrink-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                          <Globe className="text-indigo-400" size={20} />
                          Live Preview
                        </h2>
                        <div className="flex bg-black/40 rounded-lg p-1 border border-white/5 self-start sm:self-auto">
                          <button
                            onClick={() => setPreviewMode('google')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${previewMode === 'google' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                          >
                            Google SERP
                          </button>
                          <button
                            onClick={() => setPreviewMode('social')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${previewMode === 'social' ? 'bg-[#1DA1F2]/20 text-[#1DA1F2] shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                          >
                            <Twitter size={14} /> Social Card
                          </button>
                        </div>
                      </div>

                      {/* Google SERP Preview */}
                      {previewMode === 'google' && (
                        <div className="bg-white rounded-xl p-4 md:p-6 shadow-inner max-w-2xl overflow-hidden">
                          <div className="flex items-center gap-3 mb-1">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 shrink-0 overflow-hidden border border-gray-200">
                              <img
                                src={formData.ogImage || logo}
                                alt="Logo"
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.onerror = null; e.target.src = logo; }}
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm text-[#202124] font-medium truncate">{formData.author || 'Abhimanyu Raj'}</div>
                              <div className="text-xs text-[#4d5156] truncate">{formData.canonicalUrl || `https://abhimanyuraj.com${formData.pageRoute !== '/' ? formData.pageRoute : ''}`}</div>
                            </div>
                          </div>
                          <div className="text-lg md:text-xl text-[#1a0dab] hover:underline cursor-pointer mb-1 truncate">
                            {formData.metaTitle || 'Enter a Meta Title'}
                          </div>
                          <div className="text-sm text-[#4d5156] line-clamp-2 leading-snug break-words">
                            {formData.metaDescription || 'Enter a meta description to see how it will appear in search results. Keep it under 160 characters for best results.'}
                          </div>
                        </div>
                      )}

                      {/* Social Card Preview */}
                      {previewMode === 'social' && (
                        <div className="max-w-md border border-gray-700 rounded-xl overflow-hidden bg-black">
                          {formData.twitterCard === 'summary_large_image' ? (
                            <div className="h-48 bg-gray-800 relative border-b border-gray-700">
                              {formData.ogImage ? (
                                <img
                                  src={formData.ogImage}
                                  alt="OG Preview"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = logo;
                                    e.target.className = "w-full h-full object-contain p-8 bg-gray-900";
                                  }}
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">No Image Provided</div>
                              )}
                            </div>
                          ) : (
                            <div className="flex border-b border-gray-700">
                              <div className="w-32 h-32 bg-gray-800 relative shrink-0 border-r border-gray-700">
                                {formData.ogImage ? (
                                  <img
                                    src={formData.ogImage}
                                    alt="OG Preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = logo;
                                      e.target.className = "w-full h-full object-contain p-4 bg-gray-900";
                                    }}
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs text-center p-2">No Image</div>
                                )}
                              </div>
                              <div className="p-4 bg-[#15181c] flex-1 flex flex-col justify-center">
                                <div className="text-white font-bold mb-1 line-clamp-2 text-sm">{formData.metaTitle || 'Social Card Title'}</div>
                                <div className="text-gray-400 text-xs line-clamp-2">{formData.metaDescription || 'Social card description goes here.'}</div>
                                <div className="text-gray-500 text-xs mt-2 flex items-center gap-1">
                                  <img src={logo} alt="Site Logo" className="w-3 h-3 object-contain" />
                                  {formData.canonicalUrl && formData.canonicalUrl.startsWith('http') ? new URL(formData.canonicalUrl).hostname : 'abhimanyuraj.com'}
                                </div>
                              </div>
                            </div>
                          )}

                          {formData.twitterCard === 'summary_large_image' && (
                            <div className="p-4 bg-[#15181c]">
                              <div className="text-gray-500 text-xs mb-1 flex items-center gap-1">
                                <img src={logo} alt="Site Logo" className="w-3 h-3 object-contain" />
                                {formData.canonicalUrl && formData.canonicalUrl.startsWith('http') ? new URL(formData.canonicalUrl).hostname : 'abhimanyuraj.com'}
                              </div>
                              <div className="text-white font-bold mb-1 truncate">{formData.metaTitle || 'Social Card Title'}</div>
                              <div className="text-gray-400 text-sm line-clamp-2">{formData.metaDescription || 'Social card description goes here.'}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Editor Form */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6 shadow-xl shrink-0">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                          <Settings className="text-indigo-400" size={20} />
                          SEO Configuration
                        </h2>
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg transition-colors shadow-lg shadow-indigo-500/20 font-medium w-full sm:w-auto"
                        >
                          {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                          <span>Save Changes</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider mb-2 border-b border-white/10 pb-2">Basic Metadata</h3>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Page Route *</label>
                            <input
                              type="text"
                              name="pageRoute"
                              list="common-routes"
                              value={formData.pageRoute}
                              onChange={handleInputChange}
                              placeholder="e.g., /about or /blog/[slug]"
                              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            />
                            <datalist id="common-routes">
                              {COMMON_ROUTES.map(route => <option key={route} value={route} />)}
                            </datalist>
                            <p className="text-xs text-gray-500 mt-1">Select a common route or type a custom one.</p>
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <label className="block text-sm font-medium text-gray-300">Meta Title</label>
                              <span className={`text-xs ${formData.metaTitle.length > 60 ? 'text-red-400' : 'text-gray-500'}`}>
                                {formData.metaTitle.length}/60
                              </span>
                            </div>
                            <input
                              type="text"
                              name="metaTitle"
                              value={formData.metaTitle}
                              onChange={handleInputChange}
                              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <label className="block text-sm font-medium text-gray-300">Meta Description</label>
                              <span className={`text-xs ${formData.metaDescription.length > 160 ? 'text-red-400' : 'text-gray-500'}`}>
                                {formData.metaDescription.length}/160
                              </span>
                            </div>
                            <textarea
                              name="metaDescription"
                              value={formData.metaDescription}
                              onChange={handleInputChange}
                              rows={3}
                              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Keywords</label>
                            <div className="bg-black/20 border border-white/10 rounded-lg p-2 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                              <div className="flex flex-wrap gap-2 mb-2">
                                {formData.keywords.map((kw, idx) => (
                                  <span key={idx} className="bg-white/10 text-gray-200 text-xs px-2 py-1 rounded-md flex items-center gap-1">
                                    {kw}
                                    <button onClick={() => handleRemoveKeyword(kw)} className="hover:text-red-400"><X size={12} /></button>
                                  </span>
                                ))}
                              </div>
                              <input
                                type="text"
                                value={keywordInput}
                                onChange={(e) => setKeywordInput(e.target.value)}
                                onKeyDown={handleAddKeyword}
                                placeholder="Type keyword and press Enter..."
                                className="w-full bg-transparent border-none text-sm focus:outline-none px-2 py-1 text-white"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Advanced Info */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider mb-2 border-b border-white/10 pb-2">Advanced & Social</h3>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">OG Image URL</label>
                            <input
                              type="text"
                              name="ogImage"
                              value={formData.ogImage}
                              onChange={handleInputChange}
                              placeholder="https://..."
                              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">OG Type</label>
                              <select
                                name="ogType"
                                value={formData.ogType}
                                onChange={handleInputChange}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-gray-200 appearance-none"
                              >
                                <option value="website" className="bg-[#1a1d2e]">Website</option>
                                <option value="article" className="bg-[#1a1d2e]">Article</option>
                                <option value="profile" className="bg-[#1a1d2e]">Profile</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">Twitter Card</label>
                              <select
                                name="twitterCard"
                                value={formData.twitterCard}
                                onChange={handleInputChange}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-gray-200 appearance-none"
                              >
                                <option value="summary_large_image" className="bg-[#1a1d2e]">Large Image</option>
                                <option value="summary" className="bg-[#1a1d2e]">Summary</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">Canonical URL</label>
                              <input
                                type="text"
                                name="canonicalUrl"
                                value={formData.canonicalUrl}
                                onChange={handleInputChange}
                                placeholder="https://..."
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">Author</label>
                              <input
                                type="text"
                                name="author"
                                value={formData.author}
                                onChange={handleInputChange}
                                placeholder="Author Name"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Robots Directive</label>
                            <select
                              name="robots"
                              value={formData.robots}
                              onChange={handleInputChange}
                              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-gray-200 appearance-none"
                            >
                              <option value="index, follow" className="bg-[#1a1d2e]">index, follow</option>
                              <option value="noindex, follow" className="bg-[#1a1d2e]">noindex, follow</option>
                              <option value="index, nofollow" className="bg-[#1a1d2e]">index, nofollow</option>
                              <option value="noindex, nofollow" className="bg-[#1a1d2e]">noindex, nofollow</option>
                            </select>
                          </div>

                          <div className="flex-1 flex flex-col">
                            <label className="text-sm font-medium text-gray-300 mb-1 flex justify-between">
                              <span className="flex items-center gap-1"><LayoutTemplate size={14} /> Structured Data (JSON-LD)</span>
                              <span className="text-xs text-gray-500">Optional</span>
                            </label>
                            <textarea
                              name="structuredData"
                              value={formData.structuredData}
                              onChange={handleInputChange}
                              rows={5}
                              placeholder='{\n  "@context": "https://schema.org",\n  "@type": "WebPage"\n}'
                              className="w-full flex-1 bg-[#0d0d0d] border border-white/10 rounded-lg px-4 py-3 text-xs font-mono text-green-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none custom-scrollbar"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 shadow-xl flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                    <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
                      <Globe className="text-indigo-400" size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Select a Route</h3>
                    <p className="text-gray-400 max-w-md">Choose a page route from the list on the left to edit its SEO metadata, or create a new one.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOManager;
