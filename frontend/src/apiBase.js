// In production, leave empty so requests go to the frontend origin
// and Vercel rewrites will proxy them to your backend.
const API_BASE =
  process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000';

export default API_BASE;
