import { useEffect, useRef, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

const VerifyEmailPage = () {
    const { token } = useParams();
    const { verifyEmailLogin, authUser } = useAuthStore();

    const [status, setStatus] = useState("loading");
    const hasRequested = useRef(false);

    useEffect(() => {
        if (hasRequested.current) return;
        hasRequested.current = true;

        const verify = async () => {
            const result = await verifyEmailLogin(token);

            if (result?.success !== false) {
                toast.success(result?.message || "Email verified successfully!");
                setStatus("success");
            } else {
                setStatus("error");
            }
        };

        verify();
    }, [token, verifyEmailLogin]);

    if (authUser) {
        return <Navigate to="/" replace />;
    }

    if (status === "loading") {
        return (
            <div className="flex flex-col items-center justify-center h-screen space-y-4">
                <Loader className="size-12 animate-spin text-primary" />
                <p className="text-lg font-semibold">Verifying your email...</p>
            </div>
        );
    }

    return status === "success" ? (
        <div className="flex flex-col items-center justify-center h-screen text-center space-y-4">
            <h1 className="text-2xl font-bold text-green-500">✓ Verified Successfully!</h1>
            <Link to="/" className="btn btn-primary mt-4">
                Go to Home
            </Link>
        </div>
    ) : (
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

export default VerifyEmailPage;
