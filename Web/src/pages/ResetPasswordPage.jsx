import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Lock, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const ResetPasswordPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const { resetPassword, isResettingPassword } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!password || !confirmPassword) {
            setError("Both password fields are required");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        // Pass both password and confirmPassword to the store function
        const result = await resetPassword(token, password, confirmPassword);

        if (result.success) {
            toast.success(result.message || "Password reset successfully!");
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

                {/* Error message */}
                {error && (
                    <div className="alert alert-error mb-4">
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Password */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">New Password</span>
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-base-content/50" />
                            <input
                                type="password"
                                placeholder="Enter new password"
                                className="input input-bordered w-full pl-10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isResettingPassword}
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">Confirm Password</span>
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-base-content/50" />
                            <input
                                type="password"
                                placeholder="Confirm new password"
                                className="input input-bordered w-full pl-10"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isResettingPassword}
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn btn-primary w-full mt-4"
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
                        disabled={isResettingPassword}
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
