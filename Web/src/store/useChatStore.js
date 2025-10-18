import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/users");
            set({ users: res.data });
        } catch (error) {
            console.log('Get users error:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Failed to load users");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            console.log('Get messages error:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Failed to load messages");
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({ messages: [...messages, res.data] });
        } catch (error) {
            console.log('Send message error:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Failed to send message");
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) {
            console.log('No selected user for message subscription');
            return;
        }

        const socket = useAuthStore.getState().socket;
        if (!socket) {
            console.log('No socket available for message subscription');
            return;
        }

        console.log('Subscribing to messages for user:', selectedUser._id);

        socket.on("newMessage", (newMessage) => {
            console.log('New message received:', newMessage);
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
            if (!isMessageSentFromSelectedUser) return;

            set({
                messages: [...get().messages, newMessage],
            });
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (socket) {
            socket.off("newMessage");
            console.log('Unsubscribed from messages');
        }
    },

    setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
