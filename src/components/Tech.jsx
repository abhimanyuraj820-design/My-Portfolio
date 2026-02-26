import React, { useState, useEffect } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { SectionWrapper } from "../hoc";
import { Loader2, Code2, Globe, Cpu, Wrench } from "lucide-react";
import { styles } from "../styles";
import API_BASE_URL from "../config";
import { getSkillIconUrl } from "../utils/skillIconMap";

/**
 * Ultra-Premium Futuristic Styling Configurations
 */
const CategoryGlowMap = {
    Frontend: "from-[#00f2fe] to-[#4facfe]", // Cyber Cyan
    Backend: "from-[#43e97b] to-[#38f9d7]", // Matrix Green
    Language: "from-[#fdfc47] to-[#24fe41]", // Neon Yellow/Green
    Tools: "from-[#ff0844] to-[#ffb199]", // Synthwave Pink/Red
    Other: "from-[#8E2DE2] to-[#4A00E0]", // Deep Purple
};

const CategoryColorMap = {
    Frontend: "#4facfe",
    Backend: "#43e97b",
    Language: "#fdfc47",
    Tools: "#ffb199",
    Other: "#a78bfa",
};

const FallbackIconMap = {
    Frontend: Globe,
    Backend: Cpu,
    Tools: Wrench,
    Language: Code2,
    Other: Code2,
};

const TechCard = ({ skill, index }) => {
    const glowGradient = CategoryGlowMap[skill.category] || CategoryGlowMap.Other;
    const accentColor = skill.color || CategoryColorMap[skill.category] || CategoryColorMap.Other;
    const FallbackIcon = FallbackIconMap[skill.category] || Code2;
    const [imageError, setImageError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Validate if the iconUrl is a valid URL or Base64. Fix Three.js specifically if it's the broken devicon link.
    let iconSrc = getSkillIconUrl(skill.name, skill.iconUrl);
    if (skill.name.toLowerCase().includes("three")) {
        // The official devicon for threejs often fails loading in some contexts; substitute with a reliable SVG
        iconSrc = "https://raw.githubusercontent.com/mrdoob/three.js/master/files/favicon.ico";
    }

    const hasValidImageSource =
        iconSrc &&
        (iconSrc.startsWith("http") ||
            iconSrc.startsWith("data:image") ||
            iconSrc.startsWith("/"));

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50, rotateX: -15 }}
            whileInView={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
                duration: 0.8,
                delay: Math.min(index * 0.02, 0.18),
                type: "spring",
                bounce: 0.4,
            }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="relative perspective-1000 w-full flex justify-center" // Requires perspective for 3D tilts
        >
            <motion.div
                animate={{
                    y: [0, -8, 0],
                }}
                transition={{
                    duration: 4 + (index % 3), // Desynchronized floating
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.15,
                }}
                whileHover={{ scale: 1.05, zIndex: 50, rotateY: 5, rotateX: 5 }}
                className="group relative w-full max-w-[140px] h-32 xs:h-36 sm:max-w-[150px] sm:h-40 bg-gradient-to-b from-[#110e1a]/95 to-[#08060f]/95 backdrop-blur-2xl border border-white/5 rounded-3xl flex flex-col items-center justify-center shadow-[0_15px_35px_rgba(0,0,0,0.6)] cursor-pointer preserve-3d"
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* 1. Ambient Back Glow (Intensifies on hover) */}
                <div
                    className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-15 blur-xl transition-opacity duration-500`}
                    style={{ background: `linear-gradient(to top right, ${accentColor}, transparent)` }}
                />

                {/* 2. Glass Edge Highlight (Top left) */}
                <div className="absolute inset-0 rounded-3xl border-t border-l border-white/10 pointer-events-none" />

                {/* 3. Dynamic Border Tracer */}
                <svg className="absolute inset-0 w-full h-full rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <rect
                        x="1" y="1" width="100%" height="100%" rx="24" ry="24"
                        fill="none"
                        stroke={`url(#glowGradient-${skill.id})`}
                        strokeWidth="2"
                        strokeDasharray="100 600"
                        className="animate-[dash_3s_linear_infinite]"
                    />
                    <defs>
                        <linearGradient id={`glowGradient-${skill.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={accentColor} />
                            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* 4. Center Holographic Icon Platform */}
                <div
                    className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center transform group-hover:translate-z-12 transition-transform duration-500"
                    style={{ transform: isHovered ? 'translateZ(30px)' : 'translateZ(0px)' }}
                >
                    {/* Pulsing Aura Behind Icon */}
                    <div 
                        className={`absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-40 animate-pulse transition-opacity duration-500`} 
                        style={{ background: `linear-gradient(to top right, ${accentColor}, transparent)` }}
                    />

                    {hasValidImageSource && !imageError ? (
                        <img
                            src={iconSrc}
                            alt={skill.name}
                            className="w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] group-hover:drop-shadow-[0_0_25px_rgba(255,255,255,0.6)] transition-all duration-300"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <FallbackIcon
                            size={40}
                            className="text-white/30 group-hover:text-white filter group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-all duration-300"
                            style={{ color: isHovered ? accentColor : undefined }}
                        />
                    )}
                </div>

                {/* 5. Holographic Title Plate */}
                <div
                    className="mt-4 flex flex-col items-center justify-center relative z-20 w-full px-2"
                    style={{ transform: isHovered ? 'translateZ(20px)' : 'translateZ(0px)' }}
                >
                    <AnimatePresence>
                        {isHovered && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 5, scale: 0.9 }}
                                className="absolute -top-6 bg-black/80 border border-white/20 backdrop-blur-md px-3 py-1 rounded-full whitespace-nowrap"
                            >
                                <span
                                    className="text-[9px] uppercase tracking-[0.3em] font-bold"
                                    style={{ color: accentColor, textShadow: `0 0 8px ${accentColor}55` }}
                                >
                                    {skill.category}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <span className="text-white font-black text-sm sm:text-base tracking-widest uppercase text-center group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-b group-hover:from-white group-hover:to-white/50 transition-all duration-300 drop-shadow-md">
                        {skill.name}
                    </span>

                    {/* Glowing dot indicator */}
                    <div 
                        className={`w-1.5 h-1.5 rounded-full mt-2 opacity-30 group-hover:opacity-100 transition-all duration-500`} 
                        style={{ 
                            background: accentColor,
                            boxShadow: isHovered ? `0 0 10px ${accentColor}` : 'none'
                        }}
                    />
                </div>
            </motion.div>
        </motion.div>
    );
};

// Required CSS for the SVG border animation
const globalStyles = `
@keyframes dash {
  to {
    stroke-dashoffset: -700;
  }
}
`;

const Tech = () => {
    const [skills, setSkills] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/skills`);
                if (res.ok) {
                    const data = await res.json();
                    setSkills(data);
                }
            } catch (err) {
                console.error("Failed to fetch skills:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSkills();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
                <Loader2 className="animate-spin text-cyan-500 mb-4" size={40} />
                <div className="text-white/50 text-xs sm:text-sm tracking-[0.3em] uppercase font-bold animate-pulse">
                    Initializing Quantum Core...
                </div>
            </div>
        );
    }

    const featuredSkills = skills.filter((skill) => skill.isFeatured);

    if (featuredSkills.length === 0) {
        return null;
    }

    return (
        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center pt-10 pb-32">
            <style>{globalStyles}</style>

            {/* Skills Section Header (Ultra Premium) */}
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center mb-24 relative flex flex-col items-center"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4 backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-xs text-white/70 uppercase tracking-[0.2em] font-medium">Neural Interface</span>
                </div>

                <h2 className={`${styles.sectionHeadText} text-center relative z-10 !leading-tight`}>
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30 drop-shadow-lg">
                        Tech Arsenal
                    </span>
                </h2>

                {/* Advanced Header Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-[100px] -z-10 rounded-full pointer-events-none" />

                {/* Horizontal Divider Line */}
                <div className="w-48 h-[1px] mt-6 bg-gradient-to-r from-transparent via-white/30 to-transparent relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] rounded-full" />
                </div>
            </motion.div>

            {/* Honeycomb/Staggered Floating Grid */}
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-x-4 gap-y-8 sm:gap-x-8 sm:gap-y-12 max-w-[1000px] w-full px-3 sm:px-4 relative z-20">
                {featuredSkills.map((skill, index) => (
                    <TechCard
                        key={skill.id || skill.name}
                        skill={skill}
                        index={index}
                    />
                ))}
            </div>

            {/* Ambient Background Particles/Rays could go here */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none -z-20" />
        </div>
    );
};

export default SectionWrapper(Tech, "tech");
