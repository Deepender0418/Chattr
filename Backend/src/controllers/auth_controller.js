import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/util.js";
import { User } from "../models/user_model.js";
import bcrypt from "bcryptjs";


export const signup = async (req, res) => {

    const {
        fullname, 
        username, 
        email, 
        password
    } = req.body;

    try {

        if(!fullname || !username || !email || !password) {
            return res.status(400).send("All fields are required");
        }

        if(password.length < 6) {
            return res.status(400).send("Password must be at least 6 characters long");
        }

        const user = await User.findOne({ $or: [{email}, {username}] });
        if(user) {
            return res.status(400).send("User with this email or username already exists");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullname, 
            username, 
            email, 
            password: hashedPassword
        });

        if(newUser){
            generateToken(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id:newUser._id, 
                username:newUser.username, 
                fullname:newUser.fullname,
                email:newUser.email, 
                profile:newUser.profilePicture
            });
        }else{
            return res.status(400).send("Invalid user data");
        }


    } catch (error) {
        console.log("error in signup-auth_controller.js =", error.message);
        res.status(500).send("Server error");
    }
}

export const login = async (req, res) => {
    const {username, password} = req.body;

    try {
        const user = await User.findOne({ username });

        if(!user) {
            return res.status(400).send("Invalid username or password");
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect) {
            return res.status(400).send("Invalid username or password");
        }
        generateToken(user._id, res);
        res.status(200).json({
            _id:user._id, 
            username:user.username,
            fullname:user.fullname,
            email:user.email, 
            profile:user.profilePicture 
        });
    }
    catch (error) {
        console.log("error in login-auth_controller.js =", error.message);
        res.status(500).send("Server error");
    }
}

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge: 0});
        res.status(200).send("Logged out successfully");
    } catch (error) {
        console.log("error in logout-auth_controller.js =", error.message);
        res.status(500).send("Server error");
    }
}

export const updateProfile = async (req, res) => {
    try {
        const {profilePicture} = req.body;
        const userId = req.user._id;

        if(!profilePicture) {
            return res.status(400).send("Profile picture is required");
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePicture);
        const updatedUser = await User.findByIdAndUpdate(userId, {profilePicture: uploadResponse.secure_url}, {new: true}).select('-password');

        res.status(200).json(updatedUser);

    }
    catch (error) {
        console.log("error in updateProfile-auth_controller.js =", error.message);
        res.status(500).send("Server error");
    }
}

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("error in checkAuth-auth_controller.js =", error.message);
        res.status(500).send("Server error");
    }
}
