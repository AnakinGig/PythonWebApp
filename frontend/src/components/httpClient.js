import axios from "axios";
import Cookies from "js-cookie";

const httpClient = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL || "http://localhost:5000",
    withCredentials: true
});

httpClient.interceptors.request.use(function (config) {
    const csrfToken = Cookies.get('csrf_token');
    if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
    }
    return config;
});

// Response interceptor to handle 401 errors silently for current-user endpoint
httpClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Suppress 401 errors for current-user endpoint (expected when not logged in)
        if (error.config?.url?.includes('/current-user') && error.response?.status === 401) {
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

export default httpClient;