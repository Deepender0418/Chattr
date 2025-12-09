import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const { sendResetEmail, isSendingReset } = useAuthStore();

    const handleSubmit = (e) => {
        e.preventDefault();
        sendResetEmail({ email });
    };

    return (
        <div className="min-h-screen flex justify-center items-center p-6">
            <div className="w-full max-w-md bg-base-100/80 backdrop-blur shadow-xl border border-base-300/50 p-8">
                <h1 className="text-3xl font-bold text-center mb-6">Reset Password</h1>
                <p className="text-center text-base-content/70 mb-6">
                    Enter your email and we'll send a reset link
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-base-content/50" />
                        <input
                            type="email"
                            placeholder="mac@gmail.com"
                            className="input input-bordered w-full pl-10"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={isSendingReset}
                    >
                        {isSendingReset ? (
                            <>
                                <Loader2 className="size-5 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            "Send Reset Link"
                        )}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <Link
                        to="/login"
                        className="link link-primary font-semibold hover:text-secondary"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
