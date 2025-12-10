import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Moon, Sun, User, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

const Navbar = () => {
    const { logout, authUser } = useAuthStore();
    const [darkMode, setDarkMode] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const handleConfirmLogout = () => {
        setShowLogoutConfirm(false);
        logout();
    };

    const handleCancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    return (
        <>
            <header
                className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-50 
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
                                    Ch@ttr
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
                                        onClick={handleLogoutClick}
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

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-base-100 rounded-xl shadow-2xl border border-base-300 max-w-md w-full transform transition-all duration-300 scale-100">
                        {/* Modal Header */}
                        <div className="flex items-center gap-3 p-6 border-b border-base-300">
                            <div className="p-2 bg-error/10 rounded-lg">
                                <AlertTriangle className="size-6 text-error" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Confirm Logout</h3>
                                <p className="text-base-content/60 text-sm mt-1">
                                    Are you sure you want to logout?
                                </p>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            <div className="flex items-center gap-3 p-4 bg-warning/10 rounded-lg border border-warning/20">
                                <AlertTriangle className="size-5 text-warning" />
                                <div>
                                    <p className="text-sm font-medium text-warning">
                                        You will be signed out of your account
                                    </p>
                                    <p className="text-xs text-warning/70 mt-1">
                                        Any unsaved changes will be lost
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 p-3 bg-base-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                                        <User className="size-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{authUser?.fullName}</p>
                                        <p className="text-xs text-base-content/60">@{authUser?.userName}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex gap-3 p-6 border-t border-base-300">
                            <button
                                onClick={handleCancelLogout}
                                className="btn btn-ghost flex-1 transition-all duration-300 hover:bg-base-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmLogout}
                                className="btn btn-error flex-1 gap-2 transition-all duration-300 hover:bg-error/90 hover:scale-105"
                            >
                                <LogOut className="size-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
