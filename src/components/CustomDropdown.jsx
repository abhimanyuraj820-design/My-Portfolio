import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';

const CustomDropdown = ({ value, onChange, options, icon: Icon, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value) || options[0];

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <div
                className={`flex items-center justify-between bg-black-200/80 backdrop-blur-md border border-white/10 hover:border-violet-500/50 rounded-xl p-3 cursor-pointer transition-all duration-300 shadow-lg min-w-[200px] ${isOpen ? 'border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.2)] bg-[#1d1836]' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className="text-secondary pl-1">
                            <Icon size={14} />
                        </div>
                    )}
                    <span className="text-white text-sm">{selectedOption.label}</span>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-secondary ml-4"
                >
                    <FaChevronDown size={12} />
                </motion.div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full mt-2 right-0 sm:left-0 sm:right-auto w-full min-w-max bg-[#11071F]/90 backdrop-blur-xl border border-violet-500/30 rounded-2xl shadow-[0_10px_40px_-10px_rgba(139,92,246,0.4)] z-50 overflow-hidden py-2"
                    >
                        {options.map((option) => (
                            <div
                                key={option.value}
                                className={`px-4 py-3 text-sm cursor-pointer transition-colors flex items-center gap-2 ${value === option.value ? 'bg-violet-600/20 text-white font-medium border-l-2 border-violet-500' : 'text-secondary hover:bg-white/5 hover:text-white border-l-2 border-transparent'}`}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                            >
                                {option.label}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomDropdown;
