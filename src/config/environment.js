// Centralized environment config — same pattern as Angular's environment.ts
// Vite exposes env variables via import.meta.env (must be prefixed with VITE_)

export const environment = {
  production: import.meta.env.PROD,
  title: import.meta.env.VITE_APP_TITLE || 'Local Host',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5077/api/',
  noApiUrl: import.meta.env.VITE_NO_API_URL || 'http://localhost:5077',
};
