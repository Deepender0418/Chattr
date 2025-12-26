import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useFriendStore } from "../store/useFriendStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import {
    Users,
    Search,
    ChevronLeft,
    ChevronRight,
    UserPlus,
    Copy,
    X,
} from "lucide-react";
import toast from "react-hot-toast";

const Sidebar = ({ onExpandChange, isExpanded }) => {
    const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
    const { onlineUsers, authUser } = useAuthStore();

    const {
        searchUser,
        searchResult,
        isSearching,
        sendRequest,
        sentRequests,
        receivedRequests,
        respondRequest
    } = useFriendStore();

    const [searchTerm, setSearchTerm] = useState("");
    const [friendQuery, setFriendQuery] = useState("");
    const [showAddFriend, setShowAddFriend] = useState(false);
    const [activeTab, setActiveTab] = useState("add");

    useEffect(() => {
        getUsers();
    }, [getUsers]);

    useEffect(() => {
        if (showAddFriend) {
            useFriendStore.getState().fetchRequests();
        }
    }, [showAddFriend]);

    const filteredUsers = users.filter(u =>
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCopyCode = async () => {
        if (!authUser?.friendCode) return;
        await navigator.clipboard.writeText(authUser.friendCode);
        toast.success("Friend code copied");
    };

    if (isUsersLoading) return <SidebarSkeleton />;

    return (
        <>
            <aside
                className={`
                    h-full bg-base-100 flex flex-col border-r border-base-300
                    transition-all duration-300 ease-in-out
                    ${isExpanded
                    ? `
                        fixed top-16 bottom-0 left-0 w-80 z-40
                        lg:relative lg:top-0 lg:bottom-auto lg:z-0
                    `
                    : "w-20 lg:w-80"
                    }
                `}
            >
                <div className="p-3 lg:p-4 border-b border-base-300">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 lg:gap-3">
                            <Users className="size-5 flex-shrink-0 text-primary" />
                            <span className={`font-semibold text-base ${isExpanded ? "block" : "hidden lg:block"}`}>
                                Chats
                            </span>
                        </div>

                        <div className="flex gap-1">
                            <button
                                onClick={() => setShowAddFriend(true)}
                                className={`btn btn-ghost btn-sm ${isExpanded ? "btn-square" : "hidden lg:flex lg:btn-square"}`}
                                aria-label="Add friend"
                            >
                                <UserPlus className="size-4" />
                            </button>

                            <button
                                onClick={() => onExpandChange(!isExpanded)}
                                className="btn btn-ghost btn-sm btn-square lg:hidden"
                                aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
                            >
                                {isExpanded ? <ChevronLeft className="size-5" /> : <ChevronRight className="size-5" />}
                            </button>
                        </div>
                    </div>

                    <div className={`mt-3 lg:mt-4 ${isExpanded ? "block" : "hidden lg:block"}`}>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 opacity-50" />
                            <input
                                className="w-full pl-10 pr-3 py-2 text-sm bg-base-200 border border-base-300 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg"
                                placeholder="Search chats"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-thin">
                    {filteredUsers.length === 0 ? (
                        <div className={`p-4 text-center text-sm text-base-content/50 ${isExpanded ? "block" : "hidden lg:block"}`}>
                            {searchTerm ? "No chats found" : "No chats yet"}
                        </div>
                    ) : (
                        filteredUsers.map(user => (
                            <button
                                key={user._id}
                                onClick={() => {
                                    setSelectedUser(user);
                                    if (window.innerWidth < 1024) {
                                        onExpandChange(false);
                                    }
                                }}
                                className={`
                                    w-full flex items-center gap-3 p-3 lg:px-4 lg:py-3
                                    border-b border-base-300 text-left
                                    hover:bg-base-200 active:bg-base-300 transition-colors
                                    ${selectedUser?._id === user._id ? "bg-base-200" : ""}
                                    ${isExpanded ? "" : "justify-center lg:justify-start"}
                                `}
                            >
                                <div className="relative flex-shrink-0">
                                    <img
                                        src={user.profilePic || "/avatar.png"}
                                        alt={user.fullName}
                                        className="size-11 lg:size-12 rounded-full object-cover border border-base-300"
                                    />
                                    {onlineUsers.includes(user._id) && (
                                        <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-base-100" />
                                    )}
                                </div>

                                <div className={`flex-1 min-w-0 ${isExpanded ? "block" : "hidden lg:block"}`}>
                                    <div className="font-medium truncate text-sm lg:text-base">
                                        {user.fullName}
                                    </div>
                                    <div className="text-xs text-base-content/60">
                                        {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </aside>

            {/* Backdrop - only visible on mobile when sidebar is expanded */}
            {isExpanded && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    style={{ clipPath: 'polygon(320px 0, 100% 0, 100% 100%, 320px 100%)' }}
                    onClick={() => onExpandChange(false)}
                    aria-hidden="true"
                />
            )}

            {showAddFriend && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
                    <div
                        className="bg-base-100 w-full sm:max-w-md sm:max-w-lg border-t sm:border border-base-300 sm:rounded-xl overflow-hidden shadow-xl max-h-[90vh] sm:max-h-[80vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-4 border-b border-base-300 bg-base-100 sticky top-0 z-10">
                            <h3 className="font-semibold text-lg">Friends</h3>
                            <button
                                onClick={() => setShowAddFriend(false)}
                                className="btn btn-ghost btn-sm btn-circle"
                                aria-label="Close"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        <div className="flex border-b border-base-300 bg-base-100 sticky top-[57px] z-10">
                            <button
                                onClick={() => setActiveTab("add")}
                                className={`
                                    flex-1 py-3 text-sm font-medium transition-colors relative
                                    ${activeTab === "add"
                                        ? "text-primary"
                                        : "text-base-content/60 hover:text-base-content"
                                    }
                                `}
                            >
                                Add Friend
                                {activeTab === "add" && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab("sent")}
                                className={`
                                    flex-1 py-3 text-sm font-medium transition-colors relative
                                    ${activeTab === "sent"
                                        ? "text-primary"
                                        : "text-base-content/60 hover:text-base-content"
                                    }
                                `}
                            >
                                Sent
                                {sentRequests?.length > 0 && (
                                    <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                                        {sentRequests.length}
                                    </span>
                                )}
                                {activeTab === "sent" && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab("received")}
                                className={`
                                    flex-1 py-3 text-sm font-medium transition-colors relative
                                    ${activeTab === "received"
                                        ? "text-primary"
                                        : "text-base-content/60 hover:text-base-content"
                                    }
                                `}
                            >
                                Received
                                {receivedRequests?.length > 0 && (
                                    <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-error/20 text-error rounded-full">
                                        {receivedRequests.length}
                                    </span>
                                )}
                                {activeTab === "received" && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                                )}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {activeTab === "add" && (
                                <>
                                    {authUser?.friendCode && (
                                        <div className="bg-base-200 border border-base-300 p-3 rounded-lg">
                                            <label className="text-xs font-medium text-base-content/60 block mb-2">
                                                Your Friend Code
                                            </label>
                                            <div className="flex items-center justify-between gap-2">
                                                <code className="text-sm font-mono bg-base-100 px-3 py-2 rounded border border-base-300 flex-1">
                                                    {authUser.friendCode}
                                                </code>
                                                <button
                                                    onClick={handleCopyCode}
                                                    className="btn btn-sm btn-ghost btn-square flex-shrink-0"
                                                    aria-label="Copy friend code"
                                                >
                                                    <Copy className="size-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-base-content/60">
                                            Find Friend
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                className="input input-bordered w-full flex-1 text-sm"
                                                placeholder="Username or friend code"
                                                value={friendQuery}
                                                onChange={(e) => setFriendQuery(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter' && friendQuery.trim()) {
                                                        searchUser(friendQuery);
                                                    }
                                                }}
                                            />
                                            <button
                                                onClick={() => searchUser(friendQuery)}
                                                className="btn btn-primary flex-shrink-0"
                                                disabled={!friendQuery.trim() || isSearching}
                                            >
                                                {isSearching ? (
                                                    <span className="loading loading-spinner loading-sm"></span>
                                                ) : (
                                                    "Find"
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {searchResult && (
                                        <div className="bg-base-200 border border-base-300 p-3 rounded-lg flex items-center gap-3">
                                            <img
                                                src={searchResult.user.profilePic || "/avatar.png"}
                                                alt={searchResult.user.fullName}
                                                className="size-12 rounded-full object-cover flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">
                                                    {searchResult.user.fullName}
                                                </div>
                                                <div className="text-xs text-base-content/60 truncate">
                                                    @{searchResult.user.userName}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => sendRequest(searchResult.user.userName)}
                                                className="btn btn-primary btn-sm flex-shrink-0"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}

                            {activeTab === "sent" && (
                                <>
                                    {!sentRequests || sentRequests.length === 0 ? (
                                        <div className="text-center py-12 text-base-content/50">
                                            <UserPlus className="size-12 mx-auto mb-3 opacity-30" />
                                            <p className="text-sm">No sent requests</p>
                                        </div>
                                    ) : (
                                        sentRequests.map(user => (
                                            <div
                                                key={user._id}
                                                className="bg-base-200 border border-base-300 p-3 rounded-lg flex items-center gap-3"
                                            >
                                                <img
                                                    src={user.profilePic || "/avatar.png"}
                                                    alt={user.fullName}
                                                    className="size-12 rounded-full object-cover flex-shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium truncate">{user.fullName}</div>
                                                    <div className="text-xs text-base-content/60">Pending</div>
                                                </div>
                                                <button
                                                    onClick={() => cancelRequest(user.userName)}
                                                    className="btn btn-error btn-sm flex-shrink-0"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </>
                            )}

                            {activeTab === "received" && (
                                <>
                                    {!receivedRequests || receivedRequests.length === 0 ? (
                                        <div className="text-center py-12 text-base-content/50">
                                            <Users className="size-12 mx-auto mb-3 opacity-30" />
                                            <p className="text-sm">No pending requests</p>
                                        </div>
                                    ) : (
                                        receivedRequests.map(user => (
                                            <div
                                                key={user._id}
                                                className="bg-base-200 border border-base-300 p-3 rounded-lg"
                                            >
                                                <div className="flex items-center gap-3 mb-3">
                                                    <img
                                                        src={user.profilePic || "/avatar.png"}
                                                        alt={user.fullName}
                                                        className="size-12 rounded-full object-cover flex-shrink-0"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium truncate">{user.fullName}</div>
                                                        <div className="text-xs text-base-content/60">Wants to be friends</div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => respondRequest(user.requestId, "accept")}
                                                        className="btn btn-success btn-sm flex-1"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => respondRequest(user.requestId, "reject")}
                                                        className="btn btn-ghost btn-sm flex-1"
                                                    >
                                                        Decline
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
