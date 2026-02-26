/**
 * AvailabilityBadge
 *
 * Displays a live "Available for Work" / "Currently Occupied" badge that
 * reads directly from the database via the useGlobalSettings hook (SWR).
 *
 * Behaviour:
 *  - Loading:   gray animated skeleton – no layout shift
 *  - Available: pulsing green dot + "Available for Work"
 *  - Busy:      solid amber/red dot + "Currently Occupied"
 *  - Click:     smooth-scrolls to the #contact section via Lenis
 *
 * Usage:
 *   <AvailabilityBadge />                         – default
 *   <AvailabilityBadge className="mt-4" />        – extra Tailwind classes
 *   <AvailabilityBadge showTooltip={false} />     – hide hover tooltip
 */

import React from 'react';
import { useAvailability } from '../hooks/useGlobalSettings';
import { useLenis } from '../context/LenisContext';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Gray skeleton shown while the API responds. */
const LoadingSkeleton = () => (
    <div
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                   bg-white/5 border border-white/10 animate-pulse"
        aria-label="Loading availability status"
    >
        <span className="w-2.5 h-2.5 rounded-full bg-gray-500/60" />
        <span className="h-3 w-28 rounded bg-gray-500/40" />
    </div>
);

/** Pulsing green badge – user is available. */
const AvailableBadge = ({ onClick, showTooltip }) => (
    <button
        type="button"
        onClick={onClick}
        title={showTooltip ? 'Click to get in touch!' : undefined}
        className="group inline-flex items-center gap-2 px-4 py-2 rounded-full
                   bg-emerald-500/10 border border-emerald-500/30
                   hover:bg-emerald-500/20 hover:border-emerald-500/60
                   transition-all duration-300 cursor-pointer
                   focus-visible:outline-none focus-visible:ring-2
                   focus-visible:ring-emerald-500 focus-visible:ring-offset-2
                   focus-visible:ring-offset-black"
        aria-label="Available for work – click to contact"
    >
        {/* Ping layers */}
        <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
            <span
                className="animate-ping absolute inline-flex h-full w-full
                            rounded-full bg-emerald-400 opacity-75"
            />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>

        <span
            className="text-sm font-medium text-emerald-400
                        group-hover:text-emerald-300 transition-colors duration-200
                        whitespace-nowrap"
        >
            Available for Work
        </span>

        {/* Subtle arrow indicator */}
        <svg
            className="w-3 h-3 text-emerald-400/60 group-hover:text-emerald-400
                        group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
    </button>
);

/** Solid amber/red badge – user is busy. */
const BusyBadge = ({ onClick, showTooltip }) => (
    <button
        type="button"
        onClick={onClick}
        title={showTooltip ? 'Still feel free to reach out!' : undefined}
        className="group inline-flex items-center gap-2 px-4 py-2 rounded-full
                   bg-amber-500/10 border border-amber-500/30
                   hover:bg-amber-500/20 hover:border-amber-500/60
                   transition-all duration-300 cursor-pointer
                   focus-visible:outline-none focus-visible:ring-2
                   focus-visible:ring-amber-500 focus-visible:ring-offset-2
                   focus-visible:ring-offset-black"
        aria-label="Currently occupied – click to contact anyway"
    >
        {/* Solid dot (no ping – conveys "not open", not an error) */}
        <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
        </span>

        <span
            className="text-sm font-medium text-amber-400
                        group-hover:text-amber-300 transition-colors duration-200
                        whitespace-nowrap"
        >
            Currently Occupied
        </span>

        <svg
            className="w-3 h-3 text-amber-400/60 group-hover:text-amber-400
                        group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
    </button>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const AvailabilityBadge = ({ className = '', showTooltip = true }) => {
    const { isAvailable, isLoading } = useAvailability();
    const lenis = useLenis();

    /** Smooth-scroll to the contact section when the badge is clicked. */
    const handleClick = () => {
        const contactSection = document.getElementById('contact');
        if (!contactSection) return;

        if (lenis) {
            lenis.scrollTo(contactSection, { offset: -80 });
        } else {
            // Fallback for environments where Lenis isn't mounted yet
            contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        // Wrapper div keeps external className isolated from badge internals
        <div className={className}>
            {isLoading ? (
                <LoadingSkeleton />
            ) : isAvailable ? (
                <AvailableBadge onClick={handleClick} showTooltip={showTooltip} />
            ) : (
                <BusyBadge onClick={handleClick} showTooltip={showTooltip} />
            )}
        </div>
    );
};

export default AvailabilityBadge;
