import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

const PAGE_SIZE = 20;

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
        } catch (err) {
            toast.error("Failed to load users");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    loadMessages: async (userId, cursor = null) => {
        const { isLoadingMore, isMessagesLoading } = get();
        const isInitial = !cursor;

        if (isInitial && isMessagesLoading) return;
        if (!isInitial && isLoadingMore) return;

        isInitial
            ? set({ isMessagesLoading: true })
            : set({ isLoadingMore: true });

        try {
            const res = await axiosInstance.get(`/messages/${userId}`, {
                params: { cursor, limit: PAGE_SIZE },
            });

            const { messages: newMessages, hasMore, nextCursor } = res.data;

            set((state) => ({
                messages: isInitial
                    ? newMessages
                    : [...newMessages, ...state.messages],
                hasMore,
                nextCursor,
                isMessagesLoading: false,
                isLoadingMore: false,
            }));
        } catch (err) {
            toast.error("Failed to load messages");
            set({ isMessagesLoading: false, isLoadingMore: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser } = get();
        try {
            const res = await axiosInstance.post(
                `/messages/send/${selectedUser._id}`,
                messageData
            );

            set((state) => ({
                messages: [...state.messages, res.data],
            }));
        } catch {
            toast.error("Failed to send message");
        }
    },

    subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.off("newMessage");
        socket.off("messagesSeen");

        socket.on("newMessage", (newMessage) => {
            const { selectedUser } = get();
            if (
                !selectedUser ||
                ![newMessage.senderId, newMessage.receiverId].includes(
                    selectedUser._id
                )
            )
                return;

            set((state) => {
                if (state.messages.some((m) => m._id === newMessage._id))
                    return state;

                return { messages: [...state.messages, newMessage] };
            });

            if (newMessage.senderId === selectedUser._id) {
                get().markMessagesAsSeen(selectedUser._id);
            }
        });

        socket.on("messagesSeen", ({ messageIds, userId }) => {
            const { selectedUser } = get();
            if (!selectedUser || userId !== selectedUser._id) return;

            set((state) => ({
                messages: state.messages.map((msg) =>
                    messageIds.includes(msg._id)
                        ? { ...msg, seen: true }
                        : msg
                ),
            }));
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket?.off("newMessage");
        socket?.off("messagesSeen");
    },

    setSelectedUser: (selectedUser) =>
        set({
            selectedUser,
            messages: [],
            nextCursor: null,
            hasMore: true,
        }),

    markMessagesAsSeen: async (userId) => {
        try {
            await axiosInstance.post(`/messages/${userId}/mark-seen`);
        } catch {}
    },
}));
