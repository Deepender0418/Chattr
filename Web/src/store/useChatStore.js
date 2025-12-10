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
    isLoadingMore: false,
    hasMore: true,
    nextCursor: null,

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

    loadMessages: async (userId, cursor = null) => {
        const isInitial = !cursor;

        if (isInitial) {
            set({ isMessagesLoading: true, hasMore: true, nextCursor: null, messages: [] });
        } else {
            set({ isLoadingMore: true });
        }

        try {
            const res = await axiosInstance.get(`/messages/${userId}`, {
                params: { cursor, limit: 20 },
            });

            const { messages: newMessages = [], hasMore, nextCursor } = res.data;
            const current = get().messages;

            set({
                messages: isInitial ? newMessages : [...newMessages, ...current],
                hasMore: Boolean(hasMore),
                nextCursor: nextCursor || null,
                isMessagesLoading: false,
                isLoadingMore: false,
            });
        } catch (error) {
            console.log('Get messages error:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Failed to load messages");
            set({ isMessagesLoading: false, isLoadingMore: false });
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

        socket.off("newMessage");
        socket.off("messagesSeen");

        socket.on("newMessage", (newMessage) => {
            const { selectedUser, messages } = get();
            if (!selectedUser) return;

            const isSameChat =
                newMessage.senderId === selectedUser._id ||
                newMessage.receiverId === selectedUser._id;
            if (!isSameChat) return;

            if (messages.some((m) => m._id === newMessage._id)) return;

            set({ messages: [...messages, newMessage] });

            if (newMessage.senderId === selectedUser._id) {
                get().markMessagesAsSeen(selectedUser._id);
            }
        });

        socket.on("messagesSeen", ({ messageIds = [], userId }) => {
            const { selectedUser, messages } = get();
            if (!selectedUser || userId !== selectedUser._id) return;

            const idStrings = messageIds.map((id) => id.toString());
            const updated = messages.map((msg) =>
                idStrings.includes(msg._id?.toString())
                    ? { ...msg, seen: true, seenAt: msg.seenAt || new Date().toISOString() }
                    : msg
            );

            set({ messages: updated });
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (socket) {
            socket.off("newMessage");
            socket.off("messagesSeen");
            console.log('Unsubscribed from messages');
        }
    },

    setSelectedUser: (selectedUser) => set({ selectedUser }),

    markMessagesAsSeen: async (userId) => {
        try {
            await axiosInstance.post(`/messages/${userId}/mark-seen`);
        } catch (error) {
            console.log('Mark seen error:', error.response?.data || error.message);
        }
    },
}));
