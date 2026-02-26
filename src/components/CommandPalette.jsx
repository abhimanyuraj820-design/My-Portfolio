import React, { useState, useEffect, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCommandPalette } from '../context/CommandPaletteContext';
import { Search, Monitor, FileText, Mail, Briefcase, User, Settings, X, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const COMMANDS = [
    { id: 'dashboard', name: 'Dashboard', icon: Monitor, type: 'Navigation', action: (navigate) => navigate('/x7k9m2p4q') },
    { id: 'projects', name: 'Manage Projects', icon: Briefcase, type: 'Navigation', action: (navigate) => navigate('/x7k9m2p4q/projects') },
    { id: 'blogs', name: 'Manage Blogs', icon: FileText, type: 'Navigation', action: (navigate) => navigate('/x7k9m2p4q/blogs') },
    { id: 'testimonials', name: 'Manage Testimonials', icon: User, type: 'Navigation', action: (navigate) => navigate('/x7k9m2p4q/testimonials') },
    { id: 'contacts', name: 'Messages', icon: Mail, type: 'Navigation', action: (navigate) => navigate('/x7k9m2p4q/contacts') },
    { id: 'settings', name: 'Profile Settings', icon: Settings, type: 'Navigation', action: (navigate) => navigate('/x7k9m2p4q/settings') },

    { id: 'action_new_project', name: 'Add New Project', icon: Briefcase, type: 'Action', action: (navigate) => { navigate('/x7k9m2p4q/projects'); toast.info('Opened Projects Dashboard'); } },
    { id: 'action_new_blog', name: 'Draft New Blog', icon: FileText, type: 'Action', action: (navigate) => { navigate('/x7k9m2p4q/blogs'); toast.info('Opened Blogs Dashboard'); } },
    { id: 'action_copy_url', name: 'Copy Portfolio URL', icon: ExternalLink, type: 'Action', action: () => { navigator.clipboard.writeText(window.location.origin); toast.success('URL Copied to clipboard!'); } }
];

const CommandPalette = () => {
    const { isOpen, close } = useCommandPalette();
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    const filteredCommands = query === ''
        ? COMMANDS
        : COMMANDS.filter((command) =>
            command.name.toLowerCase().includes(query.toLowerCase()) ||
            command.type.toLowerCase().includes(query.toLowerCase())
        );

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            // Slight delay to allow modal to render before focusing
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (filteredCommands[selectedIndex]) {
                        filteredCommands[selectedIndex].action(navigate);
                        close();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filteredCommands, selectedIndex, close, navigate]);

    // Group commands for display
    const groupedCommands = filteredCommands.reduce((acc, command) => {
        if (!acc[command.type]) acc[command.type] = [];
        acc[command.type].push(command);
        return acc;
    }, {});

    // For keyboard selection visually across groups
    let renderIndex = 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <React.Fragment>
                    {/* Backdrop */}
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={close}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
                    />

                    {/* Palette Modal */}
                    <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[15vh] pointer-events-none px-4">
                        <m.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="w-full max-w-xl bg-[#111116]/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto ring-1 ring-white/5"
                        >
                            {/* Search Input */}
                            <div className="flex items-center px-4 py-4 border-b border-white/10">
                                <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Type a command or search..."
                                    value={query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        setSelectedIndex(0);
                                    }}
                                    className="w-full bg-transparent text-white placeholder-gray-500 outline-none text-lg font-medium"
                                />
                                <button
                                    onClick={close}
                                    className="p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Results List */}
                            <div className="max-h-[60vh] overflow-y-auto p-2 hide-scrollbar">
                                {filteredCommands.length === 0 ? (
                                    <div className="py-14 text-center text-gray-400">
                                        <p>No results found for "{query}"</p>
                                    </div>
                                ) : (
                                    Object.entries(groupedCommands).map(([groupType, groupItems]) => (
                                        <div key={groupType} className="mb-4 last:mb-0">
                                            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                {groupType}
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                {groupItems.map((command) => {
                                                    const currentIndex = renderIndex++;
                                                    const Icon = command.icon;
                                                    const isSelected = selectedIndex === currentIndex;

                                                    return (
                                                        <button
                                                            key={command.id}
                                                            onMouseEnter={() => setSelectedIndex(currentIndex)}
                                                            onClick={() => {
                                                                command.action(navigate);
                                                                close();
                                                            }}
                                                            className={`flex items-center w-full px-3 py-3 text-left rounded-xl transition-all duration-200 ${isSelected
                                                                ? 'bg-[#915EFF]/20 text-white ring-1 ring-[#915EFF]/50'
                                                                : 'text-gray-300 hover:bg-white/5'
                                                                }`}
                                                        >
                                                            <div className={`p-2 rounded-lg mr-3 ${isSelected ? 'bg-[#915EFF]/30 text-[#915EFF]' : 'bg-white/10 text-gray-400'}`}>
                                                                <Icon className="w-4 h-4" />
                                                            </div>
                                                            <span className="font-medium">{command.name}</span>

                                                            {isSelected && (
                                                                <span className="ml-auto text-xs text-gray-400 flex items-center gap-1">
                                                                    Press <kbd className="font-sans px-2 py-0.5 rounded bg-white/10 text-gray-300 border border-white/20">Enter</kbd> to jump
                                                                </span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-3 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-sans border border-white/20">↑</kbd>
                                        <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-sans border border-white/20">↓</kbd>
                                        to navigate
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-sans border border-white/20">esc</kbd>
                                        to close
                                    </span>
                                </div>
                            </div>
                        </m.div>
                    </div>
                </React.Fragment>
            )}
        </AnimatePresence>
    );
};

export default CommandPalette;
