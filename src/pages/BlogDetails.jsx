import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { Navbar, Footer } from "../components";
import API_BASE_URL from "../config";
import { ArrowLeft, Calendar, Clock, Tag, Folder } from "lucide-react";

const BlogDetails = () => {
    const { slug } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/blogs`);
                if (res.ok) {
                    const blogs = await res.json();
                    const currentBlog = blogs.find(b => b.slug === slug);
                    setBlog(currentBlog || null);
                }
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };

        fetchBlog();
    }, [slug]);

    if (loading) {
        return (
            <div className="bg-primary min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="bg-primary min-h-screen">
                <Navbar />
                <div className="flex flex-col items-center justify-center h-[70vh] text-white">
                    <h1 className="text-4xl font-bold mb-4">Blog Not Found</h1>
                    <p className="text-secondary mb-8">The article you're looking for doesn't exist.</p>
                    <Link to="/blog" className="bg-violet-600 hover:bg-violet-700 px-6 py-3 rounded-lg transition-colors">
                        ← Back to Blogs
                    </Link>
                </div>
            </div>
        );
    }

    const metaDescription = blog.excerpt || blog.content.substring(0, 150).replace(/<[^>]+>/g, '');

    return (
        <>
            <Helmet>
                <title>{blog.title} | Abhimanyu Raj</title>
                <meta name="description" content={metaDescription} />
                <meta property="og:title" content={blog.title} />
                <meta property="og:description" content={metaDescription} />
                {blog.cover_image && <meta property="og:image" content={blog.cover_image} />}
            </Helmet>

            <div className="bg-primary min-h-screen">
                <Navbar />

                {/* Cover Image */}
                {blog.cover_image && (
                    <div className="w-full h-[400px] relative">
                        <img
                            src={blog.cover_image}
                            alt={blog.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent"></div>
                    </div>
                )}

                <main className={`max-w-4xl mx-auto px-6 ${blog.cover_image ? '-mt-32 relative z-10' : 'pt-32'}`}>
                    {/* Back Button */}
                    <Link
                        to="/blog"
                        className="inline-flex items-center gap-2 text-secondary hover:text-white transition-colors mb-8"
                    >
                        <ArrowLeft size={18} /> Back to Blogs
                    </Link>

                    {/* Title */}
                    <h1 className="text-white font-black md:text-[50px] sm:text-[40px] text-[30px] leading-tight mb-6">
                        {blog.title}
                    </h1>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-4 mb-8 text-secondary text-sm">
                        <span className="flex items-center gap-2">
                            <Calendar size={16} />
                            {new Date(blog.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </span>
                        <span className="flex items-center gap-2">
                            <Clock size={16} />
                            {blog.reading_time || 5} min read
                        </span>
                        {blog.category && (
                            <span className="flex items-center gap-2">
                                <Folder size={16} />
                                <span className="bg-violet-600/20 text-violet-400 px-2 py-0.5 rounded">
                                    {blog.category}
                                </span>
                            </span>
                        )}
                    </div>

                    {/* Tags */}
                    {blog.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-10">
                            {blog.tags.map((tag, i) => (
                                <span
                                    key={i}
                                    className="flex items-center gap-1 bg-tertiary text-secondary px-3 py-1.5 rounded-full text-sm"
                                >
                                    <Tag size={14} /> {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Excerpt */}
                    {blog.excerpt && (
                        <p className="text-xl text-secondary italic border-l-4 border-violet-600 pl-6 mb-10">
                            {blog.excerpt}
                        </p>
                    )}

                    {/* Content */}
                    <article
                        dir="ltr"
                        style={{ direction: 'ltr', textAlign: 'left', unicodeBidi: 'embed' }}
                        className="prose prose-lg prose-invert max-w-none 
                            prose-headings:text-white prose-headings:font-bold
                            prose-p:text-white-100 prose-p:leading-relaxed
                            prose-a:text-violet-400 prose-a:no-underline hover:prose-a:underline
                            prose-strong:text-white
                            prose-code:bg-tertiary prose-code:px-2 prose-code:py-1 prose-code:rounded
                            prose-pre:bg-tertiary prose-pre:rounded-xl
                            prose-img:rounded-xl prose-img:shadow-lg
                            prose-blockquote:border-violet-600 prose-blockquote:bg-tertiary/50 prose-blockquote:rounded-r-xl prose-blockquote:py-1
                            prose-table:overflow-hidden prose-table:rounded-xl
                            prose-th:bg-tertiary prose-th:text-white
                            prose-td:border-gray-700
                            pb-20"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />

                    {/* Share Section */}
                    <div className="border-t border-gray-800 pt-10 pb-20">
                        <p className="text-secondary mb-4">Share this article:</p>
                        <div className="flex gap-4">
                            <a
                                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(window.location.href)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#1DA1F2] hover:bg-[#1a8cd8] px-4 py-2 rounded-lg text-white transition-colors"
                            >
                                Twitter
                            </a>
                            <a
                                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#0A66C2] hover:bg-[#094d92] px-4 py-2 rounded-lg text-white transition-colors"
                            >
                                LinkedIn
                            </a>
                            <a
                                href={`https://wa.me/?text=${encodeURIComponent(blog.title + ' ' + window.location.href)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#25D366] hover:bg-[#1fb855] px-4 py-2 rounded-lg text-white transition-colors"
                            >
                                WhatsApp
                            </a>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
};

export default BlogDetails;

