import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const SignUpPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        userName: "",
        email: "",
        password: "",
    });

    const { signup, isSigningUp } = useAuthStore();
    const navigate = useNavigate();

    const validateForm = () => {
        if (!formData.fullName.trim()) return toast.error("Full name is required");
        if (!formData.userName.trim()) return toast.error("Username is required");
        if (!formData.email.trim()) return toast.error("Email is required");
        if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
        if (!formData.password) return toast.error("Password is required");
        if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSigningUp) return;
    
        const valid = validateForm();
        if (!valid) return;
    
        const result = await signup(formData);
    
        if (result?.success) {
            navigate("/check-email");
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-center items-center min-h-screen p-6 sm:p-8">
            <div className="w-full max-w-md">
            <div className="bg-base-100/80 backdrop-blur-lg shadow-xl border border-base-300/50 p-8">
                <div className="text-center mb-8">
                <div className="flex flex-col items-center gap-2 group">
                    <div className="size-16 bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 shadow-lg">
                    <MessageSquare className="size-7 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold mt-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Create Account
                    </h1>
                    <p className="text-base-content/70 text-lg mt-2">Get started with your free account</p>
                </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                <div className="form-control">
                    <label className="label">
                    <span className="label-text font-semibold text-base">Full Name</span>
                    </label>
                    <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="size-5 text-base-content/50" />
                    </div>
                    <input
                        type="text"
                        className="input input-bordered w-full pl-10 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                        placeholder="Mac Frazer"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                    </div>
                </div>

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
                    <span className="label-text font-semibold text-base">Email</span>
                    </label>
                    <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="size-5 text-base-content/50" />
                    </div>
                    <input
                        type="email"
                        className="input input-bordered w-full pl-10 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                    disabled={isSigningUp}
                >
                    {isSigningUp ? (
                    <>
                        <Loader2 className="size-5 animate-spin" />
                        Creating Account...
                    </>
                    ) : (
                    "Create Account"
                    )}
                </button>
                </form>

                <div className="text-center mt-6 pt-6 border-t border-base-300/50">
                <p className="text-base-content/70">
                    Already have an account?{" "}
                    <Link
                    to="/login"
                    className="link link-primary font-semibold hover:text-secondary transition-colors duration-200"
                    >
                    Log in
                    </Link>
                </p>
                </div>
            </div>
            </div>
        </div>
        </div>
    );
};

export default SignUpPage;
