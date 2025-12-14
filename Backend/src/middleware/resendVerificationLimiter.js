import rateLimit from "express-rate-limit";

const resendVerificationLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        message: "Too many verification requests. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export default resendVerificationLimiter;
