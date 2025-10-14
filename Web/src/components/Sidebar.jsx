import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Radio } from "lucide-react";

const Sidebar = () => {
    const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
    const { onlineUsers } = useAuthStore();
    const [showOnlineOnly, setShowOnlineOnly] = useState(false);

    useEffect(() => {
        getUsers();
    }, [getUsers]);

    const filteredUsers = showOnlineOnly
        ? users.filter((user) => onlineUsers.includes(user._id))
        : users;

    if (isUsersLoading) return <SidebarSkeleton />;

    return (
        <aside className="h-full w-20 lg:w-80 border-r border-base-300 flex flex-col transition-all duration-200 bg-base-100">
            <div className="border-b border-base-300 w-full p-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <Users className="size-5 text-primary" />
                    </div>
                    <span className="font-bold text-lg hidden lg:block">Users</span>
                </div>
                
                <div className="mt-4 hidden lg:flex items-center justify-between">
                    <label className="cursor-pointer flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={showOnlineOnly}
                            onChange={(e) => setShowOnlineOnly(e.target.checked)}
                            className="checkbox checkbox-primary checkbox-sm"
                        />
                        <span className="text-sm font-medium">Show online only</span>
                    </label>
                    <span className="text-xs text-base-content/60 bg-base-200 px-2 py-1 rounded-full">
                        {onlineUsers.length - 1} online
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto w-full p-3 space-y-2">
                {filteredUsers.map((user) => (
                    <button
                        key={user._id}
                        onClick={() => setSelectedUser(user)}
                        className={`
                            w-full p-4 flex items-center gap-4 rounded-xl transition-all duration-200
                            hover:bg-base-300/50 hover:shadow-sm
                            ${selectedUser?._id === user._id 
                                ? "bg-primary/10 ring-2 ring-primary/20 shadow-sm" 
                                : ""}
                        `}
                    >
                        <div className="relative">
                            <img
                                src={user.profilePic || "/avatar.png"}
                                alt={user.fullName}
                                className="size-12 object-cover rounded-full ring-2 ring-base-300"
                            />
                            {onlineUsers.includes(user._id) && (
                                <span className="absolute bottom-0 right-0 size-3 bg-success rounded-full ring-2 ring-base-100" />
                            )}
                        </div>

                        <div className="hidden lg:block text-left min-w-0 flex-1">
                            <div className="font-semibold truncate">{user.fullName}</div>
                            <div className="text-sm text-base-content/60 flex items-center gap-1">
                                {onlineUsers.includes(user._id) ? (
                                    <>
                                        <Radio className="size-3 text-success" />
                                        <span>Online</span>
                                    </>
                                ) : (
                                    "Offline"
                                )}
                            </div>
                        </div>
                    </button>
                ))}

                {filteredUsers.length === 0 && (
                    <div className="text-center text-base-content/60 py-8">
                        <Users className="size-12 mx-auto mb-3 opacity-40" />
                        <p>No contacts found</p>
                        {showOnlineOnly && <p className="text-sm">Try turning off online filter</p>}
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;