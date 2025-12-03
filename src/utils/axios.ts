import axios from "axios";

const API = axios.create({
    // baseURL: 'http://localhost:5000/api',
    baseURL: `${process.env.NEXT_PUBLIC_BACKEND}`,
    withCredentials:true,
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