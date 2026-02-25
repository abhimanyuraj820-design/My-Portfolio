// During development, it will fall back to localhost:5000 if VITE_API_URL is not set.
// In production (Vercel), you MUST set VITE_API_URL in the environment variables to the full URL (e.g. https://your-domain.vercel.app)
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

export default API_BASE_URL;
