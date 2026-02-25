import React, { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { styles } from "../styles";
import { EarthCanvas } from "./canvas";
import { SectionWrapper } from "../hoc";
import API_BASE_URL from "../config";

import { slideIn } from "../utils/motion";


// Template ID, Service ID, Public Key placeholder
// const SERVICE_ID = "service_id";
// const TEMPLATE_ID = "template_id";
// const PUBLIC_KEY = "public_key";

const ThankYouModal = React.memo(({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="bg-[#100d25] border border-white/10 p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl relative"
                    >
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                        <p className="text-secondary mb-6">
                            Thank you for reaching out. I will get back to you as soon as possible.
                        </p>
                        <button
                            onClick={onClose}
                            className="bg-tertiary hover:bg-[#1f1b3c] text-white font-bold py-3 px-8 rounded-xl outline-none transition-all duration-300 border border-white/5"
                        >
                            Close
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
});

const Contact = () => {
    const formRef = useRef();
    const [form, setForm] = useState({
        name: "",
        email: "",
        mobile: "",
        service: "",
        budget: "",
        message: "",
    });

    const [loading, setLoading] = useState(false);
    const [showThankYou, setShowThankYou] = useState(false);

    const handleChange = useCallback((e) => {
        const { target } = e;
        const { name, value } = target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Save to Database (for Admin Panel)
            const dbRes = await fetch(`${API_BASE_URL}/api/contacts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    mobile: form.mobile,
                    subject: form.service, // Map service to subject on backend
                    budget: form.budget || "Not Specified",
                    message: form.message,
                })
            });

            if (!dbRes.ok) {
                console.error("Database error. Status:", dbRes.status);
            }

            // 2. Send Email via FormSubmit (for Email notification)
            await fetch("https://formsubmit.co/ajax/abhimanyuraj134@gmail.com", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    mobile: form.mobile,
                    service: form.service,
                    budget: form.budget || "Not Specified",
                    message: form.message,
                    _subject: "New Portfolio Inquiry from " + form.name,
                    _template: "table"
                })
            });

            setLoading(false);
            setShowThankYou(true);
            toast.success("Thank you! Your message has been received. I will get back to you shortly.");
            setForm({
                name: "",
                email: "",
                mobile: "",
                service: "",
                budget: "",
                message: "",
            });
        } catch (error) {
            setLoading(false);
            console.error("Form error:", error);
            toast.error("Unable to send message. Please check your connection and try again.");
        }
    }, [form]);

    return (
        <div
            className={`xl:mt-12 flex xl:flex-row flex-col-reverse gap-10 overflow-hidden`}
        >
            <ThankYouModal isOpen={showThankYou} onClose={() => setShowThankYou(false)} />

            <motion.div
                variants={slideIn("left", "tween", 0.2, 1)}
                className='flex-[0.75] bg-black-100 p-8 rounded-2xl'
            >
                <p className={styles.sectionSubText}>Get in touch</p>
                <h3 className={styles.sectionHeadText}>Contact.</h3>

                <form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    className='mt-12 flex flex-col gap-8'
                >
                    <div className="flex flex-col md:flex-row gap-6">
                        <label className='flex flex-col flex-1'>
                            <span className='text-white font-medium mb-4'>Your Name</span>
                            <input
                                type='text'
                                name='name'
                                value={form.name}
                                onChange={handleChange}
                                placeholder="What's your good name?"
                                className='bg-tertiary py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none border-none font-medium'
                                autoComplete="name"
                            />
                        </label>
                        <label className='flex flex-col flex-1'>
                            <span className='text-white font-medium mb-4'>Mobile / WhatsApp</span>
                            <input
                                type='tel'
                                name='mobile'
                                value={form.mobile}
                                onChange={handleChange}
                                placeholder="Your Contact Number"
                                className='bg-tertiary py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none border-none font-medium'
                                autoComplete="tel"
                            />
                        </label>
                    </div>

                    <label className='flex flex-col'>
                        <span className='text-white font-medium mb-4'>Your Email</span>
                        <input
                            type='email'
                            name='email'
                            value={form.email}
                            onChange={handleChange}
                            placeholder="What's your web address?"
                            className='bg-tertiary py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none border-none font-medium'
                            autoComplete="email"
                        />
                    </label>

                    <div className="flex flex-col md:flex-row gap-6">
                        <label className='flex flex-col flex-1'>
                            <span className='text-white font-medium mb-4'>Service Interested In</span>
                            <div className="relative">
                                <select
                                    name='service'
                                    value={form.service}
                                    onChange={handleChange}
                                    className='bg-tertiary py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none border-none font-medium w-full appearance-none cursor-pointer'
                                >
                                    <option value="" disabled>Select a Service</option>
                                    <option value="Website Development">Website Development</option>
                                    <option value="App Development">App Development</option>
                                    <option value="SEO Optimization">SEO Optimization</option>
                                    <option value="Bug Fixing">Bug Fixing</option>
                                    <option value="Website Maintenance">Website Maintenance</option>
                                    <option value="Content/Blog Writing">Content/Blog Writing</option>
                                    <option value="Other">Other</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-secondary">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                </div>
                            </div>
                        </label>

                        {form.service && (
                            <motion.label
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className='flex flex-col flex-1'
                            >
                                <span className='text-white font-medium mb-4'>Your Budget</span>
                                <input
                                    type='text'
                                    name='budget'
                                    value={form.budget}
                                    onChange={handleChange}
                                    placeholder="Estimated Budget (e.g. $500 - $1000)"
                                    className='bg-tertiary py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none border-none font-medium'
                                />
                            </motion.label>
                        )}
                    </div>

                    <label className='flex flex-col'>
                        <span className='text-white font-medium mb-4'>Your Message</span>
                        <textarea
                            rows={7}
                            name='message'
                            value={form.message}
                            onChange={handleChange}
                            placeholder='What you want to say?'
                            className='bg-tertiary py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none border-none font-medium'
                        />
                    </label>

                    <button
                        type='submit'
                        className='bg-tertiary py-3 px-8 rounded-xl outline-none w-fit text-white font-bold shadow-md shadow-primary'
                    >
                        {loading ? "Sending..." : "Send"}
                    </button>
                </form>
            </motion.div>

            <motion.div
                variants={slideIn("right", "tween", 0.2, 1)}
                className='xl:flex-1 xl:h-auto md:h-[550px] h-[350px]'
            >
                <EarthCanvas />
            </motion.div>
        </div>
    );
};

export default SectionWrapper(Contact, "contact");
