import React, { useState, useEffect, useCallback } from 'react';
import { X, Code2, Cpu, Wrench, Globe, UploadCloud } from 'lucide-react';
import { AnimatePresence, m as motion } from 'framer-motion';

const CATEGORIES = ['Frontend', 'Backend', 'Tools', 'Language', 'Other'];

const CATEGORY_ICONS = {
    Frontend: Globe,
    Backend: Cpu,
    Tools: Wrench,
    Language: Code2,
    Other: Code2
};

const initialForm = {
    name: '',
    iconUrl: '',
    category: CATEGORIES[0],
    proficiency: 50,
    color: '#6366f1', // Default indigo
    isFeatured: false,
};

const TechModal = ({ isOpen, onClose, onSave, skill = null }) => {
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        if (!isOpen) return;

        setTimeout(() => {
            setFormData(skill ? { ...initialForm, ...skill } : initialForm);
        }, 0);
    }, [isOpen, skill]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSliderChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            proficiency: parseInt(e.target.value) || 0,
        }));
    };

    const handleFileDrop = useCallback((e) => {
        e.preventDefault();
        const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, iconUrl: reader.result })); // Base64 string
        };
        reader.readAsDataURL(file);
    }, []);

    const removeIcon = () => {
        setFormData(prev => ({ ...prev, iconUrl: '' }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 400 }}
                    className="bg-[#13111c]/95 w-full max-w-lg max-h-[90vh] rounded-3xl border border-indigo-500/20 shadow-[0_0_60px_rgba(99,102,241,0.15)] overflow-hidden relative flex flex-col"
                >
                    {/* Glowing Orbs */}
                    <div className="absolute top-0 left-0 w-[500px] h-[300px] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 -translate-x-1/4" />
                    <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none translate-y-1/2 translate-x-1/4" />

                    <div className="relative z-10 flex flex-col flex-1 min-h-0">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                                    <Code2 className="text-indigo-400" size={24} />
                                </div>
                                {skill ? 'Edit Technology' : 'Add Technology'}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors border border-transparent hover:border-white/10"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form Body */}
                        <div className="overflow-y-auto flex-1 min-h-0" data-lenis-prevent>
                            <form id="tech-form" onSubmit={handleSubmit} className="p-6 space-y-6">

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-white/80">Skill Name <span className="text-red-400">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g., React, Node.js, Python..."
                                        required
                                        className="w-full bg-black/20 hover:bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-light tracking-wide shadow-inner"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-white/80 flex justify-between items-center">
                                            <span>Icon Image (Square)</span>
                                            {formData.iconUrl?.startsWith('data:image') || formData.iconUrl?.startsWith('http') || formData.iconUrl ? (
                                                <button type="button" onClick={removeIcon} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                                            ) : null}
                                        </label>

                                        {(formData.iconUrl?.startsWith('data:image') || formData.iconUrl?.startsWith('http') || formData.iconUrl) && (formData.iconUrl.length > 50 || formData.iconUrl.includes('/')) ? (
                                            <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 group bg-white/5 flex items-center justify-center p-2">
                                                <img src={formData.iconUrl} alt="Icon Preview" className="w-full h-full object-contain" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="text-white text-xs text-center leading-tight">Uploaded</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center hover:bg-white/5 hover:border-indigo-500/50 transition-colors cursor-pointer group"
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={handleFileDrop}
                                                onClick={() => document.getElementById('icon-upload').click()}
                                            >
                                                <UploadCloud className="mx-auto h-8 w-8 text-white/40 group-hover:text-indigo-400 transition-colors mb-2" />
                                                <p className="text-xs text-white/60">Drag & drop or Click</p>
                                                <input
                                                    id="icon-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleFileDrop}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-white/80">Category</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full bg-black/20 hover:bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 appearance-none transition-all font-light"
                                        >
                                            {CATEGORIES.map(cat => (
                                                <option key={cat} value={cat} className="bg-[#13111c]">{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-white/80">Proficiency Level</label>
                                        <span className="text-indigo-400 font-mono font-bold">{formData.proficiency}%</span>
                                    </div>
                                    <div className="relative w-full h-3 bg-black/40 rounded-full border border-white/5 overflow-hidden">
                                        {/* Progress Bar tracking */}
                                        <motion.div
                                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${formData.proficiency}%` }}
                                            transition={{ type: "spring", stiffness: 100 }}
                                        />
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={formData.proficiency}
                                            onChange={handleSliderChange}
                                            className="absolute inset-0 w-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-white/40 uppercase tracking-widest font-semibold">
                                        <span>Beginner</span>
                                        <span>Master</span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-white/80">Glow Color</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            name="color"
                                            value={formData.color || '#6366f1'}
                                            onChange={handleChange}
                                            className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0"
                                        />
                                        <span className="text-white/60 text-sm font-mono">{formData.color || '#6366f1'}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5">
                                    <label className="flex items-center gap-4 cursor-pointer p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all group">
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                name="isFeatured"
                                                checked={formData.isFeatured}
                                                onChange={handleChange}
                                                className="w-6 h-6 rounded-lg border-white/20 bg-black/40 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium group-hover:text-indigo-300 transition-colors">Feature this Skill</h4>
                                            <p className="text-xs text-white/40">Display this prominently in your main tech stack row.</p>
                                        </div>
                                    </label>
                                </div>

                            </form>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end gap-3 rounded-b-3xl">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all font-medium text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                form="tech-form"
                                type="submit"
                                className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold tracking-wide hover:opacity-90 transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] text-sm"
                            >
                                {skill ? 'Save Changes' : 'Add Tech'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default TechModal;
