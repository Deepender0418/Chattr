import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import { useState } from "react";

const HomePage = () => {
    const { selectedUser } = useChatStore();
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

    return (
        <div className="h-screen bg-base-200 overflow-hidden">
            <div className="h-full pt-16">
                <div className="h-full">
                    <div className="bg-base-100 shadow-xl w-full h-full border-base-300 mx-auto">
                        <div className="flex h-full relative">
                            <Sidebar 
                                onExpandChange={setIsSidebarExpanded}
                                isExpanded={isSidebarExpanded}
                            />
                            
                            {/* Blur overlay for mobile */}
                            {isSidebarExpanded && (
                                <div 
                                    className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                                    onClick={() => setIsSidebarExpanded(false)}
                                />
                            )}
                            
                            {/* Main content with blur effect */}
                            <div className={`
                                flex-1 transition-all duration-300 relative
                                ${isSidebarExpanded ? 'lg:blur-0 blur-sm' : 'blur-0'}
                            `}>
                                {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
