import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState, useLayoutEffect } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { Check, CheckCheck, Loader2 } from "lucide-react";

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

/* ================= COMPONENT ================= */

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
  const lastStickyDateRef = useRef("");
  const rafRef = useRef(false);
  const prevSelectedUserIdRef = useRef(null);

  const [stickyDate, setStickyDate] = useState("");


  useEffect(() => {
    if (!selectedUser?._id) return;

    if (prevSelectedUserIdRef.current !== selectedUser._id) {
      isInitialLoadRef.current = true;
      prevSelectedUserIdRef.current = selectedUser._id;
    }

    loadMessages(selectedUser._id, null);
    subscribeToMessages();

    return unsubscribeFromMessages;
  }, [selectedUser?._id]);


  useLayoutEffect(() => {
    if (
      !selectedUser?._id ||
      !messagesContainerRef.current ||
      isMessagesLoading ||
      !isInitialLoadRef.current ||
      !messages.length
    )
      return;

    const container = messagesContainerRef.current;
    container.scrollTop = container.scrollHeight;
    isInitialLoadRef.current = false;
  }, [isMessagesLoading, messages.length, selectedUser?._id]);


  useEffect(() => {
    if (
      !messages.length ||
      !messagesContainerRef.current ||
      isInitialLoadRef.current
    )
      return;

    const container = messagesContainerRef.current;
    const lastMessage = messages[messages.length - 1];

    const distanceFromBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    const isUserNearBottom = distanceFromBottom < 200;

    if (
      lastMessage.senderId === authUser._id ||
      isUserNearBottom
    ) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);


  useEffect(() => {
    if (!selectedUser?._id || !messages.length) return;

    const hasUnseen = messages.some(
      (msg) =>
        msg.senderId === selectedUser._id && !msg.seen
    );

    if (hasUnseen) {
      markMessagesAsSeen(selectedUser._id);
    }
  }, [messages.length, selectedUser?._id]);


  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (rafRef.current) return;

      rafRef.current = true;
      requestAnimationFrame(async () => {
        rafRef.current = false;

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

        if (
          container.scrollTop <= 100 &&
          hasMore &&
          !isLoadingMore &&
          !isInitialLoadRef.current &&
          selectedUser?._id
        ) {
          const prevHeight = container.scrollHeight;
          await loadMessages(selectedUser._id, nextCursor);
          container.scrollTop =
            container.scrollHeight - prevHeight;
        }
      });
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasMore, isLoadingMore, nextCursor, selectedUser?._id]);


  useEffect(() => {
    if (selectedUser?._id) {
      setStickyDate("");
      lastStickyDateRef.current = "";
    }
  }, [selectedUser?._id]);


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

  return (
    <div className="flex flex-col h-full bg-base-100 relative">
      <ChatHeader />

      {stickyDate && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 px-3 py-1 bg-base-300 text-xs sm:text-sm rounded-full shadow">
          {stickyDate}
        </div>
      )}

      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-4 bg-base-200/10"
        style={{ overflowAnchor: "none" }}
      >
        {isLoadingMore && (
          <div className="flex justify-center">
            <Loader2 className="animate-spin size-5 text-primary" />
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm opacity-50">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id || message.tempId}
              data-timestamp={message.createdAt}
            >
              <div
                className={`chat ${
                  message.senderId === authUser._id
                    ? "chat-end"
                    : "chat-start"
                }`}
              >
                <div className="chat-image avatar">
                  <div className="size-9 rounded-full overflow-hidden">
                    <img
                      src={
                        message.senderId === authUser._id
                          ? authUser.profilePic || "/avatar.png"
                          : selectedUser.profilePic || "/avatar.png"
                      }
                      alt="avatar"
                    />
                  </div>
                </div>

                <div className="chat-header flex gap-1 text-xs opacity-70">
                  <span>
                    {message.senderId === authUser._id
                      ? "You"
                      : selectedUser.fullName}
                  </span>
                  <time>{formatMessageTime(message.createdAt)}</time>

                  {message.senderId === authUser._id && (
                    message.seen ? (
                      <CheckCheck className="size-3 text-primary" />
                    ) : (
                      <Check className="size-3" />
                    )
                  )}
                </div>

                <div
                  className={`chat-bubble max-w-xs sm:max-w-md break-words ${
                    message.senderId === authUser._id
                      ? "bg-primary text-primary-content"
                      : "bg-base-300"
                  }`}
                >
                  {message.media && (
                    <img
                      src={message.media}
                      alt="media"
                      className="rounded mb-1 max-w-full"
                    />
                  )}
                  {message.text}
                </div>
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
