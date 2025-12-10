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
    isSendingReset: false,
    isResettingPassword: false,
    onlineUsers: [],
    socket: null,
    
    checkAuth: async () => {
        if (get().isCheckingAuth) return;

        set({ isCheckingAuth: true });

        try {
            const res = await axiosInstance.get("/auth/check");

            set({
                authUser: res.data?.data,
                isCheckingAuth: false
            });

            get().connectSocket();
        } catch (error) {
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
            toast.success(res.data.message || "Account created! Verify your email.");
            return { success: true };
        } catch (error) {
            toast.error(error.response?.data?.message || "Signup failed");
            return { success: false };
        } finally {
            set({ isSigningUp: false });
        }
    },


    login: async (data) => {
        set({ isLoggingIn: true });

        try {
            const res = await axiosInstance.post("/auth/login", data);

            set({
                authUser: res.data?.data,
                isLoggingIn: false
            });

            toast.success("Welcome back!");
            get().connectSocket();
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
        } catch {}

        set({
            authUser: null,
            onlineUsers: []
        });

        get().disconnectSocket();
        toast.success("Logged out");
    },

    sendResetEmail: async ({ email }) => {
        set({ isSendingReset: true });

        try {
            const res = await axiosInstance.post("/auth/forgot-password", { email });
            toast.success(res.data.message || "Reset link sent!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send email");
        } finally {
            set({ isSendingReset: false });
        }
    },

    resetPassword: async (token, password, confirmPassword) => {
        set({ isResettingPassword: true });

        try {
            const res = await axiosInstance.put(`/auth/reset-password/${token}`, { 
                password, 
                confirmPassword
            });
            toast.success(res.data.message || "Password reset successfully!");
            return { success: res.data?.success ?? true, message: res.data.message };
        } catch (error) {
            toast.error(error.response?.data?.message || "Password reset failed");
            return { success: false };
        } finally {
            set({ isResettingPassword: false });
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });

        try {
            const res = await axiosInstance.put("/auth/update-profile", data);

            set({
                authUser: res.data?.data,
                isUpdatingProfile: false
            });

            toast.success("Profile updated");
        } catch (error) {
            toast.error(error.response?.data?.message || "Update failed");
            set({ isUpdatingProfile: false });
        }
    },

    verifyEmailLogin: async (token) => {
        try {
            const res = await axiosInstance.get(`/auth/verify-email/${token}`);

            if (res.data?.data?.user) {
                set({ authUser: res.data.data.user });
                toast.success("Email verified! You're now logged in.");
                get().connectSocket();
            }

            return res.data;
        } catch (error) {
            return { success: false, message: "Invalid or expired link" };
        }
    },

    connectSocket: () => {
        const { authUser } = get();
        if (!authUser) return;

        if (get().socket?.connected) return;

        try {
            const socket = io(BASE_URL, {
                query: { userId: authUser._id },
                transports: ['websocket', 'polling'], // Fallback
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            });

            socket.on("connect", () => {
                console.log("Socket connected:", socket.id);
            });

            socket.on("connect_error", (error) => {
                console.error("Socket connection error:", error);
            });

            socket.on("getOnlineUsers", (userIds) => {
                set({ onlineUsers: userIds });
            });

            set({ socket });
        } catch (error) {
            console.error("Failed to connect socket:", error);
        }
    },

    disconnectSocket: () => {
        const socket = get().socket;
        if (socket?.connected) socket.disconnect();
        set({ socket: null });
    },
}));
