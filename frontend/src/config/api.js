const rawApiBaseUrl = process.env.REACT_APP_API_BASE_URL;

if (!rawApiBaseUrl) {
  throw new Error('Missing REACT_APP_API_BASE_URL. Set it in frontend/.env or in your deployment environment.');
}

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, '');
