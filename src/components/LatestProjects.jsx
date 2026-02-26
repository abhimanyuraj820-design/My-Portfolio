/**
 * LatestProjects
 *
 * Fetches and displays the top 3 featured projects (isFeatured: true) sorted
 * by priorityOrder descending, exactly as defined in the Admin dashboard.
 *
 * States:
 *  - Loading:      animated skeleton grid (3 cards)
 *  - No projects:  "Coming Soon" skeleton with a friendly message
 *  - Success:      responsive 3-column project grid
 *
 * Usage – drop anywhere on the homepage:
 *   <LatestProjects />
 *   <LatestProjects limit={3} showViewAll />
 */

import React, { useState } from 'react';
import { m as motion } from 'framer-motion';
import useSWR from 'swr';
import { Github, Globe2, Star } from 'lucide-react';
import { fetcher } from '../hooks/useGlobalSettings';
import API_BASE_URL from '../config';
import { fadeIn, textVariant } from '../utils/motion';

// ---------------------------------------------------------------------------
// Skeleton card shown during load or when no data is available
// ---------------------------------------------------------------------------
const SkeletonCard = ({ animate = true }) => (
    <div
        className={`bg-tertiary rounded-2xl overflow-hidden border border-white/5 
                    flex flex-col h-full
                    ${animate ? 'animate-pulse' : ''}`}
    >
        <div className="w-full h-[200px] bg-white/5" />
        <div className="p-5 flex flex-col gap-3 flex-1">
            <div className="h-4 bg-white/10 rounded w-3/4" />
            <div className="h-3 bg-white/5 rounded w-full" />
            <div className="h-3 bg-white/5 rounded w-5/6" />
            <div className="mt-auto flex gap-2 pt-3">
                <div className="h-6 w-16 bg-white/10 rounded-full" />
                <div className="h-6 w-16 bg-white/10 rounded-full" />
            </div>
        </div>
    </div>
);

// ---------------------------------------------------------------------------
// "Coming Soon" placeholder when DB has no featured projects yet
// ---------------------------------------------------------------------------
const ComingSoonGrid = () => (
    <div className="flex flex-col items-center gap-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 w-full">
            {[0, 1, 2].map((i) => (
                <div key={i} className="relative">
                    <SkeletonCard animate={false} />
                    {i === 1 && (
                        // Centre card gets the "Coming Soon" label
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-black/60 backdrop-blur-sm">
                            <span className="text-3xl">🚀</span>
                            <p className="text-base font-semibold text-white/80 text-center px-4">
                                Projects Coming Soon
                            </p>
                            <p className="text-xs text-white/40 text-center px-6">
                                Mark projects as Featured in the Admin dashboard to show them here.
                            </p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
);

// ---------------------------------------------------------------------------
// Individual project card
// ---------------------------------------------------------------------------
const TAG_COLORS = [
    'blue-text-gradient',
    'green-text-gradient',
    'pink-text-gradient',
    'orange-text-gradient',
];

const ProjectCard = ({ project, index }) => {
    const [imgError, setImgError] = useState(false);
    const hasImage = Boolean(project.thumbnailUrl) && !imgError;

    const tags = project.techStack ?? [];

    return (
        <motion.div
            variants={fadeIn('up', 'spring', index * 0.15, 0.6)}
            className="bg-tertiary p-5 rounded-2xl border border-white/5
                       hover:border-white/20 transition-colors duration-200
                       flex flex-col h-full shadow-card group"
        >
            {/* Thumbnail */}
            <div className="relative w-full h-[200px] rounded-2xl overflow-hidden bg-slate-900 flex-shrink-0">
                {hasImage ? (
                    <img
                        src={project.thumbnailUrl}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105
                                   transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center
                                    bg-gradient-to-br from-indigo-600 via-purple-600
                                    to-cyan-500 text-5xl text-white">
                        🖥️
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full
                                     bg-black/70 text-white uppercase tracking-wide">
                        {project.category}
                    </span>
                    {project.isFeatured && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs
                                          font-semibold rounded-full bg-amber-500/90 text-white">
                            <Star size={10} fill="currentColor" />
                            Featured
                        </span>
                    )}
                </div>

                {/* Status indicator */}
                <div className="absolute top-3 right-3">
                    <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full
                            ${project.status === 'Completed'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : project.status === 'InProgress'
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            }`}
                    >
                        {project.status}
                    </span>
                </div>

                {/* Link buttons */}
                <div className="absolute inset-0 flex justify-end items-end gap-2 p-3
                                pointer-events-none">
                    {project.repoUrl && (
                        <button
                            type="button"
                            onClick={() => window.open(project.repoUrl, '_blank')}
                            className="pointer-events-auto inline-flex items-center gap-1.5
                                       px-3 py-1.5 text-xs font-semibold rounded-full
                                       bg-black/80 text-white backdrop-blur-sm
                                       hover:bg-black transition-colors"
                        >
                            <Github size={13} /> Code
                        </button>
                    )}
                    {project.liveUrl && (
                        <button
                            type="button"
                            onClick={() => window.open(project.liveUrl, '_blank')}
                            className="pointer-events-auto inline-flex items-center gap-1.5
                                       px-3 py-1.5 text-xs font-semibold rounded-full
                                       bg-[#915eff]/90 text-white backdrop-blur-sm
                                       hover:bg-[#915eff] transition-colors"
                        >
                            <Globe2 size={13} /> Live
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="mt-5 flex flex-col flex-1">
                <h3 className="text-white font-bold text-[18px] leading-snug line-clamp-2">
                    {project.title}
                </h3>
                <p className="mt-2 text-secondary text-[13px] leading-relaxed flex-1 line-clamp-3">
                    {project.description}
                </p>

                {/* Tech tags */}
                {tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {tags.slice(0, 5).map((tag, i) => (
                            <span
                                key={`${tag}-${i}`}
                                className={`text-[12px] font-medium ${TAG_COLORS[i % TAG_COLORS.length]}`}
                            >
                                #{tag}
                            </span>
                        ))}
                        {tags.length > 5 && (
                            <span className="text-[12px] text-white/30">+{tags.length - 5} more</span>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const LatestProjects = ({ limit = 3, showViewAll = false }) => {
    const { data: projects, isLoading, error } = useSWR(
        `${API_BASE_URL}/api/projects/featured?limit=${limit}`,
        fetcher,
        {
            refreshInterval: 120_000,       // refresh every 2 min – projects change less often
            revalidateOnFocus: false,
            dedupingInterval: 60_000,
            errorRetryCount: 3,
        }
    );

    // ── Loading state ──
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 w-full">
                {Array.from({ length: limit }).map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        );
    }

    // ── Error state ──
    if (error) {
        return (
            <div className="w-full flex flex-col items-center gap-4 py-12">
                <p className="text-red-400/80 text-sm">
                    Couldn't load projects right now. Please try refreshing the page.
                </p>
            </div>
        );
    }

    // ── Empty state ──
    if (!projects || projects.length === 0) {
        return <ComingSoonGrid />;
    }

    // ── Success state ──
    return (
        <div className="flex flex-col items-center gap-10 w-full">
            <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 w-full"
            >
                {projects.map((project, index) => (
                    <ProjectCard key={project.id} project={project} index={index} />
                ))}
            </motion.div>

            {showViewAll && (
                <motion.a
                    variants={fadeIn('up', 'spring', 0.5, 0.5)}
                    href="/projects"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full
                               border border-[#915eff]/40 text-[#915eff] text-sm font-medium
                               hover:bg-[#915eff]/10 hover:border-[#915eff]/70
                               transition-all duration-200"
                >
                    View All Projects
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </motion.a>
            )}
        </div>
    );
};

export default LatestProjects;
