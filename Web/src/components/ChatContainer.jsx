import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

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
            <div className="flex-1 flex flex-col overflow-auto bg-base-100">
                <ChatHeader />
                <div className="flex-1 bg-base-200/30">
                    <MessageSkeleton />
                </div>
                <MessageInput />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-auto bg-base-100">
            <ChatHeader />
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-200/30">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-base-content/60">
                        <div className="text-center space-y-2">
                            <div className="text-4xl">👋</div>
                            <p className="font-medium">Start a conversation</p>
                            <p className="text-sm">Send your first message to {selectedUser.fullName}</p>
                        </div>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message._id}
                            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
                        >
                            <div className="chat-image avatar">
                                <div className="size-10 rounded-full border-2 border-base-300">
                                    <img
                                        src={
                                            message.senderId === authUser._id
                                                ? authUser.profilePic || "/avatar.png"
                                                : selectedUser.profilePic || "/avatar.png"
                                        }
                                        alt="profile pic"
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                            <div className="chat-header mb-1 flex items-center gap-2">
                                <span className="text-xs font-medium">
                                    {message.senderId === authUser._id ? "You" : selectedUser.fullName}
                                </span>
                                <time className="text-xs opacity-50">
                                    {formatMessageTime(message.createdAt)}
                                </time>
                            </div>
                            <div 
                                className={`chat-bubble flex flex-col ${
                                    message.senderId === authUser._id 
                                        ? "bg-primary text-primary-content" 
                                        : "bg-base-300 text-base-content"
                                }`}
                            >
                                {message.image && (
                                    <img
                                        src={message.image}
                                        alt="Attachment"
                                        className="max-w-[200px] rounded-md mb-2"
                                    />
                                )}
                                {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}
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