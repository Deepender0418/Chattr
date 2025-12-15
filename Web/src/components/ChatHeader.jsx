import { useState } from "react";
import { X, ArrowLeft, User, Mail, Calendar, Trash2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useFriendStore } from "../store/useFriendStore";

const ChatHeader = () => {
    const { selectedUser, setSelectedUser } = useChatStore();
    const { onlineUsers } = useAuthStore();
    const { removeFriend } = useFriendStore();
    const [showProfile, setShowProfile] = useState(false);

    if (!selectedUser) return null;

    return (
        <>
            {/* Compact Chat Header */}
            <div className="px-3 py-2 border-b border-base-300 bg-base-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Back Button Mobile */}
                        <button
                            onClick={() => setSelectedUser(null)}
                            className="lg:hidden btn btn-ghost btn-circle btn-sm"
                            aria-label="Back"
                        >
                            <ArrowLeft className="size-4" />
                        </button>

                        {/* Avatar */}
                        <div
                            className="avatar cursor-pointer"
                            onClick={() => setShowProfile(true)}
                        >
                            <div className="size-10 rounded-full overflow-hidden relative ring-1 ring-primary hover:ring-secondary transition-all duration-200">
                                <img
                                    src={selectedUser.profilePic || "/avatar.png"}
                                    alt={selectedUser.fullName}
                                    className="w-full h-full object-cover"
                                />
                                {onlineUsers.includes(selectedUser._id) && (
                                    <span className="absolute bottom-0 right-0 size-2 bg-success rounded-full ring-1 ring-base-100" />
                                )}
                            </div>
                        </div>

                        {/* Name & Status */}
                        <div className="flex flex-col">
                            <h3 className="font-semibold text-sm lg:text-base">
                                {selectedUser.fullName}
                            </h3>
                            <span
                                className={`text-xs ${
                                    onlineUsers.includes(selectedUser._id)
                                        ? "text-success"
                                        : "text-base-content/60"
                                }`}
                            >
                                {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
                            </span>
                        </div>
                    </div>

                    {/* Close Button Desktop */}
                    <button
                        onClick={() => setSelectedUser(null)}
                        className="hidden lg:flex btn btn-ghost btn-circle hover:bg-error/20 hover:text-error transition-colors"
                        aria-label="Close chat"
                    >
                        <X className="size-4" />
                    </button>
                </div>
            </div>

            {/* Profile Modal */}
            {showProfile && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-base-100 shadow-lg w-full max-w-xs rounded-lg overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-base-300">
                            <h3 className="text-lg font-bold">Profile Info</h3>
                            <button
                                onClick={() => setShowProfile(false)}
                                className="btn btn-ghost btn-circle btn-sm hover:bg-error/20 hover:text-error"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-4 flex flex-col items-center gap-4">
                            <div className="size-24 rounded-full overflow-hidden ring-2 ring-primary">
                                <img
                                    src={selectedUser.profilePic || "/avatar.png"}
                                    alt={selectedUser.fullName}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="font-semibold text-lg">{selectedUser.fullName}</h3>
                            <span
                                className={`text-sm ${
                                    onlineUsers.includes(selectedUser._id)
                                        ? "text-success"
                                        : "text-base-content/60"
                                }`}
                            >
                                {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
                            </span>

                            <div className="w-full mt-2 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-base-content/60">Username</span>
                                    <span className="font-semibold text-sm">@{selectedUser.userName}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-sm text-base-content/60">Status</span>
                                    <span
                                        className={`font-semibold text-sm ${
                                            onlineUsers.includes(selectedUser._id)
                                                ? "text-success"
                                                : "text-warning"
                                        }`}
                                    >
                                        {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
                                    </span>
                                </div>

                                {selectedUser.email && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-base-content/60">Email</span>
                                        <span className="font-semibold text-sm">{selectedUser.email}</span>
                                    </div>
                                )}
                            </div>

                            <button
                                className="btn btn-error w-full mt-3 gap-2"
                                onClick={async () => {
                                    await removeFriend(selectedUser._id);
                                    setShowProfile(false);
                                    setSelectedUser(null);
                                }}
                            >
                                <Trash2 className="size-4" />
                                Remove Friend
                            </button>

                            <button
                                onClick={() => setShowProfile(false)}
                                className="btn btn-ghost w-full mt-2"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatHeader;
