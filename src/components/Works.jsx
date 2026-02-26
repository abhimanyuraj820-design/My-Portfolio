import React, { useMemo, useState, useEffect } from "react";
import { m as motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { styles } from "../styles";
import { fadeIn, textVariant } from "../utils/motion";
import { SectionWrapper } from "../hoc";
import { Github, Globe2 } from "lucide-react";
import { useLenis } from "../context/LenisContext";
import API_BASE_URL from "../config";

const categories = [
    { id: "all", label: "All" },
    { id: "web", label: "Web" },
    { id: "mobile", label: "Mobile" },
    { id: "tools", label: "Tools" },
];

const TAG_COLORS = [
    "blue-text-gradient",
    "green-text-gradient",
    "pink-text-gradient",
    "orange-text-gradient"
];

const ProjectCard = ({
    index,
    name,
    description,
    tags,
    image,
    source_code_link,
    live_link,
    category,
    featured,
    skewStyle // Receive skew style prop
}) => {
    const [imageError, setImageError] = useState(false);
    const hasImage = Boolean(image) && !imageError;
    const primaryLink = live_link || source_code_link;

    const handleCardRedirect = () => {
        if (!primaryLink) return;
        window.open(primaryLink, "_self");
    };

    return (
        <motion.div style={skewStyle} className="h-full">
            <div
                className='bg-tertiary p-5 rounded-2xl w-full shadow-card border border-white/5 hover:border-white/15 transition-colors duration-200 h-full flex flex-col'
                onClick={handleCardRedirect}
                role={primaryLink ? 'link' : undefined}
                tabIndex={primaryLink ? 0 : -1}
                onKeyDown={(e) => {
                    if (!primaryLink) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCardRedirect();
                    }
                }}
                style={{ cursor: primaryLink ? 'pointer' : 'default' }}
            >
                <div className='relative w-full h-[230px] overflow-hidden rounded-2xl bg-slate-900 flex-shrink-0'>
                    {hasImage ? (
                        <img
                            src={image}
                            alt={name}
                            className='w-full h-full object-cover transform hover:scale-110 transition-transform duration-500'
                            loading='lazy'
                            decoding='async'
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-500 text-5xl text-white'>
                            🖥️
                        </div>
                    )}

                    <div className='absolute top-3 left-3 flex gap-2'>
                        <span className='px-3 py-1 text-xs font-semibold rounded-full bg-black/70 text-white uppercase tracking-wide'>
                            {category}
                        </span>
                        {featured && (
                            <span className='px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/90 text-white'>Featured</span>
                        )}
                    </div>

                    <div className='absolute inset-0 flex justify-end items-end gap-3 p-3 pointer-events-none'>
                        {source_code_link && (
                            <button
                                type='button'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(source_code_link, "_blank");
                                }}
                                className='pointer-events-auto inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-full bg-black/80 text-white backdrop-blur-sm hover:bg-black transition-colors'
                            >
                                <Github size={16} />
                                Code
                            </button>
                        )}
                        {live_link && (
                            <button
                                type='button'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(live_link, "_blank");
                                }}
                                className='pointer-events-auto inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-full bg-violet-500 text-white hover:bg-violet-600 transition-colors'
                            >
                                <Globe2 size={16} />
                                Live
                            </button>
                        )}
                    </div>
                </div>

                <div className='mt-5 space-y-2 flex-grow'>
                    <h3 className='text-white font-bold text-[20px]'>{name}</h3>
                    <p className='text-secondary text-[14px] line-clamp-3'>{description}</p>
                </div>

                <div className='mt-4 flex flex-wrap gap-2 pt-2 border-t border-white/5'>
                    {tags.map((tag) => (
                        <span
                            key={`${name}-${tag.name}`}
                            className={`text-[13px] ${tag.color} bg-white/5 px-2 py-1 rounded-full`}
                        >
                            #{tag.name}
                        </span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

const Works = () => {
    const [filter, setFilter] = useState("all");
    const [dbProjects, setDbProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/projects`);
                if (res.ok) {
                    const data = await res.json();
                    setDbProjects(data);
                }
            } catch (err) {
                console.error("Failed to fetch projects:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProjects();
    }, []);

    // Velocity Skew Logic
    const scrollVelocity = useMotionValue(0);
    const skewVelocity = useSpring(scrollVelocity, {
        stiffness: 100,
        damping: 30
    });
    // Map velocity to skew degrees. range: [-50, 50] velocity -> [-2, 2] deg skew
    const skewY = useTransform(skewVelocity, [-50, 50], [-3, 3]);

    useLenis(({ velocity }) => {
        scrollVelocity.set(velocity);
    });

    // Map DB projects back to frontend format
    const mappedProjects = useMemo(() => {
        return dbProjects.map(p => ({
            name: p.title,
            description: p.description,
            category: p.category.toLowerCase(),
            featured: p.isFeatured,
            tags: (p.techStack || []).map((tech, i) => ({
                name: tech,
                color: TAG_COLORS[i % TAG_COLORS.length]
            })),
            image: p.thumbnailUrl,
            source_code_link: p.repoUrl,
            live_link: p.liveUrl
        }));
    }, [dbProjects]);

    const categoryCounts = useMemo(() => {
        const counts = mappedProjects.reduce((acc, project) => {
            acc[project.category] = (acc[project.category] || 0) + 1;
            return acc;
        }, {});
        counts.all = mappedProjects.length;
        return counts;
    }, [mappedProjects]);

    const filteredProjects = filter === "all"
        ? mappedProjects
        : mappedProjects.filter((project) => project.category === filter);

    return (
        <>
            <motion.div variants={textVariant()}>
                <p className={`${styles.sectionSubText} `}>My work</p>
                <h2 className={`${styles.sectionHeadText}`}>Projects.</h2>
            </motion.div>

            <div className='w-full flex'>
                <motion.p
                    variants={fadeIn("", "", 0.1, 1)}
                    className='mt-3 text-secondary text-[17px] max-w-3xl leading-[30px]'
                >
                    Following projects showcases my skills and experience through
                    real-world examples of my work. Each project is briefly described with
                    links to code repositories and live demos in it. It reflects my
                    ability to solve complex problems, work with different technologies,
                    and manage projects effectively.
                </motion.p>
            </div>

            <div className='mt-10 flex flex-wrap gap-3'>
                {categories.map((cat) => {
                    const active = filter === cat.id;
                    const count = categoryCounts[cat.id] || 0;
                    return (
                        <button
                            key={cat.id}
                            type='button'
                            onClick={() => setFilter(cat.id)}
                            aria-pressed={active}
                            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors duration-200 ${active
                                ? "bg-white text-primary border-white"
                                : "bg-white/5 text-white border-white/10 hover:border-white/30"
                                }`}
                        >
                            {cat.label}
                            <span className='ml-2 text-xs opacity-80'>({count})</span>
                        </button>
                    );
                })}
            </div>

            <div className='mt-12 grid gap-7 w-full grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'>
                {filteredProjects.length === 0 ? (
                    <div className='col-span-full text-center text-secondary'>No projects in this category yet.</div>
                ) : (
                    filteredProjects.map((project, index) => (
                        <ProjectCard
                            key={`${project.name}-${project.category}`}
                            index={index}
                            {...project}
                            skewStyle={{ skewY }}
                        />
                    ))
                )}
            </div>
        </>
    );
};

export default SectionWrapper(Works, "projects");
