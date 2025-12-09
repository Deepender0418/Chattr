import { generateToken } from "../lib/utils.js";
import User from "../models/user_model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import crypto from "crypto";
import { sendEmail } from "../lib/brevoEmail.js";

export const signup = async (req, res) => {
    const { fullName, userName, email, password } = req.body;

    try {
        if (!fullName || !userName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const existing = await User.findOne({ $or: [{ userName }, { email }] });

        if (existing) {
            if (existing.userName === userName) {
                return res.status(400).json({ message: "Username already taken" });
            }
            if (existing.email === email) {
                return res.status(400).json({ message: "Email already registered" });
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const verificationToken = crypto.randomBytes(32).toString("hex");
        const hashedVerificationToken = crypto
            .createHash("sha256")
            .update(verificationToken)
            .digest("hex");

        const newUser = new User({
            fullName,
            userName,
            email,
            password: hashedPassword,
            verificationToken: hashedVerificationToken,
            verificationTokenExpires: Date.now() + 30 * 60 * 1000,
        });

        const verifyURL = `${process.env.FRONTENDURL}/verify-email/${verificationToken}`;

        try {
            await sendEmail({
                toEmail: newUser.email,
                toName: newUser.fullName,
                subject: 'Verify Your Email',
                htmlContent: `
                    <h2>Welcome, ${newUser.fullName}!</h2>
                    <p>Click below to verify your email:</p>
                    <a href="${verifyURL}" target="_blank" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
                    <p><small>Or copy and paste this URL:</small><br><code>${verifyURL}</code></p>
                    <p>This link expires in <b>30 minutes</b>.</p>
                `
            }); 
        } catch (err) {
            newUser.verificationToken = undefined;
            newUser.verificationTokenExpires = undefined;
            await newUser.save({ validateBeforeSave: false });

            return res.status(500).json({
                message: "Account created but failed to send verification email. Try again.",
            });
        }

        await newUser.save();

        res.status(201).json({
            message: "Account created. Please check your email to verify your account.",
        });

    } catch (error) {
        console.log("Error in signup controller:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


export const login = async (req, res) => {
    const { userName, password } = req.body;

    try {
        const user = await User.findOne({ userName });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                message: "Please verify your email before logging in.",
                isVerified: false,
                email: user.email,
                userId: user._id,
            });
        }

        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            userName: user.userName,
            email: user.email,
            profilePic: user.profilePic,
            isVerified: user.isVerified,
        });

    } catch (error) {
        console.log("Error in login controller:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;

        if (!profilePic) {
            return res.status(400).json({ message: "Profile pic is required" });
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url },
            { new: true }
        );

        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("Error in update profile:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) return res.status(400).json({ message: "Email is required" });

        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ message: "If this email exists, reset link sent" });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
        await user.save();

        const resetURL = `${process.env.FRONTENDURL}/reset-password/${resetToken}`;

        await sendEmail({
            toEmail: user.email,
            toName: user.fullName || '',
            subject: "Password Reset Request",
            htmlContent: `
                <h2>Password Reset Link</h2>
                <p>Click the link below to reset your password:</p>
                <a href="${resetURL}" target="_blank" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
                <p><small>Or copy and paste this URL into your browser:</small><br>${resetURL}</p>
                <p>This link expires in <b>15 minutes</b>.</p>
                <p><em>If you didn't request this, please ignore this email.</em></p>`
        });

        res.json({ message: "Password reset link sent to your email" });
    } catch (error) {
        console.log("Error in forgotPassword controller:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const resetPassword = async (req, res) => {
    console.log("resetPassword called");
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        console.log("Error in resetPassword controller:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


export const verifyEmail = async (req, res) => {
    console.log("verifyEmail called");
    try {
        const { token } = req.params;

        const hashedToken = crypto.createHash("sha256").update(token.trim()).digest("hex");

        const user = await User.findOne({
            verificationToken: hashedToken,
            verificationTokenExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired verification token",
                allowResend: true,
            });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;

        await user.save();

        generateToken(user._id, res);

        res.json({
            success: true,
            message: "Email verified successfully.",
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                userName: user.userName,
                profilePic: user.profilePic,
                isVerified: true,
            },
        });

    } catch (error) {
        console.log("Error in verifyEmail controller:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
