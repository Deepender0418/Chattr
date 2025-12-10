import { generateToken } from "../lib/utils.js";
import User from "../models/user_model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import crypto from "crypto";
import { sendEmail } from "../lib/brevoEmail.js";

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const generateVerificationToken = () => {
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
    return { token, hashedToken };
};

const generateFriendCode = () => crypto.randomBytes(4).toString("hex");

const getUniqueFriendCode = async () => {
    let code = generateFriendCode();
    let exists = await User.exists({ friendCode: code });
    while (exists) {
        code = generateFriendCode();
        exists = await User.exists({ friendCode: code });
    }
    return code;
};

const createVerificationEmail = (userName, fullName, verifyURL) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to our platform, ${fullName}!</h2>
        <p>Thank you for registering with username: <strong>${userName}</strong></p>
        <p>Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyURL}" 
            style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Verify Email Address
        </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all;">
        ${verifyURL}
        </p>
        <p><strong>This link will expire in 30 minutes.</strong></p>
        <p>If you didn't create an account, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
        This is an automated message, please do not reply to this email.
        </p>
    </div>
`;

export const signup = async (req, res) => {
    const { fullName, userName, email, password } = req.body;

    try {
        if (!fullName || !userName || !email || !password) {
            return res.status(400).json({ 
                success: false,
                message: "All fields are required" 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                success: false,
                message: "Password must be at least 6 characters" 
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid email format" 
            });
        }

        // Check existing user
        const existingUser = await User.findOne({ 
            $or: [{ userName: userName.toLowerCase() }, { email: email.toLowerCase() }] 
        });

        if (existingUser) {
            if (existingUser.userName === userName.toLowerCase()) {
                return res.status(409).json({ 
                    success: false,
                    message: "Username already taken" 
                });
            }
            if (existingUser.email === email.toLowerCase()) {
                return res.status(409).json({ 
                    success: false,
                    message: "Email already registered" 
                });
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const { token, hashedToken } = generateVerificationToken();
        const friendCode = await getUniqueFriendCode();

        const newUser = new User({
            fullName,
            userName: userName.toLowerCase(),
            email: email.toLowerCase(),
            password: hashedPassword,
            verificationToken: hashedToken,
            verificationTokenExpires: Date.now() + 30 * 60 * 1000, // 30 minutes
            friendCode
        });

        await newUser.save();

        const verifyURL = `${process.env.FRONTENDURL}/verify-email/${token}`;
        const emailContent = createVerificationEmail(userName, fullName, verifyURL);

        try {
            await sendEmail({
                toEmail: newUser.email,
                toName: newUser.fullName,
                subject: 'Verify Your Email Address',
                htmlContent: emailContent
            });

            res.status(201).json({
                success: true,
                message: "Account created successfully. Please check your email to verify your account.",
                data: {
                    email: newUser.email,
                    userId: newUser._id
                }
            });

        } catch (emailError) {
            console.error("Signup: Email sending failed:", emailError);

            return res.status(500).json({
                success: false,
                message: "Account created but failed to send verification email. Please use 'Resend Verification'",
                data: {
                    email: newUser.email,
                    userId: newUser._id
                }
            });
        }

    } catch (error) {
        console.error("Error in signup controller:", error);
        
        if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
            return res.status(409).json({
                success: false,
                message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
            });
        }

        res.status(500).json({ 
            success: false,
            message: "Internal server error. Please try again later." 
        });
    }
};

export const login = async (req, res) => {
    const { userName, password } = req.body;

    try {
        if (!userName || !password) {
            return res.status(400).json({ 
                success: false,
                message: "Username and password are required" 
            });
        }

        const user = await User.findOne({ 
            userName: userName.toLowerCase() 
        });

        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid credentials" 
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid credentials" 
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before logging in.",
                data: {
                isVerified: false,
                email: user.email,
                userId: user._id,
                }
            });
        }

        const token = generateToken(user._id, res);

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                _id: user._id,
                fullName: user.fullName,
                userName: user.userName,
                email: user.email,
                profilePic: user.profilePic,
                isVerified: user.isVerified,
                friends: user.friends,
                friendCode: user.friendCode,
                token
            }
        });

    } catch (error) {
        console.error("Error in login controller:", error);
        res.status(500).json({ 
            success: false,
            message: "Internal server error" 
        });
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { 
            maxAge: 0,
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: process.env.NODE_ENV === 'production'
        });
        
        res.status(200).json({ 
            success: true,
            message: "Logged out successfully" 
        });
    } catch (error) {
        console.error("Error in logout controller:", error);
        res.status(500).json({ 
            success: false,
            message: "Internal server error" 
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic, fullName, userName } = req.body;
        const userId = req.user._id;

        if (!profilePic && !fullName && !userName) {
            return res.status(400).json({
                success: false,
                message: "No changes provided",
            });
        }

        const updateData = {};

        if (fullName) {
            updateData.fullName = fullName.trim();
        }

        if (userName) {
            const normalizedUserName = userName.toLowerCase().trim();

            if (normalizedUserName !== req.user.userName) {
                const existingUser = await User.findOne({ userName: normalizedUserName });
                if (existingUser && existingUser._id.toString() !== userId.toString()) {
                    return res.status(409).json({
                        success: false,
                        message: "Username already taken",
                    });
                }
            }

            updateData.userName = normalizedUserName;
        }

        if (profilePic) {
            if (!profilePic.startsWith("data:image/") && !profilePic.startsWith("http")) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid image format",
                });
            }

            const currentUser = await User.findById(userId);

            if (profilePic.startsWith("data:image/")) {
                const uploadResponse = await cloudinary.uploader.upload(profilePic, {
                    folder: "user-profiles",
                    transformation: [
                        { width: 500, height: 500, crop: "fill" },
                        { quality: "auto" },
                    ],
                });

                if (currentUser.profilePic && currentUser.profilePic.includes("cloudinary.com")) {
                    try {
                        const publicId = currentUser.profilePic.split("/").pop().split(".")[0];
                        await cloudinary.uploader.destroy(`user-profiles/${publicId}`);
                    } catch (deleteError) {
                        console.warn("Failed to delete old profile picture:", deleteError);
                    }
                }

                updateData.profilePic = uploadResponse.secure_url;
                updateData.profilePicPublicId = uploadResponse.public_id;
            } else {
                updateData.profilePic = profilePic;
            }
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
            new: true,
            select: "-password -verificationToken -resetPasswordToken",
        });

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedUser,
        });
    } catch (error) {
        console.error("Error in updateProfile controller:", error);
        if (error.message?.includes("File size too large")) {
            return res.status(400).json({
                success: false,
                message: "Image size too large. Maximum 5MB allowed.",
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to update profile",
        });
    }
};

// Check Auth Controller
export const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        .select('-password -verificationToken -resetPasswordToken');
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        if (!user.friendCode) {
            user.friendCode = await getUniqueFriendCode();
            await user.save();
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error("Error in checkAuth controller:", error);
        res.status(500).json({ 
            success: false,
            message: "Internal server error" 
        });
    }
};

export const verifyEmail = async (req, res) => {
    const { token } = req.params;

    try {
        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Verification token is required",
            });
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            verificationToken: hashedToken,
            verificationTokenExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification token. Please request a new one.",
            });
        }

        if (user.isVerified) {
            const authToken = generateToken(user._id, res);

            return res.status(200).json({
                success: true,
                message: "Email is already verified",
                data: {
                    isVerified: true,
                    token: authToken,
                    user: {
                        _id: user._id,
                        fullName: user.fullName,
                        userName: user.userName,
                        email: user.email,
                        friends: user.friends,
                        friendCode: user.friendCode,
                    },
                },
            });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        const authToken = generateToken(user._id, res);

        res.status(200).json({
            success: true,
            message: "Email verified successfully! You are now logged in.",
            data: {
                isVerified: true,
                token: authToken,
                user: {
                _id: user._id,
                fullName: user.fullName,
                userName: user.userName,
                    email: user.email,
                    friends: user.friends,
                    friendCode: user.friendCode,
                },
            },
        });
    } catch (error) {
        console.error("Error in verifyEmail controller:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify email",
        });
    }
};

export const resendVerification = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ 
                success: false,
                message: "Email is required" 
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(200).json({ 
                success: true,
                message: "If an account exists with this email, a verification link will be sent." 
            });
        }

        if (user.isVerified) {
            return res.status(400).json({ 
                success: false,
                message: "Email is already verified" 
            });
        }

        const { token, hashedToken } = generateVerificationToken();

        user.verificationToken = hashedToken;
        user.verificationTokenExpires = Date.now() + 30 * 60 * 1000;

        await user.save();

        const verifyURL = `${process.env.FRONTENDURL}/verify-email/${token}`;
        const emailContent = createVerificationEmail(user.userName, user.fullName, verifyURL);

        await sendEmail({
            toEmail: user.email,
            toName: user.fullName,
            subject: 'Verify Your Email Address',
            htmlContent: emailContent
        });

        res.status(200).json({ 
            success: true,
            message: "Verification email sent successfully. Please check your inbox.",
            data: { email: user.email }
        });

    } catch (error) {
        console.error("Error in resendVerification controller:", error);
        res.status(500).json({ 
            success: false,
            message: "Failed to resend verification email" 
        });
    }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        if (!email) {
            return res.status(400).json({ 
                success: false,
                message: "Email is required" 
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(200).json({ 
                success: true,
                message: "If an account exists with this email, a password reset link will be sent." 
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

        user.resetPasswordToken = hashedResetToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

        await user.save();
        
        const resetURL = `${process.env.FRONTENDURL}/reset-password/${resetToken}`;

        console.log("Reset URL generated:", resetURL);

        await sendEmail({
            toEmail: user.email,
            toName: user.fullName,
            subject: 'Reset Your Password',
            htmlContent: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Password Reset Request</h2>
                <p>Hello ${user.fullName},</p>
                <p>You requested to reset your password. Click the button below to create a new password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetURL}" 
                    style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                    Reset Password
                    </a>
                </div>
                <p><strong>This link will expire in 15 minutes.</strong></p>
                <p>If you didn't request this, please ignore this email or contact support if you have concerns.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #666; font-size: 12px;">
                    For security reasons, this link can only be used once.
                </p>
                </div>
            `
        });

        res.status(200).json({ 
            success: true,
            message: "Password reset email sent successfully.",
            data: { email: user.email }
        });

    } catch (error) {
        console.error("Error in forgotPassword controller:", error);
        res.status(500).json({ 
            success: false,
            message: "Failed to process password reset request" 
        });
    }
};

export const resetPassword = async (req, res) => {
    let { token } = req.params;
    const { token: bodyToken, password, confirmPassword } = req.body;

    if (!token && bodyToken) {
        token = bodyToken;
    }

    console.log("Reset Password Token:", token);
    console.log("Request Body:", req.body);

    try {
        // Validation - Check all required fields
        if (!token || !password || !confirmPassword) {
            console.log("Missing fields:", { token, password, confirmPassword });
            return res.status(400).json({ 
                success: false,
                message: "All fields are required" 
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ 
                success: false,
                message: "Passwords do not match" 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                success: false,
                message: "Password must be at least 6 characters" 
            });
        }

        const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

        console.log("Hashed token:", hashedToken);

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        console.log("User found:", user ? user.email : "No user found");

        if (!user) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid or expired reset token" 
            });
        }

        const isSamePassword = await bcrypt.compare(password, user.password);
        if (isSamePassword) {
            return res.status(400).json({ 
                success: false,
                message: "New password cannot be the same as current password" 
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        console.log("Password reset successful for:", user.email);

        try {
            await sendEmail({
                toEmail: user.email,
                toName: user.fullName,
                subject: 'Password Changed Successfully',
                htmlContent: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Password Updated Successfully</h2>
                    <p>Hello ${user.fullName},</p>
                    <p>Your password has been changed successfully.</p>
                    <p>If you did not make this change, please contact our support team immediately.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #666; font-size: 12px;">
                    Security notice: This is a confirmation that your password was changed.
                    </p>
                </div>
                `
            });
            console.log("Confirmation email sent to:", user.email);
        } catch (emailError) {
            console.error("Failed to send confirmation email:", emailError);
        }

        res.status(200).json({ 
            success: true,
            message: "Password reset successful. You can now log in with your new password.",
            data: { email: user.email }
        });

    } catch (error) {
        console.error("Error in resetPassword controller:", error);
        res.status(500).json({ 
            success: false,
            message: "Failed to reset password" 
        });
    }
};

// Check Verification Status
export const checkVerificationStatus = async (req, res) => {
    try {
        const { email } = req.query;
        
        if (!email) {
            return res.status(400).json({ 
                success: false,
                message: "Email is required" 
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() })
        .select('isVerified email fullName userName');
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        res.status(200).json({
            success: true,
            data: {
                isVerified: user.isVerified,
                email: user.email,
                fullName: user.fullName,
                userName: user.userName
            }
        });

    } catch (error) {
        console.error("Error in checkVerificationStatus:", error);
        res.status(500).json({ 
            success: false,
            message: "Failed to check verification status" 
        });
    }
};
