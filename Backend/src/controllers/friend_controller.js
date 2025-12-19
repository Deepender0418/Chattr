import User from "../models/user_model.js";
import FriendRequest from "../models/friend_request_model.js";
import crypto from "crypto";

const normalizeUsername = (value) => value?.toLowerCase().trim();

export const searchUser = async (req, res) => {
    try {
        const { q } = req.query;
        const meId = req.user._id;

        if (!q) {
            return res.status(400).json({ success: false, message: "Query is required" });
        }

        const normalized = normalizeUsername(q);

        const user = await User.findOne({
            $or: [{ userName: normalized }, { friendCode: q.trim() }],
        }).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isSelf = user._id.toString() === meId.toString();
        const isFriend = user.friends?.some((f) => f.toString() === meId.toString());

        const pendingRequest = await FriendRequest.findOne({
            $or: [
                { from: meId, to: user._id },
                { from: user._id, to: meId },
            ],
            status: "pending",
        });

        res.json({
            success: true,
            data: {
                user: {
                _id: user._id,
                fullName: user.fullName,
                userName: user.userName,
                profilePic: user.profilePic,
                friendCode: user.friendCode,
                },
                isSelf,
                isFriend,
                pendingRequestDirection: pendingRequest
                ? pendingRequest.from.toString() === meId.toString()
                    ? "outgoing"
                    : "incoming"
                : null,
                requestId: pendingRequest?._id,
            },
        });
    } catch (error) {
        console.error("Error in searchUser:", error);
        res.status(500).json({ success: false, message: "Failed to search user" });
    }
};

export const sendFriendRequest = async (req, res) => {
    try {
        const meId = req.user._id;
        const { target } = req.body;

        if (!target) {
            return res.status(400).json({ success: false, message: "Target is required" });
        }

        const normalized = normalizeUsername(target);
        const targetUser = await User.findOne({
            $or: [{ userName: normalized }, { friendCode: target.trim() }],
        });

        if (!targetUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (targetUser._id.toString() === meId.toString()) {
            return res.status(400).json({ success: false, message: "You cannot add yourself" });
        }

        if (targetUser.friends?.some((f) => f.toString() === meId.toString())) {
            return res.status(400).json({ success: false, message: "Already friends" });
        }

        const existing = await FriendRequest.findOne({
            $or: [
                { from: meId, to: targetUser._id },
                { from: targetUser._id, to: meId },
            ],
            status: "pending",
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Friend request already exists",
            });
        }

        const request = await FriendRequest.findOneAndUpdate(
        {
            $or: [
                { from: meId, to: targetUser._id },
                { from: targetUser._id, to: meId },
            ],
        },
        {
            from: meId,
            to: targetUser._id,
            status: "pending",
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.status(201).json({
            success: true,
            message: "Friend request sent",
            data: { requestId: request._id },
        });
    } catch (error) {
        console.error("Error in sendFriendRequest:", error);
        res.status(500).json({ success: false, message: "Failed to send request" });
    }
};

export const getFriendRequests = async (req, res) => {
    try {
        const meId = req.user._id;

        const [sent, received] = await Promise.all([
            FriendRequest.find({
                from: meId,
                status: "pending",
            })
            .populate("to", "fullName userName profilePic friendCode")
            .sort({ createdAt: -1 }),

            FriendRequest.find({
                to: meId,
                status: "pending",
            })
            .populate("from", "fullName userName profilePic friendCode")
            .sort({ createdAt: -1 }),
        ]);

        res.json({
            success: true,
            data: {
                sent: sent.map(r => ({
                    requestId: r._id,
                    _id: r.to._id,
                    fullName: r.to.fullName,
                    userName: r.to.userName,
                    profilePic: r.to.profilePic,
                    friendCode: r.to.friendCode,
                })),
                received: received.map(r => ({
                    requestId: r._id,
                    _id: r.from._id,
                    fullName: r.from.fullName,
                    userName: r.from.userName,
                    profilePic: r.from.profilePic,
                    friendCode: r.from.friendCode,
                })),
            },
        });
    } catch (error) {
        console.error("Error in getFriendRequests:", error);
        res.status(500).json({
            success: false,
            message: "Failed to load requests",
        });
    }
};


export const respondFriendRequest = async (req, res) => {
    try {
        const meId = req.user._id;
        const { requestId, action } = req.body;

        if (!requestId || !["accept", "reject"].includes(action)) {
            return res.status(400).json({ success: false, message: "Invalid payload" });
        }

        const request = await FriendRequest.findById(requestId);
        if (!request || request.to.toString() !== meId.toString()) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        if (request.status !== "pending") {
            return res.status(400).json({ success: false, message: "Request already handled" });
        }

        if (action === "reject") {
            request.status = "rejected";
            await request.save();
            return res.json({ success: true, message: "Request rejected" });
        }

        request.status = "accepted";
        await request.save();

        await User.findByIdAndUpdate(request.from, {
            $addToSet: { friends: request.to },
        });
        await User.findByIdAndUpdate(request.to, {
            $addToSet: { friends: request.from },
        });
        
        await FriendRequest.findByIdAndDelete(requestId);

        res.json({ success: true, message: "Request accepted" });
    } catch (error) {
        console.error("Error in respondFriendRequest:", error);
        res.status(500).json({ success: false, message: "Failed to respond to request" });
    }
};

export const getFriends = async (req, res) => {
    try {
        const meId = req.user._id;
        const user = await User.findById(meId).populate("friends", "fullName userName profilePic friendCode");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, data: user.friends || [] });
    } catch (error) {
        console.error("Error in getFriends:", error);
        res.status(500).json({ success: false, message: "Failed to fetch friends" });
    }
};

export const removeFriend = async (req, res) => {
    try {
        const meId = req.user._id;
        const { id: friendId } = req.params;

        if (!friendId) {
            return res.status(400).json({ success: false, message: "Friend id is required" });
        }

        const friend = await User.findById(friendId);
        if (!friend) {
            return res.status(404).json({ success: false, message: "Friend not found" });
        }

        await User.findByIdAndUpdate(meId, { $pull: { friends: friendId } });
        await User.findByIdAndUpdate(friendId, { $pull: { friends: meId } });

        await FriendRequest.deleteMany({
            $or: [
                { from: meId, to: friendId },
                { from: friendId, to: meId },
            ],
        });

        res.json({ success: true, message: "Friend removed" });
    } catch (error) {
        console.error("Error in removeFriend:", error);
        res.status(500).json({ success: false, message: "Failed to remove friend" });
    }
};

export const backfillFriendCode = async (userId) => {
    const code = crypto.randomBytes(4).toString("hex");
    await User.findByIdAndUpdate(userId, { friendCode: code });
    return code;
};

