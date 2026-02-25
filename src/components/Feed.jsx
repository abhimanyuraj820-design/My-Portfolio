import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";

import { styles } from "../styles";
import API_BASE_URL from "../config";

import { SectionWrapper } from "../hoc";
import { fadeIn, textVariant } from "../utils/motion";
import { testimonials } from "../constants"; // Fallback data


const FeedbackCard = ({
    index,
    message,
    name,
    designation,
    company,
    image,
    rating,
}) => (
    <motion.div
        variants={fadeIn("", "spring", index * 0.5, 0.75)}
        className='bg-black-200 p-10 rounded-3xl xs:w-[320px] w-full'
    >
        <p className='text-white font-black text-[48px]'>"</p>

        <div className='mt-1'>
            <p className='text-white tracking-wider text-[18px]'>{message}</p>

            <div className="flex gap-1 mt-2 mb-4 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={i < (rating || 5) ? "text-yellow-500" : "text-gray-600"} />
                ))}
            </div>

            <div className='mt-7 flex justify-between items-center gap-1'>
                <div className='flex-1 flex flex-col'>
                    <p className='text-white font-medium text-[16px]'>
                        <span className='blue-text-gradient'>@</span> {name}
                    </p>
                    <p className='mt-1 text-secondary text-[12px]'>
                        {designation} {company && `of ${company}`}
                    </p>
                </div>

                {image ? (
                    <img
                        src={image}
                        alt={`feedback_by-${name}`}
                        className='w-10 h-10 rounded-full object-cover'
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold">
                        {name.charAt(0)}
                    </div>
                )}
            </div>
        </div>
    </motion.div>
);

const Feed = () => {
    const [reviews, setReviews] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        name: "",
        rating: 5,
        message: "",
        designation: ""
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/testimonials`);
            if (res.ok) {
                const data = await res.json();
                const approvedReviews = data.filter(r => r.isApproved);
                approvedReviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                if (approvedReviews.length > 0) {
                    setReviews(approvedReviews.slice(0, 10));
                } else {
                    setReviews(testimonials);
                }
            } else {
                setReviews(testimonials);
            }
        } catch (err) {
            console.error("Error fetching reviews", err);
            setReviews(testimonials);
        }
    };

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
                setTimeout(() => {
                    setSubmitted(false);
                    setShowForm(false);
                }, 4000);
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
        <div className={`mt-12 bg-black-100 rounded-[20px]`}>
            <div
                className={`bg-tertiary rounded-2xl ${styles.padding} min-h-[300px]`}
            >
                <motion.div variants={textVariant()} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <p className={styles.sectionSubText}>What others say</p>
                        <h2 className={styles.sectionHeadText}>Testimonials.</h2>
                    </div>
                    <motion.button
                        onClick={() => setShowForm(!showForm)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-violet-600 to-purple-600 py-3 px-6 rounded-xl text-white font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all flex items-center gap-2 w-fit"
                    >
                        <FaStar /> {showForm ? "Close Form" : "Leave a Review"}
                    </motion.button>
                </motion.div>

                {/* Review Form */}
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mt-8 bg-black-200/50 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl border border-white/10 w-full max-w-full sm:max-w-2xl overflow-hidden"
                    >
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <span className="text-2xl">✍️</span> Share Your Experience
                        </h3>

                        {submitted ? (
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                className="bg-green-500/20 border border-green-500 p-6 rounded-xl text-center"
                            >
                                <div className="text-4xl mb-2">🎉</div>
                                <h4 className="text-white font-bold text-xl">Thank You!</h4>
                                <p className="text-secondary mt-2">Your review has been submitted for approval.</p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-white font-medium">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <FaStar
                                                key={star}
                                                size={28}
                                                className={`cursor-pointer transition-all hover:scale-110 ${star <= form.rating ? "text-yellow-500" : "text-gray-600"}`}
                                                onClick={() => handleRating(star)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <label className="flex flex-col">
                                        <span className="text-white font-medium mb-2">Your Name *</span>
                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            placeholder="What's your name?"
                                            required
                                            className="w-full bg-tertiary py-3 px-4 placeholder:text-secondary text-white rounded-lg outline-none border border-transparent focus:border-violet-500 transition-all font-medium"
                                            autoComplete="name"
                                        />
                                    </label>

                                    <label className="flex flex-col">
                                        <span className="text-white font-medium mb-2">Designation (Optional)</span>
                                        <input
                                            type="text"
                                            name="designation"
                                            value={form.designation}
                                            onChange={handleChange}
                                            placeholder="e.g. CEO of Company"
                                            className="w-full bg-tertiary py-3 px-4 placeholder:text-secondary text-white rounded-lg outline-none border border-transparent focus:border-violet-500 transition-all font-medium"
                                            autoComplete="organization-title"
                                        />
                                    </label>
                                </div>

                                <label className="flex flex-col">
                                    <span className="text-white font-medium mb-2">Your Review *</span>
                                    <textarea
                                        rows={4}
                                        name="message"
                                        value={form.message}
                                        onChange={handleChange}
                                        placeholder="Share your experience working with me..."
                                        required
                                        className="w-full bg-tertiary py-3 px-4 placeholder:text-secondary text-white rounded-lg outline-none border border-transparent focus:border-violet-500 transition-all font-medium resize-none"
                                    />
                                </label>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-gradient-to-r from-violet-600 to-purple-600 py-3 px-8 rounded-xl outline-none w-fit text-white font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Submitting..." : "Submit Review ✨"}
                                </button>
                            </form>
                        )}
                    </motion.div>
                )}
            </div>
            <div className={`-mt-20 pb-14 ${styles.paddingX}`}>
                <div className="flex flex-wrap gap-7">
                    {reviews.map((testimonial, index) => (
                        <FeedbackCard key={testimonial.name + index} index={index} {...testimonial} />
                    ))}
                </div>
                {reviews.length > 0 && (
                    <div className="mt-12 flex justify-center w-full">
                        <Link to="/testimonials">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gradient-to-r from-violet-600 to-purple-600 py-3 px-8 rounded-xl text-white font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all flex items-center gap-2"
                            >
                                See All Reviews ✨
                            </motion.button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SectionWrapper(Feed, "feed");

