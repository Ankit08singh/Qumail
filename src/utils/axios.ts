import axios from "axios";

const API = axios.create({
    // baseURL: 'http://localhost:5000/api',
    baseURL: `${process.env.NEXT_PUBLIC_BACKEND}`,
    withCredentials:true,
});

// Add Authorization header with NextAuth JWT token and provider info
API.interceptors.request.use(async (config) => {
    try {
        // Get the JWT token from our custom endpoint
        const tokenResponse = await fetch('/api/auth/token', {
            credentials: 'include' // Important: include cookies
        });
        
        if (tokenResponse.ok) {
            const data = await tokenResponse.json();
            if (data.token) {
                config.headers.Authorization = `Bearer ${data.token}`;
            }
            // Pass provider info to backend (use lowercase to avoid CORS issues)
            if (data.provider) {
                config.headers['x-provider'] = data.provider;
            }
            // Pass user email to backend
            if (data.email) {
                config.headers['x-user-email'] = data.email;
            }
        }
    } catch (error) {
        console.error('Failed to get JWT token:', error);
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

API.interceptors.response.use((response) => {
    return response;
},(error) => {
    if(error.response?.status === 401) {
        window.location.href = '/login';
    }
    return Promise.reject(error);
});

export default API;