import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Response interceptor - handle 401 and auto-refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && error.response?.data?.expired && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
                return api(originalRequest);
            } catch (refreshError) {
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
