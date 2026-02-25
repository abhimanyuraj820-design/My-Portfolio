import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

import { styles } from "../styles";
import API_BASE_URL from "../config";

import { Navbar, Footer } from "../components";
import { fadeIn, textVariant } from "../utils/motion";
import { FaClock, FaCalendar, FaArrowRight, FaStar, FaBookOpen, FaFilter, FaSortAmountDown } from "react-icons/fa";

const BlogCard = ({ index, title, excerpt, content, slug, created_at, cover_image, category, tags, reading_time, featured }) => {
    const description = excerpt || content?.replace(/<[^>]+>/g, '').substring(0, 120) + '...';

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1, type: "spring", stiffness: 100 }}
            className="group h-full"
        >
            <Link to={`/blog/${slug}`} className="block h-full">
                <div className={`relative h-full flex flex-col bg-gradient-to-br from-[#1d1836]/80 via-[#231d42]/80 to-[#11071F]/80 backdrop-blur-2xl rounded-3xl overflow-hidden border border-white/5 hover:border-violet-500/40 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(139,92,246,0.3)] hover:-translate-y-2 ${featured ? 'ring-2 ring-yellow-500/50 shadow-[0_0_30px_-5px_rgba(234,179,8,0.3)]' : ''}`}>
                    {/* Image Container */}
                    <div className='relative w-full h-[200px] overflow-hidden'>
                        {cover_image ? (
                            <img
                                src={cover_image}
                                alt={title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-violet-900/50 to-purple-900/50 flex items-center justify-center">
                                <FaBookOpen className="text-6xl text-violet-400/50" />
                            </div>
                        )}

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#11071F] via-transparent to-transparent opacity-60" />

                        {/* Featured Badge */}
                        {featured && (
                            <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg shadow-yellow-500/30">
                                <FaStar className="text-[10px]" /> Featured
                            </div>
                        )}

                        {/* Category Badge */}
                        {category && (
                            <div className="absolute bottom-4 left-4 bg-violet-600/90 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                                {category}
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className='p-6 flex flex-col flex-grow'>
                        <h3 className='text-white font-bold text-xl mb-3 line-clamp-2 group-hover:text-violet-400 transition-colors'>
                            {title}
                        </h3>
                        <p className='text-secondary text-sm leading-relaxed line-clamp-2 mb-4 flex-grow'>
                            {description}
                        </p>

                        {/* Tags */}
                        {tags?.length > 0 && (
                            <div className="flex gap-2 mb-4 flex-wrap mt-auto">
                                {tags.slice(0, 3).map((tag, i) => (
                                    <span
                                        key={i}
                                        className="bg-white/5 text-secondary text-xs px-3 py-1 rounded-full border border-white/10 group-hover:border-violet-500/30 transition-colors"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Meta Info */}
                        <div className="flex justify-between items-center pt-5 mt-auto border-t border-white/5">
                            <div className="flex items-center gap-4 text-secondary text-xs">
                                <span className="flex items-center gap-1.5">
                                    <FaCalendar className="text-violet-400" />
                                    {new Date(created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                                <span className="flex items-center gap-1.5 flex-shrink-0">
                                    <FaClock className="text-violet-400" />
                                    {reading_time || 5} min
                                </span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
                                <FaArrowRight size={12} />
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

const Blogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [filteredBlogs, setFilteredBlogs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Feature States
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortBy, setSortBy] = useState("newest");

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/blogs`);
                if (res.ok) {
                    const data = await res.json();

                    // Filter published blogs
                    const publishedBlogs = data.filter(blog => blog.published);

                    // Extract unique categories directly from the published blogs
                    const uniqueCategories = ["All", ...new Set(publishedBlogs.map(b => b.category).filter(Boolean))];

                    setBlogs(publishedBlogs);
                    setFilteredBlogs(publishedBlogs);
                    setCategories(uniqueCategories);
                }
            } catch (err) {
                console.error('Error fetching blogs:', err);
            }
            setLoading(false);
        };

        fetchBlogs();
    }, []);

    // Filter and Sort Effect
    useEffect(() => {
        let result = [...blogs];

        // 1. Filtering by Category
        if (selectedCategory !== "All") {
            result = result.filter(blog => blog.category === selectedCategory);
        }

        // 2. Sorting
        switch (sortBy) {
            case "oldest":
                result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                break;
            case "newest":
            default:
                result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
        }

        setFilteredBlogs(result);
    }, [blogs, selectedCategory, sortBy]);

    // We only feature a blog if filtering allows it, otherwise we just show grid
    const featuredBlog = filteredBlogs.find(blog => blog.featured);
    const regularBlogs = filteredBlogs.filter(blog => blog.id !== featuredBlog?.id);

    return (
        <>
            <Helmet>
                <title>Blog | Abhimanyu Raj - Software Engineer</title>
                <meta name="description" content="Read insights, tutorials, and updates on Web Development, Software Engineering, and Technology." />
            </Helmet>

            <div className="bg-primary min-h-screen">
                {/* Hero Header */}
                <div className="relative overflow-hidden">
                    {/* Animated Background Orbs */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            animate={{ scale: [1, 1.3, 1], rotate: [0, 60, 0] }}
                            transition={{ duration: 25, repeat: Infinity, repeatType: "mirror" }}
                            className="absolute -top-[30%] -left-[15%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-violet-600/30 to-purple-800/20 blur-[120px]"
                        />
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
                            transition={{ duration: 18, repeat: Infinity, repeatType: "mirror" }}
                            className="absolute top-[5%] -right-[15%] w-[45%] h-[45%] rounded-full bg-gradient-to-bl from-blue-600/25 to-cyan-600/15 blur-[100px]"
                        />
                    </div>

                    <Navbar />

                    <div className={`${styles.padding} max-w-7xl mx-auto pt-32 pb-16 relative z-10`}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <p className={`${styles.sectionSubText} text-violet-400`}>My Thoughts & Tutorials</p>
                            <h1 className={`${styles.sectionHeadText} bg-gradient-to-r from-white via-violet-200 to-violet-400 bg-clip-text text-transparent`}>
                                Blog.
                            </h1>
                            <p className="mt-4 text-secondary max-w-2xl text-lg">
                                Insights, tutorials, and stories from my journey as a software engineer.
                                Exploring web development, technology trends, and coding best practices.
                            </p>
                        </motion.div>
                    </div>
                </div>

                {/* Main Content */}
                <main className={`${styles.padding} max-w-7xl mx-auto pb-20`}>

                    {/* Filter & Sort Controls */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        {/* Category Pills */}
                        <div className="flex flex-wrap gap-2">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 backdrop-blur-md border ${selectedCategory === category
                                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white border-transparent shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                                        : 'bg-black-200/50 text-secondary border-white/10 hover:border-violet-500/50 hover:text-white'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative group min-w-[160px]">
                            <div className="absolute inset-0 bg-purple-600 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            <div className="relative flex items-center bg-black-200/80 border border-white/10 rounded-xl p-1 backdrop-blur-md">
                                <div className="flex items-center pl-3 pr-2 text-secondary">
                                    <FaSortAmountDown size={14} />
                                </div>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-transparent text-white text-sm outline-none py-2 pr-3 cursor-pointer appearance-none w-full"
                                >
                                    <option value="newest" className="bg-[#11071F]">Newest First</option>
                                    <option value="oldest" className="bg-[#11071F]">Oldest First</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-6" />
                            <p className="text-secondary tracking-widest uppercase text-sm font-semibold animate-pulse">Loading amazing articles...</p>
                        </div>
                    ) : filteredBlogs.length > 0 ? (
                        <>
                            {/* Featured Blog */}
                            {featuredBlog && (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-16"
                                >
                                    <h2 className="text-white font-bold text-2xl mb-6 flex items-center gap-2">
                                        <FaStar className="text-yellow-500" /> Featured Article
                                    </h2>
                                    <Link to={`/blog/${featuredBlog.slug}`}>
                                        <div className="group relative bg-gradient-to-br from-[#1d1836]/90 via-[#231d42]/90 to-[#11071F]/90 backdrop-blur-xl rounded-3xl overflow-hidden border border-violet-500/30 hover:border-violet-500/60 transition-all duration-500 hover:shadow-[0_20px_50px_-15px_rgba(139,92,246,0.4)]">
                                            <div className="grid md:grid-cols-2 gap-0">
                                                <div className="relative h-[300px] md:h-full overflow-hidden">
                                                    {featuredBlog.cover_image ? (
                                                        <img
                                                            src={featuredBlog.cover_image}
                                                            alt={featuredBlog.title}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-violet-900 to-purple-900 flex items-center justify-center">
                                                            <FaBookOpen className="text-8xl text-violet-400/30" />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#11071F]/80 md:block hidden" />
                                                </div>
                                                <div className="p-8 flex flex-col justify-center">
                                                    {featuredBlog.category && (
                                                        <span className="bg-violet-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold w-fit mb-4">
                                                            {featuredBlog.category}
                                                        </span>
                                                    )}
                                                    <h3 className="text-white font-bold text-3xl mb-4 group-hover:text-violet-400 transition-colors">
                                                        {featuredBlog.title}
                                                    </h3>
                                                    <p className="text-secondary mb-6 line-clamp-3">
                                                        {featuredBlog.excerpt || featuredBlog.content?.replace(/<[^>]+>/g, '').substring(0, 200)}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-secondary text-sm">
                                                        <span className="flex items-center gap-2">
                                                            <FaCalendar className="text-violet-400" />
                                                            {new Date(featuredBlog.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                        <span className="flex items-center gap-2">
                                                            <FaClock className="text-violet-400" />
                                                            {featuredBlog.reading_time || 5} min read
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            )}

                            {/* Blog Grid */}
                            <div>
                                <h2 className="text-white font-bold text-2xl mb-8 border-b border-white/5 pb-4">
                                    {featuredBlog ? 'More Articles' : 'All Articles'}
                                    <span className="text-secondary text-sm font-normal ml-4 bg-white/5 px-3 py-1 rounded-full">
                                        {regularBlogs.length} {regularBlogs.length === 1 ? 'Article' : 'Articles'}
                                    </span>
                                </h2>
                                <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-8'>
                                    {regularBlogs.map((blog, index) => (
                                        <div key={blog.id} className="h-full">
                                            <BlogCard index={index} {...blog} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Empty State */
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-20 text-center"
                        >
                            <div className="w-32 h-32 bg-gradient-to-br from-violet-600/20 to-purple-600/20 rounded-full flex items-center justify-center mb-6">
                                <FaBookOpen className="text-5xl text-violet-400" />
                            </div>
                            <h3 className="text-white text-2xl font-bold mb-2">No Articles Yet</h3>
                            <p className="text-secondary max-w-md">
                                I'm working on some amazing content. Check back soon for tutorials, insights, and tech stories!
                            </p>
                        </motion.div>
                    )}
                </main>

                {/* Footer */}
                <Footer />
            </div>
        </>
    );
};

export default Blogs;

