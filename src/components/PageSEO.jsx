/**
 * PageSEO
 *
 * Drop-in SEO component powered by react-helmet-async.
 * Fetches live SEOMetadata from the database for the given `route` and
 * injects all relevant <head> tags:
 *
 *   - <title> and meta description / keywords / robots
 *   - Canonical URL
 *   - Open Graph (Facebook / LinkedIn preview)
 *   - Twitter Card
 *   - JSON-LD Structured Data (Google Rich Snippets)
 *
 * Falls back to sensible defaults so pages are never left tag-less if
 * the database hasn't been seeded for that route yet.
 *
 * Usage:
 *   // At the top of any page component:
 *   <PageSEO route="/" />
 *   <PageSEO route="/about" />
 *   <PageSEO route="/projects" />
 *
 *   // Override individual fields for a specific page:
 *   <PageSEO route="/blog/my-post" fallbackTitle="My Post | Portfolio" />
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import useSWR from 'swr';
import { fetcher } from '../hooks/useGlobalSettings';
import API_BASE_URL from '../config';

// ---------------------------------------------------------------------------
// Defaults (used when the DB has no record for this route)
// ---------------------------------------------------------------------------
const DEFAULT_SEO = {
    metaTitle: 'Portfolio | Full Stack Developer',
    metaDescription:
        'Full Stack Developer specialising in React, Node.js and modern web technologies. View my projects and get in touch.',
    keywords: ['portfolio', 'full stack developer', 'react', 'nodejs'],
    ogImage: '',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    canonicalUrl: '',
    author: 'Portfolio Owner',
    robots: 'index, follow',
    structuredData: null,
};

// ---------------------------------------------------------------------------
// Hook – fetch SEO data for a specific route
// ---------------------------------------------------------------------------
function usePageSEO(route) {
    // Normalise: always start with `/`, never end with `/` (except root)
    const normRoute = route
        ? '/' + route.replace(/^\/+|\/+$/g, '')
        : '/';
    const finalRoute = normRoute === '/' ? '/' : normRoute;

    const encodedRoute = encodeURIComponent(finalRoute);

    const { data, error, isLoading } = useSWR(
        `${API_BASE_URL}/api/seo/${encodedRoute}`,
        fetcher,
        {
            // SEO data changes rarely – cache it for 5 minutes
            refreshInterval: 300_000,
            revalidateOnFocus: false,
            dedupingInterval: 120_000,
            errorRetryCount: 2,
            // Return null on 404 rather than keeping the fallback stuck in loading
            onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
                if (error?.message?.includes('404')) return; // no retry on 404
                if (retryCount >= 2) return;
                setTimeout(() => revalidate({ retryCount }), 5000);
            },
        }
    );

    return { seo: data, isLoading, isError: Boolean(error) };
}

// ---------------------------------------------------------------------------
// Structured Data builder
// ---------------------------------------------------------------------------
/**
 * Merges the database-stored JSON-LD with a sensible WebPage baseline so
 * Google always gets at least minimal structured data.
 */
function buildJsonLD(seo, currentUrl) {
    const base = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: seo.metaTitle,
        description: seo.metaDescription,
        url: seo.canonicalUrl || currentUrl,
        author: {
            '@type': 'Person',
            name: seo.author || DEFAULT_SEO.author,
        },
        ...(seo.ogImage ? { image: seo.ogImage } : {}),
    };

    // If the admin stored custom JSON-LD, deep-merge it on top
    if (seo.structuredData && typeof seo.structuredData === 'object') {
        return { ...base, ...seo.structuredData };
    }

    return base;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const PageSEO = ({
    route = '/',
    fallbackTitle,
    fallbackDescription,
    fallbackOgImage,
}) => {
    const { seo, isLoading } = usePageSEO(route);

    // Merge db data with defaults; allow prop-level overrides for one-offs
    const merged = {
        ...DEFAULT_SEO,
        ...(seo ?? {}),
        ...(fallbackTitle ? { metaTitle: fallbackTitle } : {}),
        ...(fallbackDescription ? { metaDescription: fallbackDescription } : {}),
        ...(fallbackOgImage ? { ogImage: fallbackOgImage } : {}),
    };

    // Derive the canonical URL – prefer DB value, then current window location
    const canonical =
        merged.canonicalUrl ||
        (typeof window !== 'undefined' ? window.location.href : '');

    // Don't render empty tags while loading – Helmet will show the previous
    // page's tags momentarily which is fine for UX; suppress a flash of wrong
    // title by returning null only on the very first hydration.
    if (isLoading && !seo) return null;

    const jsonLD = buildJsonLD(merged, canonical);

    return (
        <Helmet>
            {/* ── Primary meta ── */}
            <title>{merged.metaTitle}</title>
            <meta name="description" content={merged.metaDescription} />
            {merged.keywords?.length > 0 && (
                <meta
                    name="keywords"
                    content={
                        Array.isArray(merged.keywords)
                            ? merged.keywords.join(', ')
                            : merged.keywords
                    }
                />
            )}
            <meta name="robots" content={merged.robots} />
            {merged.author && <meta name="author" content={merged.author} />}
            {canonical && <link rel="canonical" href={canonical} />}

            {/* ── Open Graph ── */}
            <meta property="og:title" content={merged.metaTitle} />
            <meta property="og:description" content={merged.metaDescription} />
            <meta property="og:type" content={merged.ogType} />
            {canonical && <meta property="og:url" content={canonical} />}
            {merged.ogImage && (
                <meta property="og:image" content={merged.ogImage} />
            )}
            {merged.ogImage && (
                <meta property="og:image:alt" content={merged.metaTitle} />
            )}

            {/* ── Twitter Card ── */}
            <meta name="twitter:card" content={merged.twitterCard} />
            <meta name="twitter:title" content={merged.metaTitle} />
            <meta name="twitter:description" content={merged.metaDescription} />
            {merged.ogImage && (
                <meta name="twitter:image" content={merged.ogImage} />
            )}

            {/* ── JSON-LD Structured Data ── */}
            <script type="application/ld+json">
                {JSON.stringify(jsonLD, null, 0)}
            </script>
        </Helmet>
    );
};

export default PageSEO;
