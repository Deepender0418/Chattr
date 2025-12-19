import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState, useCallback } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { Check, CheckCheck, Loader2 } from "lucide-react";
import { useLayoutEffect } from "react";

const formatMessageDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

const isToday = (dateStr) => {
    const today = new Date();
    const date = new Date(dateStr);
    return (
        today.getFullYear() === date.getFullYear() &&
        today.getMonth() === date.getMonth() &&
        today.getDate() === date.getDate()
    );
};

const ChatContainer = () => {
    const {
        messages,
        loadMessages,
        isMessagesLoading,
        selectedUser,
        subscribeToMessages,
        unsubscribeFromMessages,
        hasMore,
        nextCursor,
        isLoadingMore,
        markMessagesAsSeen,
    } = useChatStore();

    const { authUser } = useAuthStore();

    const isInitialLoadRef = useRef(true);
    const messageEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const isNearBottomRef = useRef(true);
    const lastStickyDateRef = useRef("");
    const rafRef = useRef(false);
    const prevSelectedUserIdRef = useRef(null);

    const [stickyDate, setStickyDate] = useState("");

    /* ---------------- initial load (LATEST ONLY) ---------------- */
    useEffect(() => {
        if (!selectedUser?._id) return;

        // Reset initial load flag when switching users
        if (prevSelectedUserIdRef.current !== selectedUser._id) {
            isInitialLoadRef.current = true;
            prevSelectedUserIdRef.current = selectedUser._id;
        }

        // Load only most recent messages
        loadMessages(selectedUser._id, null, true);

        subscribeToMessages();
        return unsubscribeFromMessages;
    }, [selectedUser?._id]);

    /* ---------------- scroll to bottom on initial load ---------------- */
    useLayoutEffect(() => {
        if (!selectedUser?._id || !messagesContainerRef.current) return;

        const container = messagesContainerRef.current;
        
        if (isInitialLoadRef.current && !isMessagesLoading && messages.length > 0) {
            // Scroll to bottom instantly for initial load
            container.scrollTop = container.scrollHeight;
            isNearBottomRef.current = true;
            isInitialLoadRef.current = false;
        }
    }, [isMessagesLoading, messages.length, selectedUser?._id]);

    /* ---------------- auto scroll on new messages ---------------- */
    useEffect(() => {
        if (!messages.length || !messagesContainerRef.current || isInitialLoadRef.current) return;

        const container = messagesContainerRef.current;
        const lastMessage = messages[messages.length - 1];

        // Scroll to bottom if:
        // 1. We sent the last message
        // 2. OR we're near the bottom
        const distanceFromBottom = 
            container.scrollHeight - container.scrollTop - container.clientHeight;
        const isUserNearBottom = distanceFromBottom < 200;

        if (lastMessage.senderId === authUser._id || isUserNearBottom) {
            // Update the ref
            isNearBottomRef.current = true;
            // Scroll smoothly for new messages
            messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    /* ---------------- mark seen ---------------- */
    useEffect(() => {
        if (!selectedUser?._id) return;

        const hasUnseen = messages.some(
            (msg) => msg.senderId === selectedUser._id && !msg.seen
        );

        if (hasUnseen) markMessagesAsSeen(selectedUser._id);
    }, [messages, selectedUser]);

    /* ---------------- scroll handler (for older messages and sticky date) ---------------- */
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            if (rafRef.current) return;

            rafRef.current = true;
            requestAnimationFrame(async () => {
                rafRef.current = false;

                // Update sticky date
                const containerTop = container.getBoundingClientRect().top;
                for (const child of container.children) {
                    if (!child.dataset?.timestamp) continue;
                    const rect = child.getBoundingClientRect();
                    if (rect.bottom >= containerTop + 10) {
                        const dateStr = child.dataset.timestamp;
                        const nextDate = isToday(dateStr)
                            ? ""
                            : formatMessageDate(dateStr);
                        if (lastStickyDateRef.current !== nextDate) {
                            lastStickyDateRef.current = nextDate;
                            setStickyDate(nextDate);
                        }
                        break;
                    }
                }

                // Check if user is near bottom
                const distanceFromBottom = 
                    container.scrollHeight - container.scrollTop - container.clientHeight;
                isNearBottomRef.current = distanceFromBottom < 200;

                // Load older messages ONLY when scrolling up near the top
                if (
                    container.scrollTop <= 100 &&
                    hasMore &&
                    !isLoadingMore &&
                    !isInitialLoadRef.current &&
                    selectedUser?._id
                ) {
                    const prevHeight = container.scrollHeight;
                    
                    // Load older messages
                    await loadMessages(selectedUser._id, nextCursor, false);
                    
                    // Maintain scroll position
                    container.scrollTop = container.scrollHeight - prevHeight;
                }
            });
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, [hasMore, isLoadingMore, nextCursor, selectedUser]);

    /* ---------------- reset on user change ---------------- */
    useEffect(() => {
        // Reset sticky date when user changes
        if (selectedUser?._id) {
            setStickyDate("");
            lastStickyDateRef.current = "";
        }
    }, [selectedUser?._id]);

    /* ---------------- loading state ---------------- */
    if (isMessagesLoading && isInitialLoadRef.current) {
        return (
            <div className="flex flex-col h-full bg-base-100">
                <ChatHeader />
                <div className="flex-1 overflow-hidden">
                    <MessageSkeleton />
                </div>
                <MessageInput />
            </div>
        );
    }

    /* ---------------- render ---------------- */
    return (
        <div className="flex flex-col h-full bg-base-100 relative">
            <ChatHeader />

            {stickyDate && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 px-3 py-1 bg-base-300 text-xs sm:text-sm text-base-content/70 rounded-full shadow-md">
                    {stickyDate}
                </div>
            )}

            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 bg-base-200/10"
                style={{ overflowAnchor: "none" }} // Prevent browser auto-scroll
            >
                {isLoadingMore && (
                    <div className="flex justify-center mb-2">
                        <Loader2 className="animate-spin size-5 sm:size-6 text-primary" />
                    </div>
                )}

                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-base-content/50">
                        <p className="text-sm">No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div key={message._id} data-timestamp={message.createdAt}>
                            <div
                                className={`chat ${
                                    message.senderId === authUser._id
                                        ? "chat-end"
                                        : "chat-start"
                                }`}
                            >
                                <div className="chat-image avatar">
                                    <div className="size-8 sm:size-10 overflow-hidden rounded-full">
                                        <img
                                            src={
                                                message.senderId === authUser._id
                                                    ? authUser.profilePic || "/avatar.png"
                                                    : selectedUser.profilePic || "/avatar.png"
                                            }
                                            alt="profile"
                                        />
                                    </div>
                                </div>

                                <div className="chat-header flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                                    <span className="font-semibold">
                                        {message.senderId === authUser._id
                                            ? "You"
                                            : selectedUser.fullName}
                                    </span>
                                    <time className="opacity-60">
                                        {formatMessageTime(message.createdAt)}
                                    </time>

                                    {message.senderId === authUser._id && (
                                        <span>
                                            {message.seen ? (
                                                <CheckCheck className="size-3 sm:size-4 text-primary" />
                                            ) : (
                                                <Check className="size-3 sm:size-4" />
                                            )}
                                        </span>
                                    )}
                                </div>

                                <div
                                    className={`chat-bubble text-sm max-w-xs sm:max-w-md lg:max-w-lg whitespace-pre-wrap break-words ${
                                        message.senderId === authUser._id
                                            ? "bg-primary text-primary-content"
                                            : "bg-base-300 text-base-content"
                                    }`}
                                >
                                    {message.media && (
                                        <img
                                            src={message.media}
                                            alt="Attachment"
                                            className="max-w-full rounded"
                                            loading="lazy"
                                        />
                                    )}
                                    {message.text}
                                </div>
                            </div>
                        </div>
                    ))
                )}

                <div ref={messageEndRef} style={{ height: '1px' }} />
            </div>

            <MessageInput />
        </div>
    );
};

export default ChatContainer;
