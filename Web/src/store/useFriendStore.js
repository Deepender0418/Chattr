import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useChatStore } from "./useChatStore";
import { useAuthStore } from "./useAuthStore";

export const useFriendStore = create((set, get) => ({
    friends: [],
    requests: [],
    searchResult: null,
    isSearching: false,
    isLoadingFriends: false,
    isLoadingRequests: false,

    fetchFriends: async () => {
        set({ isLoadingFriends: true });
        try {
            const res = await axiosInstance.get("/friends/list");
            set({ friends: res.data?.data || [] });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load friends");
        } finally {
            set({ isLoadingFriends: false });
        }
    },

    fetchRequests: async () => {
        set({ isLoadingRequests: true });
        try {
            const res = await axiosInstance.get("/friends/requests");
            set({ requests: res.data?.data || [] });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load requests");
        } finally {
            set({ isLoadingRequests: false });
        }
    },

    searchUser: async (query) => {
        if (!query) {
            set({ searchResult: null });
            return;
        }
        set({ isSearching: true });
        try {
            const res = await axiosInstance.get("/friends/search", { params: { q: query } });
            set({ searchResult: res.data?.data || null });
        } catch (error) {
            toast.error(error.response?.data?.message || "No user found");
            set({ searchResult: null });
        } finally {
            set({ isSearching: false });
        }
    },

    refreshLists: async () => {
        await Promise.all([
            get().fetchRequests(),
            get().fetchFriends(),
        ]);
        const chat = useChatStore.getState();
        chat.getUsers?.();
        const auth = useAuthStore.getState();
        auth.checkAuth?.();
    },

    sendRequest: async (target) => {
        try {
            await axiosInstance.post("/friends/request", { target });
            toast.success(`Friend request sent to "${target}"`);
            set({ searchResult: null });
            await get().refreshLists();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send request");
        }
    },

    respondRequest: async (requestId, action) => {
        try {
            await axiosInstance.post("/friends/respond", { requestId, action });
            toast.success(action === "accept" ? "Request accepted" : "Request rejected");
            await get().refreshLists();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update request");
        }
    },

    removeFriend: async (friendId) => {
        try {
            await axiosInstance.delete(`/friends/${friendId}`);
            toast.success("Friend removed");
            await get().refreshLists();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to remove friend");
        }
    },
}));

