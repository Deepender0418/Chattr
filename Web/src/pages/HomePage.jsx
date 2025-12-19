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
                            
                            {/* Main content */}
                            <div className="flex-1">
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
