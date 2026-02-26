import React from "react";
import { Link } from "react-router-dom";
import { m as motion } from "framer-motion";
import { SectionWrapper } from "../hoc";
import { styles } from "../styles";
import { FaGithub, FaLinkedin, FaInstagram, FaFacebook, FaTwitter, FaArrowUp } from "react-icons/fa";

import { logo } from "../assets";
import API_BASE_URL from "../config";

const Footer = () => {
    const scrollTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const currentYear = new Date().getFullYear();

    const [socialLinks, setSocialLinks] = React.useState([]);

    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/settings`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.socialLinks) {
                        const platforms = {
                            github: { icon: <FaGithub size={20} />, color: "hover:text-[#333] hover:bg-white", name: "GitHub" },
                            linkedin: { icon: <FaLinkedin size={20} />, color: "hover:text-[#0077b5] hover:bg-white", name: "LinkedIn" },
                            instagram: { icon: <FaInstagram size={20} />, color: "hover:text-[#e4405f] hover:bg-white", name: "Instagram" },
                            facebook: { icon: <FaFacebook size={20} />, color: "hover:text-[#1877f2] hover:bg-white", name: "Facebook" },
                            twitter: { icon: <FaTwitter size={20} />, color: "hover:text-[#1da1f2] hover:bg-white", name: "X (Twitter)" },
                            reddit: { icon: <FaGithub size={20} />, color: "hover:text-[#ff4500] hover:bg-white", name: "Reddit" }, // Generic fallback for reddit
                        };

                        const dynamicLinks = Object.entries(data.socialLinks)
                            .filter(([_, url]) => url)
                            .map(([platform, url]) => {
                                const matchedPlatform = platforms[platform.toLowerCase()] || {
                                    icon: <FaGithub size={20} />,
                                    color: "hover:text-black hover:bg-white",
                                    name: platform.charAt(0).toUpperCase() + platform.slice(1)
                                };
                                return {
                                    ...matchedPlatform,
                                    url
                                };
                            });

                        setSocialLinks(dynamicLinks);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch social links:", error);
            }
        };

        fetchSettings();
    }, []);

    return (
        <footer className="w-full bg-[#050816] py-10 border-t border-t-[#1f1f3a] relative z-10">
            <div className="max-w-7xl mx-auto px-6 sm:px-16 flex flex-col gap-8">

                {/* Top Section: Brand & Nav */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    {/* Brand */}
                    <div className="flex items-center gap-4">
                        <img src={logo} alt="logo" className="w-12 h-12 object-contain" />
                        <div className="flex flex-col">
                            <p className="text-white text-[18px] font-bold cursor-pointer flex">
                                Abhimanyu &nbsp;
                                <span className="sm:block hidden"> | Web Developer</span>
                            </p>
                            <p className="text-secondary text-[12px] mt-1">
                                Creating digital masterpieces.
                            </p>
                        </div>
                    </div>

                    {/* Navigation (Optional simpler nav for footer) */}
                    <div className="flex gap-6">
                        <a href="#about" className="text-secondary hover:text-white text-[16px] transition-colors">About</a>
                        <a href="#work" className="text-secondary hover:text-white text-[16px] transition-colors">Work</a>
                        <a href="#contact" className="text-secondary hover:text-white text-[16px] transition-colors">Contact</a>
                    </div>
                </div>

                {/* Divider */}
                <div className="w-full h-[1px] bg-[#1f1f3a]" />

                {/* Bottom Section: Social & Legal */}
                <div className="flex flex-col items-center gap-6">

                    {/* Social Icons */}
                    <div className="flex gap-4">
                        {socialLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`w-10 h-10 rounded-full bg-[#151030] flex justify-center items-center text-white transition-all duration-300 border border-[#1f1f3a] ${link.color} shadow-lg shadow-[#000]/30 hover:-translate-y-1`}
                                title={link.name}
                            >
                                {link.icon}
                            </a>
                        ))}
                    </div>

                    {/* Legal Links */}
                    <div className="flex flex-wrap justify-center gap-6 text-[14px] text-secondary">
                        <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/terms-and-conditions" className="hover:text-white transition-colors">Terms & Conditions</Link>
                        <Link to="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link>
                    </div>

                    {/* Copyright */}
                    <p className="text-secondary text-[14px] text-center border-t border-[#1f1f3a] pt-6 w-full">
                        © {currentYear} Abhimanyu. All rights reserved.
                    </p>
                </div>
            </div>


            {/* Scroll to Top Button */}
            <motion.button
                onClick={scrollTop}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute bottom-10 right-6 sm:right-16 bg-[#915eff] p-3 rounded-full text-white shadow-lg shadow-purple-500/30 hidden md:flex"
            >
                <FaArrowUp size={24} />
            </motion.button>
        </footer >
    );
};

export default Footer;
