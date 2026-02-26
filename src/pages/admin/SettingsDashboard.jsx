import React, { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import { User, Link as LinkIcon, Save, Plus, Trash2, Mail, Phone, ChevronRight, FileText } from 'lucide-react';
import { toast } from 'sonner';

const getAuthToken = () => localStorage.getItem('token');

const SettingsDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        fullName: '',
        headline: '',
        bio: '',
        avatarUrl: '',
        resumeUrl: '',
        isAvailableForWork: true,
        contactEmail: '',
        whatsappNumber: '',
        socialLinks: {}
    });

    const [socialInputs, setSocialInputs] = useState([]);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                setSettings({
                    fullName: data.fullName || '',
                    headline: data.headline || '',
                    bio: data.bio || '',
                    avatarUrl: data.avatarUrl || '',
                    resumeUrl: data.resumeUrl || '',
                    isAvailableForWork: data.isAvailableForWork ?? true,
                    contactEmail: data.contactEmail || '',
                    whatsappNumber: data.whatsappNumber || '',
                    socialLinks: data.socialLinks || {}
                });

                // Convert socialLinks object to array for dynamic inputs
                if (data.socialLinks) {
                    const socialsArray = Object.entries(data.socialLinks).map(([platform, url]) => ({
                        id: Date.now() + Math.random(),
                        platform,
                        url
                    }));
                    setSocialInputs(socialsArray);
                }
            }
        } catch (error) {
            toast.error('Failed to load settings');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Social Links Handlers
    const addSocialInput = () => {
        setSocialInputs([...socialInputs, { id: Date.now(), platform: 'github', url: '' }]);
    };

    const updateSocialInput = (id, field, value) => {
        setSocialInputs(socialInputs.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const removeSocialInput = (id) => {
        setSocialInputs(socialInputs.filter(item => item.id !== id));
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // Convert socialInputs array back to object
            const socialLinksObj = {};
            socialInputs.forEach(item => {
                if (item.platform && item.url) {
                    socialLinksObj[item.platform.toLowerCase()] = item.url;
                }
            });

            const payload = {
                ...settings,
                socialLinks: socialLinksObj
            };

            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to save settings');

            toast.success('Settings updated successfully!');
        } catch (error) {
            toast.error(error.message || 'Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-10 h-10 border-4 border-[#915EFF] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Global Settings</h1>
                    <p className="text-gray-400">Manage your portfolio's public identity and connect links.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#915EFF] hover:bg-[#7a4ee8] text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#915EFF]/20"
                >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>

            <div className="space-y-8">
                {/* 1. Live Status Control */}
                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#111116] border border-white/5 rounded-2xl p-6 md:p-8"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                                <div className={`w-3 h-3 rounded-full ${settings.isAvailableForWork ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                Availability Status
                            </h2>
                            <p className="text-gray-400 text-sm max-w-md">
                                Toggle your availability for work. This controls the green indicator dot and contact messaging on your public profile.
                            </p>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                                type="checkbox"
                                name="isAvailableForWork"
                                className="sr-only peer"
                                checked={settings.isAvailableForWork}
                                onChange={handleChange}
                            />
                            <div className="w-20 h-10 bg-red-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-8 after:w-8 after:transition-all peer-checked:bg-green-500/20 border border-white/10"></div>
                            <span className={`absolute inset-0 flex items-center justify-between px-3 pointer-events-none text-xs font-bold uppercase tracking-wider ${settings.isAvailableForWork ? 'text-green-500' : 'text-red-500'}`}>
                                <span className={settings.isAvailableForWork ? 'opacity-100' : 'opacity-0'}>On</span>
                                <span className={!settings.isAvailableForWork ? 'opacity-100' : 'opacity-0'}>Off</span>
                            </span>
                        </label>
                    </div>
                </m.div>

                {/* 2. Profile & Bio Section */}
                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[#111116] border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8"
                >
                    {/* Avatar Upload (Mock for now, URL based) */}
                    <div className="shrink-0 flex flex-col items-center gap-4">
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-[#1d1836] border-2 border-white/10 relative group">
                            {settings.avatarUrl ? (
                                <img src={settings.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-16 h-16 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-500" />
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-xs text-white font-medium">Edit URL</span>
                            </div>
                        </div>
                        <div className="w-full max-w-[150px]">
                            <input
                                type="text"
                                name="avatarUrl"
                                value={settings.avatarUrl}
                                onChange={handleChange}
                                placeholder="Avatar URL..."
                                className="w-full px-3 py-1.5 bg-black/30 border border-white/10 rounded-lg text-white text-xs placeholder-gray-600 focus:outline-none focus:border-[#915EFF]"
                            />
                        </div>
                    </div>

                    <div className="flex-1 space-y-5">
                        <h2 className="text-xl font-bold text-white mb-4">Profile & Bio</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-400">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={settings.fullName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#915EFF] transition-colors"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-400">Headline</label>
                                <input
                                    type="text"
                                    name="headline"
                                    value={settings.headline}
                                    onChange={handleChange}
                                    placeholder="e.g. Full Stack Developer"
                                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#915EFF] transition-colors"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-400">Biography</label>
                            <textarea
                                name="bio"
                                value={settings.bio}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#915EFF] transition-colors resize-none"
                            />
                        </div>
                    </div>
                </m.div>

                {/* 3. Connect & Socials Section */}
                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#111116] border border-white/5 rounded-2xl p-6 md:p-8"
                >
                    <h2 className="text-xl font-bold text-white mb-6">Connect & Links</h2>

                    <div className="space-y-6">
                        {/* Primary Contacts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-[#915EFF]" /> Contact Email
                                </label>
                                <input
                                    type="email"
                                    name="contactEmail"
                                    value={settings.contactEmail}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#915EFF] transition-colors"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-green-500" /> WhatsApp Number
                                </label>
                                <input
                                    type="text"
                                    name="whatsappNumber"
                                    value={settings.whatsappNumber}
                                    onChange={handleChange}
                                    placeholder="+1234567890"
                                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#915EFF] transition-colors"
                                />
                            </div>
                        </div>

                        <hr className="border-white/5" />

                        {/* Resume */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-400" /> Resume / CV Link (Google Drive, PDF)
                            </label>
                            <input
                                type="url"
                                name="resumeUrl"
                                value={settings.resumeUrl}
                                onChange={handleChange}
                                placeholder="https://..."
                                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#915EFF] transition-colors"
                            />
                        </div>

                        <hr className="border-white/5" />

                        {/* Social Links Dynamic List */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                    <LinkIcon className="w-4 h-4 text-pink-500" /> Social Profiles
                                </label>
                                <button
                                    onClick={addSocialInput}
                                    className="text-xs bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors border border-white/10"
                                >
                                    <Plus className="w-3 h-3" /> Add Link
                                </button>
                            </div>

                            <div className="space-y-3">
                                {socialInputs.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3">
                                        <select
                                            value={item.platform}
                                            onChange={(e) => updateSocialInput(item.id, 'platform', e.target.value)}
                                            className="w-1/3 md:w-1/4 px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#915EFF] transition-colors appearance-none"
                                        >
                                            <option value="github">GitHub</option>
                                            <option value="linkedin">LinkedIn</option>
                                            <option value="twitter">X (Twitter)</option>
                                            <option value="instagram">Instagram</option>
                                            <option value="youtube">YouTube</option>
                                            <option value="dribbble">Dribbble</option>
                                            <option value="behance">Behance</option>
                                            <option value="website">Personal Website</option>
                                        </select>
                                        <input
                                            type="url"
                                            value={item.url}
                                            onChange={(e) => updateSocialInput(item.id, 'url', e.target.value)}
                                            placeholder="https://..."
                                            className="flex-1 px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#915EFF] transition-colors"
                                        />
                                        <button
                                            onClick={() => removeSocialInput(item.id)}
                                            className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors border border-red-500/20"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                {socialInputs.length === 0 && (
                                    <div className="text-center py-6 text-gray-500 text-sm border border-dashed border-white/10 rounded-xl bg-black/10">
                                        No social links added yet.
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </m.div>
            </div>
        </div>
    );
};

export default SettingsDashboard;
