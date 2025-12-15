import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { Check, CheckCheck, Loader2 } from "lucide-react";

const formatMessageDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { day: "numeric", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
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

    const messageEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const [stickyDate, setStickyDate] = useState("");

    useEffect(() => {
        if (!selectedUser?._id) return;

        loadMessages(selectedUser._id);
        subscribeToMessages();

        return () => unsubscribeFromMessages();
    }, [selectedUser?._id]);

    const scrollToBottom = (smooth = true) => {
        messageEndRef.current?.scrollIntoView({
            behavior: smooth ? "smooth" : "auto",
        });
    };

    useEffect(() => {
        if (!isMessagesLoading && messages.length > 0) {
            scrollToBottom(false);
        }
    }, [isMessagesLoading]);

    useEffect(() => {
        if (!selectedUser?._id) return;

        const hasUnseen = messages.some(
            (msg) => msg.senderId === selectedUser._id && !msg.seen
        );
        if (hasUnseen) markMessagesAsSeen(selectedUser._id);
    }, [messages, selectedUser]);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const handleScroll = async () => {
            if (container.scrollTop <= 50 && hasMore && !isLoadingMore && selectedUser?._id) {
                const prevHeight = container.scrollHeight;

                await loadMessages(selectedUser._id, nextCursor);

                const newHeight = container.scrollHeight;
                container.scrollTop = newHeight - prevHeight;
            }

            const children = Array.from(container.children).filter((c) =>
                c.dataset?.messageDate
            );
            for (let child of children) {
                const rect = child.getBoundingClientRect();
                if (rect.top < container.getBoundingClientRect().top + 50) {
                    setStickyDate(child.dataset.messageDate);
                }
            }
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, [hasMore, isLoadingMore, nextCursor, selectedUser, messages]);

    if (isMessagesLoading) {
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

    let lastMessageDate = null;

    return (
        <div className="flex flex-col h-full bg-base-100">
            <ChatHeader />

            {/* Sticky date */}
            {stickyDate && (
                <div className="sticky top-0 z-10 text-center bg-base-100 py-1 text-sm text-base-content/50 border-b border-base-300">
                    {stickyDate}
                </div>
            )}

            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 bg-base-200/10"
            >
                {isLoadingMore && (
                    <div className="flex justify-center mb-2">
                        <Loader2 className="animate-spin size-6 text-primary" />
                    </div>
                )}

                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-base-content/60">
                        Start a conversation with {selectedUser.fullName}
                    </div>
                ) : (
                    messages.map((message) => {
                        const messageDate = formatMessageDate(message.createdAt);
                        const showDateSeparator = messageDate !== lastMessageDate;
                        lastMessageDate = messageDate;

                        return (
                            <div key={message._id} data-message-date={messageDate}>
                                {showDateSeparator && !stickyDate && (
                                    <div className="text-center text-sm text-base-content/50 my-2">
                                        {messageDate}
                                    </div>
                                )}

                                <div
                                    className={`chat ${
                                        message.senderId === authUser._id
                                            ? "chat-end"
                                            : "chat-start"
                                    }`}
                                >
                                    <div className="chat-image avatar">
                                        <div className="size-10 rounded-full overflow-hidden">
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

                                    <div className="chat-header flex items-center gap-2">
                                        <span className="font-semibold">
                                            {message.senderId === authUser._id
                                                ? "You"
                                                : selectedUser.fullName}
                                        </span>
                                        <time className="text-xs opacity-60">
                                            {formatMessageTime(message.createdAt)}
                                        </time>

                                        {message.senderId === authUser._id && (
                                            <span>
                                                {message.seen ? (
                                                    <CheckCheck className="size-4 text-primary" />
                                                ) : (
                                                    <Check className="size-4" />
                                                )}
                                            </span>
                                        )}
                                    </div>

                                    <div
                                        className={`chat-bubble flex flex-col gap-2 max-w-lg ${
                                            message.senderId === authUser._id
                                                ? "bg-primary text-primary-content"
                                                : "bg-base-300"
                                        }`}
                                    >
                                        {message.media && (
                                            <img
                                                src={message.media}
                                                alt="Attachment"
                                                className="max-w-full rounded-lg"
                                                loading="lazy"
                                            />
                                        )}

                                        {message.text && (
                                            <p className="whitespace-pre-wrap break-words">
                                                {message.text}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}

                <div ref={messageEndRef} />
            </div>

            <MessageInput />
        </div>
    );
};

export default ChatContainer;
