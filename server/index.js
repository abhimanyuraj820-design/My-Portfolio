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
        const limit = parseInt(req.query.limit) || undefined;
        const contacts = await prisma.contactMessage.findMany({
            orderBy: { created_at: 'desc' },
            take: limit,
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
        const { isRead } = req.body;
        const data = {};
        if (isRead !== undefined) data.isRead = isRead;

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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
