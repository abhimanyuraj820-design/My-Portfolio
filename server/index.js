import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Access denied' });
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

// --- AUTH ROUTES ---
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, email: user.email } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ user: { id: user.id, email: user.email } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- BLOG ROUTES ---
app.get('/api/blogs', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || undefined;
        const blogs = await prisma.blog.findMany({
            orderBy: { created_at: 'desc' },
            take: limit,
        });
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/blogs/:id', async (req, res) => {
    try {
        const blog = await prisma.blog.findUnique({ where: { id: req.params.id } });
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        res.json(blog);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/blogs', authMiddleware, async (req, res) => {
    try {
        const { title, slug, excerpt, content, cover_image, category, tags, reading_time, published, featured } = req.body;
        const blog = await prisma.blog.create({
            data: {
                title,
                slug,
                excerpt: excerpt || null,
                content,
                cover_image: cover_image || null,
                category: category || null,
                tags: tags || [],
                reading_time: reading_time || 5,
                published: published || false,
                featured: featured || false,
            }
        });

        await prisma.systemLog.create({
            data: { action: "Created Blog", details: `Created blog: ${title}` }
        });

        res.status(201).json(blog);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/blogs/:id', authMiddleware, async (req, res) => {
    try {
        const { title, slug, excerpt, content, cover_image, category, tags, reading_time, published, featured } = req.body;
        const data = {};
        if (title !== undefined) data.title = title;
        if (slug !== undefined) data.slug = slug;
        if (excerpt !== undefined) data.excerpt = excerpt;
        if (content !== undefined) data.content = content;
        if (cover_image !== undefined) data.cover_image = cover_image;
        if (category !== undefined) data.category = category;
        if (tags !== undefined) data.tags = tags;
        if (reading_time !== undefined) data.reading_time = reading_time;
        if (published !== undefined) data.published = published;
        if (featured !== undefined) data.featured = featured;

        const blog = await prisma.blog.update({
            where: { id: req.params.id },
            data,
        });
        res.json(blog);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/blogs/:id', authMiddleware, async (req, res) => {
    try {
        await prisma.blog.delete({ where: { id: req.params.id } });
        res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- TESTIMONIAL ROUTES ---
app.get('/api/testimonials', async (req, res) => {
    try {
        const testimonials = await prisma.testimonial.findMany({
            orderBy: { created_at: 'desc' },
        });
        res.json(testimonials);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/testimonials', async (req, res) => {
    try {
        const { name, designation, company, image, message, rating, isApproved } = req.body;
        const testimonial = await prisma.testimonial.create({
            data: {
                name,
                designation: designation || '',
                company: company || null,
                image: image || null,
                message,
                rating: rating || 5,
                isApproved: isApproved || false,
            }
        });
        res.status(201).json(testimonial);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/testimonials/:id', authMiddleware, async (req, res) => {
    try {
        const { name, designation, company, image, message, rating, isApproved } = req.body;
        const data = {};
        if (name !== undefined) data.name = name;
        if (designation !== undefined) data.designation = designation;
        if (company !== undefined) data.company = company;
        if (image !== undefined) data.image = image;
        if (message !== undefined) data.message = message;
        if (rating !== undefined) data.rating = rating;
        if (isApproved !== undefined) data.isApproved = isApproved;

        const testimonial = await prisma.testimonial.update({
            where: { id: req.params.id },
            data,
        });
        res.json(testimonial);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/testimonials/:id', authMiddleware, async (req, res) => {
    try {
        await prisma.testimonial.delete({ where: { id: req.params.id } });
        res.json({ message: 'Testimonial deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- CONTACT ROUTES ---
app.get('/api/contacts', authMiddleware, async (req, res) => {
    try {
        const { status, priority, search, sort, order, limit: lim } = req.query;
        const where = {};

        if (status && status !== 'all') where.status = status;
        if (priority && priority !== 'all') where.priority = priority;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { subject: { contains: search, mode: 'insensitive' } },
                { message: { contains: search, mode: 'insensitive' } },
            ];
        }

        const orderBy = {};
        if (sort === 'priority') {
            // manual sort later
        } else if (sort === 'budget') {
            orderBy.budget = order === 'asc' ? 'asc' : 'desc';
        } else {
            orderBy.created_at = order === 'asc' ? 'asc' : 'desc';
        }

        const contacts = await prisma.contactMessage.findMany({
            where,
            orderBy: sort !== 'priority' ? orderBy : { created_at: 'desc' },
            take: lim ? parseInt(lim) : undefined,
        });
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/contacts', async (req, res) => {
    try {
        const { name, email, mobile, subject, budget, message } = req.body;
        const contact = await prisma.contactMessage.create({
            data: {
                name,
                email,
                mobile: mobile || null,
                subject: subject || null,
                budget: budget || null,
                message,
            }
        });
        res.status(201).json(contact);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/contacts/:id', authMiddleware, async (req, res) => {
    try {
        const { isRead, status, priority, notes, quotedPrice, paidAmount, paymentStatus } = req.body;
        const data = {};
        if (isRead !== undefined) data.isRead = isRead;
        if (status !== undefined) data.status = status;
        if (priority !== undefined) data.priority = priority;
        if (notes !== undefined) data.notes = notes;
        if (quotedPrice !== undefined) data.quotedPrice = quotedPrice;
        if (paidAmount !== undefined) data.paidAmount = paidAmount;
        if (paymentStatus !== undefined) data.paymentStatus = paymentStatus;

        const contact = await prisma.contactMessage.update({
            where: { id: req.params.id },
            data,
        });
        res.json(contact);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/contacts/:id', authMiddleware, async (req, res) => {
    try {
        await prisma.contactMessage.delete({ where: { id: req.params.id } });
        res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- DASHBOARD STATS (optimized single endpoint) ---
app.get('/api/dashboard/stats', authMiddleware, async (req, res) => {
    try {
        const [blogs, testimonials, contacts] = await Promise.all([
            prisma.blog.findMany({ orderBy: { created_at: 'desc' } }),
            prisma.testimonial.findMany({ orderBy: { created_at: 'desc' } }),
            prisma.contactMessage.findMany({ orderBy: { created_at: 'desc' } }),
        ]);

        const avgRating = testimonials.length > 0
            ? (testimonials.reduce((sum, t) => sum + (t.rating || 5), 0) / testimonials.length).toFixed(1)
            : '0.0';

        const statusBreakdown = { pending: 0, in_progress: 0, completed: 0, rejected: 0 };
        let totalQuoted = 0, totalPaid = 0;
        const paymentBreakdown = { unpaid: 0, partial: 0, paid: 0 };

        contacts.forEach(c => {
            statusBreakdown[c.status] = (statusBreakdown[c.status] || 0) + 1;
            if (c.quotedPrice) totalQuoted += parseFloat(c.quotedPrice) || 0;
            if (c.paidAmount) totalPaid += parseFloat(c.paidAmount) || 0;
            paymentBreakdown[c.paymentStatus] = (paymentBreakdown[c.paymentStatus] || 0) + 1;
        });

        const serviceBreakdown = {};
        contacts.forEach(c => {
            const svc = c.subject || 'Other';
            serviceBreakdown[svc] = (serviceBreakdown[svc] || 0) + 1;
        });

        res.json({
            blogs: {
                total: blogs.length,
                published: blogs.filter(b => b.published).length,
                draft: blogs.filter(b => !b.published).length,
                featured: blogs.filter(b => b.featured).length,
                recent: blogs.slice(0, 3),
            },
            testimonials: {
                total: testimonials.length,
                approved: testimonials.filter(t => t.isApproved).length,
                pending: testimonials.filter(t => !t.isApproved).length,
                avgRating: parseFloat(avgRating),
            },
            contacts: {
                total: contacts.length,
                unread: contacts.filter(c => !c.isRead).length,
                read: contacts.filter(c => c.isRead).length,
                recent: contacts.slice(0, 5),
                statusBreakdown,
                paymentBreakdown,
                totalQuoted,
                totalPaid,
                serviceBreakdown,
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- SEO ROUTES ---
app.get('/api/seo', async (req, res) => {
    try {
        const records = await prisma.sEOMetadata.findMany({
            orderBy: { lastUpdated: 'desc' }
        });
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/seo/:pageRoute', async (req, res) => {
    try {
        const { pageRoute } = req.params;
        const record = await prisma.sEOMetadata.findUnique({
            where: { pageRoute: decodeURIComponent(pageRoute) }
        });
        if (!record) return res.status(404).json({ error: 'SEO record not found' });
        res.json(record);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/seo', authMiddleware, async (req, res) => {
    try {
        const { pageRoute, metaTitle, metaDescription, keywords, ogImage, ogType, twitterCard, canonicalUrl, author, robots, structuredData } = req.body;
        const newRecord = await prisma.sEOMetadata.create({
            data: {
                pageRoute,
                metaTitle,
                metaDescription,
                keywords,
                ogImage,
                ogType,
                twitterCard,
                canonicalUrl,
                author,
                robots,
                structuredData
            }
        });
        res.json(newRecord);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/seo/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { pageRoute, metaTitle, metaDescription, keywords, ogImage, ogType, twitterCard, canonicalUrl, author, robots, structuredData } = req.body;
        const updatedRecord = await prisma.sEOMetadata.update({
            where: { id },
            data: {
                pageRoute,
                metaTitle,
                metaDescription,
                keywords,
                ogImage,
                ogType,
                twitterCard,
                canonicalUrl,
                author,
                robots,
                structuredData
            }
        });
        res.json(updatedRecord);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/seo/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.sEOMetadata.delete({ where: { id } });
        res.json({ message: 'SEO record deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- PROJECT ROUTES ---

// GET /api/projects/featured – top 3 featured projects sorted by priorityOrder.
// Must be declared BEFORE /api/projects/:id (if added later) to avoid route shadowing.
app.get('/api/projects/featured', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 3;
        const projects = await prisma.project.findMany({
            where: { isFeatured: true },
            orderBy: [{ priorityOrder: 'desc' }, { createdAt: 'desc' }],
            take: limit,
        });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/projects', async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            orderBy: [{ priorityOrder: 'desc' }, { createdAt: 'desc' }],
        });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/projects', authMiddleware, async (req, res) => {
    try {
        const data = req.body;
        const project = await prisma.project.create({ data });
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/projects/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const project = await prisma.project.update({
            where: { id },
            data,
        });
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/projects/:id', authMiddleware, async (req, res) => {
    try {
        await prisma.project.delete({ where: { id: req.params.id } });
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- SKILL ROUTES ---
app.get('/api/skills', async (req, res) => {
    try {
        const skills = await prisma.skill.findMany({
            orderBy: { proficiency: 'desc' },
        });
        res.json(skills);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/skills', authMiddleware, async (req, res) => {
    try {
        const data = req.body;
        const skill = await prisma.skill.create({ data });
        res.status(201).json(skill);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/skills/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const skill = await prisma.skill.update({
            where: { id },
            data,
        });
        res.json(skill);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/skills/:id', authMiddleware, async (req, res) => {
    try {
        await prisma.skill.delete({ where: { id: req.params.id } });
        res.json({ message: 'Skill deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- SETTINGS ROUTES ---
app.get('/api/settings', async (req, res) => {
    try {
        let settings = await prisma.profileSettings.findFirst();
        if (!settings) {
            settings = await prisma.profileSettings.create({
                data: {} // Uses schema defaults
            });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/settings', authMiddleware, async (req, res) => {
    try {
        const { fullName, headline, bio, avatarUrl, resumeUrl, isAvailableForWork, socialLinks, contactEmail, whatsappNumber } = req.body;

        // Find existing settings
        let settings = await prisma.profileSettings.findFirst();

        if (!settings) {
            settings = await prisma.profileSettings.create({
                data: { fullName, headline, bio, avatarUrl, resumeUrl, isAvailableForWork, socialLinks, contactEmail, whatsappNumber }
            });
        } else {
            settings = await prisma.profileSettings.update({
                where: { id: settings.id },
                data: { fullName, headline, bio, avatarUrl, resumeUrl, isAvailableForWork, socialLinks, contactEmail, whatsappNumber }
            });
        }

        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- SERVICE ROUTES ---
app.get('/api/services', async (req, res) => {
    try {
        const services = await prisma.service.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(services);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/services', authMiddleware, async (req, res) => {
    try {
        const { title, description, price, features, deliveryTime, icon } = req.body;
        const service = await prisma.service.create({
            data: { title, description, price: parseFloat(price), features: features || [], deliveryTime, icon: icon || null }
        });
        res.status(201).json(service);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/services/:id', authMiddleware, async (req, res) => {
    try {
        const { title, description, price, features, deliveryTime, icon } = req.body;
        const data = {};
        if (title !== undefined) data.title = title;
        if (description !== undefined) data.description = description;
        if (price !== undefined) data.price = parseFloat(price);
        if (features !== undefined) data.features = features;
        if (deliveryTime !== undefined) data.deliveryTime = deliveryTime;
        if (icon !== undefined) data.icon = icon;
        const service = await prisma.service.update({ where: { id: req.params.id }, data });
        res.json(service);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/services/:id', authMiddleware, async (req, res) => {
    try {
        await prisma.service.delete({ where: { id: req.params.id } });
        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- INVOICE ROUTES ---
app.get('/api/invoices', authMiddleware, async (req, res) => {
    try {
        const invoices = await prisma.invoice.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/invoices/:id', authMiddleware, async (req, res) => {
    try {
        const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id } });
        if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/invoices', authMiddleware, async (req, res) => {
    try {
        const { invoiceNumber, clientName, clientEmail, items, totalAmount, status, date, dueDate } = req.body;
        const invoice = await prisma.invoice.create({
            data: {
                invoiceNumber,
                clientName,
                clientEmail,
                items: items,
                totalAmount: parseFloat(totalAmount),
                status: status || 'Pending',
                date: date ? new Date(date) : new Date(),
                dueDate: new Date(dueDate),
            }
        });
        res.status(201).json(invoice);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/invoices/:id', authMiddleware, async (req, res) => {
    try {
        const { clientName, clientEmail, items, totalAmount, status, dueDate } = req.body;
        const data = {};
        if (clientName !== undefined) data.clientName = clientName;
        if (clientEmail !== undefined) data.clientEmail = clientEmail;
        if (items !== undefined) data.items = items;
        if (totalAmount !== undefined) data.totalAmount = parseFloat(totalAmount);
        if (status !== undefined) data.status = status;
        if (dueDate !== undefined) data.dueDate = new Date(dueDate);
        const invoice = await prisma.invoice.update({ where: { id: req.params.id }, data });
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/invoices/:id', authMiddleware, async (req, res) => {
    try {
        await prisma.invoice.delete({ where: { id: req.params.id } });
        res.json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ANALYTICS ROUTES ---
app.get('/api/analytics', authMiddleware, async (req, res) => {
    try {
        // Fetch last 30 days of data (placeholder logic for simplicity)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        let traffic = await prisma.analyticsData.findMany({
            where: { date: { gte: thirtyDaysAgo } },
            orderBy: { date: 'asc' }
        });

        // Initialize empty mock data array
        let mockData = [];

        // If we don't have 30 days of data, pad the beginning with mock data to keep the chart full
        if (traffic.length < 30) {
            const existingDates = traffic.map(t => new Date(t.date).toDateString());
            for (let i = 30; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                if (!existingDates.includes(d.toDateString())) {
                    mockData.push({
                        date: d,
                        views: Math.floor(Math.random() * 50) + 10, // lowered fake numbers so real spikes are visible
                        uniqueVisitors: Math.floor(Math.random() * 30) + 5,
                    });
                }
            }
        }

        // Combine mock data (oldest) with real DB traffic (newest) and sort by date
        traffic = [...mockData, ...traffic].sort((a, b) => new Date(a.date) - new Date(b.date));

        // Aggregate device data globally or from recent records
        const deviceData = [
            { name: 'Mobile', value: 400 },
            { name: 'Desktop', value: 300 },
            { name: 'Tablet', value: 300 },
        ];

        const geoData = [
            { name: 'United States', value: 35 },
            { name: 'India', value: 25 },
            { name: 'United Kingdom', value: 15 },
            { name: 'Germany', value: 10 },
            { name: 'Canada', value: 15 },
        ];

        // Simulate real-time active users
        const activeUsers = Math.floor(Math.random() * 50) + 10;

        res.json({
            traffic,
            deviceData,
            geoData,
            activeUsers
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- TRACKING ENDPOINT (PUBLIC) ---
app.post('/api/track/view', async (req, res) => {
    try {
        // We track daily generic views
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let record = await prisma.analyticsData.findUnique({
            where: { date: today }
        });

        if (record) {
            record = await prisma.analyticsData.update({
                where: { date: today },
                data: {
                    views: { increment: 1 },
                    // In a real app we'd track IPs/cookies for uniqueVisitors increment, but we'll simulate a 1 in 3 chance of it being unique
                    uniqueVisitors: Math.random() > 0.66 ? { increment: 1 } : undefined
                }
            });
        } else {
            record = await prisma.analyticsData.create({
                data: {
                    date: today,
                    views: 1,
                    uniqueVisitors: 1
                }
            });
        }
        res.status(200).json({ success: true, record });
    } catch (error) {
        // Fail silently so we don't break the user's page load
        console.error("Tracking Error:", error);
        res.status(200).json({ success: false });
    }
});

// --- SERVICES ROUTES ---
app.get('/api/services', async (req, res) => {
    try {
        const services = await prisma.service.findMany({
            orderBy: { priorityOrder: 'desc' }
        });
        res.json(services);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/services', authMiddleware, async (req, res) => {
    try {
        const { title, description, price, features, deliveryTime, icon, status, priorityOrder } = req.body;
        const service = await prisma.service.create({
            data: { title, description, price, features, deliveryTime, icon, status, priorityOrder }
        });

        await prisma.systemLog.create({
            data: { action: "Created Service", details: `Added package: ${title}` }
        });

        res.status(201).json(service);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/services/:id', authMiddleware, async (req, res) => {
    try {
        const { title, description, price, features, deliveryTime, icon, status, priorityOrder } = req.body;
        const service = await prisma.service.update({
            where: { id: req.params.id },
            data: { title, description, price, features, deliveryTime, icon, status, priorityOrder }
        });

        await prisma.systemLog.create({
            data: { action: "Updated Service", details: `Modified package: ${title}` }
        });

        res.json(service);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/services/:id', authMiddleware, async (req, res) => {
    try {
        const svc = await prisma.service.findUnique({ where: { id: req.params.id } });
        await prisma.service.delete({ where: { id: req.params.id } });

        await prisma.systemLog.create({
            data: { action: "Deleted Service", details: `Removed package: ${svc?.title || req.params.id}` }
        });

        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- SUBSCRIBERS ROUTES ---
app.get('/api/subscribers', authMiddleware, async (req, res) => {
    try {
        const subscribers = await prisma.subscriber.findMany({
            orderBy: { subscribedAt: 'desc' }
        });
        res.json(subscribers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/subscribers', authMiddleware, async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email is required" });

        const existing = await prisma.subscriber.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ error: "Already subscribed" });

        const sub = await prisma.subscriber.create({
            data: { email }
        });

        // Log action
        await prisma.systemLog.create({
            data: { action: "Added Subscriber", details: `Manually added ${email}` }
        });

        res.status(201).json(sub);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/subscribers/:id', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const sub = await prisma.subscriber.update({
            where: { id: req.params.id },
            data: { status }
        });

        await prisma.systemLog.create({
            data: { action: "Updated Subscriber", details: `Changed status to ${status} for ${sub.email}` }
        });

        res.json(sub);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- SYSTEM LOGS ROUTES ---
app.get('/api/systemLogs', authMiddleware, async (req, res) => {
    try {
        const logs = await prisma.systemLog.findMany({
            orderBy: { timestamp: 'desc' },
            take: 50
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

export default app;
