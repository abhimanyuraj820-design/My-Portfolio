import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { styles } from "../styles";
import API_BASE_URL from "../config";

import { FaStar, FaQuoteLeft, FaUser, FaPaperPlane, FaFilter, FaSortAmountDown } from "react-icons/fa";
import { Navbar, Footer } from "../components";

const FeedbackCard = ({ index, message, name, designation, company, rating }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: index * 0.1, type: "spring", stiffness: 100 }}
        className="group h-full"
    >
        <div className='relative h-full bg-gradient-to-br from-[#1d1836]/90 via-[#231d42]/90 to-[#11071F]/90 backdrop-blur-2xl p-8 rounded-3xl border border-white/5 hover:border-violet-500/40 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(139,92,246,0.3)] hover:-translate-y-2 w-full flex flex-col justify-between'>
            {/* Quote Icon */}
            <div className="absolute -top-5 -right-5 w-16 h-16 bg-gradient-to-br from-violet-600/20 to-purple-600/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-[0_10px_20px_rgba(139,92,246,0.5)] transform -rotate-6 group-hover:rotate-0 transition-transform duration-300">
                <FaQuoteLeft className="text-white text-xl" />
            </div>

            <div className='pt-4'>
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                        <FaStar
                            key={i}
                            className={`${i < rating ? "text-yellow-500" : "text-gray-600"} transition-colors`}
                        />
                    ))}
                </div>

                {/* Message */}
                <p className='text-white/90 tracking-wide text-[16px] leading-relaxed mb-6'>
                    "{message}"
                </p>

                {/* Author */}
                <div className='flex items-center gap-4 pt-4 border-t border-white/10'>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-violet-500/30">
                        {name.charAt(0).toUpperCase()}
                    </div>
                    <div className='flex-1'>
                        <p className='text-white font-semibold text-[16px]'>
                            {name}
                        </p>
                        {designation && (
                            <p className='text-secondary text-[13px]'>
                                {designation}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </motion.div>
);

const TestimonialsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [filteredReviews, setFilteredReviews] = useState([]);

    // Feature States
    const [ratingFilter, setRatingFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

    const [form, setForm] = useState({
        name: "",
        rating: 5,
        message: "",
        designation: ""
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/testimonials`);
            if (res.ok) {
                const data = await res.json();
                const approvedReviews = data.filter(r => r.isApproved);
                // Default descending inside fetch
                approvedReviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setReviews(approvedReviews);
                setFilteredReviews(approvedReviews);
            }
        } catch (err) {
            console.error(err);
        }
        setFetchLoading(false);
    };

    // Filter and Sort Effect
    useEffect(() => {
        let result = [...reviews];

        // 1. Filtering
        if (ratingFilter !== "all") {
            const starCount = parseInt(ratingFilter);
            result = result.filter(r => r.rating === starCount);
        }

        // 2. Sorting
        switch (sortBy) {
            case "oldest":
                result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                break;
            case "highest":
                result.sort((a, b) => b.rating - a.rating);
                break;
            case "newest":
            default:
                result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
        }

        setFilteredReviews(result);
    }, [reviews, ratingFilter, sortBy]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleRating = (value) => {
        setForm({ ...form, rating: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/testimonials`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: form.name,
                    rating: form.rating,
                    message: form.message,
                    designation: form.designation,
                    isApproved: false
                })
            });

            if (res.ok) {
                setSubmitted(true);
                setForm({ name: "", rating: 5, message: "", designation: "" });
                setTimeout(() => setSubmitted(false), 5000);
            } else {
                alert("Error submitting review. Please try again.");
            }
        } catch (err) {
            alert("Error submitting review. Please try again.");
            console.error(err);
        }

        setLoading(false);
    };

    return (
        <>
            <Helmet>
                <title>Testimonials | Abhimanyu Raj - Software Engineer</title>
                <meta name="description" content="Read what clients say about working with Abhimanyu Raj. Leave your review and share your experience." />
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
                            <p className={`${styles.sectionSubText} text-violet-400`}>What Our Clients Say</p>
                            <h1 className={`${styles.sectionHeadText} bg-gradient-to-r from-white via-violet-200 to-violet-400 bg-clip-text text-transparent`}>
                                Testimonials.
                            </h1>
                            <p className="mt-4 text-secondary max-w-2xl text-lg">
                                Real feedback from real clients. Share your experience working with me and help others make informed decisions.
                            </p>
                        </motion.div>
                    </div>
                </div>

                {/* Main Content */}
                <main className={`${styles.padding} max-w-7xl mx-auto pb-20`}>
                    {/* Two Column Layout */}
                    <div className="grid lg:grid-cols-5 gap-12">

                        {/* Left - Review Form */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="lg:col-span-2"
                        >
                            <div className="sticky top-28 bg-gradient-to-br from-[#1d1836]/90 to-[#11071F]/90 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                                        <FaPaperPlane className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Leave a Review</h3>
                                        <p className="text-secondary text-sm">Share your experience</p>
                                    </div>
                                </div>

                                {submitted ? (
                                    <motion.div
                                        initial={{ scale: 0.9 }}
                                        animate={{ scale: 1 }}
                                        className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 p-6 rounded-xl text-center"
                                    >
                                        <div className="text-5xl mb-3">🎉</div>
                                        <h4 className="text-white font-bold text-xl">Thank You!</h4>
                                        <p className="text-secondary mt-2">Your review has been submitted for approval.</p>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                        {/* Rating */}
                                        <div className="flex flex-col gap-2">
                                            <label className="text-white font-medium text-sm">Your Rating</label>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <motion.div
                                                        key={star}
                                                        whileHover={{ scale: 1.2 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <FaStar
                                                            size={28}
                                                            className={`cursor-pointer transition-colors ${star <= form.rating ? "text-yellow-500" : "text-gray-600 hover:text-yellow-500/50"}`}
                                                            onClick={() => handleRating(star)}
                                                        />
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Name */}
                                        <label className="flex flex-col gap-2">
                                            <span className="text-white font-medium text-sm">Your Name *</span>
                                            <div className="relative">
                                                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={form.name}
                                                    onChange={handleChange}
                                                    placeholder="What's your name?"
                                                    required
                                                    className="w-full bg-black-200/50 py-3.5 pl-11 pr-4 placeholder:text-secondary/50 text-white rounded-xl outline-none border border-white/10 focus:border-violet-500 transition-all font-medium"
                                                    autoComplete="name"
                                                />
                                            </div>
                                        </label>

                                        {/* Designation */}
                                        <label className="flex flex-col gap-2">
                                            <span className="text-white font-medium text-sm">Designation (Optional)</span>
                                            <input
                                                type="text"
                                                name="designation"
                                                value={form.designation}
                                                onChange={handleChange}
                                                placeholder="e.g. CEO of Company"
                                                className="w-full bg-black-200/50 py-3.5 px-4 placeholder:text-secondary/50 text-white rounded-xl outline-none border border-white/10 focus:border-violet-500 transition-all font-medium"
                                                autoComplete="organization-title"
                                            />
                                        </label>

                                        {/* Message */}
                                        <label className="flex flex-col gap-2">
                                            <span className="text-white font-medium text-sm">Your Review *</span>
                                            <textarea
                                                rows={4}
                                                name="message"
                                                value={form.message}
                                                onChange={handleChange}
                                                placeholder="Share your experience working with me..."
                                                required
                                                className="w-full bg-black-200/50 py-3.5 px-4 placeholder:text-secondary/50 text-white rounded-xl outline-none border border-white/10 focus:border-violet-500 transition-all font-medium resize-none"
                                            />
                                        </label>

                                        {/* Submit */}
                                        <motion.button
                                            type="submit"
                                            disabled={loading}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="bg-gradient-to-r from-violet-600 to-purple-600 py-3.5 px-8 rounded-xl text-white font-bold shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <FaPaperPlane /> Submit Review
                                                </>
                                            )}
                                        </motion.button>
                                    </form>
                                )}
                            </div>
                        </motion.div>

                        {/* Right - Reviews List */}
                        <div className="lg:col-span-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                                <div>
                                    <h2 className="text-white font-bold text-3xl mb-1">Client Reviews</h2>
                                    <p className="text-secondary text-sm">
                                        Showing <span className="text-violet-400 font-bold">{filteredReviews.length}</span> out of {reviews.length} reviews
                                    </p>
                                </div>

                                {/* Filters & Sort Controls */}
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-violet-600 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                        <div className="relative flex items-center bg-black-200/80 border border-white/10 rounded-xl p-1 backdrop-blur-md">
                                            <div className="flex items-center pl-3 pr-2 text-secondary">
                                                <FaFilter size={12} />
                                            </div>
                                            <select
                                                value={ratingFilter}
                                                onChange={(e) => setRatingFilter(e.target.value)}
                                                className="bg-transparent text-white text-sm outline-none py-2 pr-3 cursor-pointer appearance-none"
                                            >
                                                <option value="all" className="bg-[#11071F]">All Ratings</option>
                                                <option value="5" className="bg-[#11071F]">5 Stars Only</option>
                                                <option value="4" className="bg-[#11071F]">4 Stars Only</option>
                                                <option value="3" className="bg-[#11071F]">3 Stars Only</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-purple-600 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                        <div className="relative flex items-center bg-black-200/80 border border-white/10 rounded-xl p-1 backdrop-blur-md">
                                            <div className="flex items-center pl-3 pr-2 text-secondary">
                                                <FaSortAmountDown size={12} />
                                            </div>
                                            <select
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value)}
                                                className="bg-transparent text-white text-sm outline-none py-2 pr-3 cursor-pointer appearance-none"
                                            >
                                                <option value="newest" className="bg-[#11071F]">Newest First</option>
                                                <option value="oldest" className="bg-[#11071F]">Oldest First</option>
                                                <option value="highest" className="bg-[#11071F]">Highest Rated</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {fetchLoading ? (
                                <div className="flex flex-col items-center justify-center py-32">
                                    <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-6" />
                                    <p className="text-secondary tracking-widest uppercase text-sm font-semibold animate-pulse">Loading amazing reviews...</p>
                                </div>
                            ) : filteredReviews.length > 0 ? (
                                <div className="columns-1 sm:columns-2 gap-6 space-y-6">
                                    {filteredReviews.map((review, index) => (
                                        <div key={review.id} className="break-inside-avoid">
                                            <FeedbackCard index={index} {...review} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center justify-center py-20 text-center bg-gradient-to-br from-[#1d1836]/50 to-[#11071F]/50 rounded-2xl border border-white/5"
                                >
                                    <div className="w-24 h-24 bg-gradient-to-br from-violet-600/20 to-purple-600/20 rounded-full flex items-center justify-center mb-6">
                                        <FaQuoteLeft className="text-4xl text-violet-400" />
                                    </div>
                                    <h3 className="text-white text-xl font-bold mb-2">No Reviews Yet</h3>
                                    <p className="text-secondary max-w-sm">
                                        Be the first to share your experience! Your feedback helps others make informed decisions.
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
};

export default TestimonialsPage;


