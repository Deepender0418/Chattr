import { useState } from "react";
import { X, User, Mail, Calendar, ArrowLeft, Trash2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useFriendStore } from "../store/useFriendStore";

const ChatHeader = () => {
    const { selectedUser, setSelectedUser } = useChatStore();
    const { onlineUsers } = useAuthStore();
    const { removeFriend } = useFriendStore();
    const [showProfile, setShowProfile] = useState(false);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <>
            <div className="p-4 border-b border-base-300 bg-base-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Back Button for Mobile */}
                        <button 
                            onClick={() => setSelectedUser(null)}
                            className="lg:hidden btn btn-ghost btn-circle btn-sm"
                        >
                            <ArrowLeft className="size-4" />
                        </button>

                        {/* Avatar - Clickable */}
                        <div className="avatar cursor-pointer" onClick={() => setShowProfile(true)}>
                            <div className="size-12 rounded-full overflow-hidden relative ring-1 ring-primary ring-offset-1 ring-offset-base-100 hover:ring-secondary transition-all duration-200">
                                <img 
                                    src={selectedUser.profilePic || "/avatar.png"} 
                                    alt={selectedUser.fullName}
                                    className="w-full h-full object-cover"
                                />
                                {onlineUsers.includes(selectedUser._id) && (
                                    <span className="absolute bottom-0 right-0 size-3 bg-success rounded-full ring-1 ring-base-100" />
                                )}
                            </div>
                        </div>

                        {/* User info */}
                        <div>
                            <h3 className="font-bold text-lg lg:text-xl">{selectedUser.fullName}</h3>
                            <p className={`text-sm flex items-center gap-1 ${
                                onlineUsers.includes(selectedUser._id) 
                                    ? "text-success" 
                                    : "text-base-content/60"
                            }`}>
                                <span className={`size-2 rounded-full ${
                                    onlineUsers.includes(selectedUser._id) ? "bg-success" : "bg-base-content/40"
                                }`}></span>
                                {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
                            </p>
                        </div>
                    </div>

                    {/* Close button - hidden on mobile, back button used instead */}
                    <button 
                        onClick={() => setSelectedUser(null)}
                        className="hidden lg:flex btn btn-ghost btn-circle hover:bg-error/20 hover:text-error transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </div>
            </div>

            {/* Profile Modal */}
            {showProfile && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-base-100 shadow-2xl max-w-md w-full border border-base-300 max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-base-300">
                            <h3 className="text-xl font-bold">Profile Information</h3>
                            <button 
                                onClick={() => setShowProfile(false)}
                                className="btn btn-ghost btn-circle btn-sm hover:bg-error/20 hover:text-error"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Profile Picture */}
                            <div className="flex justify-center">
                                <div className="size-32 rounded-full overflow-hidden ring-4 ring-primary ring-offset-4 ring-offset-base-100">
                                    <img 
                                        src={selectedUser.profilePic || "/avatar.png"} 
                                        alt={selectedUser.fullName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                            {/* User Details */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-base-200">
                                    <User className="size-5 text-primary" />
                                    <div>
                                        <p className="text-sm text-base-content/60">Full Name</p>
                                        <p className="font-semibold">{selectedUser.fullName}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-base-200">
                                    <Mail className="size-5 text-primary" />
                                    <div>
                                        <p className="text-sm text-base-content/60">Username</p>
                                        <p className="font-semibold">@{selectedUser.userName}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-base-200">
                                    <Calendar className="size-5 text-primary" />
                                    <div>
                                        <p className="text-sm text-base-content/60">Status</p>
                                        <p className={`font-semibold ${
                                            onlineUsers.includes(selectedUser._id) 
                                                ? "text-success" 
                                                : "text-warning"
                                        }`}>
                                            {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
                                        </p>
                                    </div>
                                </div>

                                {selectedUser.email && (
                                    <div className="flex items-center gap-3 p-3 bg-base-200">
                                        <Mail className="size-5 text-primary" />
                                        <div>
                                            <p className="text-sm text-base-content/60">Email</p>
                                            <p className="font-semibold">{selectedUser.email}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex gap-3 p-6 border-t border-base-300">
                            <button 
                                onClick={() => setShowProfile(false)}
                                className="btn btn-ghost flex-1"
                            >
                                Close
                            </button>
                            <button
                                className="btn btn-error flex-1 gap-2"
                                onClick={async () => {
                                    await removeFriend(selectedUser._id);
                                    setShowProfile(false);
                                    setSelectedUser(null);
                                }}
                            >
                                <Trash2 className="size-4" />
                                Remove Friend
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatHeader;
