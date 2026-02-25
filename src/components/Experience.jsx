import React from "react";
import { m as motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Briefcase, GraduationCap, Award, Code2 } from "lucide-react";

import { styles } from "../styles";
import { experiences } from "../constants";
import { SectionWrapper } from "../hoc";
import { textVariant } from "../utils/motion";

// Map each experience to a Lucide icon by index (since asset icons may be small SVGs)
const ICONS = [Briefcase, GraduationCap, Award, Code2];
const ICON_GRADIENTS = [
    "from-violet-600 to-purple-800",
    "from-cyan-500 to-blue-700",
    "from-amber-400 to-orange-600",
    "from-emerald-400 to-green-700",
];
const CARD_GLOW = [
    "from-violet-600 to-cyan-500",
    "from-cyan-500 to-blue-500",
    "from-amber-400 to-rose-500",
    "from-emerald-400 to-teal-500",
];

const ExperienceCard = ({ experience, index }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });
    const IconComponent = ICONS[index % ICONS.length];
    const gradient = ICON_GRADIENTS[index % ICON_GRADIENTS.length];
    const glow = CARD_GLOW[index % CARD_GLOW.length];

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 60 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: index * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative group w-full"
        >
            {/* Outer animated glow border */}
            <div className={`absolute -inset-[1.5px] rounded-2xl bg-gradient-to-r ${glow} opacity-0 group-hover:opacity-60 blur-sm transition-all duration-500`} />

            {/* Card body */}
            <div className="relative bg-[#111827] rounded-2xl p-5 sm:p-7 overflow-hidden border border-white/[0.06] group-hover:border-white/10 transition-all duration-300">

                {/* Background gradient blob */}
                <div className={`absolute -top-16 -right-16 w-56 h-56 rounded-full bg-gradient-to-br ${glow} opacity-0 group-hover:opacity-[0.06] blur-3xl transition-opacity duration-700 pointer-events-none`} />
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

                <div className="flex items-start gap-4 sm:gap-6">
                    {/* Icon */}
                    <div className={`flex-shrink-0 relative`}>
                        {/* Glow ring */}
                        <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradient} blur-md opacity-50 group-hover:opacity-80 transition-opacity duration-300`} />
                        <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-2xl`}>
                            <IconComponent size={22} className="text-white/90" />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* Title row */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                            <div className="min-w-0">
                                <h3 className="text-white font-bold text-[16px] sm:text-[19px] leading-tight truncate">
                                    {experience.title}
                                </h3>
                                <p className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent text-[13px] sm:text-[14px] font-semibold mt-1`}>
                                    {experience.company_name}
                                </p>
                            </div>

                            {/* Date badge */}
                            <motion.span
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={isInView ? { scale: 1, opacity: 1 } : {}}
                                transition={{ delay: index * 0.15 + 0.3 }}
                                className="inline-flex items-center flex-shrink-0 self-start sm:self-auto gap-1.5 bg-white/[0.06] text-white/60 text-[11px] font-medium px-3 py-1.5 rounded-full border border-white/10 whitespace-nowrap"
                            >
                                <span className="text-[10px]">📅</span>
                                {experience.date}
                            </motion.span>
                        </div>

                        {/* Thin separator */}
                        <div className={`w-0 group-hover:w-full h-[1px] bg-gradient-to-r ${glow} mt-3 mb-4 transition-all duration-500 ease-out`} />

                        {/* Bullet points */}
                        <ul className="flex flex-col gap-2">
                            {experience.points.map((point, i) => (
                                <motion.li
                                    key={`point-${i}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                                    transition={{ delay: index * 0.15 + 0.2 + i * 0.07 }}
                                    className="flex items-start gap-2.5 text-[12.5px] sm:text-[13.5px] text-white/65 leading-relaxed"
                                >
                                    <span className={`mt-[5px] flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gradient-to-r ${gradient}`} />
                                    {point}
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const Experience = () => {
    return (
        <>
            <motion.div variants={textVariant()}>
                <p className={`${styles.sectionSubText} text-center`}>
                    What I have done so far
                </p>
                <h2 className={`${styles.sectionHeadText} text-center`}>
                    Work Experience.
                </h2>
            </motion.div>

            {/* Timeline wrapper */}
            <div className="mt-12 sm:mt-16 relative">
                {/* Vertical gradient line (desktop only) */}
                <div className="hidden sm:block absolute left-[27px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-violet-600 via-cyan-500/40 to-transparent rounded-full pointer-events-none" />

                {/* Horizontal connector dots (desktop) */}
                <div className="flex flex-col gap-5 sm:gap-6 sm:pl-14">
                    {experiences.map((experience, index) => {
                        const gradient = ICON_GRADIENTS[index % ICON_GRADIENTS.length];
                        return (
                            <div key={`exp-outer-${index}`} className="relative">
                                {/* Left dot on timeline */}
                                <motion.div
                                    className={`hidden sm:flex absolute -left-[46px] top-7 w-3 h-3 rounded-full bg-gradient-to-r ${gradient} shadow-[0_0_10px_rgba(139,92,246,0.8)] z-10 items-center justify-center`}
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.15, type: "spring", stiffness: 300 }}
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
                                </motion.div>

                                <ExperienceCard
                                    experience={experience}
                                    index={index}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default SectionWrapper(Experience, "experience");
