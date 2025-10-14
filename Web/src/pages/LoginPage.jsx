import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from "lucide-react";

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        userName: "",
        password: "",
    });
    const { login, isLoggingIn } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        login(formData);
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Login Form - Centered */}
            <div className="relative z-10 flex flex-col justify-center items-center min-h-screen p-6 sm:p-8">
                <div className="w-full max-w-md">
                    {/* Glassmorphism Card - No rounded edges */}
                    <div className="bg-base-100/80 backdrop-blur-lg shadow-xl border border-base-300/50 p-8">
                        {/* Logo */}
                        <div className="text-center mb-8">
                            <div className="flex flex-col items-center gap-2 group">
                                <div
                                    className="size-16 bg-primary/10 flex items-center justify-center 
                                group-hover:bg-primary/20 transition-all duration-300 shadow-lg"
                                >
                                    <MessageSquare className="size-7 text-primary" />
                                </div>
                                <h1 className="text-3xl font-bold mt-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                    Welcome Back
                                </h1>
                                <p className="text-base-content/70 text-lg mt-2">
                                    Sign in to your account
                                </p>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold text-base">Username</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="size-5 text-base-content/50" />
                                    </div>
                                    <input
                                        type="text"
                                        className="input input-bordered w-full pl-10 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                                        placeholder="Macku"
                                        value={formData.userName}
                                        onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold text-base">Password</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="size-5 text-base-content/50" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="input input-bordered w-full pl-10 pr-10 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform duration-200"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="size-5 text-base-content/50 hover:text-base-content/70" />
                                        ) : (
                                            <Eye className="size-5 text-base-content/50 hover:text-base-content/70" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="btn btn-primary w-full py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                                disabled={isLoggingIn}
                            >
                                {isLoggingIn ? (
                                    <>
                                        <Loader2 className="size-5 animate-spin" />
                                        Signing In...
                                    </>
                                ) : (
                                    "Sign in"
                                )}
                            </button>
                        </form>

                        <div className="text-center mt-6 pt-6 border-t border-base-300/50">
                            <p className="text-base-content/70">
                                Don&apos;t have an account?{" "}
                                <Link 
                                    to="/signup" 
                                    className="link link-primary font-semibold hover:text-secondary transition-colors duration-200"
                                >
                                    Create account
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
