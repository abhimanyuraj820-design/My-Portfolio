import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { m as motion } from "framer-motion";
import { Code, Globe, Smartphone, Palette, Database, Bot, Layers, Shield, Zap, Package } from "lucide-react";

import { styles } from "../styles";
import { fadeIn, textVariant } from "../utils/motion";
import { SectionWrapper } from "../hoc";
import API_BASE_URL from "../config";

// ── Icon mapping (same as ServicesManager) ───────────
const ICON_COMPONENT_MAP = { Code, Globe, Smartphone, Palette, Database, Bot, Layers, Shield, Zap, Package };

const getServiceIcon = (iconName) => {
    const Icon = ICON_COMPONENT_MAP[iconName] || Package;
    return Icon;
};

// ── Fallback emoji for unknown icons ────────────────
const FALLBACK_EMOJI = {
    Code: "💻", Globe: "🌐", Smartphone: "📱", Palette: "🎨",
    Database: "🗄️", Bot: "🤖", Layers: "📚", Shield: "🛡️", Zap: "⚡", Package: "📦"
};

// ── Service Card ─────────────────────────────────────
const ServiceCard = ({ id, index, title, icon, description, price, deliveryTime, features }) => {
    const IconComp = getServiceIcon(icon);
    const navigate = useNavigate();

    return (
        <div className="xs:w-[250px] w-full cursor-pointer group" onClick={() => navigate(`/services/${id}`, { state: { from: '/' } })}>
            <motion.div
                variants={fadeIn("right", "spring", Math.min(index * 0.12, 0.36), 0.75)}
                className="w-full green-pink-gradient p-[1px] rounded-[20px] shadow-card group-hover:-translate-y-2 transition-transform duration-300"
            >
                <div className="bg-tertiary rounded-[20px] py-5 px-8 min-h-[280px] flex justify-evenly items-center flex-col">
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white">
                        <IconComp size={26} />
                    </div>
                    <p className="text-white text-[18px] font-bold text-center mt-3">{title}</p>
                    {description && (
                        <p className="text-secondary text-[12px] text-center mt-1 line-clamp-2">{description}</p>
                    )}
                    {price > 0 && (
                        <p className="text-violet-300 text-[13px] font-semibold mt-2">
                            Starting from ₹{Number(price).toLocaleString("en-IN")}
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

// ── Static fallback cards (used if DB has no services) ──
const STATIC_SERVICES = [
    { id: "1", title: "Web Development", icon: "Globe", description: "Full-stack web development with React, Node.js and modern technologies.", price: 15000 },
    { id: "2", title: "Mobile App Development", icon: "Smartphone", description: "Cross-platform Android applications built with Kotlin & modern tools.", price: 20000 },
    { id: "3", title: "Backend Development", icon: "Database", description: "Scalable REST APIs, databases and server-side architecture.", price: 12000 },
    { id: "4", title: "UI/UX Design", icon: "Palette", description: "Beautiful, intuitive designs tailored to your brand and audience.", price: 8000 },
];

// ── About Component ──────────────────────────────────
const About = () => {
    const [services, setServices] = useState(STATIC_SERVICES);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/services`);
                if (res.ok) {
                    const data = await res.json();
                    // Only show Active services, sorted by priority
                    const active = data
                        .filter(s => s.status === "Active")
                        .sort((a, b) => (a.priorityOrder ?? 0) - (b.priorityOrder ?? 0));
                    if (active.length > 0) {
                        setServices(active);
                    }
                }
            } catch {
                // Keep pre-rendered fallback services if API is unavailable
            }
        };
        fetchServices();
    }, []);

    return (
        <>
            <motion.div variants={textVariant()}>
                <p className={styles.sectionSubText}>Introduction</p>
                <h2 className={styles.sectionHeadText}>Overview.</h2>
            </motion.div>

            <motion.p
                variants={fadeIn("", "", 0.1, 1)}
                className="mt-4 text-secondary text-[17px] max-w-3xl leading-[30px]"
            >
                Currently pursuing a Diploma in Computer Science and Engineering from Digambar Jain Polytechnic (expected August 2026), complemented by a certification in Programming with Python from Internshala Trainings.
                <br /><br />
                As a Freelance Web Developer, I design and develop custom websites and advanced Android media player applications, focusing on user experience and functionality. By leveraging skills in Kotlin, XML, and Next.js, I emphasize clean, scalable, and efficient code to deliver tailored digital solutions.
            </motion.p>

            <div className="mt-20 flex flex-wrap gap-10">
                {services.map((service, index) => (
                    <ServiceCard
                        key={service.id || service.title}
                        id={service.id}
                        index={index}
                        title={service.title}
                        icon={service.icon}
                        description={service.description}
                        price={service.price}
                        deliveryTime={service.deliveryTime}
                        features={service.features}
                    />
                ))}
            </div>
        </>
    );
};

export default SectionWrapper(About, "about");
