import express from "express";
import { checkAuth, forgotPassword, login, logout, resendVerification, resetPassword, signup, updateProfile, verifyEmail } from "../controllers/auth_controller.js";
import { protectRoute } from "../middleware/auth_middleware.js";
import resendVerificationLimiter from "../middleware/resendVerificationLimiter.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.put("/update-profile", protectRoute, updateProfile);
router.get("/check", protectRoute, checkAuth);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.post("/resend-verification", resendVerificationLimiter, resendVerification);

export default router;
