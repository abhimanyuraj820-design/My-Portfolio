import React, { useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LayoutDashboard, FileText, MessageSquare, Mail, LogOut, X, Globe, Settings, Search, Zap, Activity, Users, Package, Receipt } from "lucide-react";
import { useCommandPalette } from "../../context/CommandPaletteContext";
import { useGlobalSettings } from "../../hooks/useGlobalSettings";
import API_BASE_URL from "../../config";

// ---------------------------------------------------------------------------
// Inline quick-toggle widget — lives only in sidebar, no separate component needed
// ---------------------------------------------------------------------------
const AvailabilityToggle = () => {
    const { settings, isLoading, mutate } = useGlobalSettings();
    const [saving, setSaving] = useState(false);

    const isAvailable = settings?.isAvailableForWork ?? true;

    const handleToggle = useCallback(async () => {
        if (saving) return;
        const next = !isAvailable;

        // 1. Optimistic update — UI flips instantly
        mutate({ ...settings, isAvailableForWork: next }, false);
        setSaving(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ ...settings, isAvailableForWork: next }),
            });

            if (!res.ok) throw new Error('Save failed');

            // 2. Confirm with real server data
            mutate();
        } catch {
            // 3. Rollback on error
            mutate({ ...settings, isAvailableForWork: isAvailable }, false);
        } finally {
            setSaving(false);
        }
    }, [isAvailable, saving, settings, mutate]);

    if (isLoading) {
        return (
            <div className="mx-1 mb-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 animate-pulse">
                <div className="h-4 w-24 bg-white/10 rounded" />
            </div>
        );
    }

    return (
        <div
            className={`mx-1 mb-3 rounded-xl border transition-all duration-300
                ${isAvailable
                    ? 'bg-emerald-500/10 border-emerald-500/25'
                    : 'bg-amber-500/10 border-amber-500/25'
                }`}
        >
            {/* Label row */}
            <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                {/* Status dot */}
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                    {isAvailable && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    )}
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isAvailable ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                </span>
                <span className={`text-xs font-semibold uppercase tracking-widest ${isAvailable ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {isAvailable ? 'Available' : 'Busy'}
                </span>
                <Zap size={12} className={`ml-auto ${isAvailable ? 'text-emerald-400/40' : 'text-amber-400/40'}`} />
            </div>

            {/* Toggle row */}
            <div className="flex items-center justify-between px-4 pb-3 pt-1">
                <span className="text-[11px] text-gray-500 leading-tight">
                    {isAvailable ? 'Accepting new work' : 'Not taking projects'}
                </span>

                {/* Toggle pill */}
                <button
                    type="button"
                    onClick={handleToggle}
                    disabled={saving}
                    aria-label="Toggle availability"
                    className={`relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none
                        focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1d1836]
                        disabled:opacity-60 shrink-0
                        ${isAvailable
                            ? 'bg-emerald-500 focus-visible:ring-emerald-500'
                            : 'bg-gray-600 focus-visible:ring-amber-500'
                        }`}
                >
                    <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all duration-300
                            ${isAvailable ? 'left-6' : 'left-1'}`}
                    />
                </button>
            </div>
        </div>
    );
};

const Sidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const { open: openPalette } = useCommandPalette();

    const handleLogout = () => {
        logout();
        navigate("/x7k9m2p4q/login");
    };

    const handleLinkClick = () => {
        // Close sidebar on mobile after clicking a link
        if (onClose) onClose();
    };

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: "/x7k9m2p4q/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { path: "/x7k9m2p4q/analytics", icon: Activity, label: "Analytics" },
        { path: "/x7k9m2p4q/subscribers", icon: Users, label: "Audience" },
        { path: "/x7k9m2p4q/projects", icon: FileText, label: "Projects" },
        { path: "/x7k9m2p4q/skills", icon: Globe, label: "Tech Stack" },
        { path: "/x7k9m2p4q/blogs", icon: FileText, label: "Blogs" },
        { path: "/x7k9m2p4q/testimonials", icon: MessageSquare, label: "Testimonials" },
        { path: "/x7k9m2p4q/contacts", icon: Mail, label: "Messages" },
        { path: "/x7k9m2p4q/seo", icon: Globe, label: "SEO Manager" },
        { path: "__divider__", label: "Business Suite" },
        { path: "/x7k9m2p4q/services", icon: Package, label: "Services" },
        { path: "/x7k9m2p4q/invoices", icon: Receipt, label: "Invoices" },
        { path: "/x7k9m2p4q/settings", icon: Settings, label: "Settings" },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed left-0 top-0 h-screen bg-tertiary flex flex-col p-6 z-50
                w-64 transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
            `}>
                {/* Header with Close Button (mobile only) */}
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-white text-xl font-bold">Control Panel</h2>
                    <button
                        onClick={onClose}
                        className="md:hidden p-2 text-secondary hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-2 flex-1 overflow-y-auto scrollbar-none pb-2">
                    <button
                        onClick={() => { openPalette(); if (onClose) onClose(); }}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-base border-b border-white/10 text-gray-400 hover:text-white hover:bg-white/5 mb-2 text-left"
                    >
                        <Search size={20} />
                        <span className="flex-1">Search / Commands</span>
                        <span className="hidden md:inline-block text-xs font-sans bg-white/10 border border-white/20 px-1.5 py-0.5 rounded text-gray-300">⌘K</span>
                    </button>

                    {navItems.map(({ path, icon: Icon, label }) => {
                        if (path === '__divider__') {
                            return (
                                <div key={label} className="pt-3 pb-1">
                                    <p className="px-4 text-[9px] font-bold uppercase tracking-[0.15em] text-white/25">{label}</p>
                                    <div className="mt-2 mx-4 h-px bg-white/8" />
                                </div>
                            );
                        }
                        return (
                            <Link
                                key={path}
                                to={path}
                                onClick={handleLinkClick}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-base
                                    ${isActive(path)
                                        ? 'bg-violet-600 text-white'
                                        : 'text-secondary hover:text-white hover:bg-white/5'
                                    }
                                `}
                            >
                                <Icon size={20} />
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Live Availability Quick-Toggle */}
                <AvailabilityToggle />

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all text-base mt-auto"
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </>
    );
};

export default Sidebar;
