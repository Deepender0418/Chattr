import { useState } from "react";
import { X, User, Mail, Calendar } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
    const { selectedUser, setSelectedUser } = useChatStore();
    const { onlineUsers } = useAuthStore();
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
                        {/* Avatar - Clickable */}
                        <div className="avatar cursor-pointer" onClick={() => setShowProfile(true)}>
                            <div className="size-12 rounded-full relative ring-2 ring-primary ring-offset-2 ring-offset-base-100 hover:ring-secondary transition-all duration-200">
                                <img 
                                    src={selectedUser.profilePic || "/avatar.png"} 
                                    alt={selectedUser.fullName}
                                    className="object-cover"
                                />
                                {onlineUsers.includes(selectedUser._id) && (
                                    <span className="absolute bottom-0 right-0 size-3 bg-success rounded-full ring-2 ring-base-100" />
                                )}
                            </div>
                        </div>

                        {/* User info */}
                        <div>
                            <h3 className="font-bold text-lg">{selectedUser.fullName}</h3>
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

                    {/* Close button */}
                    <button 
                        onClick={() => setSelectedUser(null)}
                        className="btn btn-ghost btn-circle hover:bg-error/20 hover:text-error transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </div>
            </div>

            {/* Profile Modal */}
            {showProfile && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-base-100 rounded-2xl shadow-2xl max-w-md w-full border border-base-300">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-base-300">
                            <h3 className="text-xl font-bold">Profile Information</h3>
                            <button 
                                onClick={() => setShowProfile(false)}
                                className="btn btn-ghost btn-circle hover:bg-error/20 hover:text-error"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Profile Picture */}
                            <div className="flex justify-center">
                                <div className="size-32 rounded-full ring-4 ring-primary ring-offset-4 ring-offset-base-100">
                                    <img 
                                        src={selectedUser.profilePic || "/avatar.png"} 
                                        alt={selectedUser.fullName}
                                        className="size-full object-cover rounded-full"
                                    />
                                </div>
                            </div>

                            {/* User Details */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                                    <User className="size-5 text-primary" />
                                    <div>
                                        <p className="text-sm text-base-content/60">Full Name</p>
                                        <p className="font-semibold">{selectedUser.fullName}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                                    <Mail className="size-5 text-primary" />
                                    <div>
                                        <p className="text-sm text-base-content/60">Username</p>
                                        <p className="font-semibold">@{selectedUser.userName}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
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
                                    <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
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
                        {/* <div className="flex gap-3 p-6 border-t border-base-300">
                            <button 
                                onClick={() => setShowProfile(false)}
                                className="btn btn-ghost flex-1"
                            >
                                Close
                            </button>
                            <button className="btn btn-primary flex-1">
                                Start Call
                            </button>
                        </div> */}
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatHeader;