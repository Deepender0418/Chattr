import axios from "axios";

export const axiosInstance = axios.create({
    // baseURL: `${import.meta.env.BACKENDURL}/api`,
    baseURL: "https://chattr-backend-5hv9.onrender.com/api",
    withCredentials: true,
});
