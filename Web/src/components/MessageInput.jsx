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
    const emojiButtonRef = useRef(null);
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

    return (
        <div className="p-3 bg-base-100 border-t border-base-300">
            {imagePreview && (
                <div className="mb-2 flex items-center gap-2">
                    <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-16 h-16 object-cover border"
                    />
                    <button onClick={removeImage} className="btn btn-xs btn-error">
                        <X className="size-3" />
                    </button>
                </div>
            )}

            {showEmojiPicker && (
                <div ref={emojiPickerRef} className="absolute bottom-full mb-2 z-50">
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
            )}

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    enqueueMessage();
                }}
                className="flex gap-2 items-center"
            >
                <button
                    type="button"
                    ref={emojiButtonRef}
                    className="btn btn-ghost btn-sm"
                    onClick={() => setShowEmojiPicker((v) => !v)}
                >
                    <Smile className="size-5" />
                </button>

                <input
                    ref={inputRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="flex-1 input input-bordered"
                    placeholder="Type a message..."
                />

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                />

                <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Image className="size-5" />
                </button>

                <button type="submit" className="btn btn-primary btn-sm">
                    {sendingRef.current ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Send className="size-5" />
                    )}
                </button>
            </form>
        </div>
    );
};

export default MessageInput;
