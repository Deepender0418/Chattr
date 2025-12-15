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
    X
} from "lucide-react";
import toast from "react-hot-toast";

const Sidebar = ({ onExpandChange, isExpanded }) => {
    const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
    const { onlineUsers, authUser } = useAuthStore();
    const { searchUser, searchResult, isSearching, sendRequest } = useFriendStore();

    const [searchTerm, setSearchTerm] = useState("");
    const [friendQuery, setFriendQuery] = useState("");
    const [showAddFriend, setShowAddFriend] = useState(false);

    useEffect(() => {
        getUsers();
    }, [getUsers]);

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
                    transition-all duration-300
                    ${isExpanded ? "w-80 absolute lg:relative" : "w-20 lg:w-80"}
                `}
            >
                {/* Header */}
                <div className="p-4 border-b border-base-300">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Users className="size-5 text-primary" />
                            <span className={`font-semibold ${isExpanded ? "block" : "hidden lg:block"}`}>
                                Chats
                            </span>
                        </div>

                        <div className="flex gap-1">
                            <button
                                onClick={() => setShowAddFriend(true)}
                                className="btn btn-ghost btn-sm btn-square"
                            >
                                <UserPlus className="size-4" />
                            </button>

                            <button
                                onClick={() => onExpandChange(!isExpanded)}
                                className="btn btn-ghost btn-sm btn-square lg:hidden"
                            >
                                {isExpanded ? <ChevronLeft /> : <ChevronRight />}
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className={`mt-4 ${isExpanded ? "block" : "hidden lg:block"}`}>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 opacity-50" />
                            <input
                                className="w-full pl-10 py-2 text-sm bg-base-200 border border-base-300 focus:outline-none"
                                placeholder="Search chats"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Chat list */}
                <div className="flex-1 overflow-y-auto">
                    {filteredUsers.map(user => (
                        <button
                            key={user._id}
                            onClick={() => setSelectedUser(user)}
                            className={`
                                w-full flex items-center gap-3 px-4 py-3
                                border-b border-base-300 text-left
                                hover:bg-base-200 transition
                                ${selectedUser?._id === user._id ? "bg-base-200" : ""}
                            `}
                        >
                            {/* Avatar stays circular */}
                            <div className="relative">
                                <img
                                    src={user.profilePic || "/avatar.png"}
                                    className="size-12 rounded-full object-cover border border-base-300"
                                />
                                {onlineUsers.includes(user._id) && (
                                    <span className="absolute bottom-0 right-0 size-2 bg-success" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">
                                    {user.fullName}
                                </div>
                                <div className="text-xs text-base-content/50">
                                    {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </aside>

            {/* Add Friend Modal (flat) */}
            {showAddFriend && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-base-100 w-full max-w-md border border-base-300">
                        <div className="flex justify-between items-center p-4 border-b border-base-300">
                            <h3 className="font-semibold">Add Friend</h3>
                            <button
                                onClick={() => setShowAddFriend(false)}
                                className="btn btn-ghost btn-sm btn-square"
                            >
                                <X />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            {authUser?.friendCode && (
                                <div className="flex justify-between items-center border border-base-300 p-2">
                                    <span className="text-sm">{authUser.friendCode}</span>
                                    <button
                                        onClick={handleCopyCode}
                                        className="btn btn-xs btn-ghost"
                                    >
                                        <Copy className="size-3" />
                                    </button>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <input
                                    className="input input-sm input-bordered w-full"
                                    placeholder="Username or friend code"
                                    value={friendQuery}
                                    onChange={(e) => setFriendQuery(e.target.value)}
                                />
                                <button
                                    onClick={() => searchUser(friendQuery)}
                                    className="btn btn-sm btn-primary"
                                >
                                    {isSearching ? "..." : "Find"}
                                </button>
                            </div>

                            {searchResult && (
                                <div className="flex items-center gap-3 border border-base-300 p-3">
                                    <img
                                        src={searchResult.user.profilePic || "/avatar.png"}
                                        className="size-10 rounded-full"
                                    />
                                    <div className="flex-1 font-medium">
                                        {searchResult.user.fullName}
                                    </div>
                                    <button
                                        onClick={() => sendRequest(searchResult.user.userName)}
                                        className="btn btn-xs btn-primary"
                                    >
                                        Add
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
