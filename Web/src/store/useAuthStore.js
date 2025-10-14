import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_BACKENDURL;

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: false,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        if (get().isCheckingAuth) {
            console.log('Auth check already in progress, skipping...');
            return;
        }

        console.log('Starting auth check...');
        set({ isCheckingAuth: true });
        
        try {
            const res = await axiosInstance.get("/auth/check");
            console.log('Auth check successful:', res.data);
            
            set({ 
                authUser: res.data,
                isCheckingAuth: false 
            });
            
            get().connectSocket();
        } catch (error) {
            console.log("Auth check failed:", error.response?.data || error.message);
            set({ 
                authUser: null,
                isCheckingAuth: false 
            });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            console.log('Signup response:', res.data);
            
            set({ 
                authUser: res.data,
                isSigningUp: false 
            });
            
            toast.success("Account created successfully");
            get().connectSocket();
        } catch (error) {
            console.log('Signup error:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Signup failed");
            set({ isSigningUp: false });
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            console.log('Login response:', res.data);
            
            set({ 
                authUser: res.data,
                isLoggingIn: false 
            });
            
            toast.success("Logged in successfully");
            get().connectSocket();
        } catch (error) {
            console.log('Login error:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Login failed");
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
        } catch (error) {
            console.log('Logout error:', error);
        } finally {
            set({ 
                authUser: null, 
                onlineUsers: [] 
            });
            toast.success("Logged out successfully");
            get().disconnectSocket();
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ 
                authUser: res.data,
                isUpdatingProfile: false 
            });
            toast.success("Profile updated successfully");
        } catch (error) {
            console.log("Update profile failed:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Profile update failed");
            set({ isUpdatingProfile: false });
        }
    },

    connectSocket: () => {
        const { authUser } = get();
        if (!authUser) {
            console.log('No auth user, skipping socket connection');
            return;
        }

        if (get().socket?.connected) {
            console.log('Socket already connected');
            return;
        }

        console.log('Connecting socket for user:', authUser._id);
        
        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id,
            },
        });

        socket.on("connect", () => {
            console.log('Socket connected successfully');
        });

        socket.on("connect_error", (error) => {
            console.log('Socket connection error:', error);
        });

        socket.on("getOnlineUsers", (userIds) => {
            console.log('Online users updated:', userIds);
            set({ onlineUsers: userIds });
        });

        set({ socket });
    },

    disconnectSocket: () => {
        const socket = get().socket;
        if (socket?.connected) {
            console.log('Disconnecting socket');
            socket.disconnect();
        }
        set({ socket: null });
    },
}));
