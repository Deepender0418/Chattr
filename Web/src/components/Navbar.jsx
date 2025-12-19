import { MessageSquare, Users } from "lucide-react";

const NoChatSelected = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full p-4 sm:p-6 lg:p-12 bg-gradient-to-br from-base-100 via-base-100 to-base-200/10">
            <div className="max-w-2xl sm:max-w-3xl lg:max-w-4xl text-center space-y-6 sm:space-y-8">
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="size-16 sm:size-20 lg:size-28 bg-primary/10 flex items-center justify-center animate-pulse rounded-2xl">
                            <MessageSquare className="size-7 sm:size-8 lg:size-12 text-primary" />
                        </div>
                        <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 size-10 sm:size-12 lg:size-16 bg-secondary rounded-full flex items-center justify-center shadow-xl">
                            <Users className="size-4 sm:size-5 lg:size-6 text-secondary-content" />
                        </div>
                    </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                    <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Welcome to Ch@ttr!
                    </h2>
                    <p className="text-sm sm:text-base lg:text-xl text-base-content/70 leading-relaxed">
                        Select a conversation from the sidebar to start chatting with your friends and colleagues
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NoChatSelected;
