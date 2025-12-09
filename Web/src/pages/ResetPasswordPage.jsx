
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Lock, Loader2 } from "lucide-react";

const ResetPasswordPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const { resetPassword, isResettingPassword } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return alert("Passwords do not match");
        }

        const result = await resetPassword(token, password);

        if (result.success) {
            navigate("/login");
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center p-6">
        <div className="w-full max-w-md bg-base-100/80 backdrop-blur shadow-xl border border-base-300/50 p-8 rounded-xl">
            <h1 className="text-3xl font-bold text-center mb-6">Create New Password</h1>
            <p className="text-center text-base-content/70 mb-6">
            Enter your new password and confirm it
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password */}
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-base-content/50" />
                <input
                type="password"
                placeholder="New Password"
                className="input input-bordered w-full pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            {/* Confirm Password */}
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-base-content/50" />
                <input
                type="password"
                placeholder="Confirm Password"
                className="input input-bordered w-full pl-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isResettingPassword}
            >
                {isResettingPassword ? (
                <>
                    <Loader2 className="size-5 animate-spin" />
                    Updating...
                </>
                ) : (
                "Reset Password"
                )}
            </button>
            </form>

            <div className="text-center mt-6">
            <button
                onClick={() => navigate("/login")}
                className="link link-primary font-semibold hover:text-secondary"
            >
                Back to Login
            </button>
            </div>
        </div>
        </div>
    );
}

export default ResetPasswordPage;
