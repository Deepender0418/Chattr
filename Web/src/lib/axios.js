import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKENDURL;

export const axiosInstance = axios.create({
    baseURL: `${backendUrl}/api`,
    withCredentials: true,
});
