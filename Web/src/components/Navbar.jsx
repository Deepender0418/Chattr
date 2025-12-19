import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import {
    LogOut,
    MessageSquare,
    Moon,
    Sun,
    User,
    AlertTriangle,
    ArrowLeft,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

const Navbar = () => {
    const { logout, authUser } = useAuthStore();
    const location = useLocation();

    const isProfilePage = location.pathname === "/profile";

    const [darkMode, setDarkMode] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const profileRef = useRef(null);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        const systemPrefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;

        if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
            setDarkMode(true);
            document.documentElement.setAttribute("data-theme", "dark");
        } else {
            setDarkMode(false);
            document.documentElement.setAttribute("data-theme", "light");
        }
    }, []);

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);

        document.documentElement.setAttribute(
            "data-theme",
            newDarkMode ? "dark" : "light"
        );
        localStorage.setItem("theme", newDarkMode ? "dark" : "light");
    };

    useEffect(() => {
        const handler = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const handleConfirmLogout = () => {
        setShowLogoutConfirm(false);
        logout();
    };

    return (
        <>
            <header className="fixed top-0 z-50 w-full border-b border-base-300 backdrop-blur-lg bg-base-100/95">
                <div className="px-3 sm:px-4 lg:px-6 h-16">
                    <div className="flex items-center justify-between h-full gap-2 sm:gap-4">
                        <Link
                            to="/"
                            className="flex items-center gap-2 group hover:opacity-80 transition-all flex-shrink-0"
                        >
                            <div className="size-8 sm:size-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                                <MessageSquare className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
                            </div>
                            <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hidden xs:inline">
                                Ch@ttr
                            </h1>
                        </Link>

                        <div className="flex items-center gap-1 sm:gap-2">
                            <button
                                onClick={toggleDarkMode}
                                className="btn btn-ghost btn-sm gap-1 sm:gap-2 px-2 sm:px-3"
                                aria-label="Toggle theme"
                            >
                                {darkMode ? (
                                    <>
                                        <Sun className="w-4 h-4 flex-shrink-0" />
                                        <span className="hidden sm:inline text-sm">
                                            Light
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Moon className="w-4 h-4 flex-shrink-0" />
                                        <span className="hidden sm:inline text-sm">
                                            Dark
                                        </span>
                                    </>
                                )}
                            </button>

                            {authUser && isProfilePage && (
                                <Link
                                    to="/"
                                    className="btn btn-ghost btn-sm gap-1 sm:gap-2 px-2 sm:px-3"
                                    aria-label="Back to home"
                                >
                                    <ArrowLeft className="size-4 flex-shrink-0" />
                                    <span className="hidden sm:inline text-sm">
                                        Back
                                    </span>
                                </Link>
                            )}

                            {authUser && !isProfilePage && (
                                <div className="relative" ref={profileRef}>
                                    <button
                                        onClick={() =>
                                            setShowProfileMenu((p) => !p)
                                        }
                                        className="size-9 sm:size-10 rounded-full border border-base-300 overflow-hidden hover:ring-2 hover:ring-primary/40 transition-all flex-shrink-0"
                                        aria-label="Profile menu"
                                    >
                                        {authUser.profilePic ? (
                                            <img
                                                src={authUser.profilePic}
                                                alt="profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                                <User className="size-4 sm:size-5 text-primary" />
                                            </div>
                                        )}
                                    </button>

                                    {showProfileMenu && (
                                        <div className="absolute right-0 mt-2 w-48 sm:w-52 rounded-xl bg-base-100 border border-base-300 shadow-xl z-50 overflow-hidden">
                                            <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-base-300">
                                                <p className="font-medium text-xs sm:text-sm truncate">
                                                    {authUser.fullName}
                                                </p>
                                                <p className="text-xs text-base-content/60 truncate">
                                                    @{authUser.userName}
                                                </p>
                                            </div>

                                            <Link
                                                to="/profile"
                                                onClick={() =>
                                                    setShowProfileMenu(false)
                                                }
                                                className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-base-200 transition-colors text-sm"
                                            >
                                                <User className="size-4 flex-shrink-0" />
                                                <span>Profile</span>
                                            </Link>

                                            <button
                                                onClick={() => {
                                                    setShowProfileMenu(false);
                                                    handleLogoutClick();
                                                }}
                                                className="flex w-full items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-error hover:bg-error/10 transition-colors text-sm"
                                            >
                                                <LogOut className="size-4 flex-shrink-0" />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center sm:items-center justify-center z-[60] p-4">
                    <div className="bg-base-100 rounded-xl shadow-2xl border border-base-300 w-full max-w-sm">
                        <div className="flex items-start gap-3 p-4 sm:p-6 border-b border-base-300">
                            <div className="p-2 bg-error/10 rounded-lg flex-shrink-0">
                                <AlertTriangle className="size-5 sm:size-6 text-error" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-base sm:text-lg font-bold">
                                    Confirm Logout
                                </h3>
                                <p className="text-xs sm:text-sm text-base-content/60 mt-1">
                                    Are you sure you want to logout?
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2 sm:gap-3 p-4 sm:p-6 border-t border-base-300">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="btn btn-ghost flex-1 btn-sm sm:btn-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmLogout}
                                className="btn btn-error flex-1 btn-sm sm:btn-md gap-2"
                            >
                                <LogOut className="size-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
