import { MessageSquare, Users, Sparkles } from "lucide-react";

const NoChatSelected = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full p-6 lg:p-12 bg-gradient-to-br from-base-100 via-base-100 to-base-200/10">
            <div className="max-w-4xl text-center space-y-8">
                {/* Animated Icon */}
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="size-20 lg:size-28 bg-primary/10 flex items-center justify-center animate-pulse">
                            <MessageSquare className="size-8 lg:size-12 text-primary" />
                        </div>
                        <div className="absolute -top-3 -right-3 size-12 lg:size-16 bg-secondary rounded-full flex items-center justify-center shadow-xl">
                            <Users className="size-4 lg:size-6 text-secondary-content" />
                        </div>
                    </div>
                </div>

                {/* Welcome Text */}
                <div className="space-y-4">
                    <h2 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Welcome to Ch@ttr!
                    </h2>
                    <p className="text-base-content/70 text-lg lg:text-2xl leading-relaxed">
                        Select a conversation to start chatting with your friends and colleagues
                    </p>
                </div>

            </div>
        </div>
    );
};

export default NoChatSelected;
