import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LayoutDashboard, FileText, MessageSquare, Mail, LogOut, X, Globe, Settings, Search } from "lucide-react";
import { useCommandPalette } from "../../context/CommandPaletteContext";

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
        { path: "/x7k9m2p4q/projects", icon: FileText, label: "Projects" },
        { path: "/x7k9m2p4q/skills", icon: Globe, label: "Tech Stack" },
        { path: "/x7k9m2p4q/blogs", icon: FileText, label: "Blogs" },
        { path: "/x7k9m2p4q/testimonials", icon: MessageSquare, label: "Testimonials" },
        { path: "/x7k9m2p4q/contacts", icon: Mail, label: "Messages" },
        { path: "/x7k9m2p4q/seo", icon: Globe, label: "SEO Manager" },
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
                <nav className="flex flex-col gap-2 flex-1">
                    <button
                        onClick={() => { openPalette(); if (onClose) onClose(); }}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-base border-b border-white/10 text-gray-400 hover:text-white hover:bg-white/5 mb-2 text-left"
                    >
                        <Search size={20} />
                        <span className="flex-1">Search / Commands</span>
                        <span className="hidden md:inline-block text-xs font-sans bg-white/10 border border-white/20 px-1.5 py-0.5 rounded text-gray-300">⌘K</span>
                    </button>

                    {navItems.map(({ path, icon: Icon, label }) => (
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
                    ))}
                </nav>

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
