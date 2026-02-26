// ... imports ...
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LazyMotion, domAnimation } from "framer-motion";
import { Toaster } from "sonner";
import { HelmetProvider } from "react-helmet-async";
import { Navbar, Hero, StarsCanvas, Footer } from "./components"; // Keep critical above fold components eager
import SmoothScroll from "./components/SmoothScroll";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import CommandPalette from "./components/CommandPalette";

// Lazy Load heavy components
const About = lazy(() => import("./components/About"));
const Experience = lazy(() => import("./components/Experience"));
const Tech = lazy(() => import("./components/Tech"));
const Works = lazy(() => import("./components/Works"));
const Feed = lazy(() => import("./components/Feed"));
const Contact = lazy(() => import("./components/Contact"));

const Login = lazy(() => import("./pages/admin/Login"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const ManageBlogs = lazy(() => import("./pages/admin/ManageBlogs"));
const ManageTestimonials = lazy(() => import("./pages/admin/ManageTestimonials"));
const ManageContacts = lazy(() => import("./pages/admin/ManageContacts"));
const SEOManager = lazy(() => import("./pages/admin/SEOManager"));
const ProjectDashboard = lazy(() => import("./pages/admin/ProjectDashboard"));
const TechStackDashboard = lazy(() => import("./pages/admin/TechStackDashboard"));
const SettingsDashboard = lazy(() => import("./pages/admin/SettingsDashboard"));
const Blogs = lazy(() => import("./pages/Blogs"));
const BlogDetails = lazy(() => import("./pages/BlogDetails"));
const ProtectedRoute = lazy(() => import("./components/admin/ProtectedRoute"));

// Legal Pages
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));

// Public Pages
const TestimonialsPage = lazy(() => import("./pages/TestimonialsPage"));

// Loading fallback
const PageLoader = () => (
  <div className="flex justify-center items-center w-full h-screen bg-primary">
    <div className="w-20 h-20 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

import { CommandPaletteProvider } from "./context/CommandPaletteContext";

// ...

const App = () => {
  return (
    <HelmetProvider>
      <CommandPaletteProvider>
        <AuthProvider>
          <BrowserRouter>
            <SmoothScroll>
              <LazyMotion features={domAnimation} strict>
                <div className='relative z-0 bg-primary w-full overflow-clip min-h-screen'>
                  <ErrorBoundary>
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        {/* Public Routes */}
                        <Route
                          path='/'
                          element={
                            <>
                              {/* Navbar must be OUTSIDE any z-indexed wrapper */}
                              <Navbar />
                              <div className='bg-hero-pattern bg-cover bg-no-repeat bg-center'>
                                <Hero />
                              </div>
                              <main>
                                <About />
                                <Experience />
                                <Tech />
                                <Works />
                                <Feed />
                                <div className='relative'>
                                  <Contact />
                                  <StarsCanvas />
                                </div>
                              </main>
                              <Footer />
                            </>
                          }
                        />

                        {/* Legal Routes */}
                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                        <Route path="/refund-policy" element={<RefundPolicy />} />
                        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

                        {/* Admin Routes */}
                        <Route path="/blog" element={<Blogs />} />
                        <Route path="/blog/:slug" element={<BlogDetails />} />
                        <Route path="/testimonials" element={<TestimonialsPage />} />

                        {/* Admin Routes - Hidden URL for security */}
                        <Route path="/x7k9m2p4q/login" element={<Login />} />

                        <Route path="/x7k9m2p4q" element={<ProtectedRoute />}>
                          <Route index element={<Dashboard />} />
                          <Route path="dashboard" element={<Dashboard />} />
                          <Route path="projects" element={<ProjectDashboard />} />
                          <Route path="skills" element={<TechStackDashboard />} />
                          <Route path="blogs" element={<ManageBlogs />} />
                          <Route path="testimonials" element={<ManageTestimonials />} />
                          <Route path="contacts" element={<ManageContacts />} />
                          <Route path="seo" element={<SEOManager />} />
                          <Route path="settings" element={<SettingsDashboard />} />
                        </Route>

                      </Routes>
                    </Suspense>
                  </ErrorBoundary>
                </div>
              </LazyMotion>
              <Toaster position="bottom-right" richColors />
            </SmoothScroll>
          </BrowserRouter>
        </AuthProvider>
      </CommandPaletteProvider>
    </HelmetProvider >
  );
};

export default App;
