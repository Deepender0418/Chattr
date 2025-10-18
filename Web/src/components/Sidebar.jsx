import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Radio, Search, ChevronLeft, ChevronRight } from "lucide-react";

const Sidebar = ({ onExpandChange, isExpanded }) => {
    const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
    const { onlineUsers } = useAuthStore();
    const [showOnlineOnly, setShowOnlineOnly] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        getUsers();
    }, [getUsers]);

    const filteredUsers = (showOnlineOnly
        ? users.filter((user) => onlineUsers.includes(user._id))
        : users
    ).filter(user => 
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        // Auto-collapse sidebar on mobile when user is selected
        if (window.innerWidth < 1024) {
            onExpandChange(false);
        }
    };

    const handleExpandToggle = () => {
        onExpandChange(!isExpanded);
    };

    if (isUsersLoading) return <SidebarSkeleton />;

    return (
        <aside className={`
            h-full bg-base-100 flex flex-col transition-all duration-300 z-50 border-r border-base-300
            ${isExpanded ? 'w-80 absolute lg:relative' : 'w-20 lg:w-80'}
        `}>
            {/* Header */}
            <div className="border-b border-base-300 w-full p-4 lg:p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`flex items-center gap-3 ${isExpanded ? 'block' : 'hidden lg:flex'}`}>
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Users className="size-5 lg:size-6 text-primary" />
                        </div>
                        <span className="font-bold text-lg lg:text-xl">Conversations</span>
                    </div>
                    
                    {/* Expand/Collapse Button - Mobile Only */}
                    <button
                        onClick={handleExpandToggle}
                        className="lg:hidden btn btn-ghost btn-circle btn-sm"
                    >
                        {isExpanded ? (
                            <ChevronLeft className="size-4" />
                        ) : (
                            <ChevronRight className="size-4" />
                        )}
                    </button>
                </div>
                
                {/* Search Bar - Only show when expanded or on desktop */}
                <div className={`${isExpanded ? 'block' : 'hidden lg:block'}`}>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-base-content/40" />
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            className="w-full pl-10 pr-4 py-2 bg-base-200 border border-base-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 text-sm lg:text-base"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Online Filter */}
                    <div className="mt-3 flex items-center justify-between">
                        <label className="cursor-pointer flex items-center gap-2 lg:gap-3">
                            <input
                                type="checkbox"
                                checked={showOnlineOnly}
                                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                                className="checkbox checkbox-primary checkbox-xs lg:checkbox-sm"
                            />
                            <span className="text-xs lg:text-sm font-medium">Online only</span>
                        </label>
                        <span className="text-xs text-base-content/60 bg-base-200 px-2 lg:px-3 py-1 lg:py-1.5 font-medium">
                            {onlineUsers.length - 1} online
                        </span>
                    </div>
                </div>
            </div>

            {/* Contacts List */}
            <div className="flex-1 overflow-y-auto w-full p-3 lg:p-4">
                <div className={`space-y-2 lg:space-y-3 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
                    {/* Expanded View with Full Info */}
                    {filteredUsers.map((user) => (
                        <button
                            key={user._id}
                            onClick={() => handleUserSelect(user)}
                            className={`
                                w-full p-3 lg:p-4 flex items-center gap-3 lg:gap-4 transition-all duration-300
                                hover:bg-base-300/50 hover:shadow border border-transparent
                                ${selectedUser?._id === user._id 
                                    ? "bg-primary/10 ring-1 ring-primary/20 border-primary/10" 
                                    : "hover:border-base-300"}
                            `}
                        >
                            <div className="relative flex-shrink-0">
                                <div className="size-10 lg:size-14 rounded-full overflow-hidden ring-1 ring-base-300">
                                    <img
                                        src={user.profilePic || "/avatar.png"}
                                        alt={user.fullName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {onlineUsers.includes(user._id) && (
                                    <span className="absolute bottom-0 right-0 size-2.5 lg:size-3.5 bg-success rounded-full ring-1 ring-base-100" />
                                )}
                            </div>

                            <div className="text-left min-w-0 flex-1">
                                <div className="font-semibold text-sm lg:text-lg truncate">{user.fullName}</div>
                                <div className="text-xs lg:text-sm text-base-content/60 flex items-center gap-1 lg:gap-2">
                                    {onlineUsers.includes(user._id) ? (
                                        <>
                                            <Radio className="size-3 lg:size-3.5 text-success" />
                                            <span className="text-success font-medium">Online</span>
                                        </>
                                    ) : (
                                        <span className="text-base-content/40">Offline</span>
                                    )}
                                </div>
                                <div className="text-xs text-base-content/40 mt-0.5 lg:mt-1">
                                    @{user.userName}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Collapsed View - Only Profile Pictures */}
                <div className={`space-y-4 ${isExpanded ? 'hidden' : 'block lg:hidden'}`}>
                    {filteredUsers.map((user) => (
                        <button
                            key={user._id}
                            onClick={() => handleUserSelect(user)}
                            className={`
                                w-full flex flex-col items-center gap-1 p-2 transition-all duration-300
                                hover:bg-base-300/50 border border-transparent
                                ${selectedUser?._id === user._id 
                                    ? "bg-primary/10 ring-1 ring-primary/20 border-primary/10" 
                                    : "hover:border-base-300"}
                            `}
                        >
                            <div className="relative">
                                <div className="size-12 rounded-full overflow-hidden ring-1 ring-base-300">
                                    <img
                                        src={user.profilePic || "/avatar.png"}
                                        alt={user.fullName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {onlineUsers.includes(user._id) && (
                                    <span className="absolute bottom-0 right-0 size-2.5 bg-success rounded-full ring-1 ring-base-100" />
                                )}
                            </div>
                            <span className="text-xs text-center truncate w-full text-base-content/60">
                                {user.fullName.split(' ')[0]}
                            </span>
                        </button>
                    ))}
                </div>

                {filteredUsers.length === 0 && (
                    <div className={`text-center text-base-content/60 py-8 lg:py-12 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
                        <Users className="size-12 lg:size-16 mx-auto mb-3 lg:mb-4 opacity-30" />
                        <p className="font-medium text-sm lg:text-base">No contacts found</p>
                        {showOnlineOnly && searchTerm && (
                            <p className="text-xs lg:text-sm mt-1">Try turning off online filter or changing search</p>
                        )}
                        {showOnlineOnly && !searchTerm && (
                            <p className="text-xs lg:text-sm mt-1">No online contacts</p>
                        )}
                        {!showOnlineOnly && searchTerm && (
                            <p className="text-xs lg:text-sm mt-1">No contacts match your search</p>
                        )}
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
