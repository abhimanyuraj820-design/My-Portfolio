import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { styles } from "../styles";
import { navLinks } from "../constants";
import { logo } from "../assets";
import { Menu, X } from "lucide-react";
import { useLenis } from "../context/LenisContext";
import AvailabilityBadge from "./AvailabilityBadge";

// Mobile menu component rendered via portal
const MobileMenu = ({ toggle, setToggle, active, setActive, handleMobileNavClick, navigate }) => {
    if (!toggle) return null;

    return createPortal(
        <div
            id="mobile-nav-overlay"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 2147483647, // Maximum possible z-index
                pointerEvents: 'auto',
            }}
        >
            {/* Backdrop */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                }}
                onClick={() => setToggle(false)}
            />

            {/* Menu Panel */}
            <div
                style={{
                    position: 'absolute',
                    top: '80px',
                    right: '16px',
                    minWidth: '220px',
                    padding: '24px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #1d1836 0%, #11101d 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }}
            >
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {navLinks.filter(nav => nav.id !== 'blog' && nav.id !== 'contact').map((nav) => (
                        <li key={nav.id}>
                            <a
                                href={`/#${nav.id}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleMobileNavClick(nav.id, nav.title);
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    width: '100%',
                                    padding: '12px 16px',
                                    minHeight: '48px',
                                    fontSize: '16px',
                                    fontWeight: 500,
                                    color: active === nav.title ? '#fff' : '#aaa6c3',
                                    background: active === nav.title ? 'rgba(255,255,255,0.05)' : 'transparent',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    cursor: 'pointer',
                                    WebkitTapHighlightColor: 'rgba(255,255,255,0.1)',
                                }}
                            >
                                {nav.title}
                            </a>
                        </li>
                    ))}
                    <li>
                        <a
                            href="/contact"
                            onClick={(e) => { e.preventDefault(); setToggle(false); navigate('/contact'); }}
                            style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '12px 16px', minHeight: '48px', fontSize: '16px', fontWeight: 500, color: '#aaa6c3', borderRadius: '8px', textDecoration: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'rgba(255,255,255,0.1)' }}
                        >
                            Contact
                        </a>
                    </li>
                    <li>
                        <a
                            href="/services"
                            onClick={(e) => {
                                e.preventDefault();
                                setToggle(false);
                                navigate('/services');
                            }}
                            style={{
                                display: 'flex', alignItems: 'center', width: '100%',
                                padding: '12px 16px', minHeight: '48px', fontSize: '16px',
                                fontWeight: 500, color: '#aaa6c3', borderRadius: '8px',
                                textDecoration: 'none', cursor: 'pointer',
                                WebkitTapHighlightColor: 'rgba(255,255,255,0.1)',
                            }}
                        >
                            Services
                        </a>
                    </li>
                    <li>
                        <a
                            href="/blog"
                            onClick={(e) => {
                                e.preventDefault();
                                setToggle(false);
                                navigate('/blog');
                            }}
                            style={{
                                display: 'flex', alignItems: 'center', width: '100%',
                                padding: '12px 16px', minHeight: '48px', fontSize: '16px',
                                fontWeight: 500, color: '#aaa6c3', borderRadius: '8px',
                                textDecoration: 'none', cursor: 'pointer',
                                WebkitTapHighlightColor: 'rgba(255,255,255,0.1)',
                            }}
                        >
                            Blog
                        </a>
                    </li>
                    <li>
                        <a
                            href="/testimonials"
                            onClick={(e) => {
                                e.preventDefault();
                                setToggle(false);
                                navigate('/testimonials');
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                width: '100%',
                                padding: '12px 16px',
                                minHeight: '48px',
                                fontSize: '16px',
                                fontWeight: 500,
                                color: '#aaa6c3',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                cursor: 'pointer',
                                WebkitTapHighlightColor: 'rgba(255,255,255,0.1)',
                            }}
                        >
                            Testimonials
                        </a>
                    </li>
                </ul>
            </div>
        </div>,
        document.body
    );
};

const Navbar = () => {
    const [active, setActive] = useState("");
    const [toggle, setToggle] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const lenis = useLenis();

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            setScrolled(scrollTop > 100);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Lock/Unlock scroll when mobile menu is toggled
    useEffect(() => {
        if (!lenis) return;

        if (toggle) {
            lenis.stop();
        } else {
            lenis.start();
        }

        // Cleanup function to ensure scroll is restored if component unmounts
        // or if toggle logic fails in some edge case.
        return () => {
            if (lenis) lenis.start();
        };
    }, [toggle, lenis]);

    // Scroll to element with retry mechanism — uses Lenis on desktop, native scroll on mobile
    const scrollToSection = (navId, maxRetries = 30) => {
        // Special handling for "top"
        if (navId === "top") {
            if (lenis) {
                lenis.scrollTo(0);
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            return;
        }

        let retries = 0;

        const tryScroll = () => {
            const el = document.getElementById(navId);
            if (el) {
                if (lenis) {
                    // Force start if stopped (safety net in case of stuck state)
                    if (lenis.isStopped) lenis.start();
                    lenis.scrollTo(el, { offset: -80 }); // Offset for fixed header
                } else {
                    // Native fallback for mobile (Lenis is disabled)
                    const y = el.getBoundingClientRect().top + window.scrollY - 80;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
                return true;
            }

            // Element not found, retry
            retries++;
            if (retries < maxRetries) {
                setTimeout(tryScroll, 100); // Retry every 100ms, up to 3 seconds
            }
            return false;
        };

        tryScroll();
    };

    // Simple navigation handler for mobile
    const handleMobileNavClick = (navId, navTitle) => {
        setActive(navTitle);
        setToggle(false);

        // If not on home page, navigate first then scroll
        if (location.pathname !== '/') {
            navigate('/');
            // Use polling to wait for element to exist
            setTimeout(() => scrollToSection(navId), 200);
        } else {
            scrollToSection(navId);
        }
    };

    // Desktop nav click handler
    const handleNavClick = (navId, navTitle) => {
        setActive(navTitle);

        if (location.pathname !== '/') {
            navigate('/');
            setTimeout(() => scrollToSection(navId), 200);
        } else {
            scrollToSection(navId);
        }
    };

    return (
        <>
            <nav
                className={`${styles.paddingX} w-full flex items-center py-5 fixed top-0 transition-all duration-300 ${scrolled ? "bg-primary/80 backdrop-blur-md shadow-lg" : "bg-transparent"
                    }`}
                style={{
                    zIndex: 2147483646,
                    touchAction: 'manipulation',
                }}
            >
                <div className='w-full flex justify-between items-center max-w-7xl mx-auto'>
                    <Link
                        to='/'
                        className='flex items-center gap-2 flex-shrink-0'
                        onClick={() => {
                            setActive("");
                            scrollToSection("top");
                        }}
                    >
                        <img src={logo} alt="logo" className="w-8 h-8 sm:w-9 sm:h-9 object-contain flex-shrink-0" />
                        <p className='text-white text-[16px] sm:text-[18px] font-bold cursor-pointer whitespace-nowrap'>
                            Abhimanyu Raj<span className='hidden md:inline'> | CSE</span>
                        </p>
                    </Link>

                    {/* Desktop Navigation */}
                    <ul className='list-none hidden sm:flex flex-row gap-10'>
                        {navLinks.filter(nav => nav.id !== 'blog' && nav.id !== 'contact').map((nav) => (
                            <li
                                key={nav.id}
                                className={`${active === nav.title ? "text-white" : "text-secondary"
                                    } hover:text-white text-[18px] font-medium cursor-pointer transition-colors duration-200`}
                                onClick={() => handleNavClick(nav.id, nav.title)}
                            >
                                <span>{nav.title}</span>
                            </li>
                        ))}
                        <li className="text-secondary hover:text-white text-[18px] font-medium cursor-pointer transition-colors duration-200">
                            <Link to="/contact">Contact</Link>
                        </li>
                        <li className="text-secondary hover:text-white text-[18px] font-medium cursor-pointer transition-colors duration-200">
                            <Link to="/services">Services</Link>
                        </li>
                        <li className="text-secondary hover:text-white text-[18px] font-medium cursor-pointer transition-colors duration-200">
                            <Link to="/blog">Blog</Link>
                        </li>
                        <li className="text-secondary hover:text-white text-[18px] font-medium cursor-pointer transition-colors duration-200">
                            <Link to="/testimonials">Testimonials</Link>
                        </li>
                    </ul>

                    {/* Live availability badge — visible on desktop only */}
                    <div className="hidden sm:flex items-center ml-4">
                        <AvailabilityBadge showTooltip={false} />
                    </div>

                    {/* Mobile Menu Button */}
                    <div className='sm:hidden flex flex-1 justify-end items-center'>
                        <button
                            type="button"
                            aria-label={toggle ? "Close menu" : "Open menu"}
                            onClick={() => setToggle(!toggle)}
                            style={{
                                padding: '8px',
                                marginRight: '-8px',
                                color: 'white',
                                cursor: 'pointer',
                                background: 'transparent',
                                border: 'none',
                                WebkitTapHighlightColor: 'transparent',
                                touchAction: 'manipulation',
                            }}
                        >
                            {toggle ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu - Rendered via Portal */}
            <MobileMenu
                toggle={toggle}
                setToggle={setToggle}
                active={active}
                setActive={setActive}
                handleMobileNavClick={handleMobileNavClick}
                navigate={navigate}
            />
        </>
    );
};

export default Navbar;
