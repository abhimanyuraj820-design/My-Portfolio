/**
 * useGlobalSettings
 *
 * Fetches the singleton ProfileSettings record (availability, socials,
 * headline, etc.) and keeps it fresh with SWR's stale-while-revalidate
 * strategy.
 *
 * - First render: returns cached data instantly (if available)
 * - In the background: silently revalidates every 60 seconds so the site
 *   reflects changes made in the Admin dashboard without a full page reload.
 */

import useSWR from 'swr';
import API_BASE_URL from '../config';

// ---------------------------------------------------------------------------
// Shared fetcher used by all SWR hooks in this project
// ---------------------------------------------------------------------------
export const fetcher = (url) =>
    fetch(url).then((res) => {
        if (!res.ok) throw new Error(`API error ${res.status}`);
        return res.json();
    });

// ---------------------------------------------------------------------------
// Shape of the data returned by /api/settings (mirrors ProfileSettings model)
// ---------------------------------------------------------------------------
/**
 * @typedef {Object} ProfileSettings
 * @property {string}  id
 * @property {string}  fullName
 * @property {string}  headline
 * @property {string}  bio
 * @property {string}  avatarUrl
 * @property {string}  resumeUrl
 * @property {boolean} isAvailableForWork
 * @property {Object|null} socialLinks  – { github, linkedin, twitter, … }
 * @property {string}  contactEmail
 * @property {string}  whatsappNumber
 * @property {string}  updatedAt
 */

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
/**
 * Returns live ProfileSettings data from the database.
 *
 * @returns {{
 *   settings: ProfileSettings | undefined,
 *   isLoading: boolean,
 *   isError: boolean,
 *   mutate: function          – call to force an immediate re-fetch
 * }}
 *
 * @example
 * const { settings, isLoading } = useGlobalSettings();
 * if (!isLoading && settings?.isAvailableForWork) { … }
 */
export function useGlobalSettings() {
    const { data, error, isLoading, mutate } = useSWR(
        `${API_BASE_URL}/api/settings`,
        fetcher,
        {
            // --- Freshness ---
            // Revalidate silently every 60 seconds.  If you toggle "Busy" in
            // the Admin dashboard, the badge updates within one minute.
            refreshInterval: 60_000,

            // --- Performance ---
            // Keep stale data visible while the background fetch runs, so the
            // user never sees a loading flash on subsequent visits.
            revalidateOnFocus: false,   // don't hammer the API on every tab focus
            dedupingInterval: 30_000,   // de-duplicate requests within 30 s

            // --- Resilience ---
            // Retry up to 3 times on transient network errors before giving up.
            errorRetryCount: 3,
            errorRetryInterval: 5_000,

            // --- Fallback ---
            // Provide safe defaults so callers never have to null-check everything.
            fallbackData: {
                isAvailableForWork: true,
                fullName: '',
                headline: '',
                bio: '',
                avatarUrl: '',
                resumeUrl: '',
                socialLinks: null,
                contactEmail: '',
                whatsappNumber: '',
            },
        }
    );

    return {
        settings: data,
        isLoading,
        isError: Boolean(error),
        mutate,
    };
}

// ---------------------------------------------------------------------------
// Convenience selector hooks (tree-shakeable, zero extra fetches)
// ---------------------------------------------------------------------------

/** Returns only the availability flag, fully memoised inside SWR's cache. */
export function useAvailability() {
    const { settings, isLoading, isError } = useGlobalSettings();
    return {
        isAvailable: settings?.isAvailableForWork ?? true,
        isLoading,
        isError,
    };
}

/** Returns social links object, e.g. { github: "…", linkedin: "…" } */
export function useSocialLinks() {
    const { settings, isLoading, isError } = useGlobalSettings();
    return {
        socialLinks: settings?.socialLinks ?? {},
        isLoading,
        isError,
    };
}
