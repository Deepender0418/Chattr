import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Moon, Sun, User } from "lucide-react";
import { useState, useEffect } from "react";

const Navbar = () => {
    const { logout, authUser } = useAuthStore();
    const [darkMode, setDarkMode] = useState(false);

    // Initialize theme from localStorage or system preference
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            setDarkMode(true);
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            setDarkMode(false);
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }, []);

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        
        if (newDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    };

    return (
        <header
            className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
            backdrop-blur-lg bg-base-100/80"
        >
            <div className="container mx-auto px-4 h-16">
                <div className="flex items-center justify-between h-full">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all group">
                            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <MessageSquare className="w-5 h-5 text-primary" />
                            </div>
                            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                Chattr
                            </h1>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Dark/Light Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="btn btn-sm gap-2 transition-all duration-300 hover:scale-105"
                            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {darkMode ? (
                                <>
                                    <Sun className="w-4 h-4" />
                                    <span className="hidden sm:inline">Light</span>
                                </>
                            ) : (
                                <>
                                    <Moon className="w-4 h-4" />
                                    <span className="hidden sm:inline">Dark</span>
                                </>
                            )}
                        </button>

                        {authUser && (
                            <>
                                <Link 
                                    to={"/profile"} 
                                    className="btn btn-sm gap-2 transition-all duration-300 hover:scale-105"
                                >
                                    <User className="size-5" />
                                    <span className="hidden sm:inline">Profile</span>
                                </Link>

                                <button 
                                    className="flex gap-2 items-center btn btn-sm transition-all duration-300 hover:scale-105 hover:bg-error/20 hover:text-error" 
                                    onClick={logout}
                                >
                                    <LogOut className="size-5" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;