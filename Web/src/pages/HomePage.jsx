import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import { useState, useEffect } from "react";

const HomePage = () => {
    const { selectedUser } = useChatStore();
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsSidebarExpanded(false);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="h-screen bg-base-200 overflow-hidden">
            <div className="h-full pt-16">
                <div className="h-full">
                    <div className="bg-base-100 shadow-xl w-full h-full border-base-300 mx-auto">
                        <div className="flex h-full relative">

                            {/* Sidebar */}
                            <Sidebar
                                onExpandChange={setIsSidebarExpanded}
                                isExpanded={isSidebarExpanded}
                            />

                            {/* Mobile overlay */}
                            {isSidebarExpanded && (
                                <div
                                    className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-30"
                                    onClick={() => setIsSidebarExpanded(false)}
                                />
                            )}

                            {/* Main content */}
                            <div className="flex-1 relative overflow-hidden">
                                <div
                                    className={`
                                        h-full transition-all duration-300
                                        ${isSidebarExpanded ? "lg:blur-0 blur-sm" : "blur-0"}
                                    `}
                                >
                                    {!selectedUser
                                        ? <NoChatSelected />
                                        : <ChatContainer />
                                    }
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
