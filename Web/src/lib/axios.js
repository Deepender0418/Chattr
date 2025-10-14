import axios from "axios";

// Use HTTPS for backend URL
const backendUrl = import.meta.env.VITE_BACKENDURL;

export const axiosInstance = axios.create({
    baseURL: `${backendUrl}/api`,
    withCredentials: true, // Essential for cookies
});

// Add debugging interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        console.log(`Making ${config.method?.toUpperCase()} request to:`, config.url);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        console.log(`Response received from:`, response.config.url);
        return response;
    },
    (error) => {
        console.log('Request failed:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.response?.data?.message
        });
        return Promise.reject(error);
    }
);
