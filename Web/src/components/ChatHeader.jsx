import { useState } from "react";
import { X, ArrowLeft, User, Trash2 } from "lucide-react";
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
            <div className="px-3 sm:px-4 lg:px-6 py-3 border-b border-base-300 bg-base-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <button
                            onClick={() => setSelectedUser(null)}
                            className="lg:hidden btn btn-ghost btn-circle btn-sm flex-shrink-0"
                            aria-label="Back"
                        >
                            <ArrowLeft className="size-4" />
                        </button>

                        <div
                            className="avatar cursor-pointer flex-shrink-0"
                            onClick={() => setShowProfile(true)}
                        >
                            <div className="size-9 sm:size-10 rounded-full overflow-hidden relative ring-1 ring-primary hover:ring-secondary transition-all duration-200">
                                <img
                                    src={selectedUser.profilePic || "/avatar.png"}
                                    alt={selectedUser.fullName}
                                    className="w-full h-full object-cover"
                                />
                                {onlineUsers.includes(selectedUser._id) && (
                                    <span className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full ring-1 ring-base-100" />
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col min-w-0">
                            <h3 className="font-semibold text-sm sm:text-base truncate">
                                {selectedUser.fullName}
                            </h3>
                            <span
                                className={`text-xs ${
                                    onlineUsers.includes(selectedUser._id)
                                        ? "text-success"
                                        : "text-base-content/60"
                                }`}
                            >
                                {onlineUsers.includes(selectedUser._id)
                                    ? "Online"
                                    : "Offline"}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => setSelectedUser(null)}
                        className="hidden lg:flex btn btn-ghost btn-circle btn-sm hover:bg-error/20 hover:text-error transition-colors flex-shrink-0"
                        aria-label="Close chat"
                    >
                        <X className="size-4" />
                    </button>
                </div>
            </div>

            {showProfile && (
                <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
                    <div className="bg-base-100 shadow-lg w-full sm:max-w-sm rounded-t-2xl sm:rounded-lg overflow-hidden border-t sm:border border-base-300">
                        <div className="flex items-center justify-between p-4 border-b border-base-300 sticky top-0 bg-base-100 z-10">
                            <h3 className="text-lg font-bold">Profile</h3>
                            <button
                                onClick={() => setShowProfile(false)}
                                className="btn btn-ghost btn-circle btn-sm hover:bg-error/20 hover:text-error"
                                aria-label="Close"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        <div className="p-4 sm:p-6 flex flex-col items-center gap-4 max-h-[70vh] sm:max-h-auto overflow-y-auto">
                            <div className="size-20 sm:size-24 rounded-full overflow-hidden ring-2 ring-primary flex-shrink-0">
                                <img
                                    src={selectedUser.profilePic || "/avatar.png"}
                                    alt={selectedUser.fullName}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="text-center">
                                <h3 className="font-semibold text-lg">
                                    {selectedUser.fullName}
                                </h3>
                                <span
                                    className={`text-sm ${
                                        onlineUsers.includes(selectedUser._id)
                                            ? "text-success"
                                            : "text-base-content/60"
                                    }`}
                                >
                                    {onlineUsers.includes(selectedUser._id)
                                        ? "Online"
                                        : "Offline"}
                                </span>
                            </div>

                            <div className="w-full mt-2 space-y-3 bg-base-200 p-3 rounded-lg">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-base-content/60">
                                        Username
                                    </span>
                                    <span className="font-semibold">
                                        @{selectedUser.userName}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-base-content/60">
                                        Status
                                    </span>
                                    <span
                                        className={`font-semibold ${
                                            onlineUsers.includes(selectedUser._id)
                                                ? "text-success"
                                                : "text-warning"
                                        }`}
                                    >
                                        {onlineUsers.includes(selectedUser._id)
                                            ? "Online"
                                            : "Offline"}
                                    </span>
                                </div>

                                {selectedUser.email && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-base-content/60">
                                            Email
                                        </span>
                                        <span className="font-semibold truncate ml-2">
                                            {selectedUser.email}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <button
                                className="btn btn-error w-full mt-4 gap-2"
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
                                className="btn btn-ghost w-full"
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
