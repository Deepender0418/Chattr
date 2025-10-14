import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
    const {
        messages,
        getMessages,
        isMessagesLoading,
        selectedUser,
        subscribeToMessages,
        unsubscribeFromMessages,
    } = useChatStore();
    const { authUser } = useAuthStore();
    const messageEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    useEffect(() => {
        getMessages(selectedUser._id);
        subscribeToMessages();

        return () => unsubscribeFromMessages();
    }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

    useEffect(() => {
        if (messageEndRef.current && messages) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

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

    return (
        <div className="flex flex-col h-full bg-base-100">
            <ChatHeader />
            
            {/* Messages container with proper scroll */}
            <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 lg:space-y-6 bg-base-200/10"
            >
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-base-content/60 px-4">
                        <div className="text-center space-y-4 max-w-2xl">
                            <div className="text-4xl lg:text-6xl">👋</div>
                            <p className="font-bold text-2xl lg:text-3xl text-base-content/80">Start a conversation</p>
                            <p className="text-base-content/60 text-lg lg:text-xl">
                                Send your first message to {selectedUser.fullName}
                            </p>
                            <div className="pt-4 text-sm lg:text-base text-base-content/40 space-y-2">
                                <p>💬 Send text messages with real-time delivery</p>
                                <p>😊 Use emojis to express yourself</p>
                                <p>🖼️ Share images and media files</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message._id}
                            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"} w-full max-w-full`}
                        >
                            <div className="chat-image avatar">
                                <div className="size-10 lg:size-12 rounded-full overflow-hidden border border-base-300">
                                    <img
                                        src={
                                            message.senderId === authUser._id
                                                ? authUser.profilePic || "/avatar.png"
                                                : selectedUser.profilePic || "/avatar.png"
                                        }
                                        alt="profile pic"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            <div className="chat-header mb-2 flex items-center gap-3">
                                <span className="text-sm lg:text-base font-semibold">
                                    {message.senderId === authUser._id ? "You" : selectedUser.fullName}
                                </span>
                                <time className="text-xs lg:text-sm opacity-60">
                                    {formatMessageTime(message.createdAt)}
                                </time>
                            </div>
                            <div 
                                className={`chat-bubble flex flex-col max-w-lg lg:max-w-2xl ${
                                    message.senderId === authUser._id 
                                        ? "bg-primary text-primary-content" 
                                        : "bg-base-300 text-base-content"
                                }`}
                            >
                                {message.image && (
                                    <img
                                        src={message.image}
                                        alt="Attachment"
                                        className="max-w-full lg:max-w-md rounded mb-3"
                                    />
                                )}
                                {message.text && (
                                    <p className="whitespace-pre-wrap text-base lg:text-lg leading-relaxed">
                                        {message.text}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                )}
                <div ref={messageEndRef} />
            </div>

            <MessageInput />
        </div>
    );
};

export default ChatContainer;
