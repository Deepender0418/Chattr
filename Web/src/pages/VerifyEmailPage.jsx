import { useEffect, useRef, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { Loader } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

export default function VerifyEmailPage() {
    const { token } = useParams();
    const verifyEmailLogin = useAuthStore((s) => s.verifyEmailLogin);

    const [status, setStatus] = useState("loading");
    const hasRequested = useRef(false);

    useEffect(() => {
        if (hasRequested.current) return;
        hasRequested.current = true;

        const verify = async () => {
        try {
            const result = await verifyEmailLogin(token);

            if (result?.success) {
            toast.success(result.message || "Email verified successfully!");
            setStatus("success");
            return;
            }

            setStatus("error");
        } catch (err) {
            setStatus("error");
        }
        };

        verify();
    }, [token, verifyEmailLogin]);

    if (status === "loading") {
        return (
        <div className="flex flex-col items-center justify-center h-screen space-y-4">
            <Loader className="size-12 animate-spin text-primary" />
            <p className="text-lg font-semibold">Verifying your email...</p>
        </div>
        );
    }

    const verified = () => {
        if (status === "success") {
            return (
                <div className="flex flex-col items-center justify-center h-screen text-center space-y-4">
                    <h1 className="text-2xl font-bold text-green-500">✓ Verified Successfully!</h1>
                    <Link to="/" className="btn btn-primary mt-4">
                        Go to HomePage
                    </Link>
                </div>
            );
        } else {
            return (
                <div className="flex flex-col items-center justify-center h-screen text-center space-y-4">
                    <h1 className="text-2xl font-bold text-red-500">Verification Failed ❌</h1>
                    <p className="text-base-content/70 max-w-md">
                        The verification link is invalid or expired.
                    </p>
                    <Link to="/login" className="btn btn-primary mt-4">
                        Go to Login
                    </Link>
                </div>
            );
        }
    };

    return verified();
}
