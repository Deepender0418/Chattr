import { MessageSquare, Users } from "lucide-react";

const NoChatSelected = () => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-base-100 to-base-200">
            <div className="max-w-md text-center space-y-6">
                {/* Animated Icon */}
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
                            <MessageSquare className="size-8 text-primary" />
                        </div>
                        <div className="absolute -top-2 -right-2 size-8 bg-secondary rounded-full flex items-center justify-center shadow-lg">
                            <Users className="size-4 text-secondary-content" />
                        </div>
                    </div>
                </div>

                {/* Welcome Text */}
                <div className="space-y-3">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Welcome to Chattr!
                    </h2>
                    <p className="text-base-content/70 text-lg">
                        Select a conversation from the sidebar to start chatting
                    </p>
                </div>

                {/* Features List */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-3 bg-base-200 rounded-lg">
                        <div className="text-2xl mb-1">😊</div>
                        <p className="text-sm font-medium">Emoji Support</p>
                    </div>
                    <div className="text-center p-3 bg-base-200 rounded-lg">
                        <div className="text-2xl mb-1">🖼️</div>
                        <p className="text-sm font-medium">Image Sharing</p>
                    </div>
                    <div className="text-center p-3 bg-base-200 rounded-lg">
                        <div className="text-2xl mb-1">⚡</div>
                        <p className="text-sm font-medium">Real-time</p>
                    </div>
                    <div className="text-center p-3 bg-base-200 rounded-lg">
                        <div className="text-2xl mb-1">👥</div>
                        <p className="text-sm font-medium">Online Status</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoChatSelected;