import React, { useRef, useState, useCallback } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { FaEnvelope, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa';
import { Send, Loader2, CheckCircle2, X } from "lucide-react";

import { styles } from "../styles";
import { SectionWrapper } from "../hoc";
import API_BASE_URL from "../config";
import { slideIn, fadeIn } from "../utils/motion";

// ====================== THANK YOU MODAL ======================
const ThankYouModal = React.memo(({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="relative bg-[#0d0b1e] border border-violet-500/20 p-8 rounded-2xl max-w-sm w-full text-center shadow-[0_0_60px_rgba(139,92,246,0.15)]"
                    >
                        {/* Glow ring */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-600/10 to-cyan-500/5 pointer-events-none" />

                        <div className="relative z-10">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                                className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4"
                            >
                                <CheckCircle2 size={32} className="text-green-400" />
                            </motion.div>
                            <h3 className="text-2xl font-bold text-white mb-2">Message Sent! 🚀</h3>
                            <p className="text-white/50 text-sm mb-6">Thank you for reaching out. I'll get back to you as soon as possible.</p>
                            <button
                                onClick={onClose}
                                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-violet-500/20"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
});

// ====================== CONTACT CARD (Right Side) ======================
const ContactCard = ({ icon: Icon, title, content, link, index, color }) => (
    <motion.div
        variants={fadeIn("left", "spring", index * 0.2, 0.75)}
        className="w-full relative group"
    >
        {/* Outer border glow */}
        <div className={`absolute -inset-[1px] rounded-xl bg-gradient-to-r ${color} opacity-0 group-hover:opacity-50 blur-sm transition-all duration-500`} />

        <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="relative flex items-center gap-4 bg-[#111827] p-4 sm:p-5 rounded-xl border border-white/5 group-hover:border-white/10 transition-all duration-300 overflow-hidden"
        >
            {/* Background glow */}
            <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500`} />

            {/* Icon */}
            <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg bg-gradient-to-br ${color} shadow-lg`}>
                <Icon className="text-white text-lg sm:text-xl" />
            </div>

            <div className="flex flex-col overflow-hidden relative z-10">
                <h4 className="text-white font-bold text-[14px] sm:text-[15px]">{title}</h4>
                <p className="text-white/50 text-[12px] sm:text-[13px] mt-0.5 truncate">
                    {content}
                </p>
            </div>

            {/* Arrow hint */}
            <div className="ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </div>
        </a>
    </motion.div>
);

// ====================== MAIN CONTACT COMPONENT ======================
const Contact = () => {
    const formRef = useRef();
    const [form, setForm] = useState({
        name: "", email: "", mobile: "",
        service: "", budget: "", message: "",
    });
    const [loading, setLoading] = useState(false);
    const [showThankYou, setShowThankYou] = useState(false);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const dbRes = await fetch(`${API_BASE_URL}/api/contacts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name, email: form.email, mobile: form.mobile,
                    subject: form.service, budget: form.budget || "Not Specified",
                    message: form.message,
                })
            });
            if (!dbRes.ok) console.error("DB error:", dbRes.status);

            await fetch("https://formsubmit.co/ajax/novanexusltd001@gmail.com", {
                method: "POST",
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    name: form.name, email: form.email, mobile: form.mobile,
                    service: form.service, budget: form.budget || "Not Specified",
                    message: form.message,
                    _subject: "New Portfolio Inquiry from " + form.name, _template: "table"
                })
            });

            setLoading(false);
            setShowThankYou(true);
            toast.success("Message sent! I'll get back to you shortly.");
            setForm({ name: "", email: "", mobile: "", service: "", budget: "", message: "" });
        } catch (error) {
            setLoading(false);
            toast.error("Unable to send. Please check your connection.");
        }
    }, [form]);

    const contactMethods = [
        {
            title: "Email", content: "novanexusltd001@gmail.com", icon: FaEnvelope,
            link: "mailto:novanexusltd001@gmail.com", color: "from-violet-600 to-indigo-600"
        },
        {
            title: "WhatsApp", content: "Chat with me directly", icon: FaWhatsapp,
            link: "https://wa.me/918252000000", color: "from-green-500 to-emerald-600"
        },
        {
            title: "Location", content: "Remote / Global", icon: FaMapMarkerAlt,
            link: "https://www.google.com/maps", color: "from-cyan-500 to-blue-600"
        }
    ];

    const inputClass = "w-full bg-[#111827] text-white text-sm sm:text-base py-3 sm:py-3.5 px-4 rounded-xl border border-white/5 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 outline-none placeholder:text-white/25 transition-all duration-200";

    return (
        <div className="xl:mt-12 flex xl:flex-row flex-col-reverse gap-8 xl:gap-12 overflow-hidden">
            <ThankYouModal isOpen={showThankYou} onClose={() => setShowThankYou(false)} />

            {/* ====== LEFT: FORM ====== */}
            <motion.div
                variants={slideIn("left", "tween", 0.2, 1)}
                className="flex-[0.6] relative"
            >
                {/* Subtle card */}
                <div className="relative bg-[#0d0b1e]/80 border border-white/[0.06] rounded-2xl p-6 sm:p-8 overflow-hidden backdrop-blur-sm">
                    {/* Decorative glows inside card */}
                    <div className="absolute -top-20 -left-20 w-64 h-64 bg-violet-700/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-20 -right-10 w-48 h-48 bg-cyan-700/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        <p className={styles.sectionSubText}>Get in touch</p>
                        <h3 className={`${styles.sectionHeadText} mb-8`}>Contact.</h3>

                        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
                            {/* Row 1 */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">Your Name</label>
                                    <input type="text" name="name" value={form.name} onChange={handleChange}
                                        placeholder="John Doe" className={inputClass} autoComplete="name" required />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">WhatsApp / Mobile</label>
                                    <input type="tel" name="mobile" value={form.mobile} onChange={handleChange}
                                        placeholder="+91 98765 43210" className={inputClass} autoComplete="tel" />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">Email Address</label>
                                <input type="email" name="email" value={form.email} onChange={handleChange}
                                    placeholder="you@example.com" className={inputClass} autoComplete="email" required />
                            </div>

                            {/* Row 2: Service + Budget */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">Service Needed</label>
                                    <div className="relative">
                                        <select name="service" value={form.service} onChange={handleChange}
                                            className={`${inputClass} appearance-none cursor-pointer pr-10`}>
                                            <option value="" disabled>Select a Service</option>
                                            <option value="Website Development">Website Development</option>
                                            <option value="WordPress Website">WordPress Website</option>
                                            <option value="App Development">App Development</option>
                                            <option value="SEO Optimization">SEO Optimization</option>
                                            <option value="Bug Fixing">Bug Fixing</option>
                                            <option value="Website Maintenance">Website Maintenance</option>
                                            <option value="Content/Blog Writing">Content/Blog Writing</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white/30">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {form.service && (
                                        <motion.div
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className="flex-1"
                                        >
                                            <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">Budget</label>
                                            <input type="text" name="budget" value={form.budget} onChange={handleChange}
                                                placeholder="e.g. ₹5,000 - ₹10,000" className={inputClass} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">Your Message</label>
                                <textarea rows={5} name="message" value={form.message} onChange={handleChange}
                                    placeholder="Tell me about your project..."
                                    className={`${inputClass} resize-none`} required />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="relative group mt-2 w-full sm:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 px-10 rounded-xl transition-all duration-300 shadow-lg shadow-violet-500/20 overflow-hidden"
                            >
                                {/* Shimmer on hover */}
                                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} />}
                                <span>{loading ? "Sending..." : "Send Message"}</span>
                            </button>
                        </form>
                    </div>
                </div>
            </motion.div>

            {/* ====== RIGHT: INFO PANEL ====== */}
            <motion.div
                variants={slideIn("right", "tween", 0.2, 1)}
                className="xl:flex-[0.4] flex flex-col justify-center overflow-hidden"
            >
                <div className="flex flex-col gap-5 sm:gap-6 py-4 xl:py-8 min-w-0">
                    {/* Heading */}
                    <div className="mb-2">
                        <h4 className="text-2xl sm:text-3xl font-bold text-white mb-3 break-words leading-snug">
                            Let's create something{" "}
                            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                                amazing
                            </span>{" "}
                            together.
                        </h4>
                        <p className="text-white/45 text-sm leading-relaxed">
                            Whether you have a project in mind, need technical consultation, or just want to say hi —
                            I'm always open to new opportunities.
                        </p>
                    </div>

                    {/* Decorative glowing separator */}
                    <div className="w-full h-px bg-gradient-to-r from-violet-600/40 via-cyan-500/20 to-transparent" />

                    {/* Contact Method Cards */}
                    <div className="flex flex-col gap-3 sm:gap-4">
                        {contactMethods.map((method, index) => (
                            <ContactCard key={`contact-method-${index}`} index={index} {...method} />
                        ))}
                    </div>

                    {/* Bottom tagline */}
                    <motion.p
                        variants={fadeIn("up", "spring", 0.8, 0.75)}
                        className="text-white/25 text-xs mt-2"
                    >
                        ⚡ Usually responds within 24 hours
                    </motion.p>
                </div>
            </motion.div>
        </div>
    );
};

export default SectionWrapper(Contact, "contact");
