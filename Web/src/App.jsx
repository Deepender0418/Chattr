import { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import ForgotPasswordPage from "./pages/ForgetPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
    const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
    const { theme } = useThemeStore();
    const hasCheckedAuth = useRef(false);

    const [showWakeMessage, setShowWakeMessage] = useState(false);

    useEffect(() => {
        if (!hasCheckedAuth.current) {
        hasCheckedAuth.current = true;
        checkAuth();
        }

        const timer = setTimeout(() => {
        setShowWakeMessage(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    if (isCheckingAuth && !authUser) {
        return (
        <div className="flex flex-col items-center justify-center h-screen space-y-4">
            <Loader className="size-12 animate-spin text-primary" />
            <div className="text-center">
            <p className="text-lg font-semibold">Loading Ch@ttr</p>
            <p className="text-sm text-base-content/60">
                {showWakeMessage ? "Waking Backend Up..." : "Checking authentication..."}
            </p>
            </div>
        </div>
        );
    }

    return (
        <div data-theme={theme}>
        <Navbar />

        <Routes>
            <Route path="*" element={<Navigate to="/" />} />
            <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
            <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
            <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
            <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
            <Route path="/forgot-password" element={!authUser ? <ForgotPasswordPage /> : <Navigate to="/" />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        </Routes>

        <Toaster />
        </div>
    );
};

export default App;
