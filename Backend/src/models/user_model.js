import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        fullName: {
            type: String,
            required: true,
        },
        userName: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        profilePic: {
            type: String,
            default: "https://i.pinimg.com/1200x/56/af/7e/56af7ed2c15a58fed21e8ffd0744bb1e.jpg",
        },
        friendCode: {
            type: String,
            unique: true,
            sparse: true,
        },
        friends: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        resetPasswordToken: { 
            type: String 
        },
        resetPasswordExpires: { 
            type: Date 
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        verificationToken: String,
        verificationTokenExpires: Date,
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
