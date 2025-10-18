import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Smile } from "lucide-react";
import toast from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";

const MessageInput = () => {
    const [text, setText] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const fileInputRef = useRef(null);
    const emojiButtonRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const inputRef = useRef(null);
    const { sendMessage } = useChatStore();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size should be less than 5MB");
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = async () => {
            const base64Image = reader.result;
            setImagePreview(base64Image);
        };
    };

    const removeImage = () => {
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleEmojiClick = (emojiData) => {
        setText(prevText => prevText + emojiData.emoji);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!text.trim() && !imagePreview) return;

        try {
            await sendMessage({
                text: text.trim(),
                image: imagePreview,
            });

            setText("");
            setImagePreview(null);
            setShowEmojiPicker(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (error) {
            console.error("Failed to send message:", error);
            toast.error("Failed to send message");
        }
    };

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                emojiPickerRef.current && 
                !emojiPickerRef.current.contains(event.target) &&
                emojiButtonRef.current && 
                !emojiButtonRef.current.contains(event.target)
            ) {
                setShowEmojiPicker(false);
            }
        };

        if (showEmojiPicker) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }
    }, [showEmojiPicker]);

    // Close emoji picker when pressing Escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setShowEmojiPicker(false);
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    return (
        <div className="p-3 sm:p-4 w-full bg-base-100 border-t border-base-300">
            {imagePreview && (
                <div className="mb-3 flex items-center gap-2">
                    <div className="relative">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border-2 border-base-300"
                        />
                        <button
                            onClick={removeImage}
                            className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 size-5 sm:size-6 rounded-full bg-error text-error-content flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                            type="button"
                        >
                            <X className="size-3" />
                        </button>
                    </div>
                    <span className="text-xs sm:text-sm text-base-content/60">Image ready to send</span>
                </div>
            )}

            <div className="relative">
                {showEmojiPicker && (
                    <div 
                        ref={emojiPickerRef}
                        className="absolute bottom-full mb-2 left-0 z-50"
                    >
                        <div className="bg-base-100 rounded-xl shadow-2xl border border-base-300 overflow-hidden">
                            <EmojiPicker 
                                onEmojiClick={handleEmojiClick}
                                width={300}
                                height={350}
                                searchDisabled={false}
                                skinTonesDisabled
                                previewConfig={{
                                    showPreview: false
                                }}
                                theme="light"
                            />
                        </div>
                    </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-center gap-2 sm:gap-3">
                    <div className="flex-1 flex gap-1 sm:gap-2">
                        <button
                            type="button"
                            ref={emojiButtonRef}
                            className={`btn btn-circle btn-xs sm:btn-sm flex items-center justify-center ${
                                showEmojiPicker 
                                    ? "btn-primary text-primary-content" 
                                    : "btn-ghost text-base-content/70 hover:text-base-content hover:bg-base-300"
                            }`}
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                            <Smile className="size-4 sm:size-5" />
                        </button>

                        <input
                            ref={inputRef}
                            type="text"
                            className="flex-1 input input-bordered input-sm sm:input-md rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary"
                            placeholder="Type a message..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onFocus={() => setShowEmojiPicker(false)}
                        />
                        
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                        />

                        <button
                            type="button"
                            className={`btn btn-circle btn-xs sm:btn-sm flex items-center justify-center ${
                                imagePreview 
                                    ? "btn-primary text-primary-content" 
                                    : "btn-ghost text-base-content/70 hover:text-base-content hover:bg-base-300"
                            }`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Image className="size-4 sm:size-5" />
                        </button>
                    </div>
                    
                    <button
                        type="submit"
                        className="btn btn-circle btn-primary btn-sm sm:btn-md shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:bg-base-300 disabled:text-base-content/40 disabled:scale-100 disabled:shadow-none"
                        disabled={!text.trim() && !imagePreview}
                    >
                        <Send className="size-4 sm:size-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MessageInput;
