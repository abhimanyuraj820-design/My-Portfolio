import React, { useState, useEffect, useCallback } from 'react';
import { X, Briefcase, Calendar, UploadCloud } from 'lucide-react';
import { AnimatePresence, m as motion } from 'framer-motion';

const initialForm = {
    company: '',
    role: '',
    startDate: '',
    endDate: '',
    description: '',
    logoUrl: '',
    currentJob: false,
};

const ExperienceModal = ({ isOpen, onClose, onSave, experience = null }) => {
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        if (!isOpen) return;

        if (experience) {
            // Format dates for input fields (YYYY-MM-DD)
            const formattedExp = { ...experience };
            if (formattedExp.startDate) {
                formattedExp.startDate = new Date(formattedExp.startDate).toISOString().split('T')[0];
            }
            if (formattedExp.endDate) {
                formattedExp.endDate = new Date(formattedExp.endDate).toISOString().split('T')[0];
            }
            setFormData(formattedExp);
        } else {
            setFormData(initialForm);
        }
    }, [isOpen, experience]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => {
            const newData = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            };
            
            // If currentJob is checked, clear endDate
            if (name === 'currentJob' && checked) {
                newData.endDate = '';
            }
            
            return newData;
        });
    };

    const handleFileDrop = useCallback((e) => {
        e.preventDefault();
        const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, logoUrl: reader.result }));
        };
        reader.readAsDataURL(file);
    }, []);

    const removeLogo = () => {
        setFormData(prev => ({ ...prev, logoUrl: '' }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Convert dates to ISO strings for Prisma
        const submitData = { ...formData };
        if (submitData.startDate) {
            submitData.startDate = new Date(submitData.startDate).toISOString();
        }
        if (submitData.endDate && !submitData.currentJob) {
            submitData.endDate = new Date(submitData.endDate).toISOString();
        } else {
            submitData.endDate = null;
        }
        
        onSave(submitData);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 400 }}
                    className="bg-[#13111c]/95 w-full max-w-2xl rounded-3xl border border-indigo-500/20 shadow-[0_0_60px_rgba(99,102,241,0.15)] overflow-hidden relative my-8"
                >
                    {/* Glowing Orbs */}
                    <div className="absolute top-0 left-0 w-[500px] h-[300px] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 -translate-x-1/4" />
                    
                    <div className="relative z-10 max-h-[85vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
                            <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                                    <Briefcase className="text-indigo-400" size={24} />
                                </div>
                                {experience ? 'Edit Role' : 'Add Role'}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors border border-transparent hover:border-white/10"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form Body */}
                        <div className="overflow-y-auto p-6 custom-scrollbar">
                            <form id="experience-form" onSubmit={handleSubmit} className="space-y-6">
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-white/80">Role / Title <span className="text-red-400">*</span></label>
                                        <input
                                            type="text"
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            placeholder="e.g., Senior Frontend Developer"
                                            required
                                            className="w-full bg-black/20 hover:bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-light"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-white/80">Company Name <span className="text-red-400">*</span></label>
                                        <input
                                            type="text"
                                            name="company"
                                            value={formData.company}
                                            onChange={handleChange}
                                            placeholder="e.g., Google, Startup Inc."
                                            required
                                            className="w-full bg-black/20 hover:bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-light"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-white/80">Start Date <span className="text-red-400">*</span></label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                                            <input
                                                type="date"
                                                name="startDate"
                                                value={formData.startDate}
                                                onChange={handleChange}
                                                required
                                                className="w-full bg-black/20 hover:bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-light [color-scheme:dark]"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-medium text-white/80">End Date</label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="currentJob"
                                                    checked={formData.currentJob}
                                                    onChange={handleChange}
                                                    className="rounded border-white/20 bg-black/40 text-indigo-500 focus:ring-indigo-500"
                                                />
                                                <span className="text-xs text-indigo-400">Current Job</span>
                                            </label>
                                        </div>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                                            <input
                                                type="date"
                                                name="endDate"
                                                value={formData.endDate}
                                                onChange={handleChange}
                                                disabled={formData.currentJob}
                                                required={!formData.currentJob}
                                                className="w-full bg-black/20 hover:bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-light disabled:opacity-50 disabled:cursor-not-allowed [color-scheme:dark]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-white/80">Description <span className="text-red-400">*</span></label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Describe your responsibilities and achievements..."
                                        required
                                        rows={4}
                                        className="w-full bg-black/20 hover:bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-light resize-none"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-white/80 flex justify-between items-center">
                                        <span>Company Logo</span>
                                        {formData.logoUrl && (
                                            <button type="button" onClick={removeLogo} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                                        )}
                                    </label>

                                    {formData.logoUrl ? (
                                        <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/10 group bg-white/5 flex items-center justify-center p-2">
                                            <img src={formData.logoUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-white text-xs text-center leading-tight">Uploaded</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:bg-white/5 hover:border-indigo-500/50 transition-colors cursor-pointer group"
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={handleFileDrop}
                                            onClick={() => document.getElementById('logo-upload').click()}
                                        >
                                            <UploadCloud className="mx-auto h-8 w-8 text-white/40 group-hover:text-indigo-400 transition-colors mb-2" />
                                            <p className="text-sm text-white/60 mb-1">Drag & drop logo here</p>
                                            <p className="text-xs text-white/40">or click to browse</p>
                                            <input
                                                id="logo-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleFileDrop}
                                            />
                                        </div>
                                    )}
                                </div>

                            </form>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all font-medium text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                form="experience-form"
                                type="submit"
                                className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold tracking-wide hover:opacity-90 transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] text-sm"
                            >
                                {experience ? 'Save Changes' : 'Add Role'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ExperienceModal;
