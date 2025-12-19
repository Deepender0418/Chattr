import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Smile, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";
import { nanoid } from "nanoid";

const MessageInput = () => {
    const [text, setText] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const [queue, setQueue] = useState([]);
    const sendingRef = useRef(false);

    const fileInputRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const inputRef = useRef(null);

    const { sendMessage, addOptimisticMessage } = useChatStore();

    const enqueueMessage = () => {
        if (!text.trim() && !imagePreview) return;

        const tempId = nanoid();

        const msg = {
            tempId,
            text: text.trim(),
            media: imagePreview,
        };

        addOptimisticMessage({
            _id: tempId,
            text: msg.text,
            media: msg.media,
            status: "sending",
        });

        setQueue((q) => [...q, msg]);

        setText("");
        setImagePreview(null);
        setShowEmojiPicker(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    useEffect(() => {
        if (sendingRef.current) return;
        if (queue.length === 0) return;

        const sendNext = async () => {
            sendingRef.current = true;
            const msg = queue[0];

            try {
                await sendMessage(msg);
            } catch (err) {
                toast.error("Failed to send message");
            } finally {
                setQueue((q) => q.slice(1));
                sendingRef.current = false;
            }
        };

        sendNext();
    }, [queue, sendMessage]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be under 5MB");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleEmojiClick = (emojiData) => {
        setText((prev) => prev + emojiData.emoji);
        inputRef.current?.focus();
    };

    useEffect(() => {
        const handler = (e) => {
            if (
                emojiPickerRef.current &&
                !emojiPickerRef.current.contains(e.target)
            ) {
                setShowEmojiPicker(false);
            }
        };
        if (showEmojiPicker) {
            document.addEventListener("mousedown", handler);
        }
        return () => document.removeEventListener("mousedown", handler);
    }, [showEmojiPicker]);

    return (
        <div className="p-3 sm:p-4 bg-base-100 border-t border-base-300">
            {imagePreview && (
                <div className="mb-3 flex items-center gap-2">
                    <div className="relative">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-14 h-14 sm:w-16 sm:h-16 object-cover border border-base-300 rounded-lg"
                        />
                        <button
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 btn btn-error btn-xs btn-circle hover:scale-110 transition-transform"
                            aria-label="Remove image"
                        >
                            <X className="size-3" />
                        </button>
                    </div>
                    <span className="text-xs text-base-content/60">Ready to send</span>
                </div>
            )}

            {showEmojiPicker && (
                <div
                    ref={emojiPickerRef}
                    className="mb-3 flex justify-center sm:justify-start z-50"
                >
                    <div className="scale-75 sm:scale-100 origin-bottom-left">
                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                    </div>
                </div>
            )}

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    enqueueMessage();
                }}
                className="flex gap-2 items-end"
            >
                <button
                    type="button"
                    className="btn btn-ghost btn-sm btn-circle flex-shrink-0 hover:bg-base-200"
                    onClick={() => setShowEmojiPicker((v) => !v)}
                    aria-label="Emoji picker"
                >
                    <Smile className="size-5" />
                </button>

                <div className="flex-1 min-w-0">
                    <input
                        ref={inputRef}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="input input-bordered input-sm w-full text-sm placeholder:text-base-content/40"
                        placeholder="Type a message..."
                        maxLength={2000}
                    />
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                />

                <button
                    type="button"
                    className="btn btn-ghost btn-sm btn-circle flex-shrink-0 hover:bg-base-200"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Attach image"
                >
                    <Image className="size-5" />
                </button>

                <button
                    type="submit"
                    className="btn btn-primary btn-sm btn-circle flex-shrink-0"
                    disabled={(!text.trim() && !imagePreview) || sendingRef.current}
                    aria-label="Send message"
                >
                    {sendingRef.current ? (
                        <Loader2 className="size-5 animate-spin" />
                    ) : (
                        <Send className="size-5" />
                    )}
                </button>
            </form>
        </div>
    );
};

export default MessageInput;
